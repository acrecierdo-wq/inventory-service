

// import Image from "next/image";
// import { Header } from "./header";

// const LandingHomePage = () => {
//   return (
//     <div
//       className="
//         relative 
//         min-h-screen 
//         overflow-x-hidden 
//         bg-gradient-to-t 
//         from-[#e3ae01] via-[#fed795] to-[#fcf4d2]
//         flex flex-col items-center
//       "
//     >
//       <Header />
//       <div className="font-serif font-extrabold text-3xl text-center mt-5 text-[#173f63]">
//         Welcome to CTIC!
//       </div>

//       <div className="flex flex-col md:flex-row items-center justify-center py-8 px-4 gap-4">
//         <Image
//           src="/cticlogo.webp"
//           alt="CTIC"
//           width={350}
//           height={350}
//           className="w-full max-w-[300px] h-auto object-contain"
//         />

//         <div className="flex flex-col max-w-2xl text-center md:text-left">
//           <div className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
//             Canlubang Techno-Industrial Corporation
//           </div>
//           <p className="text-[#173f63] font-extralight mt-4">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla
//             recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus
//             necessitatibus earum.
//           </p>

//           <div className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
//             Background
//           </div>
//           <p className="text-[#173f63] font-extralight mt-4">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla
//             recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus
//             necessitatibus earum...
//           </p>

//           <div className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
//             Partnerships
//           </div>
//           <p className="text-[#173f63] font-extralight mt-4">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla
//             recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus
//             necessitatibus earum...
//           </p>

//           <div className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
//             Clients
//           </div>
//           <p className="text-[#173f63] font-extralight mt-4">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla
//             recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus
//             necessitatibus earum...
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LandingHomePage;

"use client";

import { useEffect, useState } from "react";
import { Header } from "./header";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Factory, Package, Shield } from "lucide-react";

const slides = [
  {
    title: "Canlubang Techno-Industrial Corporation",
    description:
      "Headquartered at 530 CTIC Building, Brgy. Sirang Lupa, Calamba City, Laguna, CTIC has supported Philippine industries for over 20 years with industrial sourcing, fabrication, and project execution.",
    badge: "Established 2001",
  },
  {
    title: "Diversified Industrial Portfolio",
    description:
      "Office furniture, consumable items, fiberglass components, and racking systems for food, logistics, export, and electronics clients—combining manufacturing, trading, and services.",
    badge: "Office Furniture • Consumables • Fiberglass • Racking",
  },
  {
    title: "Our Mission",
    description:
      "Deliver excellence through on-time service, continuous system improvements, and instilling integrity, innovation, and character across every customer touchpoint.",
    badge: "On-Time • Quality • Integrity",
  },
  {
    title: "Project Execution Philosophy",
    description:
      "Create detailed schedules, communicate clearly, supervise workmanship closely, and commission projects on time so clients can trust every delivery.",
    badge: "Plan • Communicate • Execute",
  },
];

const highlights = [
  {
    icon: Factory,
    title: "Fabrication & Projects",
    description: "Custom racks, mezzanines, and site installs built to detailed schedules and QC plans.",
  },
  {
    icon: Package,
    title: "Industrial Consumables",
    description: "Fast-moving tapes, straps, pads, plastics, and pallet accessories kept in stock.",
  },
  {
    icon: Shield,
    title: "Mission-Driven Support",
    description: "On-time delivery, quality service, and continuous system improvements for clients.",
  },
];

const stats = [
  { label: "Years Operating", value: "22" },
  { label: "Key Industries", value: "10+" },
  { label: "Major Clients", value: "14" },
];

const checklist = [
  "Detail schedules and resource plans that meet project objectives",
  "Clear communication with stakeholders from kickoff to commissioning",
  "Close supervision on quality workmanship and on-time completion",
  "Values-driven team focused on integrity, innovation, and customer care",
];

const LandingPage = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#ffedce] text-[#4f2d12]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff8ea] via-[#ffe1bf] to-[#ffd1aa]" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_rgba(255,200,116,0.4),_transparent_60%)] blur-[120px]" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_bottom,_rgba(255,236,189,0.45),_transparent_60%)] blur-[160px]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        {/* Hero */}
        <section className="flex flex-1 flex-col items-center px-5 pb-16 pt-12 md:px-12 lg:px-24">
          <div className="max-w-5xl text-center">
            <span className="text-xs uppercase tracking-[0.45em] text-[#b26c27]">
              Industrial Partner • CTIC
            </span>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#3b1f09] md:text-5xl">
              Welcome to Canlubang Techno-Industrial Corporation
            </h1>
            <p className="mt-3 text-base text-[#6f3a1a] md:text-lg">
              Supplying various products to different companies in the country, our company has diversified types of products such as Office Furniture, Consumable Items, Fiber Glass and RACKING SYSTEM.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                className="bg-gradient-to-r from-[#f5b747] to-[#f28e1d] text-white shadow-lg hover:shadow-xl"
                onClick={() => window?.open("/landing_page/product", "_self")}
              >
                View Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="border-[#f1c58b] text-[#6f3a1a] hover:bg-[#fff3de]"
                onClick={() => window?.open("/landing_page/services", "_self")}
              >
                Explore Services
              </Button>
            </div>
          </div>

          {/* Slider */}
          <div className="mt-12 w-full max-w-4xl">
            <div className="relative rounded-3xl border border-[#f4d7b8] bg-white/70 p-8 shadow-[0_25px_80px_rgba(179,118,52,0.25)]">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-full bg-[#f7c165] px-6 py-1 text-xs font-semibold text-[#4f2d12] shadow-md">
                {slides[current].badge}
              </div>
              <h2 className="text-3xl font-serif font-semibold text-[#3b1f09]">{slides[current].title}</h2>
              <p className="mt-4 text-base text-[#6f3a1a]">{slides[current].description}</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      current === idx ? "w-10 bg-[#f5a524]" : "w-2 bg-[#d8b18c]"
                    }`}
                    onClick={() => setCurrent(idx)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="bg-white/60 py-12 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 md:flex-row md:items-center">
            <div className="space-y-4 md:w-1/3">
              <h3 className="text-3xl font-semibold text-[#4f2d12]">Why CTIC</h3>
              <p className="text-[#7c4722]">
                One partner for industrial sourcing, fabrication, and support—built on reliable fulfillment and experienced engineers.
              </p>
            </div>
            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[#f4d7b8] bg-[#fff6e7] p-5 shadow-lg">
                  <div className="inline-flex rounded-full bg-[#f8c260]/30 p-3">
                    <item.icon className="h-6 w-6 text-[#c97726]" />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-[#44230c]">{item.title}</h4>
                  <p className="mt-2 text-sm text-[#7c4722]">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats & Checklist */}
        <section className="px-6 py-16 md:px-12 lg:px-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row">
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[#f3cab0] bg-white/80 p-6 text-center">
                    <p className="text-3xl font-bold text-[#c97726]">{stat.value}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[#8b5328]">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 space-y-4 rounded-3xl border border-[#f4d7b8] bg-white/80 p-8">
              <h4 className="text-2xl font-semibold text-[#4f2d12]">How we work with you</h4>
              {checklist.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm text-[#7c4722]">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#f5a524]" />
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-[#f5b747] via-[#f8d070] to-[#fff2cd] p-10 text-center shadow-2xl">
            <h5 className="text-2xl font-semibold text-[#3b1f09]">
              Ready to streamline your industrial supply chain?
            </h5>
            <p className="mt-3 text-[#4f2d12]">
              Book a capability session with our sales engineers and see how CTIC can support your plant.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button
                className="bg-[#173f63] text-white hover:bg-[#0f2b45]"
                onClick={() => window?.open("mailto:canlubangtechnoindustrialcorpo@gmail.com")}
              >
                Email Our Team
              </Button>
              <Button
                variant="outline"
                className="border-[#4f2d12] text-[#4f2d12] hover:bg-[#4f2d12]/10"
                onClick={() => window?.open("/landing_page/contact", "_self")}
              >
                Contact Details
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
