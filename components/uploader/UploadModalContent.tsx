import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ArweaveSurveyButton } from ".";
import { TWButton } from "..";
import { ErrorType } from "../../enums/errorEnums";
import Uploading from "./Uploading";
import ErrorPage from "../ErrorPage";
import { ArweaveSurvey } from "../surveys";
import Checkout from "./Checkout";
import PaymentTypeSelector from "./PaymentTypeSelector";
import { useRouter } from "next/router";
import { FileToUpload, NftObject } from "../../types/NftObject";
import { Dialog } from "@headlessui/react";
import EstimatedCost from "./EstimatedCost";
import store from 'store2';

type UploadModalContentProps = {
    title: string,
    purchasePriceInCents: number,
    setCanClose: Dispatch<SetStateAction<boolean>>,
    objectsToUpload: NftObject[] | FileToUpload[],
    projectId?: string,
}

export default function UploadModalContent(props: UploadModalContentProps) {
    const router = useRouter();
    
    const surveyStore = store.namespace('survey')
    const survey = surveyStore('arweave')

    const [showSurvey, setShowSurvey] = useState(null)
    const [isPaymentTypeChosen, setIsPaymentTypeChosen] = useState(false);
    const [beginUpload, setBeginUpload] = useState(false);
    const [error, setError] = useState<ErrorType>();

    const handleRetryUpload = () => {
        // Consider counting errors and doing something after the third retry
        setError(null);
    }

    const onSurveyComplete = (survey) => {
        // supabaseClient
        //     .from(`surveys:id=eq.${survey.id}`)
        //     .on('UPDATE', payload => {
        //         console.log('Change received!', payload)
        //     })
        //     .subscribe()
        setShowSurvey(false)
    }

    if (error) {
        switch (error) {
            case ErrorType.upload:
                return (
                    <ErrorPage
                        heading="Your upload failed"
                        subheading="You may retry - it won't cost you anything extra. Or, you can reach out to support."
                        primaryButtonText="Retry upload"
                        primaryButtonCallbackFn={handleRetryUpload}
                    />
                )
            default:
                return (
                    <ErrorPage
                        heading="There was an error"
                        subheading="The team has been notified and we'll get to it right away. You can also:"
                        primaryButtonText="Start over"
                        primaryButtonCallbackFn={() => router.push('/')}
                    />
                )
        }
    }

    if (beginUpload) {
        props.setCanClose(false)
        return <Uploading
            projectId={props.projectId}
            setError={setError}
            objectsToUpload={props.objectsToUpload}
        />
    }

    if (showSurvey) {
        return (
            <ArweaveSurvey 
                onCancel={() => setShowSurvey(false)} 
                onComplete={onSurveyComplete}
            />
        )
    }

    if (props.purchasePriceInCents > 0) {
        // Choose payment type and pay

        const heading = (
            <div className="mb-3 text-center">
                <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    {props.title}
                </Dialog.Title>
                <div className="mt-2">
                    <div className="text-m text-gray-500">
                        <EstimatedCost costInCents={props.purchasePriceInCents} />
                    </div>
                </div>
            </div>

        )
        if (!isPaymentTypeChosen) {
            return (
                <>
                    {heading}
                    <PaymentTypeSelector
                        title={props.title}
                        purchasePrice={props.purchasePriceInCents}
                        setIsPaymentTypeChosen={setIsPaymentTypeChosen}
                    />
                    {survey?.results?.claimedAt === undefined && (
                        <>
                            <div className="relative mt-4 mb-4">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-200" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-4 bg-white text-sm font-medium text-gray-500">or</span>
                                </div>
                            </div>
                            <ArweaveSurveyButton onClick={() => setShowSurvey(true)} />
                        </>
                    )}
                    
                </>
            )
        } else {
            return (
                <>
                    {heading}
                    <Checkout
                        setBeginUpload={setBeginUpload}
                        purchasePriceInCents={props.purchasePriceInCents}
                    />
                </>
            )
        }
    } else {
        // Upload is free
        return (
            <div className='py-12 text-center'>
                <div className='text-lg font-bold mb-6'>
                    Start Upload
                </div>
                <div>
                    There is no charge for this upload.
                </div>
                <TWButton
                    classMap={{
                        padding: '',
                        margin: 'mt-6'
                    }}
                >
                    <button onClick={() => setBeginUpload(true)} className='block px-3 py-1'>
                        Start Upload
                    </button>
                </TWButton>
            </div>
        )
    }

    return <></>
}