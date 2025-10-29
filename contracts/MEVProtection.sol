// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MEVProtection is ReentrancyGuard, Ownable {
    bool private paused;
    uint256 private _minBlockDelay;

    error InvalidAddress();
    error ContractPaused();

    event ProtectedSwapExecuted(address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);
    event Paused();
    event Unpaused();
    event MinBlockDelayUpdated(uint256 newDelay);

    constructor(address initialOwner) Ownable(initialOwner) {
        paused = false;
        _minBlockDelay = 1;
    }

    // ---- View Functions ----
    function isPaused() external view returns (bool) {
        return paused;
    }

    function minBlockDelay() external view returns (uint256) {
        return _minBlockDelay;
    }

    // ---- Core Function ----
    function protectedSwap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut
    ) external nonReentrant {
        if (paused) revert ContractPaused();
        if (tokenIn == address(0) || tokenOut == address(0)) revert InvalidAddress();

        emit ProtectedSwapExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
    }

    // ---- Admin Functions ----
    function updateMinBlockDelay(uint256 newDelay) external onlyOwner {
        _minBlockDelay = newDelay;
        emit MinBlockDelayUpdated(newDelay);
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }
}
