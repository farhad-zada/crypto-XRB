// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract CryptoXRB is
    Initializable,
    ERC20Upgradeable,
    OwnableUpgradeable
{

    address constant public mainOwner = 0x30b7f99664F5449629d06549fd0510086141b915;
    address constant public XRWorld = 0x55d5a6809034a21B9677F418B994CAd4FC9d7B01;
    address constant public team = 0x3765eCC3A3466c94e3926DCc644779102F3bd74b;
    address constant public marketing = 0x4B7fbE5581DA3C7783e185D7083a12EC77994770;
    address constant public investors = 0x246f9ece9Be9f59B17176C059064433e70079827;
    address constant public partnership = 0x5B6E8cB706302aF605FBDB36154ECe068662D30E;
    address constant public staking = 0xF12338660Ff6C3B5b982e52eB72521499A44c6Db;

    mapping(address => bool) public admins;
    event Admin(address to, bool status);

    modifier isAdmin() {
        require(admins[msg.sender], "cryptoxr: not admin");
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() initializer {}

    function initialize() public initializer {
        __ERC20_init("CryptoXRB", "XRB");
        __Ownable_init();
        admins[msg.sender] = true;

        _mint(mainOwner, 1_000_000_000 * 10**18);
        _mint(XRWorld, 250_000_000 * 10**18);
        _mint(team, 100_000_000 * 10**18);
        _mint(marketing, 50_000_000 * 10**18);
        _mint(investors, 100_000_000 * 10**18);
        _mint(partnership, 50_000_000 * 10**18);
        _mint(staking, 50_000_000 * 10**18);
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
