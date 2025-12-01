import Image from "next/image";
import { Header } from "../../header";

const LandingProductsPage = () => {
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
        CONSUMABLE ITEMS
      </h1>
      <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-8 pb-10">
        {/* TAPES SECTION */}
        <div className="flex flex-col sm:flex-row items-center mt-10 w-full max-w-7xl">
          <div className="text-[#173f63] font-sans font-extrabold text-2xl sm:text-3xl mb-4 sm:mb-0 sm:mr-5">
            TAPES
          </div>
          <hr className="border-t border-[#173f63] w-full max-w-[300px] sm:max-w-none sm:flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 w-full max-w-7xl">
          {/* 1st Item - Duct Tape */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/duct_tape.jpg"
                height={100}
                width={100}
                alt="Duct Tape"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Duct Tape
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* 2nd Item - Masking Tape */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/masking_tape.jpg"
                height={100}
                width={100}
                alt="Masking Tape"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Masking Tape
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* 3rd Item - Packaging Tape */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/packaging_tape.jpg"
                height={100}
                width={100}
                alt="Packaging Tape"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Packaging Tape
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* 4th Item - Floor Marking Tape */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/floor_marking_tape.jpg"
                height={100}
                width={100}
                alt="Floor Marking Tape"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Floor Marking Tape
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>
        </div>

        {/* STRAP SECTION */}
        <div className="flex flex-col sm:flex-row items-center mt-16 w-full max-w-7xl">
          <div className="text-[#173f63] font-sans font-extrabold text-2xl sm:text-3xl mb-4 sm:mb-0 sm:mr-5">
            STRAP
          </div>
          <hr className="border-t border-[#173f63] w-full max-w-[300px] sm:max-w-none sm:flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 w-full max-w-7xl">
          {/* 5th Item - Plastic Strap */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/plastic_strap.jpg"
                height={80}
                width={80}
                alt="Plastic Strap"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Plastic Strap
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* 6th Item - Metal Strap */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/steel_strap.jpg"
                height={100}
                width={100}
                alt="Metal Strap"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Metal Strap
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* 7th Item - Black Strap */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/black_strap.jpg"
                height={100}
                width={100}
                alt="Black Strap"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Black Strap
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* 8th Item - Polyester Strap */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/polyester_strap.webp"
                height={100}
                width={100}
                alt="Polyester Strap"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Polyester Strap
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>
        </div>

        {/* PADS AND TRAYS SECTION */}
        <div className="flex flex-col sm:flex-row items-center mt-16 w-full max-w-7xl">
          <div className="text-[#173f63] font-sans font-extrabold text-2xl sm:text-3xl mb-4 sm:mb-0 sm:mr-5">
            PADS AND TRAYS
          </div>
          <hr className="border-t border-[#173f63] w-full max-w-[260px] sm:max-w-none sm:flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 w-full max-w-7xl">
          {/* 9th Item - Foam Pad */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/foam_pad.jpg"
                height={100}
                width={100}
                alt="Foam Pad"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Foam Pad
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* 10th Item - Foam Tray */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/foam_tray.jpg"
                height={110}
                width={110}
                alt="Foam Tray"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Foam Tray
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* 11th Item - Bubble Sheet */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/bubble_sheet.jpg"
                height={100}
                width={100}
                alt="Bubble Sheet"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Bubble Sheet
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* 12th Item - Plastic Buckle */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/plastic_buckle.jpg"
                height={110}
                width={110}
                alt="Plastic Buckle"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Plastic Buckle
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>
        </div>

        {/* PLASTICS SECTION */}
        <div className="flex flex-col sm:flex-row items-center mt-16 w-full max-w-7xl">
          <div className="text-[#173f63] font-sans font-extrabold text-2xl sm:text-3xl mb-4 sm:mb-0 sm:mr-5">
            PLASTICS
          </div>
          <hr className="border-t border-[#173f63] w-full max-w-[290px] sm:max-w-none sm:flex-1" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 w-full max-w-7xl">
          {/* 13th Item - Plastic Box Blue */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/plastic_box_blue.webp"
                height={120}
                width={120}
                alt="Plastic Box Bin - Blue"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Plastic Box Bin - Blue
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* 14th Item - Plastic Box Red */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/plastic_box_red.webp"
                height={100}
                width={100}
                alt="Plastic Box Bin - Red"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Plastic Box Bin - Red
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* 15th Item - Plastic Box Yellow */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/plastic_box_yellow.webp"
                height={100}
                width={100}
                alt="Plastic Box Bin - Yellow"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              Plastic Box Bin - Yellow
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>

          {/* 16th Item - PE Plastic Bag */}
          <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
            <div className="flex justify-center">
              <Image
                src="/pe_plastic_bag.webp"
                height={100}
                width={100}
                alt="PE Plastic Bag"
                className="object-contain"
              />
            </div>
            <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
              PE Plastic Bag
            </h1>
            <hr className="my-4 border-t border-gray-300" />
            <div className="text-sm">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Voluptatum necessitatibus nisi quos magnam minima numquam
              aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
              ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            <hr className="my-4 border-t border-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingProductsPage;
