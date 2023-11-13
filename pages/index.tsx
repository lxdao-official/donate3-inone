"use client";
/* eslint-disable @next/next/no-img-element */
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState, useMemo, useEffect } from "react";
import clsx from "clsx";
import type { IProvider } from "@web3auth/base";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { Web3Auth, Web3AuthOptions } from "@web3auth/modal";
import { Signer, getBytes } from "ethers";
import {
  decodeAbiParameters,
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
} from "viem";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { ethers } from "ethers";
import RPC from "@/utils/RPC";
import { Client } from "@xmtp/xmtp-js";
import ERC20ABI from "@/abi/ERC20.json";
import MessageTransmitterABI from "@/abi/MessageTransmitter.json";
// import { useMetaMask } from '@/utils/hooks/useMetamask';
import { useRouter } from "next/router";
import { MetamaskCard } from "../public/components/MetamaskCard";
import { NotifiContext } from "@notifi-network/notifi-react-card";

//@ts-ignore
let xmtp = null;
//Fabri wallet
let WALLET_TO = null;
//@ts-ignore
let conversation = null;

interface Chain {
  name: string;
  icon: string;
  index: number;
}

interface ChainList {
  [key: string]: Chain;
}

const coinType: ChainList = {
  "5": {
    name: "ETH Goerli",
    icon: "/icons/support/ethereum.svg",
    index: 0,
  },
  "59140": {
    name: "Avalanche",
    icon: "/icons/support/avax.png",
    index: 1,
  },
  "420": {
    name: "Op Goerli",
    icon: "/icons/support/optimism.svg",
    index: 2,
  },
  "421613": {
    name: "Arb Goerli",
    icon: "/icons/support/optimism.svg",
    index: 3,
  },
  "84531": {
    name: "Base Goerli",
    icon: "/icons/support/optimism.svg",
    index: 6,
  },
};

export default function Home() {
  const [donation, setDonation] = useState(0);
  const { query } = useRouter();
  const [chain] = useState({
    name: "Op Goerli",
  });
  const clientId =
    process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID ??
    "BPXXQzy4os6sTlpOrHSPbq3BFHeyTgtCKcxWrOOYxpO1Wzfk3AdsdG6MQikwdxBJtf0eJrxEmURYPflRB8CGv0A";
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [address, setAddress] = useState<string>("");
  const [privateKey, savePrviateKey] = useLocalStorage("key", null);
  const [signer, setSigner] = useState<ethers.Wallet | null>(null);
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
          adapterSettings: {},
        });
        web3auth.configureAdapter(openloginAdapter);
        setWeb3auth(web3auth);

        await web3auth.initModal();

        if (web3auth.provider) {
          setProvider(web3auth.provider);
        }
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

    if (privateKey) {
      let prov = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli");
      let signer = new ethers.Wallet(privateKey, prov);
      setSigner(signer);
      setAddress(await signer.getAddress());
      console.log(await signer.getAddress());
      return;
    }
    const web3authProvider = await web3auth.connect();
    let private_key = await web3authProvider?.request({
      method: "eth_private_key",
    });
    console.log(private_key);
    savePrviateKey(private_key as string);

    let signer = new ethers.Wallet(
      // @ts-ignore
      private_key,
      new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_goerli")
    );
    setSigner(signer);
    setAddress(await signer.getAddress());
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

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    console.log(address);
    return address;
  };

  const writeContract = async (
    toChain: string,
    amount: string,
    destinationDomain: number,
    destinationAddress: `0x${string}`
  ) => {
    if (!signer) {
      uiConsole("provider not initialized yet");
      return;
    }
    let mintRecipient = encodeAbiParameters(parseAbiParameters("address"), [
      destinationAddress,
    ]);
    console.log(amount, destinationDomain, mintRecipient);

    let usdc_contract = new ethers.Contract(
      "0x07865c6E87B9F70255377e024ace6630C1Eaa37F",
      ERC20ABI.abi,
      signer
    );

    let approved_amount = BigInt(
      await usdc_contract.allowance(
        address,
        "0xD0C3da58f55358142b8d3e06C1C30c5C6114EFE8"
      )
    );
    console.log(approved_amount.toString());
    if (approved_amount < BigInt(amount)) {
      let tx = await usdc_contract.approve(
        "0xD0C3da58f55358142b8d3e06C1C30c5C6114EFE8",
        BigInt(amount)
      );
      const receipt = await tx.wait();
      console.log("approve", tx.hash, receipt);
    }
    const abi = [
      "function depositForBurn(uint256 amount,uint32 destinationDomain,bytes32 mintRecipient,address burnToken)",
    ];

    const contract = new ethers.Contract(
      "0xD0C3da58f55358142b8d3e06C1C30c5C6114EFE8",
      abi,
      signer
    );
    // Submit transaction to the blockchain
    const tx = await contract.depositForBurn(
      BigInt(amount),
      destinationDomain,
      mintRecipient,
      "0x07865c6E87B9F70255377e024ace6630C1Eaa37F"
    );
    let receipt = await tx.wait();

    let toChainClientSigner = new ethers.Wallet(
      privateKey,
      new ethers.JsonRpcProvider(
        {
          "59140": {
            url: `https://rpc.ankr.com/avalanche_fuji`,
          },
        }["59140"]?.url
      )
    );
    // @ts-ignore
    let log = receipt.logs.find((log) => {
      return (
        log.topics.length == 1 &&
        log.topics[0] ==
          "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036"
      );
    });
    console.log(log.data);
    let messageBytes = decodeAbiParameters(
      parseAbiParameters("bytes"),
      log.data
    )[0];
    console.log(log.data);
    const messageHash = keccak256(messageBytes);

    console.log(messageHash);
    let callCount = 0;
    const maxCalls = 5;
    const intervalTime = 7000; // 5秒间隔
    let attestationResponse = { status: "pending" };
    while (attestationResponse.status != "complete") {
      const response = await fetch(
        `https://iris-api-sandbox.circle.com/attestations/${messageHash}`
      );
      attestationResponse = await response.json();
      await new Promise((r) => setTimeout(r, 5000));
    }
    // @ts-ignore
    const attestationSignature = attestationResponse.attestation;
    console.log(`Signature: ${attestationSignature}`);
    let mint_contract = new ethers.Contract(
      "0xa9fb1b3009dcb79e2fe346c16a604b8fa8ae0a79",
      MessageTransmitterABI,
      toChainClientSigner
    );
    let tx1 = await mint_contract.receiveMessage(
      messageBytes,
      attestationSignature
    );
    receipt = await tx1.wait();
    return receipt;
  };

  const signMessage = async (msg: string) => {
    if (!signer) {
      uiConsole("provider not initialized yet");
      return;
    }
    const signedMessage = await signer.signMessage(msg);
    console.log(signedMessage);
    return signMessage;
  };
  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }
  const DonateBtn = ({
    donateTo,
    amount,
    toChain,
    address,
  }: {
    donateTo: `0x${string}`;
    amount: number;
    toChain: string;
    address: string;
  }) => {
    // const { wallet, hasProvider, connectMetaMask } = useMetaMask();
    const [loading, setLoading] = useState(false);
    const a = "5";
    // Create a client
    async function create_a_client() {
      //@ts-ignore
      if (!signer) {
        // console.log("Wallet is not initialized");
        return;
      }

      xmtp = await Client.create(signer, { env: "production" });
      // console.log("Client created", xmtp.address);
    }

    //Check if an address is on the network
    async function check_if_an_address_is_on_the_network() {
      //Message this XMTP message bot to get an immediate automated reply:
      //gm.xmtp.eth (0x937C0d4a6294cdfa575de17382c7076b579DC176) env:production
      //
      WALLET_TO = donateTo;
      //@ts-ignore
      if (xmtp) {
        const isOnDevNetwork = await xmtp.canMessage(WALLET_TO);
        // console.log(`Can message: ${isOnDevNetwork}`);
        return isOnDevNetwork;
      }
      return false;
    }

    //Start a new conversation
    async function start_a_new_conversation() {
      const canMessage = await check_if_an_address_is_on_the_network();
      if (!canMessage) {
        // console.log("Cannot message this address. Exiting...");
        return;
      }
      //@ts-ignore
      if (xmtp) {
        conversation = await xmtp.conversations.newConversation(donateTo);
        // console.log(`Conversation created with ${conversation.peerAddress}`);
      }
    }

    //Send a message
    async function send_a_message() {
      //@ts-ignore
      if (conversation) {
        const message = await conversation.send(
          `I transferred to ${donateTo} ${amount} 1USDC, form ${chain?.name} to ${toChain}, Remember to check it`
        );
        console.log(`Message sent: "${message.content}"`);
        return message;
      }
    }

    const sendMessageByXmtp = async () => {
      await create_a_client();
      await start_a_new_conversation();
      await send_a_message();
    };

    const handleDonate = async () => {
      toast("🦄 Sending Donation!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setLoading(true);
      try {
        const destinationAddress = donateTo;

        let txn = await writeContract(
          toChain,
          ethers.parseUnits(amount.toString(), 6).toString(),
          coinType[toChain].index,
          destinationAddress
        );

        await sendMessageByXmtp();

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
        console.log(error);
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
        setLoading(false);
      }
    };

    return (
      <div
        className={clsx(
          loading || amount == 0
            ? "cursor-not-allowed bg-[#9dbd3c]"
            : "cursor-pointer bg-[#d0fb51]",
          "rounded-full h-[40px] w-full text-center font-bold text-white leading-[40px] text-[24px]"
        )}
        onClick={address ? handleDonate : login}
      >
        {address ? (loading ? "Loading..." : `Support`) : "Connect Web3"}
      </div>
    );
  };
  console.log(query.toAddress);
  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center">
      <ToastContainer></ToastContainer>
      <div className="w-[350px]  px-[20px] py-[30px] flex flex-col gap-[15px] justify-center items-center border border-gray-300 rounded-lg">
        <div className="text-[24px] self-start font-semibold">
          Donate{" "}
          <span className="text-[#717171]">{query?.name || "Donate3"}</span>{" "}
          USDC
        </div>
        <div className="flex gap-4 w-full items-center">
          <div className="flex justify-center items-center gap-3 border  border-[#d0fb51] text-[12px] rounded-md w-[calc(50vw_-_240px)] h-[40px] p-2">
            <img
              className="w-[30px] h-[30px] bg-[#fff] rounded-full"
              src={coinType["420"]?.icon ?? "/icons/delete.png"}
              alt=""
            />
            {coinType["420"]?.name ?? "NotConnect"}
          </div>
          <img width="20px" src="./ar.png" alt="" />
          <div className="flex justify-center items-center gap-3 border  border-[#d0fb51] text-[12px] rounded-md w-[calc(50vw_-_240px)] h-[40px] p-2">
            <img
              className="w-[30px] h-[30px] bg-[#132333] rounded-full"
              src={coinType[(query.toChain as string) || "59140"]?.icon}
              alt=""
            />
            {coinType[(query.toChain as string) || "59140"]?.name}
          </div>
        </div>
        <div className="w-full h-[60px] flex justify-center items-center rounded-lg border border-[#d0fb51] bg-[#d0fb5166] gap-4">
          <div className="text-[50px]">💵</div>x
          {[1, 3, 5].map((v, i) => {
            return (
              <div
                onClick={() => {
                  setDonation(v);
                }}
                key={i}
                className={clsx(
                  donation == v
                    ? "bg-[#d0fb51] text-white"
                    : "bg-white text-[#d0fb51]",
                  "w-[35px] h-[35px] leading-[35px] rounded-full text-center cursor-pointer"
                )}
              >
                {v}
              </div>
            );
          })}
          <input
            value={donation}
            className="text-center rounded-md w-[35px] h-[35px] border border-[#d0fb51]"
            onChange={(e: any) => setDonation(e.target.value)}
          ></input>
        </div>
        <DonateBtn
          donateTo={
            typeof query.toAddress != "undefined"
              ? (query.toAddress as `0x${string}`)
              : "0xb15115A15d5992A756D003AE74C0b832918fAb75"
          }
          amount={donation}
          toChain={(query.toChain as string) || "59140"}
          address={address}
        />
        <div className="w-full p-2  rounded-lg border border-[#d0fb51] text-[#91ae39] bg-[#d0fb5166] gap-4">
          Only supports arb goerli(421613),AVAX(59140) , goerli(5) and
          op-goerli(420).
          <br />
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          top: 10,
          right: 20,
        }}
      >
        <NotifiContext
          dappAddress="597833184"
          env="Production"
          signMessage={async (message: Uint8Array) => {
            //@ts-ignore
            const result = (await signMessage(message)) ?? "";
            // @ts-ignore
            return getBytes(result);
          }}
          walletPublicKey={address ?? ""}
          walletBlockchain="ETHEREUM"
        >
          <MetamaskCard address={address} />
        </NotifiContext>
      </div>
    </main>
  );
}
const useLocalStorage = (key: string, initialValue: string | null) => {
  const [state, setState] = useState(() => {
    // Initialize the state
    try {
      const value = window.localStorage.getItem(key);
      // Check if the local storage already has any values,
      // otherwise initialize it with the passed initialValue
      return value ? JSON.parse(value) : initialValue;
    } catch (error) {
      console.log(error);
    }
  });

  const setValue = (value: any) => {
    try {
      // If the passed value is a callback function,
      //  then call it with the existing state.
      const valueToStore = value instanceof Function ? value(state) : value;
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      setState(value);
    } catch (error) {
      console.log(error);
    }
  };

  return [state, setValue];
};
