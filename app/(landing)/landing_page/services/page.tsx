
import Image from "next/image";

const LandingServicesPage = () => {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-t from-[#e3ae01] via-[#fed795] to-[#fcf4d2] px-6">
      <h1 className="text-[#173f63] font-extrabold text-5xl text-center mt-5">SERVICES</h1>

      <div className="flex flex-row items-center mt-10 ml-10">
        <div className="text-[#173f63] font-sans font-extrabold text-3xl mr-5">FABRICATION</div>
        <hr className="my-4 border-t border-[#173f63] w-[1100px]" />
      </div>

      <div className="flex flex-row flex-wrap justify-center mt-10 gap-6">
        {/* 1st Item */}
        <div className="h-[380px] w-[280px] bg-white opacity-90 rounded shadow-md flex flex-col">
          <div className="flex items-center justify-center mt-4">
            <Image src="/metal_bending.webp" height={140} width={140} alt="Metal Bending" />
          </div>
          <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">Metal Bending</h1>
          <hr className="my-4 mx-5 border-t border-gray-300" />
          <div className="text-sm px-5 flex-grow">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
          </div>
          <hr className="my-4 mx-5 border-t border-gray-300" />
        </div>

        {/* 2nd Item */}
        <div className="h-[380px] w-[280px] bg-white opacity-90 rounded shadow-md flex flex-col">
          <div className="flex items-center justify-center mt-4">
            <Image src="/metal_shearing.jpg" height={140} width={140} alt="Metal Shearing" />
          </div>
          <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">Metal Shearing</h1>
          <hr className="my-4 mx-5 border-t border-gray-300" />
          <div className="text-sm px-5 flex-grow">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
          </div>
          <hr className="my-4 mx-5 border-t border-gray-300" />
        </div>

        {/* 3rd Item */}
        <div className="h-[380px] w-[280px] bg-white opacity-90 rounded shadow-md flex flex-col">
          <div className="flex items-center justify-center mt-4">
            <Image src="/metal_painting.jpg" height={130} width={130} alt="Metal Painting" />
          </div>
          <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">Metal Painting</h1>
          <hr className="my-4 mx-5 border-t border-gray-300" />
          <div className="text-sm px-5 flex-grow">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
          </div>
          <hr className="my-4 mx-5 border-t border-gray-300" />
        </div>

        {/* 4th Item */}
        <div className="h-[380px] w-[280px] bg-white opacity-90 rounded shadow-md flex flex-col">
          <div className="flex items-center justify-center mt-4">
            <Image src="/rolling_cage.jpg" height={90} width={90} alt="Sample Project" />
          </div>
          <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">Sample Project</h1>
          <hr className="my-4 mx-5 border-t border-gray-300" />
          <div className="text-sm px-5 flex-grow">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
          </div>
          <hr className="my-4 mx-5 border-t border-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default LandingServicesPage;
