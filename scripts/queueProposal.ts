import hre from "hardhat"
import { GovernorBravoDelegate__factory } from "../types"

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

  const { address: governanceAddress } = await hre.deployments.get("GovernorBravoDelegator");
  const governance = GovernorBravoDelegate__factory.connect(governanceAddress, signer);

  const tx = await governance.queue(2,
    {
      gasLimit: 8_500_000, 
      gasPrice: 0.5 * 10 ** 9
    });
    await tx.wait()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
