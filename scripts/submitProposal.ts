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

  const tx = await governance.propose(
    ["0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"],
    [0],
    ["approve(address, uint256)"],
    ["0x0000000000000000000000000a125d473cd3b1968e728ddf7d424c928c09222affffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"],
    "#WAGMI\n ##tt",
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
