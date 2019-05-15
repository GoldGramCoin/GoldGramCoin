pragma solidity = 0.5.0;

import "./SafeMath.sol";
import "./IRepository.sol";

contract Repository is IRepository {
    using SafeMath for uint256;

    address public _owner;
    address public _writer;

    Stock[] public _inventory;

    function totalStock() external view returns (uint256) {
        uint256 total = 0;

        for (uint i = 0; i < _inventory.length; i++) {
            total = total.add(_inventory[i].amount);
        }

        return total;
    }

    struct Stock {
        uint256 amount;
        bytes32 serial;
    }

    constructor() public {
        _owner = msg.sender;
        _writer = msg.sender;
    }

    function add(uint256 amount, bytes32 serial) external onlyWriter() {
        _inventory.push(Stock(amount, serial));
    }

    function remove(uint256 index) external onlyWriter() {
        delete _inventory[index];
    }

    function update(uint256 amount, bytes32 serial, uint256 index) external onlyWriter() {
        _inventory[index].amount = amount;
        _inventory[index].serial = serial;
    }

    function updateWriter(address writer) public onlyOwner() {
        require(_writer != address(0), "Invalid address");
        _writer = writer;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Sender not authorized.");
        _;
    }

    modifier onlyWriter() {
        require(msg.sender == _writer, "Sender not authorized.");
        _;
    }
}