// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "solady/src/utils/SafeTransferLib.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // Import Ownable
import "./NaiveReceiverLenderPool.sol";

contract FlashLoanReceiver is IERC3156FlashBorrower, Ownable { // Inherit Ownable

    address private pool;
    address private constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    bool private flashLoanActive; // Flag to control when flash loans are allowed

    error Unauthorized(); // Error for unauthorized actions
    error UnsupportedCurrency();

    constructor(address _pool) {
        pool = _pool;
    }

    // Only allow flash loans when they're expected
    modifier flashLoanGuard() {
        if (!flashLoanActive) {
            revert Unauthorized();
        }
        _;
    }

    // Function to enable or disable flash loans
    function setFlashLoanActive(bool _active) external onlyOwner {
        flashLoanActive = _active;
    }

    function onFlashLoan(
        address,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata
    ) external flashLoanGuard returns (bytes32) {
        if (token != ETH)
            revert UnsupportedCurrency();

        uint256 amountToBeRepaid = amount + fee;
        _executeActionDuringFlashLoan();

        SafeTransferLib.safeTransferETH(pool, amountToBeRepaid);
        return keccak256("ERC3156FlashBorrower.onFlashLoan");
    }

    function _executeActionDuringFlashLoan() internal { }
    receive() external payable {}
}
