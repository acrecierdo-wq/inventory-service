import Image from "next/image";
import { Header } from "../../header";

const LandingContactPage = () => {
    return (
        <div className="h-screen overflow-hidden bg-gradient-to-t from-[#e3ae01] via-[#fed79relative 
        min-h-screen 
        overflow-x-hidden 
        bg-gradient-to-t 
        from-[#e3ae01] via-[#fed795] to-[#fcf4d2]
        flex flex-col items-center">
            <Header />
            <h1 className="text-[#173f63] font-extrabold text-5xl text-center mt-5">CONTACT INFORMATION</h1>
            <hr className="mt-10 border-t border-[#173f63] w-[1100px] ml-50" />
            <div className="flex flex-row mt-10 ml-20 items-center justify-center">
                    <Image src="/cticlogo.webp" height={400} width={400} alt="CTIC" />
            <div className="flex flex-col ml-10">
            <h1 className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
            Company
            </h1>
            <h2 className="mb-2 font-extralight">
            Canlubang Techno-Industrial Corporation
            </h2>
            <h1 className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
            Address
            </h1>
            <h2 className="mb-2 font-extralight">
            Brgy. Sirang Lupa, Calamba City, Laguna, Philippines
            </h2>
            <h1 className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
            Telephone Number
            </h1>
            <h2 className="mb-2 font-extralight">
            (012) 345-6789
            </h2>
            <h1 className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
            Email
            </h1>
            <h2 className="mb-2 font-extralight">
            ctic@gmail.com
            </h2>
            <br></br>
            <h1 className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
            Socials
            </h1>
            
            <h1 className="font-semibold">
            Facebook
            </h1>
            <div className="flex flex-row">
            <Image src="/facebook-1-svgrepo-com.svg" height={30} width={30} alt="facebook" />
            <h2 className="mb-2 ml-2 font-extralight">
            CTIC Page
            </h2>
            </div>
            <h1 className="font-semibold">
            Youtube
            </h1>
            <div className="flex flex-row">
                <Image src="/youtube-player-multimedia-video-communication-interaction-svgrepo-com.svg" height={30} width={30} alt="youtube" />
            <h2 className="mb-2 ml-2 font-extralight">
            CTIC Channel
            </h2>
            </div>
            </div>
                </div>
        </div>
    );
};  

export default LandingContactPage;