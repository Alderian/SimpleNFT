// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

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
        string memory name,
        string memory symbol,
        string memory baseURI,
        address withdrawer,
        uint256 newMaxSupply
    ) ERC721(name, symbol) {
        setBaseURI(baseURI);
        setWithdrawer(withdrawer);
        maxSupply = newMaxSupply;
    }

    /**
     * @dev To mint a NFT you need to pay gas. You can only mint maxPerWallet.
     * This is only available when sale is active
     */
    function saleOne() external payable returns (uint256) {
        if (!isSaleActive) revert SaleNotActive();
        if (balanceOf(msg.sender) >= maxPerWallet) revert MaximumPerWallet(maxPerWallet);
        if (_tokenIdCounter.current() >= maxSupply) revert ExceedSupplyLimit();
        if (msg.value < mintPrice) revert InvalidEthAmount();

        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(msg.sender, newTokenId);
        return newTokenId;
    }

    function availableSupply() external view returns (uint256) {
        return maxSupply - _tokenIdCounter.current();
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
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
