// app/lib/quotationSchema.ts

import { z } from "zod";

export const materialSchema = z.object({
    name: z.string().min(1, "Material name is required."),
    specification: z.string().optional(),
    quantity: z.number().int().positive("Quantity must be > 0"),
});

export const itemSchema = z.object({
    itemName: z.string().min(1, "Item name is required."),
    scopeOfWork: z.string().min(1, "Scope of work is required."),
    quantity: z.number().positive("Quantity must be > 0"),
    unitPrice: z.number().positive("Unit price must be > 0"),
    materials: z.array(materialSchema).optional(),
});

export const quotationSchema = z.object({
    requestId: z.number().int().positive(),
    projectName: z.string().optional(),
    mode: z.string().optional(),
    validity: z.string().min(1, "Validity is required."),
    delivery: z.string().min(1, "Delivery is required."),
    warranty: z.string().min(1, "Warranty is required."),
    quotationNotes: z.string().optional(),
    cadSketch: z.string().nullable(),
    vat: z.number().nonnegative(),
    markup: z.number().nonnegative(),
    status: z.enum(["draft", "sent"]),
    items: z.array(itemSchema).min(1, "At least one item is required."),
    attachedFiles: z
    .array(
        z.object({
            fileName: z.string(),
            filePath: z.string(),
        })
    )
    .optional(),
});

export type QuotationInput = z.infer<typeof quotationSchema>;
export type QuotationUpdateInput = Partial<QuotationInput> & {
    quotationNotes?: string;
    status?: "draft" | "sent" | "revision_requested" | "accepted" | "expired";
};