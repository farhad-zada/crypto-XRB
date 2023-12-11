// CryptoXRB.test.js
const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { parseUnits } = ethers;

describe("CryptoXRB", function () {
  let cryptoXRB;
  let owner, admin, user;
  let mainOwner = '0x30b7f99664F5449629d06549fd0510086141b915';

  beforeEach(async function () {
    [owner, admin, user] = await ethers.getSigners();

    // Deploy the contract
    const CryptoXRB = await ethers.getContractFactory("CryptoXRB");
    cryptoXRB = await upgrades.deployProxy(CryptoXRB, [], { initializer: "initialize", kind: 'transparent' });

    // Add admin
    await cryptoXRB.addAdmin(admin.address, true);
  });

  it("Should initialize the contract with correct initial balances", async function () {
    const balances = await Promise.all([
      cryptoXRB.balanceOf(mainOwner),
      cryptoXRB.balanceOf("0x55d5a6809034a21B9677F418B994CAd4FC9d7B01"),
      cryptoXRB.balanceOf("0x3765eCC3A3466c94e3926DCc644779102F3bd74b"),
      cryptoXRB.balanceOf("0x4B7fbE5581DA3C7783e185D7083a12EC77994770"),
      cryptoXRB.balanceOf("0x246f9ece9Be9f59B17176C059064433e70079827"),
      cryptoXRB.balanceOf("0x5B6E8cB706302aF605FBDB36154ECe068662D30E"),
      cryptoXRB.balanceOf("0xF12338660Ff6C3B5b982e52eB72521499A44c6Db"),
    ]);

    const expectedBalances = [
      parseUnits("1000000000", 18),
      parseUnits("250000000", 18),
      parseUnits("100000000", 18),
      parseUnits("50000000", 18),
      parseUnits("100000000", 18),
      parseUnits("50000000", 18),
      parseUnits("50000000", 18),
    ];

    // Check that all balances match the expected balances
    balances.forEach((balance, index) => {
      expect(balance).to.equal(expectedBalances[index]);
    });
  });

  it("Should allow only admin to mint tokens", async function () {
    // Try to mint from a non-admin account
    await expect(cryptoXRB.connect(user).mint(user.address, parseUnits("100", 18))).to.be.revertedWith("cryptoxr: not admin");

    // Mint tokens from an admin account
    await cryptoXRB.connect(admin).mint(user.address, parseUnits("100", 18));

    // Check the user's balance
    const userBalance = await cryptoXRB.balanceOf(user.address);
    expect(userBalance).to.equal(parseUnits("100", 18));
  });

  it("Should allow only owner to add and remove admins", async function () {
    // Try to add an admin from a non-owner account
    await expect(cryptoXRB.connect(user).addAdmin(user.address, true)).to.be.revertedWith("Ownable: caller is not the owner");

    // Add an admin from the owner account
    await cryptoXRB.connect(owner).addAdmin(user.address, true);
    expect(await cryptoXRB.admins(user.address)).to.be.true;

    // Remove an admin from the owner account
    await cryptoXRB.connect(owner).addAdmin(user.address, false);
    expect(await cryptoXRB.admins(user.address)).to.be.false;
  });

  it("Should allow burning tokens", async function () {

    // Mint for owner
    await cryptoXRB.mint(owner, parseUnits("1000000000", 18));

    // Burn some tokens
    await cryptoXRB.burn(parseUnits("100", 18));

    // Check the owner's balance
    const ownerBalance = await cryptoXRB.balanceOf(owner.address);

    // Check the owner's balance
    expect(ownerBalance).to.equal(parseUnits("999999900", 18));
  });

  it("Should allow only owner to withdraw tokens", async function () {
    // Deploy a mock ERC20 token
    const erc20Mock = await ethers.deployContract('ERC20Mock');

    // Mint some tokens to the ERC20Mock contract
    await erc20Mock.mint(cryptoXRB.target, parseUnits("100", 18));

    // Try to withdraw tokens from a non-owner account
    await expect(cryptoXRB.connect(user).withdraw(erc20Mock.target, user.address, parseUnits("50", 18))).to.be.revertedWith("Ownable: caller is not the owner");

    // Withdraw tokens from the owner account
    await cryptoXRB.connect(owner).withdraw(erc20Mock.target, user.address, parseUnits("50", 18));

    // Check the user's balance in the ERC20Mock contract
    const userBalance = await erc20Mock.balanceOf(user.address);
    expect(userBalance).to.equal(parseUnits("50", 18));
  });

  it("Should emit Admin event when adding or removing admin", async function () {
    // Add admin and check the emitted event
    await expect(cryptoXRB.connect(owner).addAdmin(user.address, true))
      .to.emit(cryptoXRB, "Admin")
      .withArgs(user.address, true);

    // Remove admin and check the emitted event
    await expect(cryptoXRB.connect(owner).addAdmin(user.address, false))
      .to.emit(cryptoXRB, "Admin")
      .withArgs(user.address, false);
  });
});
