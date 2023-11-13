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

  async writeContract(
    amount: string,
    destinationDomain: number,
    mintRecipient: string
  ): Promise<any> {
    const abi = [
      "function depositForBurn(uint256 amount,uint32 destinationDomain,bytes32 mintRecipient,address burnToken)",
    ];

    const ethersProvider = new ethers.BrowserProvider(this.provider);
    const signer = await ethersProvider.getSigner();
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
