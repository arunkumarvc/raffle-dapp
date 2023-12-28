"use client";

import { MetaMaskContextProvider } from "@/hooks/useMetaMask";
import { PropsWithChildren } from "react";

export default function MetaMaskProvider({ children }: PropsWithChildren) {
  return <MetaMaskContextProvider>{children}</MetaMaskContextProvider>;
}
