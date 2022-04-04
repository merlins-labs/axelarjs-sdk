import { CLIENT_API_GET_OTC, CLIENT_API_POST_TRANSFER_ASSET } from "../..";
import { TransferAssetBridge } from "../TransferAssetBridge";
import { Environment } from "../types";
import {
  apiErrorStub,
  depositAddressPayloadStub,
  ethAddressStub,
  otcStub,
  roomIdStub,
  uuidStub,
} from "./stubs";

describe("TransferAssetBridge", () => {
  describe("on init", () => {
    let bridge: TransferAssetBridge;

    beforeEach(() => {
      bridge = new TransferAssetBridge({
        environment: Environment.TESTNET,
      });
    });

    describe("TransferAssetBridge", () => {
      it("should be defined", () => {
        expect(bridge).toBeDefined();
      });

      it("should have environment", () => {
        expect(bridge.environment).toBeTruthy();
      });

      it("should have resource url", () => {
        expect(bridge.resourceUrl).toBeTruthy();
      });
    });

    describe("RestService", () => {
      it("should be defined", () => {
        expect(bridge.api).toBeDefined();
      });
    });

    describe("SocketService", () => {
      it("should be defined", () => {
        expect(bridge.socket).toBeDefined();
      });
    });
  });

  describe("getOneTimeCode()", () => {
    let bridge: TransferAssetBridge;

    beforeEach(() => {
      bridge = new TransferAssetBridge({
        environment: Environment.TESTNET,
      });
    });

    describe("on error", () => {
      describe("when called", () => {
        let otc: any;
        let error: any;

        beforeEach(async () => {
          jest.spyOn(bridge.api, "get_v2").mockRejectedValue(apiErrorStub());

          otc = await bridge
            .getOneTimeCode(ethAddressStub(), uuidStub())
            .catch((_error) => {
              error = _error;
            });
        });

        describe("api", () => {
          it("should be called", () => {
            expect(bridge.api.get_v2).toHaveBeenCalledWith(
              `${CLIENT_API_GET_OTC}?publicAddress=${ethAddressStub()}`,
              uuidStub()
            );
          });
        });

        describe("getOneTimeCode()", () => {
          it("shoud not return", () => {
            expect(otc).toBeUndefined();
          });
          it("should throw", () => {
            expect(error).toEqual(apiErrorStub());
          });
        });
      });
    });

    describe("on success", () => {
      describe("when called", () => {
        let otc: any;

        beforeEach(async () => {
          jest.spyOn(bridge.api, "get_v2").mockResolvedValue(otcStub());
          otc = await bridge.getOneTimeCode(ethAddressStub(), uuidStub());
        });

        describe("api", () => {
          it("should be called", () => {
            expect(bridge.api.get_v2).toHaveBeenCalledWith(
              `${CLIENT_API_GET_OTC}?publicAddress=${ethAddressStub()}`,
              uuidStub()
            );
          });
        });

        describe("getOneTimeCode()", () => {
          it("shoud return", () => {
            expect(otc).toEqual(otcStub());
          });
        });
      });
    });
  });

  describe("getInitRoomId_v2()", () => {
    let bridge: TransferAssetBridge;

    beforeEach(() => {
      bridge = new TransferAssetBridge({
        environment: Environment.TESTNET,
      });
    });

    describe("on error", () => {
      describe("when called", () => {
        let roomId: any;
        let error: any;

        beforeEach(async () => {
          jest.spyOn(bridge.api, "post_v2").mockRejectedValue(apiErrorStub());

          roomId = await bridge
            .getInitRoomId_v2(depositAddressPayloadStub(), uuidStub())
            .catch((_error) => {
              error = _error;
            });
        });

        describe("api", () => {
          it("should be called", () => {
            expect(bridge.api.post_v2).toHaveBeenCalledWith(
              CLIENT_API_POST_TRANSFER_ASSET,
              depositAddressPayloadStub(),
              uuidStub()
            );
          });
        });

        describe("getInitRoomId_v2()", () => {
          it("should throw", () => {
            expect(error).toEqual(apiErrorStub());
          });
          it("shoud return", () => {
            expect(roomId).toBeUndefined();
          });
        });
      });
    });

    describe("on success", () => {
      describe("when called", () => {
        let roomId: any;
        beforeEach(async () => {
          jest.spyOn(bridge.api, "post_v2").mockResolvedValue({
            data: roomIdStub(),
          });

          roomId = await bridge.getInitRoomId_v2(
            depositAddressPayloadStub(),
            uuidStub()
          );
        });

        describe("api", () => {
          it("should be called", () => {
            expect(bridge.api.post_v2).toHaveBeenCalledWith(
              CLIENT_API_POST_TRANSFER_ASSET,
              depositAddressPayloadStub(),
              uuidStub()
            );
          });
        });

        describe("getInitRoomId_v2()", () => {
          it("shoud return", () => {
            expect(roomId).toBe(roomIdStub().roomId);
          });
        });
      });
    });
  });
});
