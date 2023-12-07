const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

const { expect } = require("chai");
const { upgrades, ethers } = require("hardhat");

describe("CryptoXR", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.

  let cryptoxr;
  let owner;
  let otherAccount;

  async function deploy() {
    const [owner, otherAccount] = await ethers.getSigners();
    const CryptoXR = await ethers.getContractFactory("CryptoXR");
    const cryptoxr = await upgrades.deployProxy(CryptoXR, [], {initializer: "initialize", kind: "transparent"});
    return {cryptoxr, owner, otherAccount}; 
  }

  beforeEach(async function () {
    ({ cryptoxr, owner, otherAccount } = await loadFixture(deploy));
  });




  describe("Deployment", function () {
    it("Initial mint amount should be 5000_000_000e18", async function () {
      expect(await cryptoxr.balanceOf(owner)).to.equal(
        5000000000000000000000000000n
      );
    });
    it("Initial total supply should be 5000_000_000e18", async function () {
      expect(await cryptoxr.totalSupply()).to.equal(5000000000000000000000000000n);
    });
    it("Initial owner should be owner", async function () {
      const _owner = await cryptoxr.owner();

      expect(_owner).to.equal(owner.address);
    });

    it("Initial owner should be admin", async function () {
      expect(await cryptoxr.admins(owner)).to.be.true;
    });

    it("Initial otherAccount should not be admin", async function () {
      // const { otherAccount } = await loadFixture(deploy);
      expect(await cryptoxr.admins(otherAccount)).to.be.false;
    })

    it("Owner can add admin", async function () { 
      await cryptoxr.connect(owner).addAdmin(otherAccount, true);
      expect(await cryptoxr.admins(otherAccount)).to.be.true;
    });

    it ("Owner can remove admin", async function () { 
      await cryptoxr.connect(owner).addAdmin(otherAccount, true);
      expect(await cryptoxr.admins(otherAccount)).to.be.true;
      await cryptoxr.connect(owner).addAdmin(otherAccount, false);
      expect(await cryptoxr.admins(otherAccount)).to.be.false;
    });

    it("Other account added as admin", async function () {
      await cryptoxr.connect(owner).addAdmin(otherAccount, true);
      expect(await cryptoxr.admins(otherAccount)).to.be.true;
    } );

  });


  describe("Mint & Burn", function () {
    it("Owner can mint", async function () {
      await cryptoxr
        .connect(owner)
        .mint(otherAccount, 1000000000000000000000000000n);
      expect(await cryptoxr.balanceOf(otherAccount)).to.equal(
        1000000000000000000000000000n
      );
    });

    it("Other account cannot mint", async function () {
      expect(cryptoxr.connect(otherAccount).mint(5)).to.be.revertedWith(
        "You aren't owner"
      );
    });

    it("Owner can burn their own assets", async function () {
      await cryptoxr.connect(owner).burn("1000000000000000000000000000");
      expect(await cryptoxr.balanceOf(owner)).to.equal(
        4000000000000000000000000000n
      );
    });

    it("Other account can burn its own assets", async function () {
      await cryptoxr.transfer(otherAccount, "1000000000000000000000000000");
      await cryptoxr.connect(otherAccount).burn("100000000000000000000000000");
      expect(await cryptoxr.balanceOf(otherAccount)).to.equal(
        900000000000000000000000000n
      );
    });
  });

  describe("Events", function () {

    it("Should emit an event on mint", async function () {
      expect(cryptoxr.connect(owner).mint(otherAccount, 1)).to.emit(
        cryptoxr,
        "Mint"
      );
    });

    it("Should emit an event on burn", async function () {
      expect(cryptoxr.connect(owner).burn(1)).to.emit(cryptoxr, "Burn");
    });
  });

  describe("Transfers", function () {
    it("Assets can be transfered", async function () {
      await expect(
        cryptoxr.connect(owner).transfer(otherAccount, 1)
      ).to.changeTokenBalance(cryptoxr, owner, -1);
    });
  });
});
