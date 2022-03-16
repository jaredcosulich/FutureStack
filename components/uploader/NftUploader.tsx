import { FunctionComponent } from "react"
import Head from 'next/head'
import styles from '../../styles/Home.module.css'
import UploadImages from './uploadImages'
import { useEffect, useState } from 'react'
import { formatBytes } from '../../utils/formatters';
import UploadMetadata from './uploadMetadata'
import { getCostToSaveBytesInDollars } from '../../utils/costEstimator'
import EstimatedCost from './estimatedCost'
import UploadFilesModal from './UploadFilesModal';
import Error from './error';
import ConfirmUpload from './confirmUpload';
import { FileWithPreview } from '../../types/FileWithPreview'
import { createNftObjects } from '../../utils/createNftObjects'
import { NftObject } from '../../types/NftObject'
import NextLink from '../NextLink';
import store from 'store2';
import { StoreName } from "../../enums/storeEnums"
import { addNftObjsToLocalStorage } from "../../utils/localStorageUtils"
import { SmallSpinner } from "./spinners"

type UploaderProps = {
}

const NftUploader: FunctionComponent<UploaderProps> = () => {
  const nftUploaderStore = store.namespace(StoreName.nftUploader);
  const generalUploaderStore = store.namespace(StoreName.generalUploader);
  const [imageFiles, setImageFiles] = useState<FileWithPreview[]>([]);
  const [imageBytes, setImageBytes] = useState(0);
  const [imageCost, setImageCost] = useState(0);
  const [metadataFiles, setMetadataFiles] = useState<File[]>([]);
  const [metadataBytes, setMetadataBytes] = useState(0);
  const [metadataCost, setMetadataCost] = useState(0);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showConfirmUpload, setShowConfirmUpload] = useState(false);
  const [nftObjects, setNftObjects] = useState<NftObject[]>();
  const [loading, setLoading] = useState(false);

  const updateImageBytes = async (bytes: number) => {
    console.log('updateImageBytes :>> ', bytes);
    setImageBytes(bytes);
    const imageCost = await getCostToSaveBytesInDollars(bytes);
    setImageCost(imageCost);
  }

  const updateMetadataBytes = async (bytes: number) => {
    console.log('updateMetadataBytes :>> ', bytes);
    setMetadataBytes(bytes);
    const metadataCost = await getCostToSaveBytesInDollars(bytes);
    setMetadataCost(metadataCost);
  }

  const continueToUpload = async () => {
    setLoading(true);
    if (imageFiles.length !== metadataFiles.length) {
      setErrorMessage("There must be the same number of image and metadata files.");
    } else {
      const nftObjs = await createNftObjects(imageFiles, metadataFiles);
      setNftObjects(nftObjs);

      await addNftObjsToLocalStorage(nftObjs)

      // Remove this item of localStorage so the uploading.tsx page does not redirect
      generalUploaderStore.remove('baseURI');
      generalUploaderStore.remove('metadataFileNames');

      // So Uploading.tsx knows what local files to grab (there may be some leftover from the other type)
      generalUploaderStore('nextUploadType', StoreName.nftUploader)

      setLoading(false);
      setShowConfirmUpload(true);
    }
  }

  if (showConfirmUpload) {
    return (
      <ConfirmUpload
        nftObjects={nftObjects}
        cost={imageCost + metadataCost}
      />
    )
  } else {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <Error showError={errorMessage} message={errorMessage} />
          <br />
          <UploadImages setImageFiles={setImageFiles} updateImageBytes={updateImageBytes} />
          <br />
          <br />
          <UploadMetadata setMetadataFiles={setMetadataFiles} updateMetadataBytes={updateMetadataBytes} />
          <br />
          <br />


          {
            imageBytes + metadataBytes === 0 ?
              (<></>) :
              (
                <p>Upload size: {formatBytes(imageBytes + metadataBytes)}</p>
              )
          }

          {
            imageCost + metadataCost === 0 ? (<></>) : (
              <div>
                <EstimatedCost cost={imageCost + metadataCost} />
              </div>
            )
          }

          {
            imageBytes > 0 && metadataBytes > 0 && !loading ?
              (
                <>
                  <br />
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={continueToUpload}
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
      </div>
    )
  }
}

export default NftUploader;
