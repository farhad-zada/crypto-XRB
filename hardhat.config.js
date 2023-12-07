require("@nomicfoundation/hardhat-toolbox");
require("@openzeppelin/hardhat-upgrades");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.2",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    bsc: {
      url: process.env.BSC_RPC,
      chainId: process.env.BSC_CID * 1,
      accounts: [process.env.PKEY],
    },
    tbsc: {
      url: process.env.TBSC_RPC,
      chainId: process.env.TBSC_CID * 1,
      accounts: [process.env.PKEY],
    },
    pol: {
      url: process.env.POL_RPC,
      chainId: process.env.POL_CID * 1,
      accounts: [process.env.PKEY],
    },
    eth: {
      url: process.env.ETH_RPC,
      chainId: process.env.ETH_CID * 1,
      accounts: [process.env.PKEY],
    },
  },
  etherscan: {
    apiKey: {
      eth: process.env.ETH_APIKEY,
      bsc: process.env.BSC_APIKEY,
      pol: process.env.POL_APIKEY,
    },
  },
};
