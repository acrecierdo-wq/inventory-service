import Image from "next/image";
import { Header } from "../../header";

const LandingServicesPage = () => {
  return (
    <div
      className="relative 
        min-h-screen 
        overflow-x-hidden 
        bg-gradient-to-t 
        from-[#e3ae01] via-[#fed795] to-[#fcf4d2]
        flex flex-col items-center"
    >
      <Header />
      <h1 className="text-[#173f63] font-extrabold text-3xl sm:text-4xl md:text-5xl text-center mt-5 px-4">
        SERVICES
      </h1>

      <div className="flex flex-col sm:flex-row items-center mt-10 px-4 sm:px-6 lg:px-10 w-full max-w-7xl">
        <div className="text-[#173f63] font-sans font-extrabold text-2xl sm:text-3xl mb-4 sm:mb-0 sm:mr-5">
          FABRICATION
        </div>
        <hr className="border-t border-[#173f63] w-full max-w-[300px] sm:max-w-none sm:flex-1" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 px-4 sm:px-6 lg:px-10 w-full max-w-7xl pb-10">
        {/* 1st Item - Metal Bending */}
        <div className="h-auto w-full bg-white opacity-90 rounded shadow-md flex flex-col p-5">
          <div className="flex items-center justify-center">
            <Image
              src="/metal_bending.webp"
              height={140}
              width={140}
              alt="Metal Bending"
              className="object-contain"
            />
          </div>
          <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
            Metal Bending
          </h1>
          <hr className="my-4 border-t border-gray-300" />
          <div className="text-sm flex-grow">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum
            necessitatibus nisi quos magnam minima numquam aspernatur pariatur
            quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa
            qui quo, eveniet similique.
          </div>
          <hr className="my-4 border-t border-gray-300" />
        </div>

        {/* 2nd Item - Metal Shearing */}
        <div className="h-auto w-full bg-white opacity-90 rounded shadow-md flex flex-col p-5">
          <div className="flex items-center justify-center">
            <Image
              src="/metal_shearing.jpg"
              height={140}
              width={140}
              alt="Metal Shearing"
              className="object-contain"
            />
          </div>
          <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
            Metal Shearing
          </h1>
          <hr className="my-4 border-t border-gray-300" />
          <div className="text-sm flex-grow">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum
            necessitatibus nisi quos magnam minima numquam aspernatur pariatur
            quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa
            qui quo, eveniet similique.
          </div>
          <hr className="my-4 border-t border-gray-300" />
        </div>

        {/* 3rd Item - Metal Painting */}
        <div className="h-auto w-full bg-white opacity-90 rounded shadow-md flex flex-col p-5">
          <div className="flex items-center justify-center">
            <Image
              src="/metal_painting.jpg"
              height={130}
              width={130}
              alt="Metal Painting"
              className="object-contain"
            />
          </div>
          <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
            Metal Painting
          </h1>
          <hr className="my-4 border-t border-gray-300" />
          <div className="text-sm flex-grow">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum
            necessitatibus nisi quos magnam minima numquam aspernatur pariatur
            quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa
            qui quo, eveniet similique.
          </div>
          <hr className="my-4 border-t border-gray-300" />
        </div>

        {/* 4th Item - Sample Project */}
        <div className="h-auto w-full bg-white opacity-90 rounded shadow-md flex flex-col p-5">
          <div className="flex items-center justify-center">
            <Image
              src="/rolling_cage.jpg"
              height={90}
              width={90}
              alt="Sample Project"
              className="object-contain"
            />
          </div>
          <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
            Sample Project
          </h1>
          <hr className="my-4 border-t border-gray-300" />
          <div className="text-sm flex-grow">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum
            necessitatibus nisi quos magnam minima numquam aspernatur pariatur
            quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa
            qui quo, eveniet similique.
          </div>
          <hr className="my-4 border-t border-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default LandingServicesPage;
