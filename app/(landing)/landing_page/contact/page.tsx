"use client";

import Image from "next/image";
import { Header } from "../../header";
import { Mail, Phone, MapPin, Facebook } from "lucide-react";

const contactDetails = [
  {
    icon: MapPin,
    label: "Address",
    value: "530 CTIC Bldg., Brgy. Sirang Lupa, Calamba City, Laguna",
    action: () =>
      window.open(
        "https://maps.google.com/?q=Canlubang+Techno-Industrial+Corporation",
        "_blank"
      ),
  },
  {
    icon: Phone,
    label: "Telephone",
    value: "+49 5480 824",
    action: () => window.open("tel:+49 5480 824"),
  },
  {
    icon: Mail,
    label: "Email",
    value: "canlubangtechnoindustrialcorpo@gmail.com",
    action: () =>
      window.open("mailto:canlubangtechnoindustrialcorpo@gmail.com"),
  },
];

const LandingContactPage = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff8ea] text-[#4f2d12]">
      {/* background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fff8ea] via-[#ffe7c5] to-[#ffd1aa]" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_rgba(255,200,116,0.45),_transparent_60%)] blur-[130px]" />
      <div className="absolute inset-y-0 left-0 w-1/2 bg-[radial-gradient(circle_at_bottom,_rgba(255,236,189,0.45),_transparent_55%)] blur-[150px]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        <main className="flex-1 px-6 py-12 md:px-10 lg:px-24">
          {/* hero */}
          <section className="text-center max-w-4xl mx-auto">
            <p className="text-xs uppercase tracking-[0.45em] text-[#7c4722]/60">
              Contact
            </p>
            <h1 className="mt-4 text-4xl font-semibold md:text-5xl text-[#4f2d12]">
              Get In Touch With CTIC
            </h1>
            <p className="mt-4 text-[#6f3a1a]/80 text-base md:text-lg">
              Our team is ready to support your operations—reach out for product
              inquiries, fabrication projects, or supply programs.
            </p>
          </section>

          {/* cards */}
          <section className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* company card */}
            <div className="rounded-[32px] border border-[#f4d7b8] bg-white/80 p-10 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20">
                  <div className="absolute inset-0 rounded-full bg-[#f5d8a8]/40 blur-2xl" />
                  <Image
                    src="/cticlogo.webp"
                    alt="CTIC"
                    fill
                    sizes="80px"
                    className="relative object-contain drop-shadow-lg"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[#4f2d12]">
                    Canlubang Techno-Industrial Corp.
                  </h2>
                  <p className="text-[#7c4722]/60 text-sm">
                    Customer Support & Sales
                  </p>
                </div>
              </div>

              <div className="mt-10 space-y-5">
                {contactDetails.map((detail) => (
                  <button
                    key={detail.label}
                    onClick={detail.action}
                    className="flex w-full items-start gap-4 rounded-2xl border border-[#f3cab0] bg-[#fff5e7] px-5 py-4 text-left transition hover:bg-[#ffe8cf]"
                  >
                    <detail.icon className="mt-1 h-6 w-6 text-[#f5b747]" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#7c4722]/60">
                        {detail.label}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#4f2d12]">
                        {detail.value}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* hours + socials */}
            <div className="rounded-[32px] border border-[#f4d7b8] bg-white/80 p-10 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#7c4722]/60">
                  Office Hours
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-[#4f2d12]">
                  Visit & Support
                </h3>
                <p className="mt-3 text-[#6f3a1a]/80">
                  Monday–Friday, 8:00 AM to 6:00 PM
                  <br />
                  Closed on weekends and public holidays
                </p>

                <div className="mt-8">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#7c4722]/60">
                    Social Channels
                  </p>
                  <a
                    href="https://web.facebook.com/canlubangtechno"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center gap-3 rounded-2xl border border-[#f3cab0] bg-[#fff5e7] px-5 py-4 transition hover:bg-[#ffe8cf]"
                  >
                    <Facebook className="h-6 w-6 text-[#4f2d12]" />
                    <div>
                      <p className="text-sm text-[#6f3a1a]/70">Facebook</p>
                      <p className="text-lg font-semibold text-[#4f2d12]">
                        CTIC Page
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="mt-10 rounded-2xl border border-[#f4d7b8] bg-[#fff1d6] p-6 text-center shadow-md">
                <p className="text-xs uppercase tracking-[0.3em] text-[#7c4722]/60">
                  Need assistance?
                </p>
                <h4 className="mt-2 text-xl font-semibold text-[#4f2d12]">
                  Talk to our sales engineers
                </h4>
                <p className="mt-2 text-[#6f3a1a]/80">
                  We can specify your needs and the scope of our busiiness.
                </p>
                <button
                  onClick={() =>
                    window.open(
                      "mailto:canlubangtechnoindustrialcorpo@gmail.com"
                    )
                  }
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-[#173f63] px-6 py-3 font-semibold text-white shadow-lg hover:shadow-xl transition"
                >
                  Email us
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LandingContactPage;