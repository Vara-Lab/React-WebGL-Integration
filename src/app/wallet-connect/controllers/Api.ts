import { GearApi } from "@gear-js/api";

export class ApiService {
  private api: GearApi | null = null;
  private isReady: boolean = false;
  private error: string | null = null;

  constructor() {}

  
  async initializeApi(providerAddress: string = "wss://testnet.vara.network"): Promise<void> {
    try {
      const apiInstance = await GearApi.create({ providerAddress });
      await apiInstance.isReady;
      this.api = apiInstance;
      this.isReady = true;
      console.log("Gear API is ready");
    } catch (err: any) {
      this.error = err.message;
      console.error("Error initializing API:", err.message);
      throw err;
    }
  }


  getApi(): GearApi | null {
    return this.api;
  }


  getIsReady(): boolean {
    return this.isReady;
  }


  getError(): string | null {
    return this.error;
  }
}
