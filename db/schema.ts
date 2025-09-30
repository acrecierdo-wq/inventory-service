// db/schema.ts

import { pgTable, serial, varchar, integer, boolean, timestamp, text, uuid, numeric, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const units = pgTable("units", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 50 }).notNull(), // e.g. "pcs", "m", "kg"
});

export const variants = pgTable("variants", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const sizes = pgTable("sizes", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const items = pgTable("items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),

  categoryId: integer("category_id").notNull().references(() => categories.id),   // FK to categories table
  unitId: integer("unit_id").notNull().references(() => units.id),           // FK to units table
  variantId: integer("variant_id").references(() => variants.id),   // color or type
  sizeId: integer("size_id").references(() => sizes.id),         // mm/cm/large/small

  stock: integer("stock").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(30),
  criticalLevel: integer("critical_level").notNull().default(20),
  ceilingLevel: integer("ceiling_level").notNull().default(100),

  status: varchar("status", { length: 50 }).notNull().default("No Stock"), // Overstock, In Stock, Reorder Level, Critical Level, No Stock
  isActive: boolean("is_active").default(true),
});

{/* Item Issuances */}

export const itemIssuances = pgTable("item_issuances", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

clientName: varchar("client_name", { length: 255 }).notNull(),
dispatcherName: varchar("dispatcher_name", { length: 255 }).notNull(),

createdAt: timestamp("created_at").defaultNow().notNull(),
issuedAt: timestamp("issued_at", ),
issuedBy: varchar("issued_by", { length: 255 }).notNull(),

customerPoNumber: varchar("customer_po_number", { length: 100 }).notNull(),
prfNumber: varchar("prf_number", { length: 100 }).notNull(),

drNumber: varchar("dr_number", { length: 100 }),
saveAsDraft: boolean("save_as_draft").default(false),

status: varchar("status", { enum: ["Issued", "Draft", "Archived"] }).notNull().default("Draft"), // Issued, Draft, Archived
restocked: boolean("restocked").default(false),
});

{/* Item Issuance Items */}

export const itemIssuanceItems = pgTable("item_issuance_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  issuanceId: integer("issuance_id").notNull().references(() => itemIssuances.id, { onDelete: "cascade" }),

  itemId: integer("item_id").notNull().references(() => items.id, { onDelete: "restrict" }),

  sizeId: integer("size_id").references(() => sizes.id, { onDelete: "restrict" }),
  variantId: integer("variant_id").references(() => variants.id, { onDelete: "restrict" }),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "restrict" }),

  quantity: integer("quantity").notNull(),
});

{/* Internal Usages */}

export const internalUsages = pgTable("internal_usages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  
  personnelName: varchar("personnel_name", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }).notNull(),

  purpose: varchar("purpose", { length: 255 }).notNull(),

  authorizedBy: varchar("authorized_by", { length: 255 }).notNull(),

  note: varchar("note", { length: 255 }),

  status: varchar("status", { enum: ["Utilized", "Archived"]}).notNull().default("Utilized"),

  loggedAt: timestamp("logged_at").defaultNow().notNull(),
  loggedBy: varchar("logged_by", { length: 255 }).notNull(),
});

{/* Internal Usage Items */}

export const internalUsageItems = pgTable("internal_usage_items", {
 id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  usageId: integer("usage_id").notNull().references(() => internalUsages.id, { onDelete: "cascade" }),

  itemId: integer("item_id").notNull().references(() => items.id, { onDelete: "restrict"}),
  
  sizeId: integer("size_id").references(() => sizes.id, { onDelete: "restrict" }),
  variantId: integer("variant_id").references(() => variants.id, { onDelete: "restrict" }),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "restrict" }),

  quantity: integer("quantity").notNull(),
});

{/* App users db */}

export const appUsers = pgTable("app_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  fullName: text("full_name"),
  email: text("email").notNull(),
  pinHash: text("pin_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

{/* Item replenishments */}

export const itemReplenishments = pgTable("item_replenishments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  supplier: varchar("supplier").notNull(),
  poRefNum: varchar("po_ref_num", { length: 100 }).notNull(),
  remarks: varchar("remarks", { length: 255 }),
  drRefNum: varchar("dr_ref_num", { length: 100 }),
  isDraft: boolean("is_draft").default(false),

  status: varchar("status", { enum: ["Replenished", "Draft", "Archived"]}).notNull().default("Replenished"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  replenishedAt: timestamp("recorded_at"),
  recordedBy: varchar("recorded_by", { length: 255 }).notNull(), 
});

{/* Replenishment Items */}
export const replenishmentItems = pgTable("replenishment_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  replenishmentId: integer("replenishment_id").notNull().references(() => itemReplenishments.id, { onDelete: "cascade" }),

  itemId: integer("item_id").notNull().references(() => items.id, { onDelete: "restrict"}),
  
  sizeId: integer("size_id").references(() => sizes.id, { onDelete: "restrict" }),
  variantId: integer("variant_id").references(() => variants.id, { onDelete: "restrict" }),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "restrict" }),

  quantity: integer("quantity").notNull(),
});

{/* Quotation Requests */}

export const quotation_requests = pgTable("quotation_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  project_name: text("project_name").notNull(),
  mode: text("mode"),
  message: text("message"),
  status: text("status").default("Pending"),
  customer_id: integer("customer_id").notNull().references(() => customer_profile.id),
  created_at: timestamp("created_at").defaultNow(),
});

{/* Quotation Request Files */}

export const quotation_request_files = pgTable("quotation_request_files", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  request_id: integer("request_id").notNull().references(() => quotation_requests.id, { onDelete: "cascade" }),
  path: text("path").notNull(),
  uploaded_at: timestamp("uploaded_at").defaultNow(),
});

{/* Customer Profile */}

export const customer_profile = pgTable("customer_profile", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),

  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 255 }).notNull(),
  clientCode: varchar("client_code", { length: 10 }).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

{/* Quotations */}

export const quotations = pgTable("quotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: integer("request_id").notNull(),

  quotationSeq: serial("quotation_seq").notNull().unique(),

  quotationNumber: varchar("quotation_number", { length: 50 }).unique(),
  
  revisionNumber: integer("revision_number").default(0),
  baseQuotationId: integer("base_quotation_id"),

  projectName: varchar("project_name", { length: 255 }),
  mode: varchar("mode", { length: 50 }),
  status: varchar("status", { length: 20 })
    .notNull()
    .$type<
      | "draft"
      | "sent"
      | "revision_requested"
      | "accepted"
      | "rejected"
      | "expired"
    >()
    .default("draft"),
  validity: date("validity").notNull(),
  delivery: varchar("delivery", { length: 100 }).notNull(),
  warranty: varchar("warranty", { length: 50 }).notNull(),
  quotationNotes: text("quotation_notes"),
  cadSketch: varchar("cad_sketch", { length: 255 }),

  vat: numeric("vat", { precision: 5, scale: 2 }).default("12.00"),
  markup: numeric("markup", { precision: 5, scale: 2 }).default("0.00"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

{/* Quotation Items */}

export const quotationItems = pgTable("quotation_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  quotationId: uuid("quotation_id").notNull().references(() => quotations.id, { onDelete: "cascade" }),

  itemName: varchar("item_name", { length: 255 }).notNull(),
  scopeOfWork: text("scope_of_work").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 14, scale: 2 }),
});

{/* Quotation Materials */}

export const quotationMaterials = pgTable("quotation_materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  quotationItemId: uuid("quotation_item_id")
    .notNull()
    .references(() => quotationItems.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),
  specification: varchar("specification", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

{/* Quotation Files */}

export const quotationFiles = pgTable("quotation_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  quotationId: uuid("quotation_id")
    .notNull()
    .references(() => quotations.id, { onDelete: "cascade" }),

  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),

  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow(),
});


// Quotations → Items
export const quotationsRelations = relations(quotations, ({ many }) => ({
  items: many(quotationItems),
  files: many(quotationFiles),
}));

// Items → Materials
export const quotationItemsRelations = relations(quotationItems, ({ one, many }) => ({
  quotation: one(quotations, {
    fields: [quotationItems.quotationId],
    references: [quotations.id],
  }),
  materials: many(quotationMaterials),
}));

// Materials → Item
export const quotationMaterialsRelations = relations(quotationMaterials, ({ one }) => ({
  item: one(quotationItems, {
    fields: [quotationMaterials.quotationItemId],
    references: [quotationItems.id],
  }),
}));

// Files → Quotation
export const quotationFilesRelations = relations(quotationFiles, ({ one }) => ({
  quotation: one(quotations, {
    fields: [quotationFiles.quotationId],
    references: [quotations.id],
  }),
}));

  // //relation
  // export const studentsInformationRelations = relations(applicantsInformationTable, ({ one, many }) => ({
  //   guardian: one(guardianAndParentsTable, {
  //     fields: [applicantsInformationTable.applicants_id],
  //     references: [guardianAndParentsTable.applicants_id],
  //   }),
  //   education: one(educationalBackgroundTable, {
  //     fields: [applicantsInformationTable.applicants_id],
  //     references: [educationalBackgroundTable.applicants_id],
  //   }),
  //   documents: one(documentsTable, {
  //     fields: [applicantsInformationTable.applicants_id],
  //     references: [documentsTable.applicants_id],
  //   }),
  //   status: one(applicationStatusTable, {
  //     fields: [applicantsInformationTable.applicants_id],
  //     references: [applicationStatusTable.applicants_id],
  //   }),
  //   reservationFee: one(reservationFeeTable, {
  //     fields: [applicantsInformationTable.applicants_id],
  //     references: [reservationFeeTable.applicants_id],
  //   }),


  //   admissionStatus: one(AdmissionStatusTable, {
  //     fields: [applicantsInformationTable.applicants_id],
  //     references: [AdmissionStatusTable.applicants_id],
  //   }),