import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, sepolia, WagmiConfig } from 'wagmi';
import { mainnet, polygon, polygonMumbai, goerli, optimism, arbitrum, zora, arbitrumGoerli, optimismGoerli } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import Script from 'next/script';
// import { Linea } from '@/utils/linea';
import { MetaMaskContextProvider } from '@/utils/hooks/useMetaMask';

const { chains, publicClient } = configureChains(
  [mainnet, optimism, polygon, arbitrum, goerli, polygonMumbai, sepolia, optimismGoerli],
  // [mainnet, polygon, optimism, arbitrum, zora],
  [
    // alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'multi-donate',
  projectId: '5aa05da3efe2d1f2fbd832d55bc2b4ee',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});


export default function App({ Component, pageProps }: AppProps) {
  return (
    <MetaMaskContextProvider>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </MetaMaskContextProvider>
  );
}
