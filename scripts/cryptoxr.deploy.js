const { ethers, upgrades } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const CryptoXR = await ethers.getContractFactory(
    "CryptoXR"
  );
  console.log("Deploying contract CryptoXR...");
  const cryptoxr = await upgrades.deployProxy(CryptoXR, [], {
    initializer: "initialize",
  });
  console.log(
    `CryptoXR Token deployed at address ${cryptoxr.target}`
  );
  console.log("Waiting for contract to be mined...");
  await cryptoxr.deploymentTransaction().wait(5);
  console.log("Contract mined by 5 blocks!");
}

main().catch((err) => {
  console.log(err);
  process.exitCode = 1;
});
