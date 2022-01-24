//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./LPT.sol";
import "./NFT.sol"; 
//import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@uniswap/lib/contracts/libraries/Babylonian.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LiquidityPool is Ownable {
    event LiquidityAdded(address indexed _account);
    event LiquidityRemoved(address indexed _account);
    event TradedTokens(
        address indexed _account,
        uint256 _ethTraded,
        uint256 _nftTraded
    );

    LPT lpToken;
    NFT nft; 
    uint256 ethReserve;
    uint256 nftReserve;
    uint32 lastBlockTimestamp;

    function setLPTAddress(LPT _lpToken) external onlyOwner {
        require(address(lpToken) == address(0), "WRITE_ONCE");
        lpToken = _lpToken;
    }

    function getReserves() external view returns (uint256, uint256) {
        return (ethReserve, nftReserve);
    }

    function setNFTAddress(NFT _NFT) external onlyOwner {
        require(address(nft) == address(0), "WRITE_ONCE");
        nft = _NFT;
    }

    function swap(address account, uint256 _nftAmount) external payable {
        uint256 product = ethReserve * nftReserve;
        uint256 amountToTransfer;
        uint256 amountToTake;
        uint256 totalAmountToTransfer;

        if (msg.value == 0) {
            uint256 currentNFTBalance = nft.balanceOf(address(this));
            uint256 _nftAmountMinusTax = _nftAmount - ((2 * _nftAmount) / 100);
            uint256 addedBalance = nftReserve + _nftAmountMinusTax;

            require(addedBalance == currentNFTBalance, "DID_NOT_TRANSFER");

            uint256 x = product / (nftReserve + _nftAmountMinusTax);
            amountToTransfer = ethReserve - x;

            amountToTake = (1 * amountToTransfer) / 100;
            totalAmountToTransfer = amountToTransfer - amountToTake;

            (bool success, ) = account.call{value: totalAmountToTransfer}("");

            require(success, "TRANSFER_FAILED");
        } else {
            uint256 y = product / (ethReserve + msg.value);
            amountToTransfer = nftReserve - y;

            amountToTake = (1 * amountToTransfer) / 100;
            totalAmountToTransfer = amountToTransfer - amountToTake;
            IERC721(nft).transferFrom(address(this), account, _nftAmount );
            
          
        }
        emit TradedTokens(account, msg.value, _nftAmount);
        _update();
    }

    function deposit(uint256 nftAmount, address account) external payable {
        uint256 liquidity;
        uint256 totalSupply = lpToken.totalSupply();
        uint256 ethAmount = msg.value;

        if (totalSupply > 0) {
            liquidity = Math.min(
                (ethAmount * totalSupply) / ethReserve,
                (nftAmount * totalSupply) / nftReserve
            );
        } else {
            liquidity = Babylonian.sqrt(ethAmount * nftAmount);
        }

        lpToken.mint(account, liquidity);
        emit LiquidityAdded(account);
        _update();
    }

    function withdraw(address account) external {
        uint256 liquidity = lpToken.balanceOf(account);
        require(liquidity != 0, "NO_AVAILABLE_TOKENS");

        uint256 totalSupply = lpToken.totalSupply();

        uint256 ethAmount = (ethReserve * liquidity) / totalSupply;    

        lpToken.burn(account, liquidity);

        (bool ethTransferSuccess, ) = account.call{value: ethAmount}("");
    
        require(ethTransferSuccess , "FAILED_TRANSFER");
        emit LiquidityRemoved(account);
        _update();
    }

    function _update() private {
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        uint32 timeElapsed;
        unchecked {
            timeElapsed = blockTimestamp - lastBlockTimestamp; // If new block, overflows
        }

        if (timeElapsed > 0) {
            ethReserve = address(this).balance;
            nftReserve = nft.balanceOf(address(this));
            lastBlockTimestamp = blockTimestamp;
        }
    }
}
