import { deployMockContract } from "@ethereum-waffle/mock-contract";
import { assert, expect } from "chai";
import { DeployFunction } from "hardhat-deploy/types";
import { BigNumber, Wallet, ContractTransaction, ContractReceipt } from "ethers";
import { getAddress, parseEther } from "ethers/lib/utils";
import hre, { ethers } from "hardhat";
import {
  Timelock,
  Timelock__factory
} from "../types";


describe("Timelock tests", () => {

  let deployer: Wallet;

  let timelock: Timelock;

  let tx: ContractTransaction;
  let ret: ContractReceipt;

  before(async () => {
    const wallets = await hre.waffle.provider.getWallets();

    deployer = wallets[0]!;
  });

  before("init", async () => {

    timelock = await new Timelock__factory(deployer).deploy(deployer.address, 1)

    const StandardToken = (await ethers.getContractFactory(
        "StandardToken"
    )) as StandardToken__factory;

    mother_celo = await new StandardToken__factory(mother).deploy(
        parseEther("100"), "Test CELO", 18, "TCELO"
    );

    cusd = await new StandardToken__factory(deployer).deploy(
        parseEther("100"), "Test CUSD", 18, "TCUSD"
    );

    cycelo = await new CErc20Immutable__factory(deployer).deploy(
        mother_celo.address, 
        unitroller.address,
        jumptratemodel.address,
        parseEther("1"),
        "Compound yield celo",
        "cycelo",
        8,
        deployer.address
    );

    cycusd = await new CErc20Immutable__factory(deployer).deploy(
        cusd.address, 
        unitroller.address,
        jumptratemodel.address,
        parseEther("1"),
        "Compound yield cusd",
        "cycusd",
        8,
        deployer.address
    );

    dahlia_cycelo = new CErc20Immutable__factory(dahlia).attach(cycelo.address);
    dahlia_cycusd = new CErc20Immutable__factory(dahlia).attach(cycusd.address);
    dahlia_celo = new StandardToken__factory(dahlia).attach(mother_celo.address);

    mother_cycelo = new CErc20Immutable__factory(mother).attach(cycelo.address);
    mother_cycusd = new CErc20Immutable__factory(mother).attach(cycusd.address);

    proxy = new Comptroller__factory(deployer).attach(unitroller.address); 

    tx = await proxy._supportMarket(cycelo.address);
    await tx.wait();
    tx = await proxy._supportMarket(cycusd.address);
    await tx.wait();

    tx = await proxy._setCreditLimit(dahlia.address, true);
    await tx.wait();
  });

  describe("address check", () => {
      it("comptroller and unitroller connected", async () => {
        expect(await unitroller.comptrollerImplementation()).to.eql(comptroller.address);
      });

      it("cTokens and jump rate model are connected", async () => {
          expect(await cycelo.interestRateModel()).to.eql(jumptratemodel.address)
          expect(await cycusd.interestRateModel()).to.eql(jumptratemodel.address)
      });

      it("cTokens and comptroller are connected", async () => {
          expect(await cycelo.comptroller()).to.eql(unitroller.address)
          expect(await cycusd.comptroller()).to.eql(unitroller.address)
      });
  });

  describe("market supported", () => {
      it("celo and cusd supported", async () => {
        expect((await proxy.markets(cycelo.address))).to.eql(true);
        expect((await proxy.markets(cycusd.address))).to.eql(true);
      });
  });

  describe("whitelist", () => {
    it("whitelists the dahlia bank", async () => {
        expect(await proxy.creditLimits(dahlia.address)).to.equal(true);
    });
  });

  describe("mint", () => {
    // it("doesn't allow minting to whitelisted accounts", async () => {
    //     tx = await mother_celo.approve(dahlia_cycelo.address, parseEther("10")); 
    //     await tx.wait();

    //     tx = await dahlia_cycelo.mint(100000000, { gasLimit: 2500000, gasPrice: 0.5 * 10 ** 9});
    //     await tx.wait();
    // });

    it("allows minting of cTokens to regular accounts", async () => {
        let pre_mother_celo = await mother_celo.balanceOf(mother.address)


        tx = await mother_celo.approve(mother_cycelo.address, parseEther("10")); 
        await tx.wait();
        tx = await mother_cycelo.mint(100000000, { gasLimit: 2500000, gasPrice: 0.5 * 10 ** 9});
        await tx.wait();
        expect(await mother_cycelo.balanceOf(mother.address)).not.to.equal(parseEther("0"));
        expect(await mother_celo.balanceOf(mother.address)).not.to.equal(parseEther("100"));

        expect(await mother_cycelo.balanceOf(mother.address)).to.equal(100000000);
        expect(await mother_celo.balanceOf(mother.address)).to.equal(pre_mother_celo.sub(100000000))
    });
  });

  describe("borrow", () => {
    it("doesn't allow borrow from not whitelisted account", async () => {
        let mother_celo_amount = await mother_celo.balanceOf(mother.address)
        tx = await mother_cycelo.borrow(1000);
        await tx.wait();

        expect(await mother_celo.balanceOf(mother.address)).to.equal(mother_celo_amount); 
        expect(await mother_cycelo.balanceOf(mother.address)).to.equal(100000000);

    })
    
    it("allows unlimited borrowing", async () => {
        tx = await dahlia_cycelo.borrow(1000);
        await tx.wait();

        expect(await mother_celo.balanceOf(dahlia.address)).to.equal(1000); 
        expect(await mother_cycelo.balanceOf(dahlia.address)).to.equal(0);
    });
  });

  describe("redeem", () => {
    // it("can't redeem with no balance", async () => {
    //     tx = await cycelo.redeem(1, { gasLimit: 2500000, gasPrice: 0.5 * 10 ** 9});
    //     await tx.wait();

    //     expect(await celo.balanceOf(deployer.address)).to.equal(0); 
    // })

    // it("doesn't allow redemption for credit accounts", async () => {
    //     tx = await dahlia_cycelo.redeem(1, { gasLimit: 2500000, gasPrice: 0.5 * 10 ** 9});
    //     await tx.wait();

    //     expect(await celo.balanceOf(dahlia.address)).to.equal(0); 
    // })
    
    it("allows redemption from accounts with balance", async () => {
        let pre_mother_celo = await mother_celo.balanceOf(mother.address)
        let pre_mother_cycelo = await mother_cycelo.balanceOf(mother.address)

        tx = await mother_cycelo.redeem(1000, { gasLimit: 2500000, gasPrice: 0.5 * 10 ** 9});
        await tx.wait();

        expect(await mother_celo.balanceOf(mother.address)).not.to.equal(pre_mother_celo); 
        expect(await mother_celo.balanceOf(mother.address)).to.equal(pre_mother_celo.add(1000)); 
        expect(await cycelo.balanceOf(mother.address)).not.to.equal(pre_mother_cycelo); 
        expect(await cycelo.balanceOf(mother.address)).to.equal(pre_mother_cycelo.sub(1000)); 
    });
  });

  describe("redeem underlying", () => {
    // it("can't redeem with no balance", async () => {
    //     tx = await cycelo.redeemUnderlying(1, { gasLimit: 2500000, gasPrice: 0.5 * 10 ** 9});
    //     await tx.wait();

    //     expect(await celo.balanceOf(deployer.address)).to.equal(0); 
    // })

    // it("doesn't allow redemption for credit accounts", async () => {
    //     tx = await dahlia_cycelo.redeemUnderlying(1, { gasLimit: 2500000, gasPrice: 0.5 * 10 ** 9});
    //     await tx.wait();

    //     expect(await celo.balanceOf(dahlia.address)).to.equal(0); 
    // })
    
    it("allows redemption from accounts with balance", async () => {
        let pre_mother_celo = await mother_celo.balanceOf(mother.address)
        let pre_mother_cycelo = await mother_cycelo.balanceOf(mother.address)

        tx = await mother_cycelo.redeemUnderlying(1000, { gasLimit: 2500000, gasPrice: 0.5 * 10 ** 9});
        await tx.wait();

        expect(await mother_celo.balanceOf(mother.address)).not.to.equal(pre_mother_celo); 
        expect(await mother_celo.balanceOf(mother.address)).to.equal(pre_mother_celo.add(1000)); 
        expect(await cycelo.balanceOf(mother.address)).not.to.equal(pre_mother_cycelo); 
        expect(await cycelo.balanceOf(mother.address)).to.equal(pre_mother_cycelo.sub(1000)); 
    });
  });

  describe("repay borrow", () => {
    // it("can't repay with no balance", async () => {
    //     tx = await mother_cycelo.repayBorrow(1, { gasLimit: 2500000, gasPrice: 0.5 * 10 ** 9});
    //     await tx.wait();

    //     expect(await celo.balanceOf(deployer.address)).to.equal(0); 
    // })

    it("allows repay for credit accounts", async () => {

        await dahlia_celo.approve(dahlia_cycelo.address, 10000000); 
        tx = await dahlia_cycelo.repayBorrow(1000, { gasLimit: 2500000, gasPrice: 0.5 * 10 ** 9});
        await tx.wait();

        expect(await mother_celo.balanceOf(dahlia.address)).to.equal(0); 
        expect(await cycelo.balanceOf(dahlia.address)).to.equal(0); 

        // tx = await dahlia_cycelo.repayBorrow(1000, { gasLimit: 2500000, gasPrice: 0.5 * 10 ** 9});
        // await tx.wait();
    });

  });
});