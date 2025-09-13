// utils/ensureAppUser.ts

import { db } from "@/db/drizzle";
import { appUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function ensureAppUser() {
    const user = await currentUser();

    if (!user) throw new Error("No signed-in user found.");

    const clerkId = user.id;
    const email = user.emailAddresses[0].emailAddress ?? "";
    const fullName = user.fullName ?? "";

    const existing = await db
        .select()
        .from(appUsers)
        .where(eq(appUsers.clerkId, clerkId));

    if (existing.length > 0) {
        return existing[0];
    }

    const [newUser] = await db
        .insert(appUsers)
        .values({
            clerkId,
            email,
            fullName,
        })
        .returning();

        return newUser;
}