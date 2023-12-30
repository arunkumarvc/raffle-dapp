import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MetaMaskProvider from "../context/MetaMaskProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Raffle Dapp",
  description: "A Fair and Secure Raffle Experience on the Blockchain",
  openGraph: {
    title: "Raffle Dapp",
    description: "A Fair and Secure Raffle Experience on the Blockchain",
    url: "https://dapp-raffle.vercel.app/",
    siteName: "Raffle Dapp",
    images: [
      {
        url: "https://dapp-raffle.vercel.app/og.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
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
