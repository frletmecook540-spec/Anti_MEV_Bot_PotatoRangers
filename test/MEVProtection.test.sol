const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MEVProtection", function () {
  let mevProtection;
  let owner, user1;

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();
    
    const MEVProtection = await ethers.getContractFactory("MEVProtection");
    mevProtection = await MEVProtection.deploy();
  });

  it("Should allow first transaction", async function () {
    await expect(
      mevProtection.connect(user1).protectedSwap(
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        100
      )
    ).to.emit(mevProtection, "TransactionProtected");
  });

  it("Should block immediate second transaction", async function () {
    await mevProtection.connect(user1).protectedSwap(
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      100
    );

    await expect(
      mevProtection.connect(user1).protectedSwap(
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        100
      )
    ).to.be.revertedWith("MEV Protection: Wait 1 block");
  });

  it("Should check protection status", async function () {
    const canTransact = await mevProtection.canTransact(user1.address);
    expect(canTransact).to.be.true;
  });
});
