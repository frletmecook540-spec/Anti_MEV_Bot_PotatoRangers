const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MEVProtection Contract", function () {
  let MEVProtection, mevProtection, owner, user;

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();
    MEVProtection = await ethers.getContractFactory("MEVProtection");
    mevProtection = await MEVProtection.deploy(owner.address);
    await mevProtection.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await mevProtection.owner()).to.equal(owner.address);
    });

    it("Should not be paused initially", async function () {
      expect(await mevProtection.isPaused()).to.equal(false);
    });

    it("Should have minBlockDelay of 1", async function () {
      expect(await mevProtection.minBlockDelay()).to.equal(1);
    });
  });

  describe("Protected Swap", function () {
    it("Should revert if token addresses are invalid", async function () {
      await expect(
        mevProtection.connect(user).protectedSwap(
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          1,
          1
        )
      ).to.be.revertedWithCustomError(mevProtection, "InvalidAddress");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update minBlockDelay", async function () {
      await mevProtection.connect(owner).updateMinBlockDelay(5);
      expect(await mevProtection.minBlockDelay()).to.equal(5);
    });

    it("Should pause and unpause correctly", async function () {
      await mevProtection.connect(owner).pause();
      expect(await mevProtection.isPaused()).to.equal(true);
      await mevProtection.connect(owner).unpause();
      expect(await mevProtection.isPaused()).to.equal(false);
    });
  });
});
