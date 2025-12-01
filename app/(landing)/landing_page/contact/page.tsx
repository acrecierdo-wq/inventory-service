import Image from "next/image";
import { Header } from "../../header";

const LandingContactPage = () => {
  return (
    <div
      className="
        relative 
        min-h-screen 
        overflow-x-hidden 
        bg-gradient-to-t 
        from-[#e3ae01] via-[#fed795] to-[#fcf4d2]
        flex flex-col items-center
      "
    >
      <Header />
      <h1 className="text-[#173f63] font-extrabold text-3xl sm:text-4xl md:text-5xl text-center mt-5 px-4">
        CONTACT INFORMATION
      </h1>
      <hr className="mt-10 border-t border-[#173f63] w-full max-w-[90%] lg:max-w-[1100px]" />

      <div className="flex flex-col lg:flex-row mt-10 px-4 sm:px-6 lg:px-10 items-center justify-center gap-8 lg:gap-10 max-w-7xl pb-10">
        <Image
          src="/cticlogo.webp"
          height={400}
          width={400}
          alt="CTIC"
          className="w-full max-w-[250px] sm:max-w-[300px] lg:max-w-[400px] h-auto object-contain"
        />

        <div className="flex flex-col w-full max-w-2xl text-center lg:text-left">
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#173f63] mt-2">
            Company
          </h1>
          <h2 className="mb-2 font-extralight text-sm sm:text-base">
            Canlubang Techno-Industrial Corporation
          </h2>

          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#173f63] mt-4">
            Address
          </h1>
          <h2 className="mb-2 font-extralight text-sm sm:text-base">
            Brgy. Sirang Lupa, Calamba City, Laguna, Philippines
          </h2>

          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#173f63] mt-4">
            Telephone Number
          </h1>
          <h2 className="mb-2 font-extralight text-sm sm:text-base">
            (012) 345-6789
          </h2>

          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#173f63] mt-4">
            Email
          </h1>
          <h2 className="mb-2 font-extralight text-sm sm:text-base">
            ctic@gmail.com
          </h2>

          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[#173f63] mt-6">
            Socials
          </h1>

          <h1 className="font-semibold mt-4">Facebook</h1>
          <div className="flex flex-row items-center justify-center lg:justify-start gap-2">
            <Image
              src="/facebook-1-svgrepo-com.svg"
              height={30}
              width={30}
              alt="facebook"
            />
            <h2 className="font-extralight text-sm sm:text-base">CTIC Page</h2>
          </div>

          <h1 className="font-semibold mt-4">Youtube</h1>
          <div className="flex flex-row items-center justify-center lg:justify-start gap-2">
            <Image
              src="/youtube-player-multimedia-video-communication-interaction-svgrepo-com.svg"
              height={30}
              width={30}
              alt="youtube"
            />
            <h2 className="font-extralight text-sm sm:text-base">
              CTIC Channel
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingContactPage;
