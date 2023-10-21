import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { MetaMaskContextProvider } from '@/utils/hooks/useMetaMask';

export default function App({ Component, pageProps }: AppProps) {
  return <MetaMaskContextProvider>
    <Component {...pageProps} />
  </MetaMaskContextProvider>
}
