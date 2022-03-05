import { Dispatch, SetStateAction } from "react";
import { NftObject } from "../../types/NftObject";
import EllipsisText from "react-ellipsis-text";
import { getNameFromMetadataString } from "../../utils/metadataUtils";

type NftObjectGridProps = {
    nftObjects: NftObject[],
    setOpenNftViewerModal: Dispatch<SetStateAction<boolean>>,
    setNftToShow: Dispatch<SetStateAction<NftObject>>,
}


export default function NftObjectGrid(props: NftObjectGridProps) {
    const nftObjects = props.nftObjects;

    const showNft = (nft: NftObject) => {
        props.setOpenNftViewerModal(true);
        props.setNftToShow(nft);
    }

    return (
        <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {nftObjects.map((nftObj: NftObject, index: number) => (
                <li
                    key={index}
                    className="cursor-pointer group col-span-1 flex flex-col text-center bg-white rounded-lg shadow divide-y divide-gray-200"
                >
                    <button
                        className="flex-1 flex flex-col p-8 object-cover group-hover:opacity-75"
                        type="button"
                        onClick={() => showNft(nftObj)}
                    >
                        <img className="w-32 h-32 flex-shrink-0 mx-auto rounded-lg" src={nftObj.imageFile.preview} alt={nftObj.imageFile.name} />
                        <h3 className="mt-6 text-gray-900 text-sm font-medium">{getNameFromMetadataString(nftObj.metadata)}</h3>
                        <dl className="mt-1 flex-grow flex flex-col justify-between">
                            <dt className="sr-only">Metadata</dt>

                            <dd className="text-gray-500 text-sm">
                                <EllipsisText text={nftObj.metadata} length={50} />
                            </dd>
                        </dl>
                    </button>
                </li>
            ))}
        </ul>
    )
}