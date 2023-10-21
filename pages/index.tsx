import Image from 'next/image'
import { Inter } from 'next/font/google'
import { MetaMaskConnectBtn } from '@/components/MetaMaskConnectBtn'
import { useAccount } from 'wagmi'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { address } = useAccount()
  console.log(address)
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >

      <MetaMaskConnectBtn />
    </main>
  )
}
