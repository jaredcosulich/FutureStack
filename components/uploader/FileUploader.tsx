import { FunctionComponent } from "react"
import styles from '../../styles/Home.module.css'
import { useEffect, useState } from 'react'
import { formatBytes } from '../../utils/formatters';
import { getCostToSaveBytesInDollars } from '../../utils/costEstimator'
import EstimatedCost from './estimatedCost'
import UploadFilesModal from './UploadFilesModal';
import Error from './error';
import { FileWithPreview } from '../../types/FileWithPreview'
import store from 'store2';
import UploadFiles from './UploadFiles';
import { addFilesToLocalStorage } from "../../utils/localStorageUtils";
import { StoreName } from "../../enums/storeEnums";
import { SmallSpinner } from "./spinners";
import { supabaseClient } from '../../lib'
import { getSurvey } from '../../lib/queries'

const surveyDiscount = 500000000;

const FileUploader: FunctionComponent = () => {
    const generalUploaderStore = store.namespace(StoreName.generalUploader)
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [filesBytes, setFilesBytes] = useState(0);
    const [filesCost, setFilesCost] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showLinkToExistingUploads, setShowLinkToExistingUploads] = useState(false);
    const [loading, setLoading] = useState(false);
    const [completedSurvey, setCompletedSurvey] = useState();

    useEffect(() => {
        if (window) {
            // Re-initialize generalUploaderStore to have access in useEffect
            const generalUploaderStore = store.namespace(StoreName.generalUploader)
            const baseURIFromLocal = generalUploaderStore('baseURI');
            const metadataFileNames = generalUploaderStore('metadataFileNames');
            if (baseURIFromLocal && metadataFileNames) {
                setShowLinkToExistingUploads(true);
            }
        }

    }, []);


    const addFiles = async (newFiles: FileWithPreview[]): Promise<void> => {
        const oldAndNewFiles = files;
        console.log('files pre :>> ', files);
        for (let index = 0; index < newFiles.length; index++) {
            const file = newFiles[index];
            oldAndNewFiles.push(file);
        }
        console.log('oldAndNewFiles :>> ', oldAndNewFiles);
        setFiles(oldAndNewFiles);
    }

    const updateFilesBytes = async (bytes: number): Promise<void> => {
        console.log('updateFilesBytes :>> ', bytes);
        console.log('current filesBytes :>> ', filesBytes);
        const newTotalBytes = filesBytes + bytes;
        console.log('newTotalBytes :>> ', newTotalBytes);
        setFilesBytes(newTotalBytes - (completedSurvey ? surveyDiscount : 0));
        const newFilesCost = await getCostToSaveBytesInDollars(newTotalBytes);
        setFilesCost(newFilesCost);
    }

    /*
        I'd rather save the files to local storage when the user clicks "pay with credit card"
        in UploadFilesModal.tsx, but I can't figure out how to do that before Stripe does it's redirect.
    */
    const saveFilesToLocalAndOpenModal = async () => {
        setLoading(true);
        await addFilesToLocalStorage(files);

        // Remove this item of localStorage so the uploading.tsx page does not redirect
        generalUploaderStore.remove('baseURI');
        generalUploaderStore.remove('metadataFileNames');

        // So Uploading.tsx knows what local files to grab (there may be some leftover from the other type)
        generalUploaderStore('nextUploadType', StoreName.filesUploader)

        setLoading(false);
        setOpenModal(true);
    }

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <Error showError={errorMessage} message={errorMessage} />
                <UploadFiles addFiles={addFiles} updateFilesBytes={updateFilesBytes} />
                <br />
                {
                    filesBytes === 0 ?
                        (<></>) :
                        (
                            <p>Upload size: {formatBytes(filesBytes)}</p>
                        )
                }

                {
                    filesCost === 0 ? (<></>) : (
                        <div>
                            <EstimatedCost cost={filesCost} />
                        </div>
                    )
                }

                {
                    files.length > 0 && !loading ?
                        (
                            <>
                                <br />
                                <button
                                    type="button"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={() => saveFilesToLocalAndOpenModal()}
                                >
                                    Continue
                                </button>
                            </>
                        ) :
                        (<></>)
                }
                {
                    loading &&
                    <span className="mt-2">
                        <SmallSpinner />
                    </span>
                }

            </main>

            <UploadFilesModal
                open={openModal}
                setOpenModal={setOpenModal}
                setShowError={setShowError}
                setErrorMessage={setErrorMessage}
                cost={filesCost}
                bytes={filesBytes}
                fileCount={files.length}
            />
        </div>
    )
}
export default FileUploader;
