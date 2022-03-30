export const devnet = {
  uaxl: {
    common_key: {
      devnet: "uaxl",
      testnet: "uaxl",
      mainnet: "uaxl",
    },
    native_chain: "axelar",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      axelar: {
        assetSymbol: "AXL",
        assetName: "AXL",
        minDepositAmt: 0.01,
        ibcDenom: "uaxl",
        fullDenomPath: "uaxl",
      },
      moonbeam: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.05,
        ibcDenom: "uaxl",
        fullDenomPath: "uaxl",
      },
      ethereum: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uaxl",
        fullDenomPath: "uaxl",
      },
      avalanche: {
        assetSymbol: "AXL",
        assetName: "AXL (Axelar-wrapped)",
        minDepositAmt: 0.05,
        ibcDenom: "uaxl",
        fullDenomPath: "uaxl",
      },
    },
  },
  uusd: {
    common_key: {
      devnet: "uusd",
      testnet: "uusd",
      mainnet: "uusd",
    },
    native_chain: "terra",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      axelar: {
        assetSymbol: "UST",
        assetName: "UST",
        minDepositAmt: 0.01,
        ibcDenom:
          "ibc/6F4968A73F90CF7DE6394BF937D6DF7C7D162D74D839C13F53B41157D315E05F",
        fullDenomPath: "transfer/channel-0/uusd",
      },
      moonbeam: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.05,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      ethereum: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.1,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      avalanche: {
        assetSymbol: "UST",
        assetName: "UST (Axelar-wrapped)",
        minDepositAmt: 0.05,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
      terra: {
        assetSymbol: "UST",
        assetName: "UST",
        minDepositAmt: 0.01,
        ibcDenom: "uusd",
        fullDenomPath: "uusd",
      },
    },
  },
  uluna: {
    common_key: {
      devnet: "uluna",
      testnet: "uluna",
      mainnet: "uluna",
    },
    native_chain: "terra",
    fully_supported: true,
    decimals: 6,
    chain_aliases: {
      axelar: {
        assetSymbol: "LUNA",
        assetName: "LUNA",
        minDepositAmt: 0.0001,
        ibcDenom:
          "ibc/4627AD2524E3E0523047E35BB76CC90E37D9D57ACF14F0FCBCEB2480705F3CB8",
        fullDenomPath: "transfer/channel-0/uluna",
      },
      moonbeam: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.0005,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      ethereum: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.001,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      avalanche: {
        assetSymbol: "LUNA",
        assetName: "LUNA (Axelar-wrapped)",
        minDepositAmt: 0.0005,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
      terra: {
        assetSymbol: "LUNA",
        assetName: "LUNA",
        minDepositAmt: 0.0001,
        ibcDenom: "uluna",
        fullDenomPath: "uluna",
      },
    },
  },
};