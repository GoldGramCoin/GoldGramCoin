pragma solidity = 0.5.0;

import "./IERC20.sol";
import "./SafeMath.sol";
import "./Repository.sol";

contract GGCToken is IERC20 {
    using SafeMath for uint256;

    address public _owner;
    string public name;
    string public symbol;
    uint8 public decimals = 18;

    address public _repository;

    struct account {
        uint256 balance;
        bool isVerified;
    }

    mapping (address => account) public accInfo;
    mapping (address => mapping (address => uint256)) private _allowed;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Mint(address indexed from, uint256 value);
    event Burn(address indexed from, uint256 value);
    event Verify(address indexed who, bool state);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyBy(address _account) {
        require(msg.sender == _account, "Sender not authorized.");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner, "Sender not authorized.");
        _;
    }

    modifier onlyVerifed(address _account) {
        require(accInfo[_account].isVerified == true, "Account is not verified");
        _;
    }

    function totalSupply() external view returns (uint256) {
        Repository repo = Repository(_repository);
        return repo.totalStock();
    }

    function balanceOf(address who) external view returns (uint256) {
        return accInfo[who].balance;
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowed[owner][spender];
    }

    /**
     * Constructor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */
    constructor(address repository) public {
        _owner = msg.sender;                         // Make the creator the owner

        accInfo[msg.sender].balance = 0;  // Give the creator all initial tokens
        accInfo[msg.sender].isVerified = true;   // Give the creator whitelist privileges

        name = "GGC Token";                         // Set the name for display purposes
        symbol = "GGC";                             // Set the symbol for display purposes
        _repository = repository;
    }

    function changeRepository(address _newRepository) external onlyOwner() {
        require(_newRepository != address(0), "Invalid address");
        _owner = _newRepository;
    }

    /**
     * Change Contract Owner
     */
    function changeOwner(address _newOwner) external onlyOwner() {
        require(_newOwner != address(0), "Invalid address");
        _owner = _newOwner;
    }

    /**
     * Whitelist account address
     */
    function verify(address _account) external onlyOwner() {
        require(_account != address(0), "Invalid address");
        accInfo[_account].isVerified = true;
        emit Verify(_account, true);
    }

    /**
     * Blacklist account address
     */
    function unverify(address _account) external onlyOwner() {
        require(_account != address(0), "Invalid address");
        accInfo[_account].isVerified = false;
        emit Verify(_account, false);
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
    function _transfer(address _from, address _to, uint _value) internal onlyVerifed(_from) onlyVerifed(_to) {
        require(accInfo[_from].balance >= _value, "Sender has insufficient funds");                             // Check if the receiver is whitelisted
        require(accInfo[_to].balance + _value >= accInfo[_to].balance, "Invalid amount");            // Check for overflows

        accInfo[_from].balance = accInfo[_from].balance.sub(_value);                                           // Subtract from the sender
        accInfo[_to].balance = accInfo[_to].balance.add(_value);                                             // Add the same to the recipient

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

    function() external payable {
        revert("Not payable");
    }
}