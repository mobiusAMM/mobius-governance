import { parseEther } from "ethers/lib/utils";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function ({
  ethers,
  getNamedAccounts,
  deployments: { deploy },
}: HardhatRuntimeEnvironment) {
  const namedAccounts = await getNamedAccounts();
  const { deployer, mobiSig, veMOBI } = namedAccounts;
  if (!deployer) {
    throw new Error("Deployer not found");
  }
  const deployerSigner = await ethers.getSigner(deployer);
  if (!deployerSigner) {
    throw new Error("Deployer signer not found");
  }

  const timelock = await deploy("Timelock", {
    from: deployer,
    contract: "Timelock",
    args: [
      mobiSig,
      86400 * 7,
    ]
  });

  const implementation = await deploy("GovernorBravoDelegate", {
    from: deployer,
    contract: "GovernorBravoDelegate",
  });

  const governance = await deploy("GovernorBravoDelegator", {
    from: deployer,
    contract: "GovernorBravoDelegator",
    args: [
      timelock.address,
      veMOBI,
      mobiSig,
      implementation.address,
      10000,
      10000,
      parseEther("75000"),
    ]
  });

  console.log("Timelock:", timelock.address);
  console.log("Implementation:", implementation.address);
  console.log("Governance:", governance.address);
};

export default func;