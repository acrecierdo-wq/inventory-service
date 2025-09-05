import Image from "next/image";

const LandingHomePage = () => {
  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-t from-[#e3ae01] via-[#fed795] to-[#fcf4d2]">
      <h1 className="font-serif font-extrabold text-5xl text-center mt-5 text-[#173f63]">
        Welcome to CTIC!
      </h1>
      <div className="flex items-center justify-center py-20">
      <div className="flex flex-row ml-5">
        <Image src="/cticlogo.webp" height={600} width={600} alt="CTIC" />
        <div className="flex flex-col">
        <h1 className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
          Canlubang Techno-Industrial Corporation
        </h1>
        <h2 className="text-[#173f63] font-extralight mt-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus necessitatibus earum
        </h2>
        <br></br>
        <h1 className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
          Background
        </h1>
        <h2 className="text-[#173f63] font-extralight mt-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus necessitatibus earum...
        </h2>
        <br></br>
        <h1 className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
          Partnerships
        </h1>
        <h2 className="text-[#173f63] font-extralight mt-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus necessitatibus earum...
        </h2>
        <br></br>
        <h1 className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
          Clients
        </h1>
        <h2 className="text-[#173f63] font-extralight mt-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus necessitatibus earum...
        </h2>
      </div>
    </div>
    </div>
    </div>
  );
};

export default LandingHomePage;
