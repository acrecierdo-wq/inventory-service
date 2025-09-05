
import Image from "next/image";

export default function Home() {
  return(
  <div className="h-screen overflow-hidden bg-gradient-to-t from-[#e3ae01] via-[#fed795] to-[#fcf4d2] flex items-center justify-center px-1">
        <div className="flex flex-col items-center text-center max-w-2xl">
          <Image src="/cticlogo.webp" height={200} width={200} alt="CTIC" />
          <h1 className="text-2xl font-serif text-white mt-2">
            Canlubang Techno-Industrial Corporation
          </h1>
          <h2 className="text-white font-extralight mt-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum cumque eum, omnis nulla recusandae obcaecati quaerat aut dicta autem iure ab expedita repellendus necessitatibus earum...
          </h2>

      {/*}
      <div className="flex flex-col tems-center gap-y-3 max-w-[330px] w-full">  
        <ClerkLoading>
          <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedOut>
          <SignUpButton
            mode="modal"
            
            >
              <Button size="lg" variant="primary"
              className="w-full">
              Get Started
              </Button>
            </SignUpButton>
            <SignInButton
            mode="modal"
            
            >
              <Button size="lg" variant="primaryOutline"
              className="w-full">
              I already have an account
              </Button>
            </SignInButton>
          </SignedOut>
        </ClerkLoaded> 
      </div>*/}
    </div>
  </div>
  )
}