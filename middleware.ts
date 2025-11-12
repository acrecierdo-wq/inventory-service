// // app/middleware.ts

// import { clerkMiddleware } from "@clerk/nextjs/server";

// export default clerkMiddleware();

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// };

// app/middleware.ts
import { clerkMiddleware} from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextResponse } from "next/server";

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Only check for logged-in users
  if (!userId) return;

  // Fetch the user from Clerk
  const user = await clerkClient.users.getUser(userId);
  const status = user.publicMetadata?.status;

  // 🚫 If user is deactivated, redirect to a locked page
if ((status as string)?.toLowerCase() === "deactivated") {
  const url = new URL("/deactivated", req.url);
  return NextResponse.redirect(url);
}
});

// ✅ Keep your original matcher
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
