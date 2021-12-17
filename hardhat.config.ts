import "dotenv/config";
import "hardhat-deploy";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";

import { HardhatUserConfig } from "hardhat/config";

const accounts = {
  mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
  // path: "m/44'/52752'/0'/0"
};

const config: HardhatUserConfig = {
  defaultNetwork: "celo",
  namedAccounts: {
    deployer: {
      default: 0,
    },
    celo: {
      default: "0x471EcE3750Da237f93B8E339c536989b8978a438",
      alfajores: "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9"
    },
    veMOBI: {
      default: "0xE9d0375cd6fC027A1a0eC39BB4c9928E5aBec27e",
      alfajores: "0x7d64708ecf5201cfE74364424AddB0A8FD32174f"
    }
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      live: false,
      saveDeployments: true,
      tags: ["test", "local"],
    },
    celo: {
      url: "https://forno.celo.org",
      accounts,
      chainId: 42220,
    },
    alfajores: {
      url: "https://alfajores-forno.celo-testnet.org",
      accounts,
      chainId: 44787,
      live: true,
      gasPrice: 0.5 * 10 ** 9,
      gas: 10_000_000,
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
  mocha: {
    timeout: 300000,
    //bail: true,
  },
};

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
export default config;
