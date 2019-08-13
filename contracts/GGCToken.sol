pragma solidity = 0.5.0;

import "./IERC20.sol";
import "./SafeMath.sol";

contract GGCToken is IERC20 {
    using SafeMath for uint256;

    string public name;
    string public symbol;
    uint8 public decimals = 18;

    address private _owner;
    uint256 private _totalSupply;
    mapping (address => uint256) private _balances;
    mapping (address => mapping (address => uint256)) private _allowed;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Burn(bytes32 indexed serial, uint256 value);
    event Mint(bytes32 indexed serial, uint256 value);
    
    struct Stock {
        uint256 index;
        uint256 amount;
        bytes32 serial;
    }

    mapping(bytes32 => Stock) private _stock;
    bytes32[] private _stockIndex;

    function getStockCount() public view returns(uint count) {
        return _stockIndex.length;
    }

    function stockExists(bytes32 serial) public view returns(bool) {
        if(_stockIndex.length == 0) return false;
        return (_stockIndex[_stock[serial].index] == serial);
    }

    function getSerialAtIndex(uint index) public view returns(bytes32) {
        require(index < _stockIndex.length, "Index out of bounds");
        return _stockIndex[index];
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address who) external view returns (uint256) {
        return _balances[who];
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowed[owner][spender];
    }

    /**
     * Constructor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */
    constructor() public {
        _owner = msg.sender;                         // Make the creator the owner
        _balances[msg.sender] = 0;
        name = "GGC Token";                         // Set the name for display purposes
        symbol = "GGC";                             // Set the symbol for display purposes
    }

    /**
     * Change Contract Owner
     */
    function changeOwner(address newOwner) external onlyOwner() {
        require(newOwner != address(0), "Invalid address");
        _owner = newOwner;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function _approve(address owner, address spender, uint256 value) internal {
        require(spender != address(0) || owner != address(0), "Invalid address");

        _allowed[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        _transfer(from, to, value);
        _approve(from, msg.sender, _allowed[from][msg.sender].sub(value));
        return true;
    }

    /**
     * Internal transfer, only can be called by this contract
     */
    function _transfer(address _from, address _to, uint _value) internal  {
        require(_balances[_from] >= _value, "Sender has insufficient funds");                             // Check if the receiver is whitelisted
        require(_balances[_to].add(_value) >= _balances[_to], "Invalid amount");            // Check for overflows

        _balances[_from] = _balances[_from].sub(_value);                                           // Subtract from the sender
        _balances[_to] = _balances[_to].add(_value);                                             // Add the same to the recipient

        emit Transfer(_from, _to, _value);                                         // Emits a Transfer Event
    }

    /**
     * Transfer tokens
     *
     * Send `value` tokens to `to` from your account
     *
     * @param to The address of the recipient
     * @param value the amount to send
     */
    function transfer(address to, uint256 value) external returns (bool success) {
        require(to != address(0), "Invalid address");
        _transfer(msg.sender, to, value);
        return true;
    }

    function burn(bytes32 serial) public onlyOwner() {
        require(stockExists(serial), "Serial not found");
        uint amount = _stock[serial].amount;

        require(_balances[_owner] >= amount, "Owner has insufficent funds");

        uint rowToDelete = _stock[serial].index;
        bytes32 serialToMove = _stockIndex[_stockIndex.length-1];

        _stockIndex[rowToDelete] = serialToMove;
        _stock[serialToMove].index = rowToDelete; 
        
        _stockIndex.length--;
        _totalSupply = _totalSupply.sub(amount);

        _balances[_owner] = _balances[_owner].sub(amount);

        emit Burn(serial, amount);
    }

    function mint(uint256 amount, bytes32 serial) public onlyOwner() returns (uint index) {
        require(!stockExists(serial), "Serial exists");
        require(amount > 0, "Amount must be greater than zero");
        
        _stock[serial].serial = serial;
        _stock[serial].amount = amount;
        _stock[serial].index = _stockIndex.push(serial)-1;

        _totalSupply = _totalSupply.add(amount);
        _balances[_owner] = _balances[_owner].add(amount);

        emit Mint(serial, amount);
        
        return _stockIndex.length-1;
    }


    modifier onlyBy(address _account) {
        require(msg.sender == _account, "Sender not authorized.");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Sender not authorized.");
        _;
    }
}