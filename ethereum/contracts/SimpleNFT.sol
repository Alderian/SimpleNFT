// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/ISimpleNFT.sol";

contract SimpleNFT is ERC721, Ownable, ISimpleNFT {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    bool public isSaleActive = false;
    uint256 public maxSupply = 5000;
    uint256 public maxPerWallet = 1;
    uint256 public mintPrice = 0.12 ether;

    // Wallet/contract allowed to withdraw funds
    address private _withdrawer;

    string private _baseTokenURI;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory baseURI,
        address _newWithdrawer,
        uint256 _maxSupply
    ) ERC721(_name, _symbol) {
        _baseTokenURI = baseURI;
        _withdrawer = _newWithdrawer;
        maxSupply = _maxSupply;

        // nextTokenId is initialized to 1, since starting at 0 leads to higher gas cost for the first minter
        _tokenIdCounter.increment();
    }

    /**
     * @dev To mint a NFT you need to pay gas. You can only mint maxPerWallet.
     * This is only available when sale is active
     */
    function saleOne() external payable returns (uint256) {
        if (!isSaleActive) revert SaleNotActive();
        if (balanceOf(msg.sender) >= maxPerWallet) revert MaximumPerWallet(maxPerWallet);
        if (_tokenIdCounter.current() > maxSupply) revert ExceedSupplyLimit();
        if (msg.value < mintPrice) revert InvalidEthAmount();

        uint256 newTokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, newTokenId);
        return newTokenId;
    }

    function availableSupply() external view returns (uint256) {
        return maxSupply - totalSupply();
    }

    /**
        @dev Returns the total tokens minted so far.
        1 is always subtracted from the Counter since it tracks the next available tokenId.
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }

    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function setMaxPerWallet(uint256 newMaxPerWallet) external onlyOwner {
        maxPerWallet = newMaxPerWallet;
    }

    function toggleSale() external onlyOwner {
        isSaleActive = !isSaleActive;
    }

    /**
     * @dev Set a withdrawer address to transfer funds.. It can be a wallet or a contract
     */
    function setWithdrawer(address withdrawer) public onlyOwner {
        _withdrawer = withdrawer;
    }

    /**
     * @dev method to transfer all collected founds to withdrawer address.
     *
     * This methods can anly be called by this contract owner but will transfer founds to the configured withdrawer.
     * Doing this way, we can transfer funds directly to another contract for latter use, avoids two transfers
     */
    function withdrawAll() external payable onlyOwner {
        uint256 balance = address(this).balance;
        if (balance <= 0) revert NoBalanceAvailable();
        payable(_withdrawer).transfer(balance);
    }
}
