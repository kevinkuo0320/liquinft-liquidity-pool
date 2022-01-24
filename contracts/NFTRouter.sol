//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./NFT.sol"; 
import "./LiquidityPool.sol";

contract NFTRouter {
    LiquidityPool liquidityPool;
    NFT nft;

    constructor(LiquidityPool _liquidityPool, NFT _NFT) {
        liquidityPool = _liquidityPool;
        nft = _NFT;
    }

    function addLiquidity(uint256 _nftAmount) external payable {
        require(nft.balanceOf(msg.sender) > 0, "NO_AVAILABLE_TOKENS");

        IERC721(nft).transferFrom(msg.sender, address(liquidityPool), _nftAmount);
        liquidityPool.deposit{value: msg.value}(_nftAmount, msg.sender);
    }

    function pullLiquidity() external {
        liquidityPool.withdraw(msg.sender);
    }

    function swapTokens(uint256 _nftAmount) external payable {
        IERC721(nft).transferFrom(msg.sender, address(liquidityPool), _nftAmount);
        liquidityPool.swap{value: msg.value}(msg.sender, _nftAmount);
    }
}
