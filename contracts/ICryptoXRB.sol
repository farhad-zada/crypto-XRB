// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface ICryptoXRB {
    function admins(address) external view returns (bool);

    function initialize() external;

    function burn(uint256 amount) external;

    function mint(address to, uint256 amount) external;

    function setAdmin(address to, bool status) external;

    function setWhitelistBatch(
        address[] memory _addresses,
        bool[] memory status
    ) external;

    function withdraw(
        address token,
        address payable to,
        uint256 amount
    ) external returns (bool);
}
