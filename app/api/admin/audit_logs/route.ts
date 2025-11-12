// app/api/admin/users/audit_logs/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { audit_logs } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const role = url.searchParams.get("role");

    // Type-safe filters
    const filters: ReturnType<typeof eq>[] = [];
    if (userId) filters.push(eq(audit_logs.actorId, userId));
    if (role) filters.push(eq(audit_logs.actorRole, role));

    const query = db.select().from(audit_logs);

    // Apply filters if any
    if (filters.length > 0) query.where(and(...filters));

    const logs = await query.orderBy(desc(audit_logs.timestamp)).limit(50);

    return NextResponse.json({ logs });
  } catch (err) {
    console.error("[GET /api/admin/audit-logs] Error:", err);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}
