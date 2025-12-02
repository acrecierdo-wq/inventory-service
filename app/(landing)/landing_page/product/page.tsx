// import Image from "next/image";
// import { Header } from "../../header";

// const LandingProductsPage = () => {
//   return (
//     <div
//       className="relative 
//         min-h-screen 
//         overflow-x-hidden 
//         bg-gradient-to-t 
//         from-[#e3ae01] via-[#fed795] to-[#fcf4d2]
//         flex flex-col items-center"
//     >
//       <Header />
//       <h1 className="text-[#173f63] font-extrabold text-3xl sm:text-4xl md:text-5xl text-center mt-5 px-4">
//         CONSUMABLE ITEMS
//       </h1>
//       <div className="flex flex-col items-center justify-center w-full px-4 sm:px-6 lg:px-8 pb-10">
//         {/* TAPES SECTION */}
//         <div className="flex flex-col sm:flex-row items-center mt-10 w-full max-w-7xl">
//           <div className="text-[#173f63] font-sans font-extrabold text-2xl sm:text-3xl mb-4 sm:mb-0 sm:mr-5">
//             TAPES
//           </div>
//           <hr className="border-t border-[#173f63] w-full max-w-[300px] sm:max-w-none sm:flex-1" />
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 w-full max-w-7xl">
//           {/* 1st Item - Duct Tape */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/duct_tape.jpg"
//                 height={100}
//                 width={100}
//                 alt="Duct Tape"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Duct Tape
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>

//           {/* 2nd Item - Masking Tape */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/masking_tape.jpg"
//                 height={100}
//                 width={100}
//                 alt="Masking Tape"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Masking Tape
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>

//           {/* 3rd Item - Packaging Tape */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/packaging_tape.jpg"
//                 height={100}
//                 width={100}
//                 alt="Packaging Tape"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Packaging Tape
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>

//           {/* 4th Item - Floor Marking Tape */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/floor_marking_tape.jpg"
//                 height={100}
//                 width={100}
//                 alt="Floor Marking Tape"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Floor Marking Tape
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>
//         </div>

//         {/* STRAP SECTION */}
//         <div className="flex flex-col sm:flex-row items-center mt-16 w-full max-w-7xl">
//           <div className="text-[#173f63] font-sans font-extrabold text-2xl sm:text-3xl mb-4 sm:mb-0 sm:mr-5">
//             STRAP
//           </div>
//           <hr className="border-t border-[#173f63] w-full max-w-[300px] sm:max-w-none sm:flex-1" />
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 w-full max-w-7xl">
//           {/* 5th Item - Plastic Strap */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/plastic_strap.jpg"
//                 height={80}
//                 width={80}
//                 alt="Plastic Strap"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Plastic Strap
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>

//           {/* 6th Item - Metal Strap */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/steel_strap.jpg"
//                 height={100}
//                 width={100}
//                 alt="Metal Strap"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Metal Strap
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>

//           {/* 7th Item - Black Strap */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/black_strap.jpg"
//                 height={100}
//                 width={100}
//                 alt="Black Strap"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Black Strap
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>

//           {/* 8th Item - Polyester Strap */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/polyester_strap.webp"
//                 height={100}
//                 width={100}
//                 alt="Polyester Strap"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Polyester Strap
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>
//         </div>

//         {/* PADS AND TRAYS SECTION */}
//         <div className="flex flex-col sm:flex-row items-center mt-16 w-full max-w-7xl">
//           <div className="text-[#173f63] font-sans font-extrabold text-2xl sm:text-3xl mb-4 sm:mb-0 sm:mr-5">
//             PADS AND TRAYS
//           </div>
//           <hr className="border-t border-[#173f63] w-full max-w-[260px] sm:max-w-none sm:flex-1" />
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 w-full max-w-7xl">
//           {/* 9th Item - Foam Pad */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/foam_pad.jpg"
//                 height={100}
//                 width={100}
//                 alt="Foam Pad"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Foam Pad
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>

//           {/* 10th Item - Foam Tray */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/foam_tray.jpg"
//                 height={110}
//                 width={110}
//                 alt="Foam Tray"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Foam Tray
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>

//           {/* 11th Item - Bubble Sheet */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/bubble_sheet.jpg"
//                 height={100}
//                 width={100}
//                 alt="Bubble Sheet"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Bubble Sheet
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>

//           {/* 12th Item - Plastic Buckle */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/plastic_buckle.jpg"
//                 height={110}
//                 width={110}
//                 alt="Plastic Buckle"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Plastic Buckle
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>
//         </div>

//         {/* PLASTICS SECTION */}
//         <div className="flex flex-col sm:flex-row items-center mt-16 w-full max-w-7xl">
//           <div className="text-[#173f63] font-sans font-extrabold text-2xl sm:text-3xl mb-4 sm:mb-0 sm:mr-5">
//             PLASTICS
//           </div>
//           <hr className="border-t border-[#173f63] w-full max-w-[290px] sm:max-w-none sm:flex-1" />
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 w-full max-w-7xl">
//           {/* 13th Item - Plastic Box Blue */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/plastic_box_blue.webp"
//                 height={120}
//                 width={120}
//                 alt="Plastic Box Bin - Blue"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Plastic Box Bin - Blue
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>

//           {/* 14th Item - Plastic Box Red */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/plastic_box_red.webp"
//                 height={100}
//                 width={100}
//                 alt="Plastic Box Bin - Red"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Plastic Box Bin - Red
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>

//           {/* 15th Item - Plastic Box Yellow */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/plastic_box_yellow.webp"
//                 height={100}
//                 width={100}
//                 alt="Plastic Box Bin - Yellow"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               Plastic Box Bin - Yellow
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>

//           {/* 16th Item - PE Plastic Bag */}
//           <div className="h-auto w-full bg-white opacity-90 rounded shadow-md p-5">
//             <div className="flex justify-center">
//               <Image
//                 src="/pe_plastic_bag.webp"
//                 height={100}
//                 width={100}
//                 alt="PE Plastic Bag"
//                 className="object-contain"
//               />
//             </div>
//             <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//               PE Plastic Bag
//             </h1>
//             <hr className="my-4 border-t border-gray-300" />
//             <div className="text-sm">
//               Lorem ipsum dolor sit amet consectetur adipisicing elit.
//               Voluptatum necessitatibus nisi quos magnam minima numquam
//               aspernatur pariatur quibusdam natus? Delectus dolorem error nobis
//               ut perspiciatis culpa qui quo, eveniet similique.
//             </div>
//             <hr className="my-4 border-t border-gray-300" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LandingProductsPage;

"use client";

import Image from "next/image";
import { useState } from "react";
import { Header } from "../../header";
import { Button } from "@/components/ui/button";
import { Package2, Layers, Palette } from "lucide-react";

const categories = [
  {
    name: "Tapes",
    description: "Adhesive solutions for packing, safety markings, and general maintenance.",
    items: [
      { name: "Duct Tape", image: "/duct_tape.jpg", blurb: "Heavy-duty adhesion for repairs and sealing tasks." },
      { name: "Masking Tape", image: "/masking_tape.jpg", blurb: "Clean-release tape ideal for painting and labeling." },
      { name: "Packaging Tape", image: "/packaging_tape.jpg", blurb: "Crystal-clear tape for parcel sealing and bundling." },
      { name: "Floor Marking Tape", image: "/floor_marking_tape.jpg", blurb: "Color-coded, durable traffic guides." },
    ],
  },
  {
    name: "Straps",
    description: "Strapping options for lightweight parcels up to heavy pallets and machinery.",
    items: [
      { name: "Plastic Strap", image: "/plastic_strap.jpg", blurb: "Flexible PET strap for general bundling." },
      { name: "Metal Strap", image: "/steel_strap.jpg", blurb: "Tension-resistant steel for heavy-duty loads." },
      { name: "Black Strap", image: "/black_strap.jpg", blurb: "UV-stable strapping for outdoor storage." },
      { name: "Polyester Strap", image: "/polyester_strap.webp", blurb: "High-strength, shock-absorbing alternative to steel." },
    ],
  },
  {
    name: "Pads & Trays",
    description: "Protective packaging components for assembly lines and outbound shipments.",
    items: [
      { name: "Foam Pad", image: "/foam_pad.jpg", blurb: "Shock absorption for fragile assemblies." },
      { name: "Foam Tray", image: "/foam_tray.jpg", blurb: "Custom cavities keep components organized." },
      { name: "Bubble Sheet", image: "/bubble_sheet.jpg", blurb: "Classic cushioning for envelopes and boxes." },
      { name: "Plastic Buckle", image: "/plastic_buckle.jpg", blurb: "Tool-free buckle for PET strapping." },
    ],
  },
  {
    name: "Plastics",
    description: "Bins and bags that keep production floors tidy and inventory visible.",
    items: [
      { name: "Plastic Box Bin (Blue)", image: "/plastic_box_blue.webp", blurb: "Stackable parts storage with easy-grab fronts." },
      { name: "Plastic Box Bin (Red)", image: "/plastic_box_red.webp", blurb: "Color-coded control for critical SKUs." },
      { name: "Plastic Box Bin (Yellow)", image: "/plastic_box_yellow.webp", blurb: "High-visibility option for safety stock." },
      { name: "PE Plastic Bag", image: "/pe_plastic_bag.webp", blurb: "Moisture barrier for sensitive components." },
    ],
  },
];

const LandingProductsPage = () => {
  const [active, setActive] = useState(categories[0]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#fff8ea] via-[#ffe7c9] to-[#ffd1aa] text-[#4f2d12]">
      {/* soft gold glow */}
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_rgba(255,200,116,0.35),_transparent_65%)] blur-[120px]" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_bottom,_rgba(255,236,189,0.45),_transparent_60%)] blur-[160px]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="flex-1 px-6 py-12 md:px-10 lg:px-24">
          
          {/* hero */}
          <section className="max-w-5xl text-center mx-auto">
            <p className="text-xs uppercase tracking-[0.45em] text-[#7c4722]">Catalog</p>
            <h1 className="mt-4 text-4xl font-semibold md:text-5xl text-[#4f2d12]">
              Industrial Consumables & Storage
            </h1>
            <p className="mt-4 text-[#7c4722] text-base md:text-lg">
              Browse our fast-moving catalog, grouped by category—covering adhesives, strapping, protective packaging,
              and durable plastics for warehouses and production floors.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <Button
                  key={category.name}
                  size="sm"
                  variant="outline"
                  className={
                    active.name === category.name
                      ? "bg-[#f5b747] text-white border-[#e7a93f] hover:bg-[#f5b747]/90"
                      : "border-[#c9a47b] text-[#4f2d12] hover:bg-[#fff0dc]"
                  }
                  onClick={() => setActive(category)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </section>

          {/* feature strip */}
          <section className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Package2, title: "Wide consumable items Coverage", description: "Adhesives, straps, pads, bins, bags, and more." },
              { icon: Layers, title: "Bundled Kits", description: "Build a bill of materials tailored to your line." },
              { icon: Palette, title: "Broad variety of Colors", description: "Color-match bins, tapes, and fixtures for 5S programs." },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-[#f4d7b8] bg-white p-4 shadow-md"
              >
                <card.icon className="h-8 w-8 text-[#f5b747]" />
                <h3 className="mt-3 text-lg font-semibold text-[#4f2d12]">{card.title}</h3>
                <p className="mt-1 text-sm text-[#7c4722]">{card.description}</p>
              </div>
            ))}
          </section>

          {/* active category panel */}
          <section className="mt-16 rounded-[2rem] border border-[#f4d7b8] bg-white/70 p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[#7c4722]">Featured Category</p>
                <h2 className="mt-2 text-3xl font-semibold text-[#4f2d12]">{active.name}</h2>
                <p className="mt-3 text-[#7c4722]">{active.description}</p>
              </div>

              {/* <Button
                className="bg-[#f5b747] text-white hover:bg-[#eeb03f]"
                onClick={() => window?.open("mailto:canlubangtechnoindustrialcorpo@gmail.com")}
              >
                Request a quote
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button> */}
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {active.items.map((item) => (
                <div
                  key={item.name}
                  className="group relative rounded-3xl border border-[#f3cab0] bg-[#fff5e4] p-5 text-[#4f2d12] shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="absolute -top-6 right-6 h-12 w-12 rounded-3xl bg-[#f5b747] opacity-20 blur-3xl group-hover:opacity-40" />

                  <div className="relative mx-auto mb-4 h-24 w-24 overflow-hidden rounded-2xl bg-[#fff0dc]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-contain p-3 transition duration-500 group-hover:scale-110"
                    />
                  </div>

                  <h4 className="text-lg font-semibold">{item.name}</h4>
                  <p className="mt-2 text-sm text-[#7c4722]">{item.blurb}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mt-16 rounded-[2rem] bg-gradient-to-r from-[#f5b747] to-[#f28e1d] p-10 text-center shadow-2xl">
            <h3 className="text-2xl font-semibold text-white">Need a bundled consumables program?</h3>
            <p className="mt-3 text-white/90">
              Send us your pull list or let us audit your operations—we’ll build a replenishment plan that keeps critical
              stock on hand.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                className="bg-white text-[#4f2d12] hover:bg-[#fff0dc]"
                onClick={() => window?.open("mailto:canlubangtechnoindustrialcorpo@gmail.com")}
              >
                Email Sales
              </Button>

              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => window?.open("/landing_page/contact", "_self")}
              >
                Contact Info
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LandingProductsPage;