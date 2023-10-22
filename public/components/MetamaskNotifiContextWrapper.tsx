import { NotifiContext } from '@notifi-network/notifi-react-card';
import { getBytes } from 'ethers';
import { PropsWithChildren } from 'react';

export const MetamaskNotifiContextWrapper: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const { address, isConnected } = useAccount();

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const { signMessageAsync } = useSignMessage();

  return (
    <div>
      <button onClick={() => connect()} disabled={isConnected}>
        {isConnected ? "" : 'Connect Wallet'}
      </button>
      {isConnected ? (
        <NotifiContext
          dappAddress="597833184"
          env="Production"
          signMessage={async (message: Uint8Array) => {
            //@ts-ignore
            const result = await signMessageAsync({ message });
            return getBytes(result);
          }}
          walletPublicKey={address ?? ''}
          walletBlockchain="ETHEREUM"
        >
          {children}
        </NotifiContext>
      ) : null}
    </div>
  );
};
