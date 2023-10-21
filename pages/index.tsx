/* eslint-disable @next/next/no-img-element */
import { useAccount, useNetwork } from 'wagmi'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useMemo } from 'react'
import clsx from 'clsx'
import {
  useConnectModal,
} from '@rainbow-me/rainbowkit';

import { useContractWrite, erc20ABI } from 'wagmi';
import {
  AxelarAssetTransfer,
  CHAINS,
  Environment,
} from "@axelar-network/axelarjs-sdk";

// import { useMetaMask } from '@/utils/hooks/useMetamask';
import { useRouter } from 'next/router';

interface Chain {
  name: string;
  icon: string;
  axelarName: string;

}

interface ChainList {
  [key: string]: Chain;
}

const config = {
  environment: Environment.TESTNET
}

const coinType: ChainList = {
  '80001': {
    name: 'Polygon Mumbai',
    icon: '/icons/support/polygon.svg',
    axelarName: 'Polygon'

  },
  '5': {
    name: 'ETH Goerli',
    icon: '/icons/support/ethereum.svg',
    axelarName: 'ethereum-2'
  },
  '59140': {
    name: 'Linea Goerli',
    icon: '/icons/support/linea.svg',
    axelarName: 'linea'
  },
  '420': {
    name: 'Op Goerli',
    icon: '/icons/support/optimism.svg',
    axelarName: 'optimism'
  },
};


const DonateBtn = ({ donateTo, amount, toChain }:
  { donateTo: `0x${string}`, amount: number, toChain: string }) => {
  // const { wallet, hasProvider, connectMetaMask } = useMetaMask();
  const { chain } = useNetwork()
  const { address } = useAccount()
  const [loading, setLoading] = useState(false)
  const a = chain?.id || 5
  const { openConnectModal } = useConnectModal();


  const { writeAsync } = useContractWrite({
    address: '0x254d06f33bDc5b8ee05b2ea472107E300226659A',
    abi: erc20ABI,
    chainId: chain?.id,
    functionName: 'transfer',
  })

  const handleDonate = async () => {
    toast('🦄 Sending Donation!', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    setLoading(true)
    try {
      const destinationAddress = donateTo,
        asset = "uausdc";  // denom of asset. See note (2) below
      const sdk = new AxelarAssetTransfer(config);

      const depositAddress = await sdk.getDepositAddress({
        fromChain: coinType[a].axelarName || CHAINS.TESTNET.ETHEREUM,
        toChain: coinType[toChain].axelarName,
        destinationAddress,
        asset
      });

      const tx = await writeAsync({
        args: [
          depositAddress as `0x${string}`,
          BigInt(Math.floor(amount) * 1e6 || 10e6)
        ]
      })
      toast.success(`success, tx=${tx.hash}`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (error) {
      console.log(error)
      toast.error("Something Wrong happened!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={clsx((loading || amount == 0) ? 'cursor-not-allowed bg-[#9dbd3c]' : 'cursor-pointer bg-[#d0fb51]', 'rounded-full h-[40px] w-full text-center font-bold text-white leading-[40px] text-[24px]')} onClick={address ? handleDonate : openConnectModal}>
      {address ? (loading ? 'Loading...' : `Support`) : 'Connect Metamask'}
    </div>
  );
};

export default function Home() {
  const [donation, setDonation] = useState(0)
  const { query } = useRouter()
  const { chain } = useNetwork()

  return (
    <main
      className="w-screen h-screen flex flex-col justify-center items-center"
    >
      <ToastContainer></ToastContainer>
      <div className='w-[350px]  px-[20px] py-[30px] flex flex-col gap-[15px] justify-center items-center border border-gray-300 rounded-lg'>
        <div className='text-[24px] self-start font-semibold'>Donate <span className='text-[#717171]'>{query?.name || 'Donate3'}</span> aUSDC</div>
        <div className='flex gap-4 w-full items-center'>
          <div className='flex justify-center items-center gap-3 border  border-[#d0fb51] text-[12px] rounded-md w-[calc(50vw_-_240px)] h-[40px] p-2'>
            <img className='w-[30px] h-[30px] bg-[#fff] rounded-full' src={chain?.id ? coinType[chain?.id + '']?.icon : '/icons/delete.png'} alt="" />{chain?.id ? coinType[chain?.id + '']?.name : 'NotConnect'}
          </div>
          <img width="20px" src="./ar.png" alt="" />
          <div className='flex justify-center items-center gap-3 border  border-[#d0fb51] text-[12px] rounded-md w-[calc(50vw_-_240px)] h-[40px] p-2'>
            <img className='w-[30px] h-[30px] bg-[#132333] rounded-full' src={coinType[query.toChain as string || 420]?.icon} alt="" />{coinType[query.toChain as string || 420]?.name}
          </div>
        </div>
        <div className='w-full h-[60px] flex justify-center items-center rounded-lg border border-[#d0fb51] bg-[#d0fb5166] gap-4'>
          <div className='text-[50px]'>💵</div>
          x
          {[1, 3, 5].map((v, i) => {
            return <div onClick={() => {
              setDonation(v)
            }} key={i} className={clsx(
              donation == v ? 'bg-[#d0fb51] text-white' : 'bg-white text-[#d0fb51]',
              'w-[35px] h-[35px] leading-[35px] rounded-full text-center cursor-pointer'
            )}>{v}</div>
          })}
          <input
            value={donation}
            className='text-center rounded-md w-[35px] h-[35px] border border-[#d0fb51]'
            onChange={(e: any) => setDonation(e.target.value)}
          ></input>
        </div>
        <DonateBtn donateTo='0xb15115A15d5992A756D003AE74C0b832918fAb75' amount={donation} toChain={query.toChain as string || "420"} />
        <div className='w-full p-2  rounded-lg border border-[#d0fb51] text-[#91ae39] bg-[#d0fb5166] gap-4'>
          Only supports mubai(80001), goerli(5), linea(59140), and op-goerli(420).<br />
          <span className='font-bold'>It will use 0.2USD as handling fee.</span>
        </div>
      </div>
    </main>
  )
}
