import { useMemo } from 'react';

import { useMetaMask } from '@/utils/hooks/useMetaMask';

export const MetaMaskConnectBtn = () => {
  const { wallet, hasProvider, connectMetaMask } = useMetaMask();

  const memoBtnText = useMemo(() => {
    if (!hasProvider) {
      return '';
    }
    if (wallet?.accounts?.length > 0) {
      const account = wallet?.accounts[0];
      return `${account.slice(0, 4)}...${account.slice(-5)}`;
    }
    return 'Connect MetaMask';
  }, [wallet, hasProvider]);
  return (
    <div style={{
      cursor: 'pointer',
    }} onClick={connectMetaMask}>
      {memoBtnText}
    </div>
  );
};
