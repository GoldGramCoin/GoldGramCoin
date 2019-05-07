Code at commit `16b2e10c53e197f797f0f3ca2c6f3a412874ab55`

```
//OK LC
pragma solidity 0.5.0;

//OK LC
import "./IERC20.sol";

//OK LC
import "./SafeMath.sol";

//OK LC
contract GGCToken_Fix is IERC20 {
    //OK LC
    using SafeMath for uint256;

    // Semi Standard ERC-20 Token Contract:
    //OK LC
    address public _owner;

    //OK LC
    string public name;

    //OK LC
    string public symbol;

    //OK LC
    uint8 public decimals = 18;

    //OK LC
    uint256 private _totalSupply;

    //OK LC
    struct account {
        //OK LC
        uint256 balance;
        //OK LC
        bool isVerified;
    }

    //OK LC
    mapping (address => account) public accInfo;

    //OK LC
    mapping (address => mapping (address => uint256)) private _allowed;

    //OK LC
    event Transfer(address indexed from, address indexed to, uint256 value);

    //OK LC
    event Mint(address indexed from, uint256 value);

    //OK LC
    event Burn(address indexed from, uint256 value);

    //OK LC
    event Verify(address indexed who, bool state);

    //OK LC
    event Approval(address indexed owner, address indexed spender, uint256 value);

    //OK LC
    modifier onlyBy(address _account) {
        //OK LC
        require(msg.sender == _account, "Sender not authorized.");
        //OK LC
        _;
    }

    //OK LC
    modifier onlyOwner() {
        //OK LC
        require(msg.sender == _owner, "Sender not authorized.");
        //OK LC
        _;
    }

    //OK LC
    modifier onlyVerifed(address _account) {
        //OK LC
        require(accInfo[_account].isVerified == true, "Account is not verified");  
        //OK LC
        _;
    }

    //OK LC
    function totalSupply() external view returns (uint256) {
        //OK LC
        return _totalSupply;
    }

    //OK LC
    function balanceOf(address who) external view returns (uint256) {
        //OK LC
        return accInfo[who].balance;
    }

    //OK LC
    function allowance(address owner, address spender) public view returns (uint256) {
        //OK LC
        return _allowed[owner][spender];
    }

    /**
     * Constructor function
     *
     * Initializes contract with initial supply tokens to the creator of the contract
     */
    //OK LC
    constructor() public {
        //OK LC
        _owner = msg.sender;  
        //OK LC                       // Make the creator the owner
        _totalSupply = 0;  // Update total supply with the decimal amount
        //OK LC
        accInfo[msg.sender].balance = 0;  // Give the creator all initial tokens
        //OK LC
        accInfo[msg.sender].isVerified = true;   // Give the creator whitelist privileges
        //OK LC
        name = "GGC Token";                         // Set the name for display purposes
        //OK LC
        symbol = "GGC";                             // Set the symbol for display purposes
    }

    /**
     * Change Contract Owner
     */
    //OK LC
    function changeOwner(address _newOwner) external onlyOwner() {
        //OK LC
        require(_newOwner != address(0), "Invalid address");
        //OK LC
        _owner = _newOwner;
    }

    /**
     * Whitelist account address
     */
    //OK LC
    function verify(address _account) external onlyOwner() {
        //OK LC
        require(_account != address(0), "Invalid address");
        //OK LC
        accInfo[_account].isVerified = true;
        //OK LC
        emit Verify(_account, true);
    }

    /**
     * Blacklist account address
     */
    //OK LC
    function unverify(address _account) external onlyOwner() {
        //OK LC
        require(_account != address(0), "Invalid address");
        //OK LC
        accInfo[_account].isVerified = false;
        //OK LC
        emit Verify(_account, false);
    }

    //OK LC
    function approve(address spender, uint256 value) public returns (bool) {
        //OK LC
        _approve(msg.sender, spender, value);
        //OK LC
        return true;
    }

    //OK LC
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
    function _transfer(address _from, address _to, uint _value) onlyVerifed(_from) onlyVerifed(_to) internal {
        require(accInfo[_from].balance >= _value, "Sender has insufficient funds");                                  // Check if the sender has enough                               // Check if the receiver is whitelisted
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
        _transfer(msg.sender, to, value);
        return true;
    }

    /**
     * Buy tokens
     *
     * Add `value` tokens to the system irreversibly
     *
     * @param value the amount of money to buy
     * @param buyer the address of the Buyer
     */
    function buy(uint256 value, address buyer) onlyVerifed(buyer) onlyOwner() external returns (bool success) {        
        _totalSupply = _totalSupply.add(value);                            // Updates totalSupply
        accInfo[buyer].balance = accInfo[buyer].balance.add(value);               // Updates Buyer Account
        
        emit Mint(msg.sender, value);                    // Emits a Mint Event         
        return true;
    }

    /**
     * Sell tokens
     *
     * Remove `value` tokens to the system irreversibly
     *
     * @param value the amount of money to sell
     * @param seller the address of the Seller
     */
    function sell(uint256 value, address seller) onlyVerifed(seller) onlyOwner() external returns (bool success) {
        require(accInfo[seller].balance >= value, "Insufficient funds");      // Check if the account has enough
        
        _totalSupply = _totalSupply.sub(value);                             // Updates totalSupply
        _burnFor(value, seller);                        // Updates Seller Account
        
        return true;
    }

    /**
     * Destroy tokens of Another Account
     *
     * Remove `value` tokens from the system irreversibly
     *
     * @param value the amount of money to burn
     * @param _for the address of the owner of the tokens to burn
     */
    function _burnFor(uint256 value, address _for) onlyOwner() internal returns (bool success) {
        accInfo[_for].balance = accInfo[_for].balance.sub(value);            // Subtract from the sender
        
        emit Burn(_for, value);
        return true;
    }

    function() external payable {
        revert("Not payable");
    }
}
```