import { formatAddress } from "@/utils";
import { ethers } from "ethers";

interface AccountProps {
  account: string;
  balance: string;
  chainId: string;
  networkName: string;
}

export default function Account({
  account,
  balance,
  chainId,
  networkName,
}: AccountProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg text-xl text-gray-300">
      <a
        href={`https://sepolia.etherscan.io/address/${account}`}
        target="_blank"
        data-tooltip="Open in Block Explorer"
        className="account "
      >
        Account:{" "}
        <span className="inline-flex items-center justify-center gap-x-1">
          {formatAddress(account)}{" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </a>

      <p className="account">
        Balance: {Number(ethers.formatEther(balance)).toFixed(4)}
      </p>
      <p className="account capitalize">Network: {networkName}</p>
      <p className="account">ChainId: {parseInt(chainId)}</p>
    </div>
  );
}
