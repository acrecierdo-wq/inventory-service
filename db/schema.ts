// db/schema.ts

import { pgTable, serial, varchar, integer, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";


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

export const itemIssuanceItems = pgTable("item_issuance_items", {
  id: serial("id").primaryKey(),

  issuanceId: integer("issuance_id").notNull().references(() => itemIssuances.id, { onDelete: "cascade" }),

  itemId: integer("item_id").notNull().references(() => items.id, { onDelete: "restrict" }),

  sizeId: integer("size_id").references(() => sizes.id, { onDelete: "restrict" }),
  variantId: integer("variant_id").references(() => variants.id, { onDelete: "restrict" }),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "restrict" }),

  quantity: integer("quantity").notNull(),
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