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

    uint256 public price = 0.12 ether;

    string private _baseTokenURI;

    // Wallet/contract allowed to withdraw funds
    address private _withdrawer;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        address withdrawer
    ) ERC721(name, symbol) {
        setBaseURI(baseURI);
        setWithdrawer(withdrawer);
    }

    function saleOne() external payable {
        if (!isSaleActive) revert SaleNotActive();
        if (balanceOf(msg.sender) + 1 > maxPerWallet) revert MaximumPerWallet(maxPerWallet);
        if (_tokenIdCounter.current() >= maxSupply) revert ExceedSupplyLimit();
        if (msg.value < price) revert InvalidEthAmount();

        _mintOne(msg.sender);
    }

    function _mintOne(address _to) internal returns (uint256) {
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(_to, newTokenId);
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
        price = newPrice;
    }

    function setMaxPerWallet(uint256 newMaxPerWallet) external onlyOwner {
        maxPerWallet = newMaxPerWallet;
    }

    function setMaxSupply(uint256 newMaxSupply) external onlyOwner {
        maxSupply = newMaxSupply;
    }

    function toggleSale() external onlyOwner {
        isSaleActive = !isSaleActive;
    }

    function setWithdrawer(address withdrawer) public onlyOwner {
        _withdrawer = withdrawer;
    }

    function withdrawAll() external payable onlyOwner {
        uint256 balance = address(this).balance;
        if (balance <= 0) revert NoBalanceAvailable();
        payable(_withdrawer).transfer(balance);
    }
}
