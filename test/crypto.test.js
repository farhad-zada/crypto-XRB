// CryptoXRB.test.js
const { zeroAddress } = require("@nomicfoundation/ethereumjs-util");
const { expect } = require("chai");
const { ethers, waffle, upgrades } = require("hardhat");
const { parseUnits, parseEther } = ethers;

describe("CryptoXRB", function () {
  let cryptoXRB;
  let owner, admin, user;

  beforeEach(async function () {
    [owner, admin, user] = await ethers.getSigners();

    // Deploy the contract
    const CryptoXRB = await ethers.getContractFactory("CryptoXRB");
    cryptoXRB = await upgrades.deployProxy(CryptoXRB, [], {
      initializer: "initialize",
      kind: "transparent",
    });

    // Add admin
    await cryptoXRB.setAdmin(admin.address, true);
  });

  it("Should initialize the contract with correct initial balances", async function () {
    const balance = await cryptoXRB.balanceOf(owner);
    expect(balance).to.equal(parseUnits("1000000000", 18));
  });

  it("Should allow only admin to mint tokens", async function () {
    // Try to mint from a non-admin account
    await expect(
      cryptoXRB.connect(user).mint(user.address, parseUnits("100", 18))
    ).to.be.revertedWith("CryptoXRB: not admin");

    // Mint tokens from an admin account
    await cryptoXRB.connect(admin).mint(user.address, parseUnits("100", 18));

    // Check the user's balance
    const userBalance = await cryptoXRB.balanceOf(user.address);
    expect(userBalance).to.equal(parseUnits("100", 18));
  });

  it("Should allow only owner to add and remove admins", async function () {
    // Try to add an admin from a non-owner account
    await expect(
      cryptoXRB.connect(user).setAdmin(user.address, true)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    // Add an admin from the owner account
    await cryptoXRB.connect(owner).setAdmin(user.address, true);
    expect(await cryptoXRB.admins(user.address)).to.be.true;

    // Remove an admin from the owner account
    await cryptoXRB.connect(owner).setAdmin(user.address, false);
    expect(await cryptoXRB.admins(user.address)).to.be.false;
  });

  it("Should allow burning tokens", async function () {
    // owner balance
    const ownerBalanceInitial = await cryptoXRB.balanceOf(owner.address);
    expect(ownerBalanceInitial).to.equal(parseUnits("1000000000", 18));

    // burn tokens
    await cryptoXRB.connect(owner).burn(parseUnits("1000000000", 18));

    // owner balance
    const ownerBalanceFinal = await cryptoXRB.balanceOf(owner.address);
    expect(ownerBalanceFinal).to.equal(parseUnits("0", 18));
  });

  it("Should allow only owner to withdraw tokens", async function () {
    // Deploy a mock ERC20 token
    const erc20Mock = await ethers.deployContract("ERC20Mock");

    // Mint some tokens to the ERC20Mock contract
    await erc20Mock.mint(cryptoXRB.target, parseUnits("100", 18));

    // Try to withdraw tokens from a non-owner account
    await expect(
      cryptoXRB
        .connect(user)
        .withdraw(erc20Mock.target, user.address, parseUnits("50", 18))
    ).to.be.revertedWith("Ownable: caller is not the owner");

    // Withdraw tokens from the owner account
    await cryptoXRB
      .connect(owner)
      .withdraw(erc20Mock.target, user.address, parseUnits("50", 18));

    // Check the user's balance in the ERC20Mock contract
    const userBalance = await erc20Mock.balanceOf(user.address);
    expect(userBalance).to.equal(parseUnits("50", 18));
  });

  it("Should emit Admin event when adding or removing admin", async function () {
    // Add admin and check the emitted event
    await expect(cryptoXRB.connect(owner).setAdmin(user.address, true))
      .to.emit(cryptoXRB, "Admin")
      .withArgs(user.address, true);

    // Remove admin and check the emitted event
    await expect(cryptoXRB.connect(owner).setAdmin(user.address, false))
      .to.emit(cryptoXRB, "Admin")
      .withArgs(user.address, false);
  });

  it("Should emit Transfer event when minting tokens", async function () {
    // Mint tokens and check the emitted event
    await expect(
      cryptoXRB.connect(admin).mint(user.address, parseUnits("100", 18))
    )
      .to.emit(cryptoXRB, "Transfer")
      .withArgs(zeroAddress(), user.address, parseUnits("100", 18));
  });

  it("Should emit Transfer event when burning tokens", async function () {
    // Burn tokens and check the emitted event
    await expect(cryptoXRB.connect(owner).burn(parseUnits("100", 18)))
      .to.emit(cryptoXRB, "Transfer")
      .withArgs(owner.address, zeroAddress(), parseUnits("100", 18));
  });

  it("Should deduct the correct fee on transfer", async function () {
    // Set the transfer fee to 10%
    await cryptoXRB.setTransferFeePercent(parseUnits("10", 16));

    // Mint some tokens to a non-whitelisted address
    await cryptoXRB.mint(user, parseEther("10"));

    // Owner initial balance
    const ownerBalanceInitial = await cryptoXRB.balanceOf(owner);
    // Transfer tokens from the non-whitelisted address

    await cryptoXRB.connect(user).transfer(owner.address, parseEther("1"));

    // Check the balances
    const userBalance = await cryptoXRB.balanceOf(user);
    const ownerFinalBalance = await cryptoXRB.balanceOf(owner);
    // The non-whitelisted address should have 9 ETH (10 ETH - 10% fee)
    expect(userBalance).to.equal(parseEther("9"));

    // The contract should have 1000_000_000.1 ETH (1 ETH transfer + 10% fee)
    expect(ownerFinalBalance - ownerBalanceInitial).to.equal(parseEther("0.9"));
  });

  it("Should allow only whitelisted addresses to transfer tokens without fee", async function () {
    // Set the transfer fee to 10%
    await cryptoXRB.setTransferFeePercent(10);

    // Set the whitelisted address to true
    await cryptoXRB.setWhitelistBatch([user], [true]);

    // Mint some tokens to a whitelisted address
    await cryptoXRB.mint(user, parseEther("10"));

    // Owner initial balance
    const ownerBalanceInitial = await cryptoXRB.balanceOf(owner);
    // Transfer tokens from the whitelisted address
    await cryptoXRB.connect(user).transfer(owner, parseEther("1"));

    // Check the balances
    const userBalance = await cryptoXRB.balanceOf(user);
    const ownerFinalBalance = await cryptoXRB.balanceOf(owner);

    // The whitelisted address should have 9 ETH (10 ETH - 10% fee)
    expect(userBalance).to.equal(parseEther("9"));

    // The contract should have 1000_000_000 ETH (1 ETH transfer + 0% fee)
    expect(ownerFinalBalance - ownerBalanceInitial).to.equal(parseEther("1"));

    // Set the whitelisted address to false
    await cryptoXRB.setWhitelistBatch([user], [false]);
  });

  it("Should allow only owner to set transfer fee percent", async function () {
    // Try to set the transfer fee percent from a non-owner account
    await expect(
      cryptoXRB.connect(user).setTransferFeePercent(10)
    ).to.be.revertedWith("CryptoXRB: not admin");

    // Set the transfer fee percent from the owner account
    await cryptoXRB.connect(owner).setTransferFeePercent(10);
    expect(await cryptoXRB.transferFeePercent()).to.equal(10);
  });

  it("Should allow only owner to set whitelist batch", async function () {
    // Try to set the whitelist batch from a non-owner account
    await expect(
      cryptoXRB.connect(user).setWhitelistBatch([user.address], [true])
    ).to.be.revertedWith("CryptoXRB: not admin");

    // Set the whitelist batch from the owner account
    await cryptoXRB.connect(owner).setWhitelistBatch([user.address], [true]);
    expect(await cryptoXRB.whitelist(user.address)).to.be.true;
  });

  it("Should emit Transfer event when transferring tokens", async function () {
    // Mint some tokens to a non-whitelisted address
    await cryptoXRB.mint(user, parseEther("10"));

    // Check the emitted event
    await expect(cryptoXRB.connect(user).transfer(owner, parseEther("1")))
      .to.emit(cryptoXRB, "Transfer")
      .withArgs(user.address, owner.address, parseEther("1"));
  });

  it("Should remain remnant tokens in owner account after transferring", async function () {
    // Burn tokens
    await cryptoXRB.connect(owner).transfer(user, parseUnits("1000000000", 18));

    // Check the owner's balance
    const ownerBalance = await cryptoXRB.balanceOf(owner.address);
    expect(ownerBalance).to.equal(parseUnits("1", 15));
  });
});
