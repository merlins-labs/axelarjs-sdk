import { v4 as uuidv4 } from "uuid";
import {
  CallbackStatus,
  CLIENT_API_GET_FEE,
  CLIENT_API_GET_OTC,
  CLIENT_API_POST_TRANSFER_ASSET,
  OTC,
  SourceOrDestination,
  StatusResponse,
} from "../services/types";
import { AssetInfo } from "../assets/types";
import {
  AssetTransferObject,
  AssetInfoWithTrace,
  AssetInfoResponse,
  AssetAndChainInfo,
} from "../chains/types";

import { RestService, SocketService } from "../services";
import {
  createWallet,
  getWaitingService,
  validateDestinationAddressByChainName,
} from "../utils";
import { validateDestinationAddressByChainSymbol } from "../utils";
import { getConfigs } from "../constants";
import {
  GetDepositAddressDto,
  GetDepositAddressPayload,
  TransferAssetBridgeConfig,
} from "./types";

export class TransferAssetBridge {
  readonly environment: string;
  readonly resourceUrl: string;

  readonly api: RestService;
  readonly socket: SocketService;

  constructor(config: TransferAssetBridgeConfig) {
    const configs = getConfigs(config.environment);

    this.environment = config.environment;
    this.resourceUrl = configs.resourceUrl;
    this.api = new RestService(this.resourceUrl);
    this.socket = new SocketService(this.resourceUrl);
  }

  public async getFeeForChainAndAsset(
    chain: string,
    asset: string
  ): Promise<any> {
    return this.api
      .get_v2(
        `${CLIENT_API_GET_FEE}?chainName=${chain}&assetCommonKey=${asset}`
      )
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
        +sourceChainFeeInfo?.fee_info?.min_fee +
        +destinationChainFeeInfo?.fee_info?.min_fee
      );
    } catch (e: any) {
      throw e;
    }
  }

  public async getInitRoomId(
    payload: AssetTransferObject,
    showAlerts: boolean,
    traceId: string
  ): Promise<{ roomId: string }> {
    try {
      const response = await this.api.post(
        CLIENT_API_POST_TRANSFER_ASSET,
        payload,
        {
          "x-trace-id": traceId,
        }
      );
      return response.data;
    } catch (e: any) {
      if (showAlerts && e?.message && !e?.uncaught) {
        alert(
          "There was a problem in attempting to generate a deposit address. Details: " +
            JSON.stringify(e)
        );
      }
      throw e;
    }
  }

  public async getOneTimeCode(
    signerAddress: string,
    traceId: string
  ): Promise<OTC> {
    const otc: OTC = await this.api
      .get_v2(`${CLIENT_API_GET_OTC}?publicAddress=${signerAddress}`, traceId)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });

    return otc;
  }

  async getInitRoomId_v2(
    payload: GetDepositAddressPayload & { signature: string },
    traceId: string
  ): Promise<string> {
    type RoomIdResponse = Record<"data", Record<"roomId", string>>;

    const response: RoomIdResponse = await this.api
      .post_v2(CLIENT_API_POST_TRANSFER_ASSET, payload, traceId)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });

    const roomId = response?.data?.roomId;
    return roomId;
  }

  async getDepositAddress(dto: GetDepositAddressDto): Promise<string> {
    // generate trace id
    const traceId = uuidv4();

    const isDestinationAddressValid = validateDestinationAddressByChainName(
      dto.payload.toChain,
      dto.payload.destinationAddress,
      this.environment
    );
    if (!isDestinationAddressValid)
      throw new Error(
        `Invalid destination address for chain ${dto.payload.toChain}`
      );

    // use auth
    const wallet = createWallet();
    const { validationMsg } = await this.getOneTimeCode(
      wallet.address,
      traceId
    );
    const sig = await wallet.signMessage(validationMsg);

    const payload: GetDepositAddressPayload & {
      signature: string;
      publicAddress: string;
    } = {
      ...dto.payload,
      signature: sig,
      publicAddress: wallet.address,
    };

    const roomId = await this.getInitRoomId_v2(payload, traceId);
    const newRoomId = await this.getLinkEvent_v2(roomId);
    const depositAddress = this.extractDepositAddress(newRoomId);

    console.log("deposit address!", depositAddress);

    return depositAddress;
  }

  /**
   * @deprecated The method should not be used and will soon be removed
   */
  async getLinkEvent(
    roomId: string,
    assetAndChainInfo: AssetAndChainInfo,
    waitCb: StatusResponse,
    errCb: any,
    sOrDChain: SourceOrDestination
  ) {
    const { assetInfo, sourceChainInfo } = assetAndChainInfo;
    const waitingService = await getWaitingService(
      sourceChainInfo,
      assetInfo,
      sOrDChain,
      this.environment
    );

    try {
      const response = await waitingService.waitForLinkEvent(
        roomId,
        waitCb,
        this.socket
      );
      return response;
    } catch (e) {
      errCb(e);
    }
  }

  async getLinkEvent_v2(roomId: string): Promise<string> {
    const sockets = new SocketService(this.resourceUrl);

    return new Promise((resolve) => {
      sockets.joinRoomAndWaitForEvent(roomId, (data: any) => {
        resolve(data.newRoomId);
      });
    });
  }

  private async confirmDeposit(
    roomId: string,
    assetAndChainInfo: AssetAndChainInfo,
    waitCb: StatusResponse,
    errCb: any,
    sOrDChain: SourceOrDestination
  ) {
    const { assetInfo, sourceChainInfo } = assetAndChainInfo;
    const waitingService = await getWaitingService(
      sourceChainInfo,
      assetInfo,
      sOrDChain,
      this.environment
    );

    try {
      const response = await waitingService.waitForDepositConfirmation(
        roomId,
        waitCb,
        this.socket
      );
      return response;
    } catch (e) {
      errCb(e);
    }
  }

  /**
   * @deprecated The method should not be used and will soon be removed
   */
  private async detectTransferOnDestinationChain(
    roomId: string,
    assetAndChainInfo: AssetAndChainInfo,
    waitCb: StatusResponse,
    errCb: any,
    sOrDChain: SourceOrDestination
  ) {
    const { assetInfo, destinationChainInfo } = assetAndChainInfo;
    const waitingService = await getWaitingService(
      destinationChainInfo,
      assetInfo,
      sOrDChain,
      this.environment
    );
    try {
      if (assetAndChainInfo.sourceChainInfo.module === "evm") {
        // evm -> cosmos transfer
        await waitingService.waitForTransferEvent(
          assetAndChainInfo,
          waitCb,
          this.socket,
          roomId
        );
      } else {
        // cosmos -> evm transfer
        await waitingService.waitForTransferEvent(
          assetAndChainInfo,
          waitCb,
          this.socket,
          roomId
        );
      }
    } catch (e) {
      errCb(e);
    }
  }

  private extractDepositAddress(roomId: string) {
    // eg: {"depositAddress":"axelar1hwfjznc7zqfdfexczsec9rrz7cetyu3jlg358ugsxfvj8gjlcfzqjynltz","sourceModule":"axelarnet","type":"deposit-confirmation"}
    return JSON.parse(roomId)?.depositAddress;
  }
}
