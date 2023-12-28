// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

import {Raffle} from "../Raffle.sol";

error FailingRecipient__CallFailed();

contract FailingRecipient {
    Raffle public _target;

    constructor(address payable target) payable {
        _target = Raffle(target);
    }

    function callEnterRaffle() public {
        bytes memory payload = abi.encodeWithSignature("enterRaffle()");
        (bool success, ) = address(_target).call{value: 0.1 ether}(payload);
        if (!success) {
            revert FailingRecipient__CallFailed();
        }
    }
}
