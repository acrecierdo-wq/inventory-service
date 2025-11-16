// app/api/sales/purchase_orders/[id]/route.ts

import { db } from "@/db/drizzle";
import { purchase_orders, audit_logs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, context: RouteContext) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, {  status: 401 });
        }

        const role = user.publicMetadata?.role;
                if (role !== "sales" && role !== "admin") {
                    return NextResponse.json({ error: "Forbidden: insufficient access." }, { status: 403 });
                }

        const { id } = await context.params;
        const { status } = await req.json();
        if (!status) {
            return NextResponse.json({ error: "Missing status" }, {  status: 400 });
        }

        const [updatedPO] = await db
            .update(purchase_orders)
            .set({
                status,
                action: status.toLowerCase(),
            })
            .where(eq(purchase_orders.id, id))
            .returning({
                id: purchase_orders.id,
                poNumber: purchase_orders.poNumber,
                customerId: purchase_orders.customerId,
                quotationId: purchase_orders.quotationId,
            });

        if (!updatedPO) {
            return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
        }
        await db.insert(audit_logs).values({
            entity: "purchase_order",
            entityId: updatedPO.id,
            action: status.toLowerCase(),
            description: `Purchase Order ${updatedPO.poNumber} was ${status.toLowerCase()} by ${user.fullName || user.firstName || user.emailAddresses[0].emailAddress}.`,
            actorId: user.id,
            actorName: user.username || "Sales",
            actorRole: role || "sales",
            module: "Sales - Purchase Orders",
            timestamp: new Date(),
        });

        return NextResponse.json({
            success: true,
            message: `Purchase Order marked as ${status}`,
            updatedPO,
        });
    } catch (error) {
        console.error("Error updating PO status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}