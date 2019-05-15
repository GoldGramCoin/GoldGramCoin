pragma solidity = 0.5.0;

interface IRepository {
    function add(uint256 amount, bytes32 serial) external;

    function remove(uint256 index) external;

    function update(uint256 amount, bytes32 serial, uint256 index) external;
}