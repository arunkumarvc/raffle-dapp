import { useMetaMask } from "@/hooks/useMetaMask";

interface NotificationProps {
  message: string;
  clearTransaction: () => void;
}

export default function Notification({
  message,
  clearTransaction,
}: NotificationProps) {
  const { error, errorMessage, clearError } = useMetaMask();
  return (
    <>
      {error && (
        <div className="mt-4 flex items-center justify-between gap-x-6 rounded-xl border border-red-300/30 bg-red-950/90 px-5 py-3 text-lg text-red-100">
          <p>
            <strong>Error:</strong> {errorMessage}
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 flex-none cursor-pointer transition hover:text-red-50"
            onClick={clearError}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </div>
      )}

      {message && (
        <div className="mt-4 flex items-center justify-between gap-x-6 rounded-xl border border-green-300/30 bg-green-950/90 px-5 py-3 text-lg text-green-100">
          <div className="gap-x-2 sm:flex">
            <p>Transaction Complete!</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${message}`}
              target="_blank"
              data-tooltip="Open in Block Explorer"
              className="inline-flex items-center justify-center gap-x-1 underline"
            >
              View on block explorer
            </a>
          </div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6 flex-none cursor-pointer transition hover:text-green-50"
            onClick={clearTransaction}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </div>
      )}
    </>
  );
}
