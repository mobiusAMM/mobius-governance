import hre from "hardhat"
import { BigNumber } from "@ethersproject/bignumber"
import { Timelock__factory } from "../types"
import { parseEther } from "@ethersproject/units";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  const timelock = await new Timelock__factory(signer).deploy(deployer, 1);

  const target = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1"
  const value = 0
  const signature = "approve(address,uint256)"
  const abi = new hre.ethers.utils.AbiCoder();
  const data = abi.encode(['address', 'uint256'], ['0x7DFAFF53284Aac673D48EA3fA1D70844b7F62E24', parseEther('1')]);
  console.log(data)

  let timestamp = Math.floor(Date.now()/1000);
  const execTime = timestamp + 20
  console.log(timestamp, execTime)

  let tx = await timelock.queueTransaction(target, value, signature, data, execTime, {
    gasLimit: 5000000, 
    gasPrice: BigNumber.from(0.5 * 10 ** 9)
  });
  await tx.wait()

  await sleep(20 * 1000)

  timestamp = Math.floor(Date.now()/1000);
  console.log(timestamp)

  tx = await timelock.executeTransaction(target, value, signature, data, execTime, {
    gasLimit: 5000000, 
    gasPrice: BigNumber.from(0.5 * 10 ** 9)
  });
  await tx.wait()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
