// import { NextResponse, NextRequest } from "next/server";
// import { currentUser, clerkClient } from "@clerk/nextjs/server";

// type RouteContext = {
//   params: { id: string };
// };

// export async function PUT(req: NextRequest, { params }: RouteContext) {
//   try {
//     const admin = await currentUser();
//     if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     if (admin.publicMetadata?.role !== "admin")
//       return NextResponse.json({ error: "Forbidden" }, { status: 403 });

//     const { action, newRole } = await req.json();
//     const userId = params.id;

//     if (action === "deactivate") {
//     const client = await clerkClient();
//       await client.users.disableUser(userId);
//     } else if (action === "activate") {
//       await clerkClient.users.enableUser(userId);
//     } else if (action === "changeRole" && newRole) {
//       await clerkClient.users.updateUser(userId, {
//         publicMetadata: { role: newRole },
//       });
//     } else {
//       return NextResponse.json({ error: "Invalid action" }, { status: 400 });
//     }

//     return NextResponse.json({ success: true });
//   } catch (err: any) {
//     console.error("update staff error", err);
//     return NextResponse.json({ error: err?.message ?? "Server error" }, { status: 500 });
//   }
// }
