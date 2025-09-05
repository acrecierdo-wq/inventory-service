import CustomerClientComponent from "@/app/validate/customer_validate";
import { CustomerHeader } from "@/components/header-customer";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";

const projects = [
  { image: "/mf_1.jpg", caption: "chuchu" },
  { image: "/mf_2.jpg", caption: "Locker" },
  { image: "/mf_3.jpg", caption: "Shoe Cabinet" },
  { image: "/mf_4.jpg", caption: "Warehouse Trolley" },
  { image: "/mf_5.jpg", caption: "Customized Shoe Cabinet (40 holes)" },
];

const CustomerNonConsumablesMFPage = () => {
  return (
    <CustomerClientComponent>
      <div className="bg-[#fed795] h-full w-full">
        <CustomerHeader />

        {/* Banner image */}
        <div className="w-full overflow-hidden h-[400px] relative">
  <Image
    src="/mf.png"
    alt="Metal Fabrication"
    fill
    className="object-cover"
  />
  <div className="absolute inset-0 flex justify-center mt-15">
    <h1 className="text-white text-4xl font-bold drop-shadow-lg uppercase">Metal Fabrication</h1>
</div>
<div className="absolute inset-0 flex flex-col items-center justify-center mt-5">
<h2 className="text-white text-center w-200 font-semibold">Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto, hic inventore? Provident asperiores quidem illum eius vel corporis aperiam quisquam, quod dolorem itaque similique mollitia temporibus repellendus voluptate sed ad! Lorem ipsum dolor sit amet consectetur, adipisicing elit. Pariatur labore quibusdam minima neque consequuntur corporis fugiat magni mollitia sed exercitationem unde nisi, libero ipsa eaque natus reiciendis? Ab, repellat consequuntur.</h2>
</div>
<div className="absolute inset-0 flex flex-col items-center justify-center mt-70 ml-230">
                        <Button variant="superOutline"
                    className="w-60 px-2 py-1 rounded-4xl">
                    <Link href="/customer/p&s/non-consumables/mf/nc_request">
                    Request Service</Link> 
                    </Button></div>
  </div>
        <div className="pt-5 text-4xl font-sans text-center font-bold text-[#173f63]">
          SAMPLE PROJECTS
        </div>

        {/* Carousel */}
        <div className="px-5 py-10 relative max-w-6xl mx-auto">
          <Carousel>
            <div className="relative"> {/* Make arrows align within this block */}
              <CarouselContent className="-ml-1">
                {projects.map((project, index) => (
                  <CarouselItem key={index} className="pl-2 basis-1/3">
                    <div className="bg-[#fff7eb] rounded-lg p-4 shadow-md h-full">
                      <Image
                        src={project.image}
                        alt={project.caption}
                        width={400}
                        height={300}
                        className="rounded-lg object-cover w-full h-[200px]"
                      />
                      <div className="mt-2 text-center text-sm font-medium text-[#482b0e]">
                        {project.caption}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute -left-6 top-1/2 -translate-y-1/2 z-10" />
              <CarouselNext className="absolute -right-6 top-1/2 -translate-y-1/2 z-10" />
            </div>
          </Carousel>
        </div>
      </div>
    </CustomerClientComponent>
  );
};

export default CustomerNonConsumablesMFPage;
