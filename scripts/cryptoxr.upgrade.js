const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const CryptoXR = await ethers.getContractFactory("CryptoXR");

  // get the contract address from args
  const contractAddress = "0x1DC9e3eF180F0a3bAeaC90384442faED874685Ec";
  console.log(`Upgrading contract CryptoXR at address: ${contractAddress} ...`);

  const cryptoxr = await upgrades.upgradeProxy(contractAddress, CryptoXR, {
    kind: "transparent",
  });

  console.log(`CryptoXR Token upgraded at address ${cryptoxr.target}`);
}

main().catch((err) => {
  console.log(err);
  process.exitCode = 1;
});
