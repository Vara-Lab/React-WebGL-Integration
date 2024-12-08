import { WalletConnect } from "../services/WalletConnect";
import type { SignerPayloadJSON, SignerPayloadRaw } from "@polkadot/types/types";

class WalletConnectService {
  private connected: boolean = false;
  private accounts: any[] = [];
  private wcService: WalletConnect;

  constructor() {
    this.wcService = new WalletConnect();
  }


  async enableWalletConnect(network: string = "test"): Promise<void> {
    try {
      await this.wcService.setNamespace("polkadot");
      await this.wcService.enable(network);

      this.accounts = await this.wcService.getAccounts();
      this.connected = true;
      console.log("Wallet connected successfully:", this.accounts);
    } catch (error) {
      console.error("WalletConnect Error:", error);
      throw error;
    }
  }


  async signTransaction(payload: SignerPayloadJSON): Promise<string> {
    if (!this.connected) {
      throw new Error("Wallet not connected");
    }
    try {
      const signature = await this.wcService.signTransaction(payload);
      console.log("Transaction signed:", signature);
      return signature;
    } catch (error) {
      console.error("Error signing transaction:", error);
      throw error;
    }
  }


  async signMessage(raw: SignerPayloadRaw): Promise<string> {
    if (!this.connected) {
      throw new Error("Wallet not connected");
    }
    try {
      const signature = await this.wcService.signMessage(raw);
      console.log("Message signed:", signature);
      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  }


  isConnected(): boolean {
    return this.connected;
  }


  getAccounts(): any[] {
    return this.accounts;
  }
}

export const walletConnectService = new WalletConnectService();
