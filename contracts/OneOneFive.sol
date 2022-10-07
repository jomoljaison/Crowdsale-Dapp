// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `from` to `to` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Merkle {
    bytes32 private whitelist;
    //////////////////////////////
    address public OwnerOnly;

    constructor(bytes32 _whitelistHash) {
        whitelist = _whitelistHash;
        OwnerOnly = msg.sender;
    }

    // Modifiers
    modifier onlyOwner() {
        require((msg.sender == OwnerOnly), "Only onlyOwnercan call this");
        _;
    }

    function _whitelistHashLeaf(address account)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(account));
    }

    function _whitelistHashVerify(bytes32 leaf, bytes32[] memory proof)
        public
        view
        returns (bool)
    {
        return MerkleProof.verify(proof, whitelist, leaf);
    }

    function setWhitelistRoot(bytes32 _root) external onlyOwner {
        whitelist = _root;
    }
}

contract OneOneFive is ERC1155, Merkle, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter public _itemsSold;

    using SafeMath for uint256;

    string public constant name = "OneOneFive";
    string public constant symbol = "OOF";

    uint256 public totalSupply = 0;

    uint256 public constant presalePriceInEth = 0.05 ether;
    uint256 public constant publicsalePriceInEth = 1 ether;

    uint256 public preSaleStart; //Epoch & Unix Timestamp Conversion Tools aug1

    uint256 public constant preSaleMaxSupply = 111;

    uint256 public publicSaleStart; //Epoch & Unix Timestamp Conversion Tools aug16

    uint256 public publicSaleMaxSupply = 444;

    uint256 constant MAX_Pre_INTERACTIONS = 1;
    uint256 constant MAX_Public_INTERACTIONS = 3;

    uint256[] minted = [0, 0, 0];
    uint256 public presaleRemaining;
    uint256 public remaingtoken;
    uint256 public saleClose;

    mapping(address => bool) public isOwner;

    bool public onlyWhitelisted = true;

    string public baseURI = "ipfs://THISISTHECID/";
    bool public revealed = false;

    mapping(address => uint256) interactionCount;

    modifier limit() {
        require(
            interactionCount[msg.sender] < MAX_Pre_INTERACTIONS,
            "only 1 option"
        );
        interactionCount[msg.sender]++;

        _;
    }

    modifier publiclimit() {
        require(
            interactionCount[msg.sender] < MAX_Public_INTERACTIONS,
            "only 3 option"
        );
        interactionCount[msg.sender]++;

        _;
    }

    mapping(address => uint256) whitelist;
    mapping(address => uint256) publiclist;

    constructor(bytes32 _whitelistHashHashRoot, string memory uri)
        payable
        Merkle(_whitelistHashHashRoot)
        ERC1155(uri)
    {}

    function setURI(string memory uri) public onlyOwner {
        _setURI(uri);
    }

    /////////////////////////////PRESALE PUBLICSALE TIME CHECKING//////////
    function setPreSaleStart(uint256 timestamp) public onlyOwner {
        preSaleStart = timestamp;
        saleClose = 2 minutes + timestamp;
    }

    function setPublicSaleStart(uint256 timestamp) public onlyOwner {
        publicSaleStart = timestamp;
    }

    function preSaleIsActive() public view returns (bool) {
        return preSaleStart <= block.timestamp;
    }

    function publicSaleIsActive() public view returns (bool) {
        return (block.timestamp >= saleClose);
    }

    /////////---------------------------------minting--public-----------------------------/////////////

    function mint(
        uint256 id,
        uint256 count,
        bytes32[] calldata proof
    ) public payable limit {
        require(preSaleIsActive(), "Pre-sale is not active.");

        require(msg.value == presalePriceInEth.mul(count), "Not enough ether.");

        require(
            _whitelistHashVerify(_whitelistHashLeaf(msg.sender), proof),
            "You are not whitelisted."
        );
        require(
            totalSupply < preSaleMaxSupply,
            "Count exceeds the maximum allowed supply."
        );

        uint256 index = id - 1;
        _mint(msg.sender, id, count, "");
        minted[index] += count;
        _itemsSold.increment();
    }

    function _baseURI() internal view returns (string memory) {
        return baseURI;
    }

    function changeBaseURI(string memory baseURI_) public onlyOwner {
        baseURI = baseURI_;
    }

    function changeRevealed(bool _revealed) public onlyOwner {
        revealed = _revealed;
    }

    function tokenURI(uint256 tokenId) public view returns (string memory) {
        string memory baseURI_ = _baseURI();

        if (revealed) {
            return
                bytes(baseURI_).length > 0
                    ? string(
                        abi.encodePacked(
                            baseURI_,
                            Strings.toString(tokenId),
                            ".json"
                        )
                    )
                    : "";
        } else {
            return string(abi.encodePacked(baseURI_, "hidden.json"));
        }
    }

    function unsolded() public returns (uint256) {
        uint256 presaleRemainingvar = preSaleMaxSupply - _itemsSold.current();
        remaingtoken = presaleRemainingvar + publicSaleMaxSupply;
        return remaingtoken;
    }

    function getUnsolded() external view returns (uint256) {
        return remaingtoken;
    }

    function publicSaleMintf(address to, uint256 count) internal {
        if (count > 1) {
            uint256[] memory ids = new uint256[](uint256(count));
            uint256[] memory amounts = new uint256[](uint256(count));

            for (uint256 i = 0; i < count; i++) {
                ids[i] = totalSupply + i;
                amounts[i] = 1;
            }

            _mintBatch(to, ids, amounts, "");

            for (uint256 i = 0; i < count; i++) {}
        } else {
            _mint(to, totalSupply, 1, "");
        }

        totalSupply += count;
    }

    function publicSaleMint(uint256 count) internal publiclimit nonReentrant {
        require(publicSaleIsActive(), "Public sale is not active.");
        require(count > 0, "Count must be greater than 0.");
        //
        require(
            totalSupply + count > remaingtoken,
            "Count exceeds the maximum allowed supply."
        );

        publicSaleMintf(msg.sender, count);
        publiclist[msg.sender] += count;
    }

    function publicSaleMintWithEth(uint256 count) external payable {
        require(
            msg.value == publicsalePriceInEth.mul(count),
            "Not enough ether."
        );
        publicSaleMint(count);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdrawMoney() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "not have enough balance");
        address payable to = payable(msg.sender);
        to.transfer(balance);
    }
}
