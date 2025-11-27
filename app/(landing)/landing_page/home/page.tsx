import Image from "next/image";
import { Header } from "../../header";

const LandingHomePage = () => {
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
      <div className="font-serif font-extrabold text-2xl sm:text-3xl md:text-4xl text-center mt-5 px-4 text-[#173f63]">
        Welcome to CTIC!
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center py-8 px-4 gap-6 md:gap-8 max-w-7xl mx-auto">
        <Image
          src="/cticlogo.webp"
          alt="CTIC"
          width={350}
          height={350}
          className="w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] h-auto object-contain"
        />

        <div className="flex flex-col max-w-2xl text-center md:text-left px-4">
          <div className="text-xl sm:text-2xl font-serif font-semibold text-[#173f63] mt-2">
            Canlubang Techno-Industrial Corporation
          </div>
          <p className="text-[#173f63] font-extralight mt-4 text-sm sm:text-base">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum
            cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem
            iure ab expedita repellendus necessitatibus earum.
          </p>

          <div className="text-xl sm:text-2xl font-serif font-semibold text-[#173f63] mt-6">
            Background
          </div>
          <p className="text-[#173f63] font-extralight mt-4 text-sm sm:text-base">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum
            cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem
            iure ab expedita repellendus necessitatibus earum...
          </p>

          <div className="text-xl sm:text-2xl font-serif font-semibold text-[#173f63] mt-6">
            Partnerships
          </div>
          <p className="text-[#173f63] font-extralight mt-4 text-sm sm:text-base">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum
            cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem
            iure ab expedita repellendus necessitatibus earum...
          </p>

          <div className="text-xl sm:text-2xl font-serif font-semibold text-[#173f63] mt-6">
            Clients
          </div>
          <p className="text-[#173f63] font-extralight mt-4 text-sm sm:text-base">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum
            cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem
            iure ab expedita repellendus necessitatibus earum...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingHomePage;
