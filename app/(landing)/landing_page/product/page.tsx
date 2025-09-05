
import Image from "next/image";

const LandingProductsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-t from-[#e3ae01] via-[#fed795] to-[#fcf4d2] px-1">
      <h1 className="text-[#173f63] font-extrabold text-5xl text-center mt-5">CONSUMABLE ITEMS</h1>
        <div className="flex-flex-col items-center justify-center">
         <div className="flex flex-row mt-10">
        <div className="text-[#173f63] font-sans font-extrabold text-3xl ml-22">TAPES</div>
        <hr className="my-4 ml-5 border-t border-[#173f63] w-300" />
        </div>
            <div className="flex flex-row ml-50 mt-10">
        
        {/* 1st Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
            <div className="ml-22">
             {/* Item Image */}   
            <Image src="/duct_tape.jpg" height={100} width={100} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Duct Tape</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>

            {/* 2nd Consumable Item */}
            <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
            <div className="ml-22 mt-2 mb-3">
             {/* Item Image */}   
            <Image src="/masking_tape.jpg" height={100} width={100} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Masking Tape</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>

        {/* 3rd Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
            <div className="ml-22">
             {/* Item Image */}   
            <Image src="/packaging_tape.jpg" height={100} width={100} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Packaging Tape</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>
        {/* 4th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
            <div className="ml-22">
             {/* Item Image */}   
            <Image src="/floor_marking_tape.jpg" height={100} width={100} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Floor Marking Tape</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>
            </div>

            <div className="flex flex-row">
        <div className="text-[#173f63] font-sans font-extrabold text-3xl ml-22">STRAP</div>
        <hr className="my-4 ml-5 border-t border-[#173f63] w-300" />
        </div>
            <div className="flex flex-row ml-50 mt-10">
        {/* 5th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
        <div className="ml-25 mt-3 mb-2">
             {/* Item Image */}   
            <Image src="/plastic_strap.jpg" height={80} width={80} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Plastic Strap</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>

        {/* 6th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
        <div className="ml-22 mt-9 mb-3">
             {/* Item Image */}   
            <Image src="/steel_strap.jpg" height={100} width={100} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Metal Strap</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>

        {/* 7th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
        <div className="ml-22">
             {/* Item Image */}   
            <Image src="/black_strap.jpg" height={100} width={100} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Black Strap</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>

        {/* 8th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
        <div className="ml-22">
             {/* Item Image */}   
            <Image src="/polyester_strap.webp" height={100} width={100} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Polyester Strap</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>
            </div>
        
            <div className="flex flex-row">
        <div className="text-[#173f63] font-sans font-extrabold text-3xl ml-22">PADS AND TRAYS</div>
        <hr className="my-4 ml-5 border-t border-[#173f63] w-260" />
        </div>
        
        <div className="flex flex-row ml-50 mt-10">
        {/* 9th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
        <div className="ml-22">
             {/* Item Image */}   
            <Image src="/foam_pad.jpg" height={100} width={100} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Foam Pad</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>

        {/* 10th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
        <div className="ml-22 mt-5 mb-3">
             {/* Item Image */}   
            <Image src="/foam_tray.jpg" height={110} width={110} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Foam Tray</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>

        {/* 11th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
        <div className="ml-22 mt-2">
             {/* Item Image */}   
            <Image src="/bubble_sheet.jpg" height={100} width={100} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Bubble Sheet</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>

        {/* 12th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
        <div className="ml-22 mt-4 mb-2">
             {/* Item Image */}   
            <Image src="/plastic_buckle.jpg" height={110} width={110} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Plastic Buckle</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>
            </div>
        
            <div className="flex flex-row">
        <div className="text-[#173f63] font-sans font-extrabold text-3xl ml-22">PLASTICS</div>
        <hr className="my-4 ml-5 border-t border-[#173f63] w-290" />
        </div>
        <div className="flex flex-row ml-50 mt-10">
        {/* 13th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
        <div className="ml-22 mt-3">
             {/* Item Image */}   
            <Image src="/plastic_box_blue.webp" height={120} width={120} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Plastic Box Bin - Blue</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>

        {/* 14th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
        <div className="ml-22">
             {/* Item Image */}   
            <Image src="/plastic_box_red.webp" height={100} width={100} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Plastic Box Bin - Red</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>

        {/* 13th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
        <div className="ml-22">
             {/* Item Image */}   
            <Image src="/plastic_box_yellow.webp" height={100} width={100} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">Plastic Box Bin - Yellow</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>

        {/* 14th Consumable Item */}
        <div className="h-100 w-70 mr-4 mb-5 bg-white opacity-90 rounded">
        <div className="ml-22">
             {/* Item Image */}   
            <Image src="/pe_plastic_bag.webp" height={100} width={100} alt="ci"/>
            </div>
            {/* Item Name  */}
            <h1 className="text-center font-sans font-semibold text-neutral-500">PE Plastic Bag</h1>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
            {/* Item Description  */}
            <div className="text-sm pl-5 pr-5">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum necessitatibus nisi quos magnam minima numquam aspernatur pariatur quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa qui quo, eveniet similique.
            </div>
            {/* Horizontal Line  */}
            <hr className="my-4 ml-5 border-t border-gray-300 w-60" />
        </div>
            </div>
        </div>
    </div>
  );
};

export default LandingProductsPage;
