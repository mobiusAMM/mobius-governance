import "dotenv/config";
import "hardhat-deploy";
import "@typechain/hardhat";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";

import { HardhatUserConfig } from "hardhat/config";

const accounts = {
  mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
};

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: {
      default: 2,
    },
    celo: {
      default: "0x471EcE3750Da237f93B8E339c536989b8978a438",
    },
    mobiSig: {
      default: "0x16E319d8dAFeF25AAcec0dF0f1E349819D36993c",
    },
    veMOBI: {
      default: "0xd813a846aA9D572140d7ABBB4eFaC8cD786b4c0E",
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
