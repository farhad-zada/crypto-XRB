// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CryptoXR is
    Initializable,
    ERC20Upgradeable,
    OwnableUpgradeable
{
    mapping(address => bool) public admins;
    event Admin(address to, bool status);

    modifier isAdmin() {
        require(admins[msg.sender], "cryptoxr: not admin");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize() public initializer {
        __ERC20_init("CryptoXR", "CXR");
        __Ownable_init();
        admins[msg.sender] = true;
        _mint(msg.sender, 5_000_000_000 * 10 ** decimals());
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._beforeTokenTransfer(from, to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function mint(address to, uint256 amount) public isAdmin {
        _mint(to, amount);
    }

    function addAdmin(address to, bool status) public onlyOwner {
        admins[to] = status;
        emit Admin(to, status);
    }

    function withdraw(
        address token,
        address payable to,
        uint256 amount
    ) public payable onlyOwner returns (bool) {
        IERC20Upgradeable(token).transfer(to, amount);
        return true;
    }
}
