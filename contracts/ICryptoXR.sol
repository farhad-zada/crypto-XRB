// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

interface ICryptoXRB {
    event Admin(address to, bool status);

    event Whitelist(address to, bool status);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function admins(address) external view returns (bool);

    function whitelist(address) external view returns (bool);

    function transferFeePercent() external view returns (uint256);

    function remnant() external view returns (uint256);

    function percentFloor() external view returns (uint256);

    function initialize() external;

    function burn(uint256 amount) external;

    function mint(address to, uint256 amount) external;

    function setAdmin(address to, bool status) external;

    function setWhitelistBatch(
        address[] memory _addresses,
        bool[] memory status
    ) external;

    function setTransferFeePercent(uint256 fee) external;

    function setRemnant(uint256 _remnant) external;

    function setPercentFloor(uint256 _percentFloor) external;

    function withdraw(
        address token,
        address payable to,
        uint256 amount
    ) external returns (bool);
}
