// db/schema.ts

import { pgTable, serial, varchar, integer, boolean, timestamp, text, uuid } from "drizzle-orm/pg-core";


export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // e.g. "pcs", "m", "kg"
});

export const variants = pgTable("variants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const sizes = pgTable("sizes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
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
  id: serial("id").primaryKey(),

clientName: varchar("client_name", { length: 255 }).notNull(),
dispatcherName: varchar("dispatcher_name", { length: 255 }).notNull(),

createdAt: timestamp("created_at").defaultNow().notNull(),
issuedAt: timestamp("issued_at", ),

customerPoNumber: varchar("customer_po_number", { length: 100 }).notNull(),
prfNumber: varchar("prf_number", { length: 100 }).notNull(),

drNumber: varchar("dr_number", { length: 100 }),
saveAsDraft: boolean("save_as_draft").default(false),

status: varchar("status", { enum: ["Issued", "Draft", "Archived"] }).notNull().default("Draft"), // Issued, Draft, Archived
restocked: boolean("restocked").default(false),
});

{/* Item Issuance Items */}

export const itemIssuanceItems = pgTable("item_issuance_items", {
  id: serial("id").primaryKey(),

  issuanceId: integer("issuance_id").notNull().references(() => itemIssuances.id, { onDelete: "cascade" }),

  itemId: integer("item_id").notNull().references(() => items.id, { onDelete: "restrict" }),

  sizeId: integer("size_id").references(() => sizes.id, { onDelete: "restrict" }),
  variantId: integer("variant_id").references(() => variants.id, { onDelete: "restrict" }),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "restrict" }),

  quantity: integer("quantity").notNull(),
});

{/* Internal Usages */}

export const internalUsages = pgTable("internal_usages", {
  id: serial("id").primaryKey(),
  
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
  id: serial("id").primaryKey(),

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
  id: serial("id").primaryKey(),

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
  id: serial("id").primaryKey(),

  replenishmentId: integer("replenishment_id").notNull().references(() => itemReplenishments.id, { onDelete: "cascade" }),

  itemId: integer("item_id").notNull().references(() => items.id, { onDelete: "restrict"}),
  
  sizeId: integer("size_id").references(() => sizes.id, { onDelete: "restrict" }),
  variantId: integer("variant_id").references(() => variants.id, { onDelete: "restrict" }),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "restrict" }),

  quantity: integer("quantity").notNull(),
});


{/* Quotation Requests */}

export const quotation_requests = pgTable("quotation_requests", {
  id: serial("id").primaryKey(),
  project_name: text("project_name").notNull(),
  mode: text("mode"),
  message: text("message"),
  status: text("status").default("Pending"),
  created_at: timestamp("created_at").defaultNow(),
});

{/* Quotation Request Files */}

export const quotation_request_files = pgTable("quotation_request_files", {
  id: serial("id").primaryKey(),
  request_id: integer("request_id").notNull(),
  path: text("path").notNull(),
  uploaded_at: timestamp("uploaded_at").defaultNow(),
});

{/* Customers */}

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  password: varchar("password", { length: 255 }),
});


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