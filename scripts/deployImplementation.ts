import hre from "hardhat"
import { BigNumber } from "@ethersproject/bignumber"

async function main() {
  const namedAccounts = await hre.getNamedAccounts();
  const { deployer } = namedAccounts;
  if (!deployer) {
    throw new Error("Deployer not found");
  }
  const signer = await hre.ethers.getSigner(deployer);
  if (!signer) {
    throw new Error("Deployer signer not found");
  }

  const { deploy } = hre.deployments

  const { address: implementationAddress } = await deploy("GovernorBravoDelegate", {
    from: deployer,
    contract: "GovernorBravoDelegate",
    gasLimit: 5000000, 
    gasPrice: BigNumber.from(0.5 * 10 ** 9)
  });

  console.log('Implementation:', implementationAddress)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
