import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MetaMaskProvider from "../context/MetaMaskProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Raffle Dapp",
  description:
    "A contract that allows users to enter a raffle and win a prize.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} relative -z-10 min-h-screen overflow-x-hidden bg-black bg-gradient-radial from-[#28065C] to-[#16003A] to-80% text-gray-50`}
      >
        <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,255,255,0.7))]"></div>

        <MetaMaskProvider>{children}</MetaMaskProvider>
      </body>
    </html>
  );
}
