
// import Image from "next/image";
// import { Header } from "./header";

// export default function Home() {
//   return(
//   <div className="h-screen overflow-hidden bg-gradient-to-t from-[#e3ae01] via-[#fed79relative 
//         min-h-screen 
//         overflow-x-hidden 
//         bg-gradient-to-t 
//         from-[#e3ae01] via-[#fed795] to-[#fcf4d2]
//         flex flex-col items-center">
//           <Header />
//         <div className="flex flex-col items-center text-center max-w-2xl mt-20">
//           <Image src="/cticlogo.webp" height={200} width={200} alt="CTIC" />
//           <h1 className="text-2xl font-serif text-white mt-2">
//             Canlubang Techno-Industrial Corporation
//           </h1>
//           <h2 className="text-white font-extralight mt-4">
//             Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus necessitatibus earum...
//           </h2>

//       {/*}
//       <div className="flex flex-col tems-center gap-y-3 max-w-[330px] w-full">  
//         <ClerkLoading>
//           <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
//         </ClerkLoading>
//         <ClerkLoaded>
//           <SignedOut>
//           <SignUpButton
//             mode="modal"
            
//             >
//               <Button size="lg" variant="primary"
//               className="w-full">
//               Get Started
//               </Button>
//             </SignUpButton>
//             <SignInButton
//             mode="modal"
            
//             >
//               <Button size="lg" variant="primaryOutline"
//               className="w-full">
//               I already have an account
//               </Button>
//             </SignInButton>
//           </SignedOut>
//         </ClerkLoaded> 
//       </div>*/}
//     </div>
//   </div>
//   )
// }

// import Image from "next/image";

// const LandingHomePage = () => {
//   return (
//     <div className="relative h-screen overflow-hidden bg-gradient-to-t from-[#e3ae01] via-[#fed795] to-[#fcf4d2]">
//       <h1 className="font-serif font-extrabold text-3xl text-center mt-5 text-[#173f63]">
//         Welcome to CTIC!
//       </h1>
//       <div className="flex items-center justify-center py-10">
//       <div className="flex flex-row ml-5">
//         <Image
//               src="/cticlogo.webp"
//               height={350}
//               width={350}
//               alt="CTIC"
//               className="object-contain"
//             />
//         <div className="flex flex-col">
//         <div className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
//           Canlubang Techno-Industrial Corporation
//         </div>
//         <h2 className="text-[#173f63] font-extralight mt-4">
//           Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus necessitatibus earum
//         </h2>
//         <br></br>
//         <div className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
//           Background
//         </div>
//         <div className="text-[#173f63] font-extralight mt-4">
//           Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus necessitatibus earum...
//         </div>
//         <br></br>
//         <div className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
//           Partnerships
//         </div>
//         <h2 className="text-[#173f63] font-extralight mt-4">
//           Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus necessitatibus earum...
//         </h2>
//         <br></br>
//         <div className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
//           Clients
//         </div>
//         <div className="text-[#173f63] font-extralight mt-4">
//           Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus necessitatibus earum...
//         </div>
//       </div>
//     </div>
//     </div>
//     </div>
//   );
// };

// export default LandingHomePage;


import Image from "next/image";
import { Header } from "./header";

const LandingHomePage = () => {
  return (
    <div
      className="
        relative 
        min-h-screen 
        overflow-x-hidden 
        bg-gradient-to-t 
        from-[#e3ae01] via-[#fed795] to-[#fcf4d2]
        flex flex-col items-center
      "
    >
      <Header />
      <div className="font-serif font-extrabold text-3xl text-center mt-5 text-[#173f63]">
        Welcome to CTIC!
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center py-8 px-4 gap-4">
        <Image
          src="/cticlogo.webp"
          alt="CTIC"
          width={350}
          height={350}
          className="w-full max-w-[300px] h-auto object-contain"
        />

        <div className="flex flex-col max-w-2xl text-center md:text-left">
          <div className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
            Canlubang Techno-Industrial Corporation
          </div>
          <p className="text-[#173f63] font-extralight mt-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla
            recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus
            necessitatibus earum.
          </p>

          <div className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
            Background
          </div>
          <p className="text-[#173f63] font-extralight mt-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla
            recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus
            necessitatibus earum...
          </p>

          <div className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
            Partnerships
          </div>
          <p className="text-[#173f63] font-extralight mt-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla
            recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus
            necessitatibus earum...
          </p>

          <div className="text-2xl font-serif font-semibold text-[#173f63] mt-2">
            Clients
          </div>
          <p className="text-[#173f63] font-extralight mt-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla
            recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus
            necessitatibus earum...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingHomePage;
