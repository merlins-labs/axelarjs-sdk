import { v4 as uuidv4 } from "uuid";
import {
  CLIENT_API_GET_FEE,
  CLIENT_API_GET_OTC,
  CLIENT_API_POST_TRANSFER_ASSET,
  OTC,
} from "../services/types";

import { RestService, SocketService } from "../services";
import { createWallet, validateDestinationAddressByChainName } from "../utils";

import { getConfigs } from "../constants";
import { TransferAssetBridgeConfig } from "./types";

export class TransferAssetBridge {
  readonly environment: string;
  readonly resourceUrl: string;

  readonly api: RestService;
  readonly socket: SocketService;

  constructor(config: TransferAssetBridgeConfig) {
    const configs = getConfigs(config.environment);

    this.environment = config.environment;
    this.resourceUrl = configs.resourceUrl;

    // handle resource url overwrite (for tests)
    if (config.overwriteResourceUrl)
      this.resourceUrl = config.overwriteResourceUrl;

    this.api = new RestService(this.resourceUrl);
    this.socket = new SocketService(this.resourceUrl);
  }

  async getDepositAddress(
    fromChain: string,
    toChain: string,
    destinationAddress: string,
    asset: string
  ): Promise<string> {
    // generate trace id
    const traceId = uuidv4();

    // verify destination address format
    const isDestinationAddressValid = validateDestinationAddressByChainName(
      toChain,
      destinationAddress,
      this.environment
    );
    if (!isDestinationAddressValid)
      throw new Error(`Invalid destination address for chain ${toChain}`);

    // auth/rate limiting
    const wallet = createWallet();

    // sign validation message
    const { validationMsg } = await this.getOneTimeCode(
      wallet.address,
      traceId
    );
    const signature = await wallet.signMessage(validationMsg);

    // get room id to listen for deposit address (to be extracted from link event)
    const roomId = await this.getInitRoomId(
      fromChain,
      toChain,
      destinationAddress,
      asset,
      wallet.address,
      signature,
      traceId
    );

    // extract deposit address from link event
    const newRoomId = await this.getLinkEvent(roomId);
    const depositAddress = this.extractDepositAddress(newRoomId);

    return depositAddress;
  }

  public async getFeeForChainAndAsset(
    chain: string,
    asset: string
  ): Promise<any> {
    return this.api
      .get(`${CLIENT_API_GET_FEE}?chainName=${chain}&assetCommonKey=${asset}`)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  }

  public async getTransferFee(
    sourceChain: string,
    destinationChain: string,
    asset: string
  ): Promise<number> {
    try {
      const sourceChainFeeInfo = await this.getFeeForChainAndAsset(
        sourceChain,
        asset
      );
      const destinationChainFeeInfo = await this.getFeeForChainAndAsset(
        destinationChain,
        asset
      );
      return (
        Number(sourceChainFeeInfo?.fee_info?.min_fee) +
        Number(destinationChainFeeInfo?.fee_info?.min_fee)
      );
    } catch (e: any) {
      throw e;
    }
  }

  public async getOneTimeCode(
    signerAddress: string,
    traceId: string
  ): Promise<OTC> {
    const otc: OTC = await this.api
      .get(`${CLIENT_API_GET_OTC}?publicAddress=${signerAddress}`, traceId)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });

    return otc;
  }

  async getInitRoomId(
    fromChain: string,
    toChain: string,
    destinationAddress: string,
    asset: string,
    publicAddress: string,
    signature: string,
    traceId: string
  ): Promise<string> {
    type RoomIdResponse = Record<"data", Record<"roomId", string>>;

    const payload = {
      fromChain,
      toChain,
      destinationAddress,
      asset,
      publicAddress,
      signature,
    };

    const response: RoomIdResponse = await this.api
      .post(CLIENT_API_POST_TRANSFER_ASSET, payload, traceId)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });

    const roomId = response?.data?.roomId;
    return roomId;
  }

  async getLinkEvent(roomId: string): Promise<string> {
    const { newRoomId } = await this.socket
      .joinRoomAndWaitForEvent(roomId)
      .catch((error) => {
        throw error;
      });

    return newRoomId;
  }

  private extractDepositAddress(roomId: string) {
    return JSON.parse(roomId)?.depositAddress;
  }
}
