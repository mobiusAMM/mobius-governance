import { parseEther } from "ethers/lib/utils";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { BigNumber } from "@ethersproject/bignumber";
import { Timelock__factory } from "../types"

const func: DeployFunction = async function ({
  ethers,
  getNamedAccounts,
  deployments: { deploy },
}: HardhatRuntimeEnvironment) {
  const namedAccounts = await getNamedAccounts();
  const { deployer, veMOBI } = namedAccounts;
  if (!deployer) {
    throw new Error("Deployer not found");
  }
  const deployerSigner = await ethers.getSigner(deployer);
  if (!deployerSigner) {
    throw new Error("Deployer signer not found");
  }

  const { address: timelockAddress } = await deploy("Timelock", {
    from: deployer,
    contract: "Timelock",
    args: [
      deployer,
      3600,
    ],
    gasLimit: 5000000, 
    gasPrice: BigNumber.from(0.5 * 10 ** 9)
  });

  const implementation = await deploy("GovernorBravoDelegate", {
    from: deployer,
    contract: "GovernorBravoDelegate",
    gasLimit: 5000000, 
    gasPrice: BigNumber.from(0.5 * 10 ** 9)
  });
  const governance = await deploy("GovernorBravoDelegator", {
    from: deployer,
    contract: "GovernorBravoDelegator",
    args: [
      timelockAddress,
      veMOBI,
      timelockAddress,
      implementation.address,
      86400,
      3600,
      parseEther("5000000"),
    ],
    gasLimit: 5000000, 
    gasPrice: BigNumber.from(0.5 * 10 ** 9)
  });
  const timelock = Timelock__factory.connect(
    timelockAddress,
    deployerSigner
  );

  const tx = await timelock.setAdmin(governance.address, {
    gasLimit: 5000000, 
    gasPrice: BigNumber.from(0.5 * 10 ** 9)});
  await tx.wait()

  console.log(await timelock.admin())
  console.log("Timelock:", timelock.address);
  console.log("Implementation:", implementation.address);
  console.log("Governance:", governance.address);
};

export default func;