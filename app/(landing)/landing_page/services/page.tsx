// import Image from "next/image";
// import { Header } from "../../header";

// const LandingServicesPage = () => {
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
//         SERVICES
//       </h1>

//       <div className="flex flex-col sm:flex-row items-center mt-10 px-4 sm:px-6 lg:px-10 w-full max-w-7xl">
//         <div className="text-[#173f63] font-sans font-extrabold text-2xl sm:text-3xl mb-4 sm:mb-0 sm:mr-5">
//           FABRICATION
//         </div>
//         <hr className="border-t border-[#173f63] w-full max-w-[300px] sm:max-w-none sm:flex-1" />
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10 px-4 sm:px-6 lg:px-10 w-full max-w-7xl pb-10">
//         {/* 1st Item - Metal Bending */}
//         <div className="h-auto w-full bg-white opacity-90 rounded shadow-md flex flex-col p-5">
//           <div className="flex items-center justify-center">
//             <Image
//               src="/metal_bending.webp"
//               height={140}
//               width={140}
//               alt="Metal Bending"
//               className="object-contain"
//             />
//           </div>
//           <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//             Metal Bending
//           </h1>
//           <hr className="my-4 border-t border-gray-300" />
//           <div className="text-sm flex-grow">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum
//             necessitatibus nisi quos magnam minima numquam aspernatur pariatur
//             quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa
//             qui quo, eveniet similique.
//           </div>
//           <hr className="my-4 border-t border-gray-300" />
//         </div>

//         {/* 2nd Item - Metal Shearing */}
//         <div className="h-auto w-full bg-white opacity-90 rounded shadow-md flex flex-col p-5">
//           <div className="flex items-center justify-center">
//             <Image
//               src="/metal_shearing.jpg"
//               height={140}
//               width={140}
//               alt="Metal Shearing"
//               className="object-contain"
//             />
//           </div>
//           <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//             Metal Shearing
//           </h1>
//           <hr className="my-4 border-t border-gray-300" />
//           <div className="text-sm flex-grow">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum
//             necessitatibus nisi quos magnam minima numquam aspernatur pariatur
//             quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa
//             qui quo, eveniet similique.
//           </div>
//           <hr className="my-4 border-t border-gray-300" />
//         </div>

//         {/* 3rd Item - Metal Painting */}
//         <div className="h-auto w-full bg-white opacity-90 rounded shadow-md flex flex-col p-5">
//           <div className="flex items-center justify-center">
//             <Image
//               src="/metal_painting.jpg"
//               height={130}
//               width={130}
//               alt="Metal Painting"
//               className="object-contain"
//             />
//           </div>
//           <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//             Metal Painting
//           </h1>
//           <hr className="my-4 border-t border-gray-300" />
//           <div className="text-sm flex-grow">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum
//             necessitatibus nisi quos magnam minima numquam aspernatur pariatur
//             quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa
//             qui quo, eveniet similique.
//           </div>
//           <hr className="my-4 border-t border-gray-300" />
//         </div>

//         {/* 4th Item - Sample Project */}
//         <div className="h-auto w-full bg-white opacity-90 rounded shadow-md flex flex-col p-5">
//           <div className="flex items-center justify-center">
//             <Image
//               src="/rolling_cage.jpg"
//               height={90}
//               width={90}
//               alt="Sample Project"
//               className="object-contain"
//             />
//           </div>
//           <h1 className="text-center font-sans font-semibold text-neutral-500 mt-4">
//             Sample Project
//           </h1>
//           <hr className="my-4 border-t border-gray-300" />
//           <div className="text-sm flex-grow">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum
//             necessitatibus nisi quos magnam minima numquam aspernatur pariatur
//             quibusdam natus? Delectus dolorem error nobis ut perspiciatis culpa
//             qui quo, eveniet similique.
//           </div>
//           <hr className="my-4 border-t border-gray-300" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LandingServicesPage;

"use client";

import Image from "next/image";
import { Header } from "../../header";
import { Button } from "@/components/ui/button";
import { Wrench, Layers, ShieldCheck, Users } from "lucide-react";

const services = [
  {
    title: "Metal Bending",
    image: "/metal_bending.webp",
    summary: "Precision bending for frames, racks, and fixtures with tight tolerances.",
    highlights: ["CNC-assisted accuracy", "Thick gauge capability", "Quick prototyping"],
  },
  {
    title: "Metal Shearing",
    image: "/metal_shearing.jpg",
    summary: "Clean cuts for stainless, aluminum, and mild steel panels.",
    highlights: ["Up to 10mm thickness", "Straight & angled cuts", "Material sourcing"],
  },
  {
    title: "Metal Painting",
    image: "/metal_painting.jpg",
    summary: "Powder coating and industrial finishes for corrosion protection and branding.",
    highlights: ["Powder coat booth", "Custom RAL colors", "Salt-spray tested"],
  },
  {
    title: "Custom Fabrication",
    image: "/rolling_cage.jpg",
    summary: "End-to-end build partner for racks, carts, cages, and bespoke fixtures.",
    highlights: ["Co-design support", "On-site measurements", "Installation available"],
  },
];

const badges = [
  { icon: Wrench, label: "End-to-end builds" },
  { icon: Layers, label: "Multi-material" },
  { icon: ShieldCheck, label: "ISO-aligned QC" },
  { icon: Users, label: "Dedicated Production Team" },
];

const LandingServicesPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff8ea] text-[#4f2d12]">
      {/* top soft gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff3df] via-[#ffe7cd] to-[#fff8ea]" />

      {/* subtle gold glow left */}
      <div className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_bottom_left,_rgba(245,183,71,0.25),_transparent_60%)] blur-[130px]" />

      {/* soft brown glow right */}
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,_rgba(124,71,34,0.20),_transparent_60%)] blur-[140px]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="flex-1 px-6 py-12 md:px-10 lg:px-24">
          {/* Hero */}
          <section className="max-w-5xl text-center mx-auto">
            <p className="text-xs uppercase tracking-[0.45em] text-[#7c4722]/70">
              Services
            </p>
            <h1 className="mt-4 text-4xl font-semibold md:text-5xl text-[#4f2d12]">
              Fabrication & Industrial Support
            </h1>
            <p className="mt-4 text-[#7c4722]/80 text-base md:text-lg">
              CTIC blends engineered craftsmanship with production-scale throughput.
              From prototype to recurring runs, our team keeps your operations moving.
            </p>
          </section>

          {/* badges */}
          <section className="mt-12 grid gap-4 sm:grid-cols-4">
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="rounded-2xl border border-[#d4b59a] bg-white/70 p-4 text-center shadow-sm"
              >
                <badge.icon className="mx-auto h-8 w-8 text-[#f5b747]" />
                <p className="mt-3 text-sm font-semibold text-[#4f2d12]">
                  {badge.label}
                </p>
              </div>
            ))}
          </section>

          {/* service cards */}
          <section className="mt-14 grid gap-8 lg:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.title}
                className="group relative rounded-[32px] border border-[#e6cdb5] bg-white/80 p-8 shadow-xl"
              >
                <div className="absolute -top-8 right-6 h-16 w-16 rounded-3xl bg-[#f5b747]/40 blur-2xl group-hover:opacity-80 transition" />
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                  <div className="relative h-48 w-full md:w-48 overflow-hidden rounded-2xl border border-[#e6cdb5]">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="220px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-[#4f2d12]">
                      {service.title}
                    </h2>
                    <p className="mt-3 text-[#7c4722]/80">{service.summary}</p>
                    <ul className="mt-4 space-y-2 text-sm text-[#7c4722]/70">
                      {service.highlights.map((point) => (
                        <li key={point} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#f5b747]" />
                          {point}
                        </li>
                      ))}
                    </ul>
                    <button className="mt-6 text-sm font-semibold text-[#f28e1d] hover:text-[#7c4722] transition">
                      Discuss a project →
                      
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* CTA */}
          <section className="mt-16 rounded-[2rem] bg-gradient-to-r from-[#f5b747] to-[#f28e1d] p-10 text-center shadow-2xl text-white">
            <h3 className="text-2xl font-semibold">Ready to build something specific?</h3>
            <p className="mt-3 text-white/95">
              We collaborate with production and operations teams to deliver
              practical solutions. Send us drawings—or let’s design together.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                className="bg-white text-[#7c4722] hover:bg-white/90"
                onClick={() => window?.open("mailto:canlubangtechnoindustrialcorpo@gmail.com")}
              >
                Book a consultation
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => window?.open("/landing_page/contact", "_self")}
              >
                Contact details
              </Button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LandingServicesPage;