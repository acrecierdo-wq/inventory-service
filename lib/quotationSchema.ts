// app/lib/quotationSchema.ts

import { z } from "zod";

export const quotationStatusEnum = z.enum([
  "draft",
  "restoring",
  "sent",
  "accepted",
  "rejected",
]);

export const materialSchema = z.object({
    name: z.string().min(1, "Material name is required."),
    specification: z.string().min(1, "Material specification is required."),
    quantity: z.coerce.number().int().positive("Quantity must be > 0"),
});

export const itemSchema = z.object({
    itemName: z.string().min(1, "Item name is required."),
    scopeOfWork: z.string().min(1, "Scope of work is required."),
    quantity: z.coerce.number().positive("Quantity must be > 0").min(0).default(0),
    unitPrice: z.coerce.number().positive("Unit price must be > 0").min(0).default(0),
    materials: z.array(materialSchema).optional(),
});

export const quotationSchema = z.object({
    requestId: z.coerce.number().int().positive(),
    projectName: z.string().optional(),
    mode: z.string().optional(),
    validity: z.string().min(1, "Validity is required."),
    delivery: z.string().min(1, "Delivery is required."),
    warranty: z.string().min(1, "Warranty is required."),
    quotationNotes: z.string().optional(),
    cadSketch: z.string().nullable(),
    vat: z.preprocess((val) => (val === "" || undefined || val === null ? 12 : val), z.coerce.number().default(12)),
    markup: z.preprocess((val) => (val === "" || val === undefined || val === null ? 0 : val), z.coerce.number().default(0)),
    status: quotationStatusEnum.default("draft").optional(),
    items: z.array(itemSchema).default([]),
    attachedFiles: z
    .array(
        z.object({
            fileName: z.string(),
            filePath: z.string(),
        })
    )
    .optional(),
});

export const draftSchema = z.object({
  id: z.string().optional(),
  requestId: z.number(),
  projectName: z.string().optional(),
  mode: z.string().optional(),
  delivery: z.string().nullable().optional(),
  validity: z.string().nullable().optional(),
  warranty: z.string().nullable().optional(),
  quotationNotes: z.string().optional(),
  cadSketch: z.string().nullable().optional(),
  vat: z.number().optional().default(12),
  markup: z.number().optional().default(0),
  items: z.array(itemSchema).optional(),
  status: z.literal("draft"),
  attachedFiles: z.array(z.object({ fileName: z.string(), filePath: z.string() })).optional(),
});

export const sentSchema = z.object({
  id: z.string().optional(),
  requestId: z.number(),
  mode: z.string().min(1, "Mode is required"),
  projectName: z.string().min(1, "Project name is required"),
  delivery: z.string().min(1, "Delivery is required"),
  validity: z.string().min(1, "Validity is required"),
  warranty: z.string().min(1, "Warranty is required"),
  quotationNotes: z.string().optional(),
  cadSketch: z.string().nullable().optional(),
  vat: z.number(),
  markup: z.number(),
  items: z.array(itemSchema).min(1, "At least 1 item is required"),
  status: z.literal("sent"),
  attachedFiles: z.array(z.object({ fileName: z.string(), filePath: z.string() })).optional(),
});

export type DraftInput = z.infer<typeof draftSchema>;
export type SentInput = z.infer<typeof sentSchema>;

export function validateQuotation(data: unknown): DraftInput | SentInput {
  if ((data as { status?: string }).status === "draft") {
    return draftSchema.parse(data);
  }
  return sentSchema.parse(data);
}


export type QuotationInput = DraftInput | SentInput;
export type QuotationUpdateInput = Partial<{
  id: string;
  requestId: number;
  projectName: string;
  mode: string;
  validity: string;
  delivery: string;
  warranty: string;
  quotationNotes: string;
  cadSketch: string | null;
  vat: number;
  markup: number;
  items: {
    itemName: string;
    scopeOfWork: string;
    quantity: number;
    unitPrice: number;
    materials?: {
      name: string;
      specification?: string;
      quantity: number;
    }[];
  }[];
  attachedFiles?: {
    fileName: string;
    filePath: string;
  }[];
  status?: "draft" | "restoring" | "sent" | "accepted" | "rejected" | "revision_requested" | "expired";
}>;

