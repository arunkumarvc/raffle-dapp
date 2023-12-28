// SPDX-License-Identifier: MIT
pragma solidity 0.8.22;

/* Imports */
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/interfaces/AutomationCompatibleInterface.sol";

/**
 * @title Raffle Contract
 * @author Arun
 * @notice The contact that allows users to enter a raffle and win a prize.
 * @dev This implements the Chainlink VRF Version 2
 */
contract Raffle is VRFConsumerBaseV2, AutomationCompatibleInterface {
    /* Type Declarations */
    enum RaffleState {
        Open,
        Calculating
    }

    /* State Variable */
    // Chainlink VRF Variables
    VRFCoordinatorV2Interface private immutable _VRF_COORDINATOR;
    bytes32 private immutable _GAS_LANE;
    uint64 private immutable _SUB_ID;
    uint32 private immutable _CALLBACK_GAS_LIMIT;
    uint16 private constant _REQUEST_CONFIRMATIONS = 3;
    uint32 private constant _NUM_WORDS = 1;

    // Raffle Variables
    uint256 private immutable _ENTRANCE_FEE;
    address payable[] private _players;
    address private _recentWinner;
    uint256 private immutable _INTERVAL;
    uint256 private _lastTimeStamp;
    RaffleState private _raffleState;

    /* Events */

    /**
     * @dev Emitted when a new player enters the raffle.
     * @param player address of the player.
     */
    event RaffleEnter(address indexed player);
    /**
     * @dev Emitted when a winner is picked.
     * @param winner address of the winner.
     */
    event WinnerPicked(address indexed winner);

    /* Errors */
    /// @dev Error is thrown if the user does not enter enough ETH to participate in the raffle.
    error Raffle__SendMoreToEnterRaffle();
    /// @dev Error is thrown if the raffle is not currently open for entries
    error Raffle__RaffleNotOpen();
    /// @dev Error is thrown if the upkeepNeeded is false.
    error Raffle__UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 raffleState);
    /// @dev Error is thrown if the transfer of ETH from the raffle contract to  user fails.
    error Raffle__TransactionFailed();

    /* Functions */
    /**
     *
     * @param entranceFee The entrance fee for the raffle.
     * @param interval The interval between raffles.
     * @param vrfCoordinatorV2 The address of the Chainlink VRF Coordinator
     * contract that this contract will use.
     * @param gasLane The gas lane key hash value, which is the maximum gas
     * price you are willing to pay for a request in wei.
     * @param subId  The subscription ID that this contract uses for funding requests.
     * @param callbackGasLimit The limit for how much gas to use for the callback
     * request to this contract's fulfillRandomWords function.
     */
    constructor(
        uint256 entranceFee,
        uint256 interval,
        address vrfCoordinatorV2,
        bytes32 gasLane,
        uint64 subId,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        _ENTRANCE_FEE = entranceFee;
        _INTERVAL = interval;
        _VRF_COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        _GAS_LANE = gasLane;
        _SUB_ID = subId;
        _CALLBACK_GAS_LIMIT = callbackGasLimit;
        _lastTimeStamp = block.timestamp;
        _raffleState = RaffleState.Open;
    }

    receive() external payable {
        enterRaffle();
    }

    function enterRaffle() public payable {
        if (msg.value < _ENTRANCE_FEE) {
            revert Raffle__SendMoreToEnterRaffle();
        }
        if (_raffleState != RaffleState.Open) {
            revert Raffle__RaffleNotOpen();
        }
        _players.push(payable(msg.sender));
        emit RaffleEnter(msg.sender);
    }

    /**
     * @dev this method is called by the Automation Nodes to check if `performUpkeep` should be performed
     */
    function checkUpkeep(
        bytes memory /* checkData */
    ) public view override returns (bool upkeepNeeded, bytes memory /*  performData */) {
        bool isOpen = _raffleState == RaffleState.Open;
        bool timePassed = ((block.timestamp - _lastTimeStamp) > _INTERVAL);
        bool hasPlayers = _players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (isOpen && timePassed && hasPlayers && hasBalance);
        return (upkeepNeeded, "0x0");
    }

    /**
     * @dev Once `checkUpkeep` is returning `true`, this function is called
     * and it kicks off a Chainlink VRF call to get a random winner.
     */
    function performUpkeep(bytes calldata /* performData */) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert Raffle__UpkeepNotNeeded(
                uint256(_raffleState),
                _players.length,
                address(this).balance
            );
        }
        _raffleState = RaffleState.Calculating;
        _VRF_COORDINATOR.requestRandomWords(
            _GAS_LANE,
            _SUB_ID,
            _REQUEST_CONFIRMATIONS,
            _CALLBACK_GAS_LIMIT,
            _NUM_WORDS
        );
    }

    /**
     * @dev This is the function that Chainlink VRF node
     * calls to send the money to the random winner.
     */
    function fulfillRandomWords(
        uint256 /* requestId */,
        uint256[] memory randomWords
    ) internal override {
        uint256 indexOfWinner = randomWords[0] % _players.length;
        address payable recentWinner = _players[indexOfWinner];
        _recentWinner = recentWinner;
        _players = new address payable[](0);
        _raffleState = RaffleState.Open;
        _lastTimeStamp = block.timestamp;
        emit WinnerPicked(recentWinner);
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert Raffle__TransactionFailed();
        }
    }

    /* Getter (View and Pure) Functions */
    function getEntranceFee() public view returns (uint256) {
        return _ENTRANCE_FEE;
    }

    function getInterval() public view returns (uint256) {
        return _INTERVAL;
    }

    function getVRFCoordinatorV2() public view returns (VRFCoordinatorV2Interface) {
        return _VRF_COORDINATOR;
    }

    function getGasLane() public view returns (bytes32) {
        return _GAS_LANE;
    }

    function getSubscriptionId() public view returns (uint64) {
        return _SUB_ID;
    }

    function getCallbackGasLimit() public view returns (uint32) {
        return _CALLBACK_GAS_LIMIT;
    }

    function getLastTimeStamp() public view returns (uint256) {
        return _lastTimeStamp;
    }

    function getRaffleState() public view returns (RaffleState) {
        return _raffleState;
    }

    function getPlayer(uint256 index) public view returns (address) {
        return _players[index];
    }

    function getNumberOfPlayers() public view returns (uint256) {
        return _players.length;
    }

    function getRecentWinner() public view returns (address) {
        return _recentWinner;
    }
}
