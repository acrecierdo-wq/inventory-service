// // app/api/admin/users/route.ts

// import { NextResponse, NextRequest } from "next/server";
// import { currentUser, clerkClient } from "@clerk/nextjs/server";

// export async function POST(req: NextRequest) {
//     try {
//         // verify tha caller is logged in
//         const admin = await currentUser();
//         if (!admin) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         // verify they have admin role
//         if (admin.publicMetadata?.role !== "admin") {
//             return NextResponse.json({ error: "Forbidden" }, { status: 403 });
//         }

//         const { username, email, password, role } = await req.json();

//         if (!username || !email || !password || !role) {
//             return NextResponse.json({ error: "Missing fields" }, { status: 400 });
//         }

//         const allowedRoles = ["warehouseman", "sales"];
//         if (!allowedRoles.includes(role)) {
//             return NextResponse.json({ error: "Invalid role" }, { status: 400 });
//         }
        

//         // create the staff user in Clerk
//         const user = await clerkClient.users.createUser({
//             username,
//             emailAddress: [email],
//             password,
//             publicMetadata: {
//                 role,
//                 mustChangePassword: true,
//             },
//         });

//         return NextResponse.json({ success: true, userId: user.id });
//     } catch {
//         console.error("create staff error");
//         return NextResponse.json({ error: "Server error" }, { status: 500 });
//     }
// }

// export async function GET() {
//     try {
//         const admin = await currentUser();
//         if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         if (admin.publicMetadata?.role !== "admin")
//             return NextResponse.json({ error: "Forbidden" }, { status: 403 });


//     const users = await clerkClient.users.getUserList({ limit: 50 });

//     const staff = users.data
//         .filter(
//             u =>
//                 u.publicMetadata?.role === "warehouseman" ||
//                 u.publicMetadata?.role === "sales"
//         )
//         .map(u => ({
//             id: u.id,
//             username: u.username,
//             email: u.emailAddresses[0]?.emailAddress,
//             role: u.publicMetadata?.role,
//             status: u.banned ? "deactivated" : "active",
//         }));

//         return NextResponse.json({ staff });
//     } catch {
//         console.error("list staff error");
//         return NextResponse.json({ error: "Service error" }, { status: 500 });
//     }
// }

// app/api/admin/users/route.ts
import { NextResponse, NextRequest } from "next/server";
import { currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/clerk-sdk-node'; // import the constructor

console.log('typeof clerkClient:', typeof clerkClient);


export async function POST(req: NextRequest) {
  try {
    //const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY! });
    // verify caller is logged in and is admin
    const admin = await currentUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.publicMetadata?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

    const { username, email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing fields (email, password, role are required)" }, { status: 400 });
    }

    const allowedRoles = ["warehouseman", "sales"];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // NOTE: Clerk requires passwords to be >= 8 chars by default.
    if (typeof password === "string" && password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    // create user in Clerk
    const user = await clerkClient.users.createUser({
      username: username || undefined,
      emailAddress: [email],
      password,
      publicMetadata: {
        role,
        mustChangePassword: true, // your own flag — Clerk will not auto-enforce
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (err) {
    // helpful log for debugging (remove or sanitize in production)
    console.error("[POST /api/admin/users] create staff error:", err);
    return NextResponse.json(
      { error: "Server error while creating user" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    
    const admin = await currentUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (admin.publicMetadata?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    //const clerkClient = Clerk({ secretKey: process.env.CLERK_SECRET_KEY! });
    const users = await clerkClient.users.getUserList({ limit: 200 }); // increase limit if needed

    const staff = (users.data)
      .filter((u) => ["warehouseman", "sales"].includes(u.publicMetadata?.role as string))
      .map((u) => ({
        id: u.id,
        username: u.username ?? null,
        // backend user object has emailAddresses array
        email: u.emailAddresses?.[0]?.emailAddress ?? null,
        role: u.publicMetadata?.role ?? null,
        status: u.banned ? "deactivated" : "active",
      }));

    return NextResponse.json({ staff });
  } catch (err) {
    console.error("[GET /api/admin/users] list staff error:", err);
    return NextResponse.json({ error: "Service error" }, { status: 500 });
  }
}
