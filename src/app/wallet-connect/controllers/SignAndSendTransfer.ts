import { SignerPayloadJSON } from "@polkadot/types/types";
import { ApiPromise } from "@polkadot/api";

export class SignAndSendTransferService {
  private api: ApiPromise | null = null;
  private isReady: boolean = false;
  private txHash: string | null = null;
  private isSigning: boolean = false;
  private error: string | null = null;

  constructor(api: ApiPromise, isApiReady: boolean) {
    this.api = api;
    this.isReady = isApiReady;
  }

  /**
   * Sign and send a transfer transaction.
   */
  async signAndSendTransfer(
    accounts: any[],
    signTransaction: (payload: SignerPayloadJSON) => Promise<string>,
    address: string,
    amount: any
  ): Promise<string | null> {
    if (!accounts || accounts.length === 0) {
      this.error = "No accounts available";
      return null;
    }

    if (!this.isReady || !this.api) {
      this.error = "API is not ready";
      return null;
    }

    this.isSigning = true;
    this.error = null;

    try {
      const runtimeVersion = await this.api.rpc.state.getRuntimeVersion();
      const genesisHash = await this.api.rpc.chain.getBlockHash(0);
      const latestBlock:any = await this.api.rpc.chain.getHeader();
      const blockHash = latestBlock.hash.toHex();
      const blockNumber = latestBlock.number.toNumber();
      const era = this.api
        .createType("ExtrinsicEra", {
          current: latestBlock.number,
          period: 64,
        })
        .toHex();

      const { nonce }: any = await this.api.query.system.account(
        accounts[0].address
      );

      const extrinsic = this.api.tx.balances.transferKeepAlive(address, amount);

      const method = extrinsic.method.toHex();

      const payload: SignerPayloadJSON = {
        address: accounts[0].address,
        blockHash,
        blockNumber: this.api.registry
          .createType("BlockNumber", blockNumber)
          .toHex(),
        era,
        genesisHash: genesisHash.toHex(),
        method,
        nonce: this.api.registry.createType("Compact<Index>", nonce).toHex(),
        specVersion: this.api.registry
          .createType("u32", runtimeVersion.specVersion)
          .toHex(),
        tip: "0x00",
        transactionVersion: this.api.registry
          .createType("u32", runtimeVersion.transactionVersion)
          .toHex(),
        signedExtensions: this.api.registry.signedExtensions,
        version: 4,
      };

      const signature: any = await signTransaction(payload);

      const extrinsicPayload: any = {
        method: payload.method,
        blockHash: payload.blockHash,
        era: this.api.createType("ExtrinsicEra", payload.era),
        nonce: this.api.registry.createType("Index", payload.nonce).toNumber(),
        tip: this.api.registry.createType("Balance", payload.tip).toBn(),
        specVersion: this.api.createType("u32", payload.specVersion),
        transactionVersion: this.api.createType(
          "u32",
          payload.transactionVersion
        ),
        genesisHash: payload.genesisHash,
      };

      const signedExtrinsic = extrinsic.addSignature(
        payload.address,
        signature,
        extrinsicPayload
      );

      console.log("Signed Extrinsic", signedExtrinsic);

      const txId = await this.api.rpc.author.submitExtrinsic(signedExtrinsic);

      this.txHash = txId.toString();
      console.log("Transaction Id", txId.toString());

      return txId.toString();
    } catch (error: any) {
      this.error = error.message;
      console.error("Error signing transaction:", error);
      return null;
    } finally {
      this.isSigning = false;
    }
  }

  /**
   * Get the last transaction hash.
   */
  getTxHash(): string | null {
    return this.txHash;
  }

  /**
   * Check if a transaction is currently being signed.
   */
  getIsSigning(): boolean {
    return this.isSigning;
  }

  /**
   * Get the last error message.
   */
  getError(): string | null {
    return this.error;
  }
}
