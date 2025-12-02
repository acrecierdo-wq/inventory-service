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