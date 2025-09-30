// /app/api/sales/upload/route.ts

import { NextResponse, NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";

// allowed MIME types
const ALLOWED_EXTENSIONS = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/acad", // DWG file
    "application/vnd.dwg",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        
        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        if (!ALLOWED_EXTENSIONS.includes(file.type)) {
            return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ success: false, error: `File too large. Max is ${MAX_FILE_SIZE / (1024 * 1024)}MB`}, { status: 400 });
        }

        // generate safe filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const safeName = file.name.replace(/[^a-z0-9\.\-_]/gi, "_");
        const fileName = `${Date.now()}-${safeName}`;

        // save file under /public/uploads
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, file.name);
        await fs.writeFile(filePath, buffer);

        return NextResponse.json({ 
            success: true, 
            file: {
                name: file.name,
                filePath: `/uploads/${fileName}`,
            },});
    } catch (err) {
        console.error("Upload error:", err);
        return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 });
    }
}