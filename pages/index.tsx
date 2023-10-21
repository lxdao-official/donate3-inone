import Image from 'next/image'
import { Inter } from 'next/font/google'
// import { MetaMaskConnectBtn } from '@/components/MetaMaskConnectBtn'
import { useAccount } from 'wagmi'
import { useEffect, useState, useMemo } from 'react'
import clsx from 'clsx'

import { useMetaMask } from '@/utils/hooks/useMetaMask';

const DonateBtn = () => {
  const { wallet, hasProvider, connectMetaMask } = useMetaMask();

  const memoBtnText = useMemo(() => {
    if (!hasProvider) {
      return '';
    }
    if (wallet?.accounts?.length > 0) {
      const account = wallet?.accounts[0];
      // return `${account.slice(0, 4)}...${account.slice(-5)}`;
      return `Support`;
    }
    return 'Connect MetaMask';
  }, [wallet, hasProvider]);
  return (
    <div className='rounded-full bg-[#d0fb51] h-[40px] w-full text-center font-bold text-white leading-[40px] text-[24px]' onClick={connectMetaMask}>
      {memoBtnText}
    </div>
  );
};

export default function Home() {
  const { address } = useAccount()
  const [donation, setDonation] = useState(0)
  console.log(address)
  return (
    <main
      className="w-screen h-screen flex flex-col justify-center items-center"
    >
      <div className='w-[350px]  px-[20px] py-[30px] flex flex-col gap-[15px] justify-center items-center border border-gray-300 rounded-lg'>
        <div className='text-[24px] self-start font-semibold'>Donate <span className='text-[#717171]'>0xhardman</span> aUSDC</div>
        <div className='w-full h-[60px] flex justify-center items-center rounded-lg border border-[#d0fb51] bg-[#d0fb5166] gap-4'>
          <div className='text-[50px]'>💵</div>
          x
          {[1, 3, 5].map((v, i) => {
            return <div onClick={() => {
              console.log(v)
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
        {/* <div className='rounded-full bg-[#d0fb51] h-[40px] w-full text-center font-bold text-white leading-[40px] text-[24px]'>Support</div> */}
        <DonateBtn />
      </div>
    </main>
  )
}
