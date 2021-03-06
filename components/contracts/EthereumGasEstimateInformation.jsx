import {
  getEthereumGasEstimate,
  ethereumNetworkIdToName
} from '../../lib'

import {
  BoldTitleAndValue
} from '..'

import { ethers } from 'ethers';
import { useEffect, useMemo, useRef, useState } from 'react';

const EthereumGasEstimateInformation = ({ provider, contract, deploymentArguments }) => {
  const [network, setNetwork] = useState();
  const [gasEstimate, setGasEstimate] = useState();
  const [gasPrice, setGasPrice] = useState();
  const gasPriceTimeout = useRef();

  const getAndSetGasPrice = useMemo(() => async () => {
    try {
      const gasPrice = await provider?.getGasPrice();
      setGasPrice(gasPrice);  
    } catch (e) {
      if (e.message.includes('underlying network changed')) {
        window.location.reload();
      }
      console.error(e);
    }
  }, [provider])

  useEffect(() => {
    if (gasEstimate && !deploymentArguments) {
      setGasEstimate(null)
    }

    if (!deploymentArguments) {
      return;
    }

    const getGasEstimate = async () => {
      const gasEstimateInfo = await getEthereumGasEstimate(
        provider,
        contract.info.abi,
        contract.info.bytecode,
        deploymentArguments
      );
      setGasEstimate(gasEstimateInfo?.gas);
    }

    getGasEstimate()
    getAndSetGasPrice()
  }, [gasEstimate, provider, contract, deploymentArguments, getAndSetGasPrice])

  useEffect(() => {
    if (!provider) {
      return;
    }

    const getNetwork = async () => {
      const { chainId } = await provider.getNetwork();
      setNetwork(chainId);
    }

    getNetwork();
  }, [provider]);

  useEffect(() => {
    if (gasPriceTimeout.current) {
      clearTimeout(gasPriceTimeout.current);
    }

    gasPriceTimeout.current = setTimeout(getAndSetGasPrice, 1000)
  }, [gasPrice, getAndSetGasPrice])
  
  if (!provider || !deploymentArguments) {
    return (
      <div className='text-xs py-6'>
        {!provider && !deploymentArguments && 
          "Connect your wallet and provide deployment arguments"
        } 
        {!provider && deploymentArguments &&
          "Connect your wallet"
        }
        {provider && !deploymentArguments &&
          "Provide deployment arguments"
        }
        <br/>
        to get an estimate on gas or deploy the contract.
        {network && 
          <div className='pt-6'>
            <BoldTitleAndValue
              title='Network'
              value={ethereumNetworkIdToName(network)}
            />
            <div className='text-xs'>
              To switch your network change it 
              <br/>
              in your wallet and refresh the page.
            </div>
          </div>
        }
      </div>
    )
  }

  const readableGasPrice = gasPrice ? (
    Math.round(
      (ethers.utils.formatUnits(gasPrice, "gwei") * 100)
    ) / 100
  ) : null;

  const estimatedCost = (gasEstimate && gasPrice) ? (
    Math.round(
      ethers.utils.formatEther(
        ethers.BigNumber.from(gasEstimate).mul(ethers.BigNumber.from(gasPrice))
      ) * 100000
    ) / 100000
  ) : null;

  return (
    <div>
      {network && 
        <BoldTitleAndValue
          title="Network"
          value={ethereumNetworkIdToName(network)}
        />
      }
      {gasEstimate &&
        <BoldTitleAndValue
          title="Gas"
          value={ethers.utils.commify(gasEstimate)}
        />
      }
      {readableGasPrice && 
        <BoldTitleAndValue
          title="Gas Price"
          value={`${readableGasPrice} GWEI`}
        />
      }
      {estimatedCost !== null &&
        <BoldTitleAndValue
          title="Transaction Cost"
          value={`${estimatedCost} ETH`}
        />      
      }
    </div>
  )

}

export default EthereumGasEstimateInformation;