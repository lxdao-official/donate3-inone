/* eslint-disable @next/next/no-img-element */
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState, useMemo, useEffect } from 'react'
import clsx from 'clsx'
import type { IProvider } from "@web3auth/base";
import { OpenloginAdapter } from '@web3auth/openlogin-adapter'
import { Web3Auth, Web3AuthOptions } from '@web3auth/modal'

import {
  AxelarAssetTransfer,
  CHAINS,
  Environment,
} from "@axelar-network/axelarjs-sdk";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import * as ethers from "ethers"

// import { useMetaMask } from '@/utils/hooks/useMetamask';
import { useRouter } from 'next/router';
import RPC from '@/utils/RPC';

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

export default function Home() {
  const [donation, setDonation] = useState(0)
  const { query } = useRouter()
  const clientId = 'BP8bji4wELSfVgjZeikRwOnWYbHAy7oAMXSIyQKDE7Gknao6ERHQaeGWuAG3fN_PTogvyaTI0Q_chfWMWzdnI5s';
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null)
  const [address, setAddress] = useState<string>("")
  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId,
          web3AuthNetwork: "testnet",
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x5",
            rpcTarget: "https://rpc.ankr.com/eth_goerli",
          },
        });

        const openloginAdapter = new OpenloginAdapter({
          loginSettings: {
            mfaLevel: "none",
          },
          adapterSettings: {
          }
        });
        web3auth.configureAdapter(openloginAdapter);
        setWeb3auth(web3auth);

        await web3auth.initModal();

        if (web3auth.provider) {
          setProvider(web3auth.provider);
        };

      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);

    setAddress(await getAccounts())
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
  };

  const getChainId = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const chainId = await rpc.getChainId();
    uiConsole(chainId);
  };
  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    console.log(address)
    return address
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const sendTransaction = async (address: string, token: string) => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction(address, token);
    return receipt
  };

  const writeContract = async (address: string, token: string) => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    console.log(address, token)
    const rpc = new RPC(provider);
    const receipt = await rpc.writeContract(address, token);
    return receipt
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    console.log(signedMessage)
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    uiConsole(privateKey);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }
  const DonateBtn = ({ donateTo, amount, toChain, address }:
    { donateTo: `0x${string}`, amount: number, toChain: string, address: string }) => {
    // const { wallet, hasProvider, connectMetaMask } = useMetaMask();
    const [loading, setLoading] = useState(false)
    const a = '5'


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

        let txn = await writeContract(depositAddress, ethers.parseUnits(amount.toString(), 6).toString())


        toast.success(`success, tx=${txn.hash}`, {
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
      <div className={clsx((loading || amount == 0) ? 'cursor-not-allowed bg-[#9dbd3c]' : 'cursor-pointer bg-[#d0fb51]', 'rounded-full h-[40px] w-full text-center font-bold text-white leading-[40px] text-[24px]')} onClick={address ? handleDonate : login}>
        {address ? (loading ? 'Loading...' : `Support`) : 'Connect Web3'}
      </div>
    );
  };
  return (
    <main
      className="w-screen h-screen flex flex-col justify-center items-center"
    >
      <ToastContainer></ToastContainer>
      <div className='w-[350px]  px-[20px] py-[30px] flex flex-col gap-[15px] justify-center items-center border border-gray-300 rounded-lg'>
        <div className='text-[24px] self-start font-semibold'>Donate <span className='text-[#717171]'>{query?.name || 'Donate3'}</span> aUSDC</div>
        <div className='flex gap-4 w-full items-center'>
          <div className='flex justify-center items-center gap-3 border  border-[#d0fb51] text-[12px] rounded-md w-[calc(50vw_-_240px)] h-[40px] p-2'>
            <img className='w-[30px] h-[30px] bg-[#fff] rounded-full' src={5 ? coinType[5 + '']?.icon : '/icons/delete.png'} alt="" />{5 ? coinType[5 + '']?.name : 'NotConnect'}
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
        <DonateBtn donateTo='0xb15115A15d5992A756D003AE74C0b832918fAb75' amount={donation} toChain={query.toChain as string || "420"} address={address} />
        <div className='w-full p-2  rounded-lg border border-[#d0fb51] text-[#91ae39] bg-[#d0fb5166] gap-4'>
          Only supports mubai(80001), goerli(5), linea(59140), and op-goerli(420).<br />
          <span className='font-bold'>It will use 0.2USD as handling fee.</span>
        </div>
      </div>
    </main>
  )
}