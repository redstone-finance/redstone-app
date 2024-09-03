export default {
  standard: {
    abracadabraKavaBtc: {
      chain: {
        name: "Kava EVM",
        id: 2222,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0xEcf0d5EEa51658997D7E750d0a449485D8a4079E",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        BTC: "0x099E81C3A9aA6185c083ac579ef60541418dE8d7",
      },
    },
    abracadabraKavaEth: {
      chain: {
        name: "Kava EVM",
        id: 2222,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x2CB9C0826bF3C5c010D84D3cCfD6eFbdD5C7bA48",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ETH: "0x5C552051bcD340cC57fa5Fb1ecdF0d896B1379Ec",
      },
    },
    abracadabraKavaUsdt: {
      chain: {
        name: "Kava EVM",
        id: 2222,
      },
      updateTriggers: {
        deviationPercentage: 0.2,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x6CFc01ECEB12C9365a15A1d8906314031C0AFD05",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        USDT: "0xc0c3B20Af1A431b9Ab4bfe1f396b12D97392e50f",
      },
    },
    arbitrumAngleAgeur: {
      chain: {
        name: "arbitrumOne",
        id: 42161,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x37963F10245e7c3a10c0E9d43a6E617B4Bc8440A",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        agEUR: "0x37963F10245e7c3a10c0E9d43a6E617B4Bc8440A",
      },
    },
    arbitrumPremia: {
      chain: {
        name: "arbitrumOne",
        id: 42161,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        cron: ["55 7 * * *", "30 59 7 * * *", "40 59 7 * * *", "50 59 7 * * *"],
      },
      adapterContract: "0x5B0E8F9B1A0De4fEC0fbe53387817f30D7Dec800",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "PREMIA-TWAP-60": "0x50db815D3c4B869F89925690E936ED85b0b76075",
      },
    },
    arbitrumSusdeRateProvider: {
      chain: {
        name: "arbitrumOne",
        id: 42161,
      },
      updateTriggers: {
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x3A236F67Fce401D87D7215695235e201966576E4",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        sUSDe_RATE_PROVIDER: "0x3A236F67Fce401D87D7215695235e201966576E4",
      },
    },
    arbitrumWeetheth: {
      chain: {
        name: "arbitrumOne",
        id: 42161,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0xA736eAe8805dDeFFba40cAB8c99bCB309dEaBd9B",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "weETH/ETH": "0xA736eAe8805dDeFFba40cAB8c99bCB309dEaBd9B",
      },
    },
    arbitrumWeethfundamental: {
      chain: {
        name: "arbitrumOne",
        id: 42161,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 43200000,
      },
      adapterContract: "0x119A190b510c9c0D5Ec301b60B2fE70A50356aE9",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        weETH_FUNDAMENTAL: "0x119A190b510c9c0D5Ec301b60B2fE70A50356aE9",
      },
    },
    arbitrumXvs: {
      chain: {
        name: "arbitrumOne",
        id: 42161,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0xd9a66Ff1D660aD943F48e9c606D09eA672f312E8",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        XVS: "0xd9a66Ff1D660aD943F48e9c606D09eA672f312E8",
      },
    },
    b2MultiPriceFeed: {
      chain: {
        name: "b2",
        id: 223,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
        priceFeedsDeviationOverrides: {
          USDT: 0.2,
        },
      },
      adapterContract: "0xfcd454d19f9B8806F8908e99d85b8eA17b3c7346",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        BTC: "__NO_FEED__",
        USDT: "__NO_FEED__",
        STONE: "__NO_FEED__",
      },
    },
    baseBsdetheth: {
      chain: {
        name: "base",
        id: 8453,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0xC49F0Dd98F38C525A7ce15E73E60675456F3a161",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "bsdETH/ETH": "0xC49F0Dd98F38C525A7ce15E73E60675456F3a161",
      },
    },
    baseEusd: {
      chain: {
        name: "base",
        id: 8453,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x9b2C948dbA5952A1f5Ab6fA16101c1392b8da1ab",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        eUSD: "0x9b2C948dbA5952A1f5Ab6fA16101c1392b8da1ab",
      },
    },
    basePufetheth: {
      chain: {
        name: "base",
        id: 8453,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x4aaf2844c5420BF979d5bC2Cf883EF02Db07e590",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "pufETH/ETH": "0x4aaf2844c5420BF979d5bC2Cf883EF02Db07e590",
      },
    },
    baseUsdplus: {
      chain: {
        name: "base",
        id: 8453,
      },
      updateTriggers: {
        deviationPercentage: 0.2,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0xd9a66Ff1D660aD943F48e9c606D09eA672f312E8",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "USD+": "0xd9a66Ff1D660aD943F48e9c606D09eA672f312E8",
      },
    },
    berachainTestnetEth: {
      chain: {
        name: "berachain-testnet",
        id: 80084,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x11B714817cBC92D402383cFd3f1037B122dcf69A",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ETH: "0x11B714817cBC92D402383cFd3f1037B122dcf69A",
      },
    },
    blastBtc: {
      chain: {
        name: "blast-mainnet",
        id: 81457,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x7262c8C5872A4Aa0096A8817cF61f5fa3c537330",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        BTC: "0x7262c8C5872A4Aa0096A8817cF61f5fa3c537330",
      },
    },
    blastEth: {
      chain: {
        name: "blast-mainnet",
        id: 81457,
      },
      updateTriggers: {
        deviationPercentage: 0.2,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x0af23B08bcd8AD35D1e8e8f2D2B779024Bd8D24A",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ETH: "0x0af23B08bcd8AD35D1e8e8f2D2B779024Bd8D24A",
      },
    },
    blastLrts: {
      chain: {
        name: "blast-mainnet",
        id: 81457,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x05C70f0a77c02CDB50a146D95EfE826A6B02F631",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "weETH/ETH": "0xcD96262Df56127f298b452FA40759632868A472a",
        "ezETH/ETH": "0x6bc42F8Ee8cD9BEA7d5CfF0934Ce73eCD2c11e99",
        "apxETH/ETH": "0x0c86AAbBEEF451f28C0CE4e9Cfeecc98a7881087",
      },
    },
    blastMwstethWpunks20: {
      chain: {
        name: "blast",
        id: 81457,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 21600000,
      },
      adapterContract: "0xBc1f356dfa55555bD81BD2EfF712b7e0cBD32FdF",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "mwstETH-WPUNKS:20": "0xBc1f356dfa55555bD81BD2EfF712b7e0cBD32FdF",
      },
    },
    blastTestnet: {
      chain: {
        name: "blast-testnet",
        id: 168587773,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0xb7e2d66D9c09A10E5Ca7116BD76F7A7e1e1a7643",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        BTC: "0x24b44096A381344A43559882c9A23A9DAd420781",
        ETH: "0xc447B8cAd2db7a8B0fDde540B038C9e06179c0f7",
        USDB: "0x2Bc667aDbf3ed021834114599C15388c49C9c773",
      },
    },
    blastUsdb: {
      chain: {
        name: "blast-mainnet",
        id: 81457,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 21600000,
      },
      adapterContract: "0x3A236F67Fce401D87D7215695235e201966576E4",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "USDB-TWAP-30": "0x3A236F67Fce401D87D7215695235e201966576E4",
      },
    },
    bnbBnb: {
      chain: {
        name: "bnb",
        id: 56,
      },
      updateTriggers: {
        deviationPercentage: 0.1,
        timeSinceLastUpdateInMilliseconds: 60000,
      },
      adapterContract: "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        BNB: "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e",
      },
    },
    bnbBtc: {
      chain: {
        name: "bnb",
        id: 56,
      },
      updateTriggers: {
        deviationPercentage: 0.1,
        timeSinceLastUpdateInMilliseconds: 60000,
      },
      adapterContract: "0xa51738d1937FFc553d5070f43300B385AA2D9F55",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        BTC: "0xa51738d1937FFc553d5070f43300B385AA2D9F55",
      },
    },
    bnbEzetheth: {
      chain: {
        name: "bnb",
        id: 56,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 43200000,
      },
      adapterContract: "0x3A236F67Fce401D87D7215695235e201966576E4",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "ezETH/ETH": "0x3A236F67Fce401D87D7215695235e201966576E4",
      },
    },
    bnbStone: {
      chain: {
        name: "bnb",
        id: 56,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 21600000,
      },
      adapterContract: "0xa41107f9259bB835275eaCaAd8048307B80D7c00",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        STONE: "0xa41107f9259bB835275eaCaAd8048307B80D7c00",
      },
    },
    bnbWeethfundamental: {
      chain: {
        name: "bnb",
        id: 56,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 21600000,
      },
      adapterContract: "0x9b2C948dbA5952A1f5Ab6fA16101c1392b8da1ab",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        weETH_FUNDAMENTAL: "0x9b2C948dbA5952A1f5Ab6fA16101c1392b8da1ab",
      },
    },
    bobMultiPriceFeed: {
      chain: {
        name: "bob",
        id: 60808,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 3600000,
        priceFeedsDeviationOverrides: {
          USDT: 0.2,
          USDC: 0.2,
        },
      },
      adapterContract: "0x2d484E029b8Ae5cA6335DAe11fC726B232bE87D1",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        BTC: "__NO_FEED__",
        ETH: "__NO_FEED__",
        USDC: "__NO_FEED__",
        USDT: "__NO_FEED__",
        STONE: "__NO_FEED__",
        wstETH: "__NO_FEED__",
      },
    },
    cadenceCantoAtom: {
      chain: {
        name: "Canto",
        id: 7700,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x30D2CC6EB00FA53869c3e0379e957357f88f6202",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ATOM: "0xCe8937eF7f3874e71C65C55470253B6b86f7C1AB",
      },
    },
    cadenceCantoCanto: {
      chain: {
        name: "Canto",
        id: 7700,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x9D321d4dEFCd791D8702a9e1acbf7F6Ca8D041E1",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        CANTO: "0x93063D743Fc0082121aec5d183e40554468E1568",
      },
    },
    cadenceCantoCnote: {
      chain: {
        name: "Canto",
        id: 7700,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x19219BC90F48DeE4d5cF202E09c438FAacFd8Bea",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        cNOTE: "0x19219BC90F48DeE4d5cF202E09c438FAacFd8Bea",
      },
    },
    cadenceCantoEth: {
      chain: {
        name: "Canto",
        id: 7700,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x7dCE097efeE8E490Fc8f28B54C42036422E3f6de",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ETH: "0x6D882e6d7A04691FCBc5c3697E970597C68ADF39",
      },
    },
    cadenceCantoTestnet: {
      chain: {
        name: "Canto Testnet",
        id: 7701,
      },
      updateTriggers: {
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x3d4F0DE18f07D4B2C9cd5158b407C7D7CE416AAD",
      dataServiceId: "redstone-main-demo",
      priceFeeds: {
        CANTO: "0xb023edad08B9A105CE7adE54B5dd83E43f544426",
        ETH: "0x9aCA2eAA465a930Af067204870104D6ca82f7676",
        ATOM: "0x537823970B58601F1309373e5362128c31DdAA48",
        USDC: "0xDd06C4c928dEd7435c3d93e7CB8c3968b98F8950",
        USDT: "0xE38bA844b36ce56639dCaE9EBE2F16F31d8ab903",
      },
    },
    cadenceCantoUsdc: {
      chain: {
        name: "Canto",
        id: 7700,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x63a5b7add2b1CAfF393b416dbE8541766244613d",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        USDC: "0x1b23243882DC7F419Ba01B5a841554f7bb0b9Da1",
      },
    },
    cadenceCantoUsdt: {
      chain: {
        name: "Canto",
        id: 7700,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0xE781Eb68aA3c8e597eE3756EA5859bC7103511d2",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        USDT: "0x5BA83F63c558cedba271a1892188b58360976acc",
      },
    },
    cyberEth: {
      chain: {
        name: "cyber",
        id: 7560,
      },
      updateTriggers: {
        deviationPercentage: 0.15,
        timeSinceLastUpdateInMilliseconds: 1200000,
      },
      adapterContract: "0x100c8e61aB3BeA812A42976199Fc3daFbcDD7272",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ETH: "0x100c8e61aB3BeA812A42976199Fc3daFbcDD7272",
      },
    },
    ethereumApxetheth: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x19219BC90F48DeE4d5cF202E09c438FAacFd8Bea",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "apxETH/ETH": "0x19219BC90F48DeE4d5cF202E09c438FAacFd8Bea",
      },
    },
    ethereumC3m: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        cron: ["00 12 * * *"],
      },
      adapterContract: "0x5BeEFeFE23aecccC77d164AB8E9Ff74e056588f1",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        C3M: "0x6E27A25999B3C665E44D903B2139F5a4Be2B6C26",
      },
    },
    ethereumEtherfiWeeth: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 21600000,
      },
      adapterContract: "0xdDb6F90fFb4d3257dd666b69178e5B3c5Bf41136",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        weETH: "0xdDb6F90fFb4d3257dd666b69178e5B3c5Bf41136",
      },
    },
    ethereumEtherfiWeetheth: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x8751F736E94F6CD167e8C5B97E245680FbD9CC36",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "weETH/ETH": "0x8751F736E94F6CD167e8C5B97E245680FbD9CC36",
      },
    },
    ethereumEthpluseth: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x3B9c09bde7776C32C518e2E787412A9bBaA7685F",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "ETH+/ETH": "0x3B9c09bde7776C32C518e2E787412A9bBaA7685F",
      },
    },
    ethereumEthxeth: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0xc799194cAa24E2874Efa89b4Bf5c92a530B047FF",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "ETHx/ETH": "0xc799194cAa24E2874Efa89b4Bf5c92a530B047FF",
      },
    },
    ethereumEusd: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0xb347d2e3524D0F9e2321D84A2E9b2e60CbC4A836",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        eUSD: "0xb347d2e3524D0F9e2321D84A2E9b2e60CbC4A836",
      },
    },
    ethereumEzetheth: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 43200000,
      },
      adapterContract: "0xF4a3e183F59D2599ee3DF213ff78b1B3b1923696",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "ezETH/ETH": "0xF4a3e183F59D2599ee3DF213ff78b1B3b1923696",
      },
    },
    ethereumPufetheth: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x76A495b0bFfb53ef3F0E94ef0763e03cE410835C",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "pufETH/ETH": "0x76A495b0bFfb53ef3F0E94ef0763e03cE410835C",
      },
    },
    ethereumPufStaking: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 5,
        timeSinceLastUpdateInMilliseconds: 43200000,
        priceFeedsDeviationOverrides: {
          ETH_ELE: 10,
        },
      },
      adapterContract: "0xf9dfBF71F2d9C8A4e565e1346aEb2C3e1dC765De",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ETH_CLE: "0xf9dfBF71F2d9C8A4e565e1346aEb2C3e1dC765De",
      },
    },
    ethereumRsetheth: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0xA736eAe8805dDeFFba40cAB8c99bCB309dEaBd9B",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "rsETH/ETH": "0xA736eAe8805dDeFFba40cAB8c99bCB309dEaBd9B",
      },
    },
    ethereumRswetheth: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x3A236F67Fce401D87D7215695235e201966576E4",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "rswETH/ETH": "0x3A236F67Fce401D87D7215695235e201966576E4",
      },
    },
    ethereumSfrxetheth: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 21600000,
      },
      adapterContract: "0xdd60c54115C19e0c6360AD4762B88BB8076D50a8",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "sfrxETH/ETH": "0xdd60c54115C19e0c6360AD4762B88BB8076D50a8",
      },
    },
    ethereumStakewiseOsetheth: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x66ac817f997Efd114EDFcccdce99F3268557B32C",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "osETH/ETH": "0x66ac817f997Efd114EDFcccdce99F3268557B32C",
      },
    },
    ethereumUsdeSusde: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 0.2,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x1B9b4b6705797968954A597362898AcE5F30C1C5",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        USDe: "0xbC5FBcf58CeAEa19D523aBc76515b9AEFb5cfd58",
        sUSDe: "0xb99D174ED06c83588Af997c8859F93E83dD4733f",
      },
    },
    etherlinkGhostnetTezosXtzEthBtc: {
      chain: {
        name: "etherlink-ghostnet",
        id: 128123,
      },
      updateTriggers: {
        timeSinceLastUpdateInMilliseconds: 10000,
      },
      adapterContract: "0xd576DE7A454DE52A61bE4c8d9d40C4165030415c",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ETH: "0xb31D94df41ccc22b46fd2Ae4eA2a6D6eB9c23bfb",
        BTC: "0xfe66A25096128f57D3876D42cD2B4347a77784c2",
        XTZ: "0xE06FE39f066562DBfE390167AE49D8Cb66e1F887",
      },
    },
    etherlinkTezos: {
      chain: {
        name: "etherlink",
        id: 42793,
      },
      updateTriggers: {
        timeSinceLastUpdateInMilliseconds: 10000,
      },
      adapterContract: "0xA2cCa359C43839040cF3D230DeB1689AB8db2dac",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ETH: "0xF0F22f4b9e49a0d6ade134A9d71D37cc0117951F",
        BTC: "0x7e5a7D5d603d53d6681BdDBd1B743796956cdF17",
        XTZ: "0xe92c00BC72dD12e26E61212c04E8D93aa09624F2",
      },
    },
    fraxtalPackage: {
      chain: {
        name: "fraxtal",
        id: 252,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 21600000,
      },
      adapterContract: "0x100c8e61aB3BeA812A42976199Fc3daFbcDD7272",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        BTC: "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e",
        CRV: "0x6C5090e85a65038ca6AB207CDb9e7a897cb33e4d",
        ETH: "0x89e60b56efD70a1D4FBBaE947bC33cae41e37A72",
        FRAX: "0xa41107f9259bB835275eaCaAd8048307B80D7c00",
        FXS: "0xbf228a9131AB3BB8ca8C7a4Ad574932253D99Cd1",
      },
      dataPacakgesNames: ["__FRAXTAL__"],
    },
    lineaEzetheth: {
      chain: {
        name: "linea",
        id: 59144,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x97c19d3Ae8e4d74e25EF3AFf3a277fB614ed76D4",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "ezETH/ETH": "0x97c19d3Ae8e4d74e25EF3AFf3a277fB614ed76D4",
      },
    },
    lineaWeethfundamental: {
      chain: {
        name: "linea",
        id: 59144,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 21600000,
      },
      adapterContract: "0x100c8e61aB3BeA812A42976199Fc3daFbcDD7272",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        weETH_FUNDAMENTAL: "0x100c8e61aB3BeA812A42976199Fc3daFbcDD7272",
      },
    },
    mantaLayerBank: {
      chain: {
        name: "manta",
        id: 169,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 21600000,
      },
      adapterContract: "0x6e3661519025D6cBcAFD3013D5BDB7aB71741B99",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        USDC: "__NO_FEED__",
        TIA: "__NO_FEED__",
        "LAB.m": "__NO_FEED__",
        wstETH: "__NO_FEED__",
        STONE: "__NO_FEED__",
        wUSDM: "__NO_FEED__",
        MANTA: "__NO_FEED__",
        ETH: "__NO_FEED__",
      },
    },
    mantleEth: {
      chain: {
        name: "Mantle",
        id: 5000,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x43D11B34ceDe79fEa2294f09532C435fa6dd3F72",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ETH: "0xFc34806fbD673c21c1AEC26d69AA247F1e69a2C6",
      },
    },
    mantleMnt: {
      chain: {
        name: "Mantle",
        id: 5000,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x25694bD737b6050B44bDD44a5Cd35EC17C47EF81",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        MNT: "0xed1f0df0b88889e5eA19c768613cDf3DbBF3d2a7",
      },
    },
    mantleTest: {
      chain: {
        name: "Mantle",
        id: 5000,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
      },
      adapterContract: "0x2ED1f6f2Ac7b0B8534db19976ea83504682B0B00",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        wstETH: "0x6985aaF13a197700c3C8747f5924686D7F0bE781",
      },
    },
    mantleUsdeSusde: {
      chain: {
        name: "Mantle",
        id: 5000,
      },
      updateTriggers: {
        deviationPercentage: 0.2,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0xA504E7f1000C7871a3332B371461aeB2F0024e09",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        USDe: "0x3DFA26B9A15D37190bB8e50aE093730DcA88973E",
        sUSDe: "0xd6a987Ff6323F658D04da16c36CE00960137a115",
      },
    },
    mantleUsdt: {
      chain: {
        name: "Mantle",
        id: 5000,
      },
      updateTriggers: {
        deviationPercentage: 0.25,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x3A236F67Fce401D87D7215695235e201966576E4",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        USDT: "0x3A236F67Fce401D87D7215695235e201966576E4",
      },
    },
    mantleWstEth: {
      chain: {
        name: "Mantle",
        id: 5000,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x9D0cA5a8a19B2CB9711721a5B026f8B32161b7f2",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "wstETH/stETH": "0xE8d850331faAbb277a24C09d91aabb68fb808748",
      },
    },
    mentoBaklavaMultisig: {
      chain: {
        name: "Celo Baklava Testnet",
        id: 62320,
      },
      updateTriggers: {
        timeSinceLastUpdateInMilliseconds: 250000,
        deviationPercentage: 0.2,
      },
      adapterContract: "0x6E0b50972117d50E3a18Fa8317c0D70B1edC3bFE",
      adapterContractType: "mento",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        CELO: "",
        "CELO/EUR": "",
        "CELO/BRL": "",
        USDC: "",
        "USDC/EUR": "",
        "USDC/BRL": "",
        "EUROC/EUR": "",
      },
    },
    mentoCeloMainnet: {
      chain: {
        name: "Celo Mainnet",
        id: 42220,
      },
      updateTriggers: {
        timeSinceLastUpdateInMilliseconds: 250000,
        deviationPercentage: 0.2,
      },
      adapterContract: "0x6490a3FFAD86CA14FF84Be380D5639Fb8fBD311B",
      adapterContractType: "mento",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        CELO: "",
        "CELO/EUR": "",
        "CELO/BRL": "",
        USDC: "",
        "USDC/EUR": "",
        "USDC/BRL": "",
        "EUROC/EUR": "",
      },
    },
    merlinMerl: {
      chain: {
        name: "merlin",
        id: 4200,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x815178f0781e300cbB49EEda1617DB0b83277379",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        MERL: "0x815178f0781e300cbB49EEda1617DB0b83277379",
      },
    },
    merlinMultiPriceFeed: {
      chain: {
        name: "merlin",
        id: 4200,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        BTC: "__NO_FEED__",
        "SolvBTC_MERLIN/BTC-TWAP-60": "__NO_FEED__",
      },
    },
    modeLayerBank: {
      chain: {
        name: "mode-mainnet",
        id: 34443,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 21600000,
      },
      adapterContract: "0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ETH: "0x100c8e61aB3BeA812A42976199Fc3daFbcDD7272",
        BTC: "__NO_FEED__",
        USDC: "__NO_FEED__",
        USDT: "__NO_FEED__",
        weETH: "__NO_FEED__",
        ezETH: "__NO_FEED__",
        STONE: "__NO_FEED__",
        rsETH: "__NO_FEED__",
        weETH_FUNDAMENTAL: "__NO_FEED__",
      },
    },
    modeMode: {
      chain: {
        name: "mode-mainnet",
        id: 34443,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        MODE: "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e",
      },
    },
    modeUsde: {
      chain: {
        name: "mode",
        id: 34443,
      },
      updateTriggers: {
        deviationPercentage: 0.2,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x1bB8f2dF000553E5Af2AEd5c42FEd3a73cd5144b",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        USDe: "0x1bB8f2dF000553E5Af2AEd5c42FEd3a73cd5144b",
      },
    },
    optimismApxetheth: {
      chain: {
        name: "optimism",
        id: 10,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x4aaf2844c5420BF979d5bC2Cf883EF02Db07e590",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        "apxETH/ETH": "0x4aaf2844c5420BF979d5bC2Cf883EF02Db07e590",
      },
    },
    realGbp: {
      chain: {
        name: "real",
        id: 111188,
      },
      updateTriggers: {
        deviationPercentage: 0.15,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x100c8e61aB3BeA812A42976199Fc3daFbcDD7272",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        GBP: "0x100c8e61aB3BeA812A42976199Fc3daFbcDD7272",
      },
    },
    realXau: {
      chain: {
        name: "real",
        id: 111188,
      },
      updateTriggers: {
        deviationPercentage: 0.3,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        XAU: "0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e",
      },
    },
    seiMultiAdapter: {
      chain: {
        name: "sei",
        id: 1329,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 21600000,
        priceFeedsDeviationOverrides: {
          USDT: 0.2,
          USDC: 0.2,
        },
      },
      adapterContract: "0x7C1DAAE7BB0688C9bfE3A918A4224041c7177256",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ETH: "0xEFc092F9D1Fd756D6788C5E8c1043Ed7a7F423Df",
        BTC: "0x49973FA847Fd57d879f48E4B8Fd5F968DafD5774",
        USDT: "0xfBB68fC1445F73cc3296fb6Cef316EdAC53967b6",
        USDC: "0x2eE9A7d22482905e7bb5E0aD832Be0DdB4d5582f",
        weETH_FUNDAMENTAL: "0x46fd38D7C751427acd66F6E6ffb95C79952e33e6",
      },
    },
    sepoliaAngleAgeur: {
      chain: {
        name: "sepolia",
        id: 11155111,
      },
      updateTriggers: {
        deviationPercentage: 0.1,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x0eD6b13775777318145B93589A34e9B2f5A6b0D4",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        agEUR: "0xa76dB2Cb356ba111cCB5a7Ca369D17E1592f42Dd",
      },
    },
    sepoliaVenusXvs: {
      chain: {
        name: "sepolia",
        id: 11155111,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 3600000,
      },
      adapterContract: "0x1F55c257275e285AD66C273655D5aBf610aD0873",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        XVS: "0x0d7697a15bce933cE8671Ba3D60ab062dA216C60",
      },
    },
    staderEthx: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0xfcF1CBead3dAefe4f345442c5fb8fDB08757478a",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ETHx: "0xFaBEb1474C2Ab34838081BFdDcE4132f640E7D2d",
      },
    },
    swell: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 21600000,
      },
      adapterContract: "0x68ba9602B2AeE30847412109D2eE89063bf08Ec2",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        SWETH: "0x0704eEc81ea7CF98Aa4A400c65DC4ED5933bddf7",
        "SWETH/ETH": "0x061bB36F8b67bB922937C102092498dcF4619F86",
      },
      dataPacakgesNames: ["__SWELL__"],
    },
    venusBnbTestnet: {
      chain: {
        name: "Smart Chain - Testnet",
        id: 97,
      },
      updateTriggers: {
        timeSinceLastUpdateInMilliseconds: 600000,
        deviationPercentage: 0.2,
      },
      dataServiceId: "redstone-primary-prod",
      adapterContract: "0x5B0E8F9B1A0De4fEC0fbe53387817f30D7Dec800",
      priceFeeds: {
        TRX: "0x50db815D3c4B869F89925690E936ED85b0b76075",
      },
    },
    venusBnbTrx: {
      chain: {
        name: "bnb",
        id: 56,
      },
      updateTriggers: {
        deviationPercentage: 0.2,
        timeSinceLastUpdateInMilliseconds: 600000,
      },
      adapterContract: "0xd65D50ebA419FAcB6ac4957b564765DDe932ba0F",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        TRX: "0xa17362dd9AD6d0aF646D7C8f8578fddbfc90B916",
      },
    },
    venusMainnetXvs: {
      chain: {
        name: "mainnet",
        id: 1,
      },
      updateTriggers: {
        deviationPercentage: 1,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x17350E8433f109e1Da3Dbd4f8B1E75759243572D",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        XVS: "0xa2a8507DEb233ceE4F5594044C259DD0582339CC",
      },
    },
    zksyncZk: {
      chain: {
        name: "zkSyncMainnet",
        id: 324,
      },
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      adapterContract: "0x5efDb74da192584746c96EcCe138681Ec1501218",
      dataServiceId: "redstone-primary-prod",
      priceFeeds: {
        ZK: "0x5efDb74da192584746c96EcCe138681Ec1501218",
      },
    },
  },
  multifeed: {
    arbitrumOneMultiFeed: {
      chain: {
        name: "arbitrumOne",
        id: 42161,
      },
      adapterContract: "0x89e60b56efD70a1D4FBBaE947bC33cae41e37A72",
      adapterContractType: "multi-feed",
      dataServiceId: "redstone-primary-prod",
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      priceFeeds: {
        eUSD: {
          priceFeedAddress: "0xa41107f9259bB835275eaCaAd8048307B80D7c00",
        },
        "ETH+/ETH": {
          priceFeedAddress: "0xCfd39de761508A7aCb8C931b959127a1D9d0B3D4",
        },
      },
    },
    modeMultiFeed: {
      chain: {
        name: "mode",
        id: 34443,
      },
      adapterContract: "0xF5F641fF3c7E39876A76e77E84041C300DFa4550",
      adapterContractType: "multi-feed",
      dataServiceId: "redstone-primary-prod",
      updateTriggers: {
        deviationPercentage: 0.5,
        timeSinceLastUpdateInMilliseconds: 21600000,
      },
      priceFeeds: {
        ETH: {
          priceFeedAddress: "0x100c8e61aB3BeA812A42976199Fc3daFbcDD7272",
        },
        BTC: {},
        USDC: {},
        USDT: {},
        weETH: {},
        ezETH: {},
        STONE: {},
        rsETH: {},
        weETH_FUNDAMENTAL: {},
        sDAI: {},
      },
    },
    sepoliaMultiFeed: {
      chain: {
        name: "sepolia",
        id: 11155111,
      },
      adapterContract: "0xE2Ff0DeB9B24Ec6C4F1f1dEE39610A450B3238E0",
      adapterContractType: "multi-feed",
      dataServiceId: "redstone-primary-prod",
      updateTriggers: {
        timeSinceLastUpdateInMilliseconds: 86400000,
      },
      priceFeeds: {
        ETH: {},
        BTC: {},
        USDC: {},
        USDT: {},
      },
    },
  },
};
