import Image from "next/image";
import raffleLogo from "/public/raffle-logo.png";
import shapes from "/public/shapes.png";
import shapes1 from "/public/shapes1.png";

export default function Header() {
  return (
    <div className="flex flex-col items-center justify-start ">
      <Image
        src={raffleLogo}
        alt="raffle logo"
        quality={95}
        priority={true}
        className="mx-auto w-[28rem]"
      ></Image>
      <div className="absolute inset-0 -top-32 -z-50 mx-auto hidden h-[40rem]  flex-1 bg-gradient-radial from-[#E36EFF]/20 to-60% sm:block sm:w-[40rem] lg:w-[60rem]"></div>
      {/* Background Shapes */}
      <div className="absolute top-72 -z-50 flex justify-center">
        <div className="flex-none">
          <Image
            src={shapes}
            alt="shapes"
            className="w-[80rem] opacity-75"
          ></Image>
        </div>
      </div>
      <div className="absolute top-6 -z-50 flex justify-center">
        <div className="flex-none">
          <Image
            src={shapes1}
            alt="shapes"
            className="w-[42rem] opacity-50"
          ></Image>
        </div>
      </div>
      <div className="mt-8 max-w-lg">
        <h1 className="text-center text-4xl font-bold uppercase tracking-tight sm:text-6xl">
          Win Big with{" "}
          <span className="bg-gradient-to-b from-[#99F1FF] to-[#39AFFF] bg-clip-text text-transparent">
            Transparency
          </span>
        </h1>
        <p className="mt-4 text-center text-lg leading-8 text-gray-300">
          Dive into the World of Decentralized Raffles with Guaranteed
          Verifiable Randomness.
        </p>
      </div>
    </div>
  );
}
