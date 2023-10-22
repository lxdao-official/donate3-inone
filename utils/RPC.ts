import type { IProvider } from "@web3auth/base";
import { Signer, ethers } from "ethers";

export default class EthereumRpc {
  private provider: IProvider;

  constructor(provider: IProvider) {
    this.provider = provider;
  }

  async getChainId(): Promise<any> {
    try {
      const ethersProvider = new ethers.BrowserProvider(this.provider);
      // Get the connected Chain's ID
      const networkDetails = await ethersProvider.getNetwork();

      return networkDetails.chainId;
    } catch (error) {
      return error;
    }
  }

  async getAccounts(): Promise<any> {
    try {
      const ethersProvider = new ethers.BrowserProvider(this.provider);
      const signer = await ethersProvider.getSigner();

      // Get user's Ethereum public address
      const address = signer.getAddress();

      return address;
    } catch (error) {
      return error;
    }
  }

  async getSigner(): Promise<Signer> {
    const ethersProvider = new ethers.BrowserProvider(this.provider);
    const signer = await ethersProvider.getSigner();
    return signer;
  }

  async getBalance(): Promise<string> {
    try {
      const ethersProvider = new ethers.BrowserProvider(this.provider);
      const signer = await ethersProvider.getSigner();

      // Get user's Ethereum public address
      const address = signer.getAddress();

      // Get user's balance in ether
      const balance = ethers.formatEther(
        await ethersProvider.getBalance(address) // Balance is in wei
      );

      return balance;
    } catch (error) {
      return error as string;
    }
  }

  async writeContract(destination: string, amount: string): Promise<any> {
    const abi = [
      "function transfer(address to, uint256 amount)"
    ]

    const ethersProvider = new ethers.BrowserProvider(this.provider);
    const signer = await ethersProvider.getSigner();
    const contract = new ethers.Contract("0x254d06f33bDc5b8ee05b2ea472107E300226659A", abi, signer)
    // Submit transaction to the blockchain
    const tx = await contract.transfer(destination, BigInt(amount))
    const receipt = await tx.wait();

    return receipt;

  }

  async sendTransaction(destination: string, amount: string): Promise<any> {

    const ethersProvider = new ethers.BrowserProvider(this.provider);
    const signer = ethersProvider.getSigner();

    // Submit transaction to the blockchain
    const tx = await (
      await signer
    ).sendTransaction({
      to: destination,
      value: amount,
    });

    const receipt = await tx.wait();

    return receipt;

  }

  async signMessage(msg: string) {
    const ethersProvider = new ethers.BrowserProvider(this.provider);
    const signer = ethersProvider.getSigner();
    const signedMessage = await (await signer).signMessage(msg);

    return signedMessage;
  }

  async getPrivateKey(): Promise<any> {
    try {
      const privateKey = await this.provider.request({
        method: "eth_private_key",
      });

      return privateKey;
    } catch (error) {
      return error as string;
    }
  }
}