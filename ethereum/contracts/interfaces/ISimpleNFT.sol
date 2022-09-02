// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

interface ISimpleNFT {
    /**************************************************************************
     * Errors
     *************************************************************************/

    /// @dev Sale is not active
    error SaleNotActive();

    /// @dev Exceeds NFT tokens supply
    error ExceedSupplyLimit();

    /// @dev Balance is 0
    error NoBalanceAvailable();

    /// @dev Maximum NFT per wallet exceeded
    error MaximumPerWallet(uint256 maxPerWallet);

    /// @dev You can only mint a maximum of 2 tokens per transaction
    error MaximumPerTransaction();

    /// @dev Ether sent is not correct
    error InvalidEthAmount();
}
