// db/schema.ts

import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  text,
  uuid,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const audit_logs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),

  entity: varchar("entity").notNull(),
  entityId: varchar("entity_id"),

  action: varchar("action").notNull(),
  description: varchar("description"),

  actorId: varchar("actor_id").notNull(),
  actorName: varchar("actor_name"),
  actorRole: varchar("actor_role"),

  timestamp: timestamp("timestamp").defaultNow(),
  module: varchar("module"),
});

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

  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id), // FK to categories table
  unitId: integer("unit_id")
    .notNull()
    .references(() => units.id), // FK to units table
  variantId: integer("variant_id").references(() => variants.id), // color or type
  sizeId: integer("size_id").references(() => sizes.id), // mm/cm/large/small

  stock: integer("stock").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(30),
  criticalLevel: integer("critical_level").notNull().default(20),
  ceilingLevel: integer("ceiling_level").notNull().default(100),

  status: varchar("status", { length: 50 }).notNull().default("No Stock"), // Overstock, In Stock, Reorder Level, Critical Level, No Stock
  isActive: boolean("is_active").default(true),
});

{
  /* Item Issuances */
}

export const itemIssuances = pgTable("item_issuances", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(), // ✅ FIXED
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientAddress: varchar("client_address", { length: 500 }),
  referenceNumber: varchar("reference_number", { length: 100 }),
  deliveryDate: varchar("delivery_date", { length: 100 }),
  customerPoNumber: varchar("customer_po_number", { length: 255 }).notNull(),
  drNumber: varchar("dr_number", { length: 255 }),
  drDate: varchar("dr_date", { length: 50 }),
  saveAsDraft: boolean("save_as_draft").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  issuedAt: timestamp("issued_at"),
  issuedBy: varchar("issued_by", { length: 255 }).notNull(),

  status: varchar("status", { enum: ["Issued", "Draft", "Archived"] })
    .notNull()
    .default("Draft"),
  restocked: boolean("restocked").default(false),
});

{
  /* Item Issuance Items */
}

export const itemIssuanceItems = pgTable("item_issuance_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  issuanceId: integer("issuance_id")
    .notNull()
    .references(() => itemIssuances.id, { onDelete: "cascade" }),

  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "restrict" }),

  sizeId: integer("size_id").references(() => sizes.id, {
    onDelete: "restrict",
  }),
  variantId: integer("variant_id").references(() => variants.id, {
    onDelete: "restrict",
  }),
  unitId: integer("unit_id").references(() => units.id, {
    onDelete: "restrict",
  }),

  quantity: integer("quantity").notNull(),
});

{
  /* Internal Usages */
}

export const internalUsages = pgTable("internal_usages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  personnelName: varchar("personnel_name", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }).notNull(),

  purpose: varchar("purpose", { length: 255 }).notNull(),

  authorizedBy: varchar("authorized_by", { length: 255 }).notNull(),

  note: varchar("note", { length: 255 }),

  status: varchar("status", { enum: ["Utilized", "Archived"] })
    .notNull()
    .default("Utilized"),

  loggedAt: timestamp("logged_at").defaultNow().notNull(),
  loggedBy: varchar("logged_by", { length: 255 }).notNull(),
});

{
  /* Internal Usage Items */
}

export const internalUsageItems = pgTable("internal_usage_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  usageId: integer("usage_id")
    .notNull()
    .references(() => internalUsages.id, { onDelete: "cascade" }),

  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "restrict" }),

  sizeId: integer("size_id").references(() => sizes.id, {
    onDelete: "restrict",
  }),
  variantId: integer("variant_id").references(() => variants.id, {
    onDelete: "restrict",
  }),
  unitId: integer("unit_id").references(() => units.id, {
    onDelete: "restrict",
  }),

  quantity: integer("quantity").notNull(),
});

{
  /* Purchasing Purchase Orders */
}
export const purchasingPurchaseOrders = pgTable("purchasing_purchase_orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  poNumber: varchar("po_number", { length: 100 }).notNull(),
  date: timestamp("date").defaultNow().notNull(),

  supplierId: integer("supplier_id")
    .notNull()
    .references(() => suppliers.id, { onDelete: "restrict" }),

  terms: varchar("terms"),
  deliveryMode: varchar("delivery_mode"),
  projectName: varchar("project_name"),
  remarks: varchar("remarks"),

  accountName: varchar("account_name"),
  preparedBy: varchar("prepared_by").notNull(),
  status: varchar("status", { enum: ["Pending", "Partial", "Complete"] })
    .notNull()
    .default("Pending"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

{
  /* Purchase Order Items */
}
export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  purchasingPurchaseOrderId: integer("purchasing_purchase_order_id")
    .notNull()
    .references(() => purchasingPurchaseOrders.id, { onDelete: "cascade" }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "restrict" }),
  sizeId: integer("size_id").references(() => sizes.id, {
    onDelete: "restrict",
  }),
  variantId: integer("variant_id").references(() => variants.id, {
    onDelete: "restrict",
  }),
  unitId: integer("unit_id").references(() => units.id, {
    onDelete: "restrict",
  }),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 14, scale: 2 }),
  receivedQuantity: integer("received_quantity").default(0),
});

{
  /* Supplier List */
}
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  supplierName: varchar("supplier_name").notNull(),
  email: varchar("email").notNull(),
  contactNumber: varchar("contact_number").notNull(),
  role: varchar("role"),
  tinNumber: varchar("tin_number"),
  address: varchar("address"),
  status: varchar("status", { enum: ["Active", "Inactive"] })
    .notNull()
    .default("Active"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  loggedBy: varchar("logged_by").notNull(),
});

{
  /* Personnels */
}
export const personnels = pgTable("personnels", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  personnelName: varchar("personnel_name", { length: 255 }).notNull(),
  department: varchar("department", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  contactNumber: varchar("contact_number", { length: 20 }).notNull(),
  status: varchar("status", { enum: ["Active", "Inactive"] })
    .notNull()
    .default("Active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
});

{
  /* Personnel Accounts */
}
export const personnelAccounts = pgTable("personnel_accounts", {
  id: serial("id").primaryKey(),
  personnelId: integer("personnel_id")
    .notNull()
    .references(() => personnels.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash").notNull(),
  status: varchar("status", { enum: ["Active", "Inactive"] })
    .notNull()
    .default("Active"),
  role: varchar("role", { length: 50 }).notNull(),
  clerkId: varchar("clerk_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

{
  /* Clients */
}
export const clients = pgTable("clients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  contact: varchar("contact", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 255 }).notNull(),
});

{
  /* Item replenishments */
}

export const itemReplenishments = pgTable("item_replenishments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  supplier: varchar("supplier").notNull(),
  poRefNum: varchar("po_ref_num", { length: 100 }).notNull(),
  remarks: varchar("remarks", { length: 255 }),
  drRefNum: varchar("dr_ref_num", { length: 100 }),
  isDraft: boolean("is_draft").default(false),

  status: varchar("status", { enum: ["Replenished", "Draft", "Archived"] })
    .notNull()
    .default("Replenished"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  replenishedAt: timestamp("recorded_at"),
  recordedBy: varchar("recorded_by", { length: 255 }).notNull(),
});

{
  /* Replenishment Items */
}
export const replenishmentItems = pgTable("replenishment_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  replenishmentId: integer("replenishment_id")
    .notNull()
    .references(() => itemReplenishments.id, { onDelete: "cascade" }),

  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "restrict" }),

  sizeId: integer("size_id").references(() => sizes.id, {
    onDelete: "restrict",
  }),
  variantId: integer("variant_id").references(() => variants.id, {
    onDelete: "restrict",
  }),
  unitId: integer("unit_id").references(() => units.id, {
    onDelete: "restrict",
  }),

  quantity: integer("quantity").notNull(),
});

{
  /* Physical Inventory Sessions */
}

export const physicalInventorySessions = pgTable(
  "physical_inventory_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    createdBy: varchar("created_by", { length: 255 }).notNull(), // warehouseman userId
    approvedBy: varchar("approved_by", { length: 255 }),
    rejectedBy: varchar("rejected_by", { length: 255 }),

    status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, submitted, approved, rejected

    remarks: text("remarks"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    submittedAt: timestamp("submitted_at"),
    reviewedAt: timestamp("reviewed_at"), // when purchasing approves/rejects
  }
);

{
  /* Physical Inventory Items */
}
export const physicalInventoryItems = pgTable("physical_inventory_items", {
  id: uuid("id").primaryKey().defaultRandom(),

  sessionId: uuid("session_id")
    .notNull()
    .references(() => physicalInventorySessions.id, {
      onDelete: "cascade",
    }),

  itemId: integer("item_id").notNull(),

  // warehouseman input
  physicalQty: integer("physical_qty").notNull(),

  // system values (copied when submitted, warehouseman can't edit or view)
  systemQty: integer("system_qty").notNull(),

  discrepancy: integer("discrepancy").notNull(), // systemQty - physicalQty

  status: varchar("status", { length: 50 }).notNull(),
  // match | shortage | overage

  comments: text("comments"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

{
  /* Inventory Adjustments */
}
export const inventoryAdjustments = pgTable("inventory_adjustments", {
  id: uuid("id").primaryKey().defaultRandom(),

  sessionId: uuid("session_id").references(() => physicalInventorySessions.id, {
    onDelete: "set null",
  }),

  itemId: integer("item_id").notNull(),

  adjustmentQty: integer("adjustment_qty").notNull(),
  // + for overage, - for shortage

  reason: varchar("reason", { length: 255 }).notNull(),
  // e.g., "Physical Inventory Adjustment"

  approvedBy: varchar("approved_by", { length: 255 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

{
  /* Quotation Requests */
}

export const quotation_requests = pgTable("quotation_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  project_name: text("project_name").notNull(),
  mode: text("mode"),
  message: text("message"),
  status: varchar("status", { length: 20 })
    .notNull()
    .$type<
      "Pending" | "Accepted" | "Rejected" | "Cancelled" | "Cancel_Requested"
    >()
    .default("Pending"),
  customer_id: integer("customer_id")
    .notNull()
    .references(() => customer_profile.id),
  created_at: timestamp("created_at").defaultNow(),
});

{
  /* Quotation Request Files */
}

export const quotation_request_files = pgTable("quotation_request_files", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  request_id: integer("request_id")
    .notNull()
    .references(() => quotation_requests.id, { onDelete: "cascade" }),
  publicId: text("public_id").notNull(),
  filename: text("filename").notNull(),
  path: text("path").notNull(),
  resource_type: text("resource_type").default("auto"),
  uploaded_at: timestamp("uploaded_at").defaultNow(),
});

{
  /* Customer Profile */
}

export const customer_profile = pgTable("customer_profile", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),

  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  role: text("role").notNull(),
  email: text("email").notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 255 }).notNull(),
  tinNumber: varchar("tin_number", { length: 255 }),
  clientCode: varchar("client_code", { length: 10 }).notNull(),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

{
  /* Purchase Order */
}
export const purchase_orders = pgTable("purchase_orders", {
  id: uuid("id").primaryKey(),
  customerId: integer("customer_id").references(() => customer_profile.id),

  quotationId: uuid("quotation_id").references(() => quotations.id),

  poNumber: varchar("po_number").notNull(),

  fileName: varchar("file_name"),
  filePath: varchar("file_path"),
  fileType: varchar("file_type"),

  uploadedAt: timestamp("uploaded_at").defaultNow(),
  uploadedBy: varchar("uploaded_by"),
  action: varchar("action").default("uploaded"),
  status: varchar("status", {
    enum: ["Pending", "Accepted", "Rejected"],
  }).default("Pending"),
});

{
  /* Quotations */
}

export const quotations = pgTable("quotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: integer("request_id")
    .notNull()
    .references(() => quotation_requests.id, { onDelete: "cascade" }),

  quotationSeq: serial("quotation_seq").notNull().unique(),
  quotationNumber: varchar("quotation_number", { length: 50 }).unique(),

  revisionNumber: integer("revision_number").default(0),
  baseQuotationId: integer("base_quotation_id"),

  projectName: varchar("project_name", { length: 255 }),

  deliveryType: varchar("delivery_type", { length: 20 }),

  deliveryDeadline: timestamp("delivery_deadline"),

  porgressStatus: varchar("progess_status", { length: 30 })
    .$type<
      | "in_progress"
      | "ready_for_pickup"
      | "out_for_delivery"
      | "completed"
      | "none"
    >()
    .default("none"),

  status: varchar("status", { length: 20 })
    .notNull()
    .$type<
      | "draft"
      | "restoring"
      | "sent"
      | "revision_requested"
      | "approved"
      | "rejected"
      | "expired"
    >()
    .default("draft"),

  payment: varchar("payment", { length: 50 }).notNull(),
  validity: varchar("validity").notNull(),
  delivery: varchar("delivery", { length: 100 }),
  warranty: varchar("warranty", { length: 50 }).notNull(),

  quotationNotes: text("quotation_notes"),
  cadSketch: varchar("cad_sketch", { length: 255 }),

  vat: numeric("vat", { precision: 5, scale: 2 }).default("12.00"),
  markup: numeric("markup", { precision: 5, scale: 2 }).default("5.00"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  customerActionAt: timestamp("customer_action_at").defaultNow().notNull(),
});

{
  /* Quotation Items */
}

export const quotationItems = pgTable("quotation_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  quotationId: uuid("quotation_id")
    .notNull()
    .references(() => quotations.id, { onDelete: "cascade" }),

  itemName: varchar("item_name", { length: 255 }).notNull(),
  scopeOfWork: text("scope_of_work").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  totalPrice: numeric("total_price", { precision: 14, scale: 2 }),
});

{
  /* Quotation Materials */
}

export const quotationMaterials = pgTable("quotation_materials", {
  id: uuid("id").primaryKey().defaultRandom(),
  quotationItemId: uuid("quotation_item_id")
    .notNull()
    .references(() => quotationItems.id, { onDelete: "cascade" }),

  name: varchar("name", { length: 255 }).notNull(),
  specification: varchar("specification", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

{
  /* Quotation Files */
}

export const quotationFiles = pgTable("quotation_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  quotationId: uuid("quotation_id")
    .notNull()
    .references(() => quotations.id, { onDelete: "cascade" }),

  fileName: varchar("file_name", { length: 255 }).notNull(),
  filePath: varchar("file_path", { length: 500 }).notNull(),

  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const quotationRequestsRelations = relations(
  quotation_requests,
  ({ one, many }) => ({
    customer: one(customer_profile, {
      fields: [quotation_requests.customer_id],
      references: [customer_profile.id],
    }),
    quotations: many(quotations),
    files: many(quotation_request_files),
  })
);

// Quotations → Items
export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  request: one(quotation_requests, {
    fields: [quotations.requestId],
    references: [quotation_requests.id],
  }),
  items: many(quotationItems),
  files: many(quotationFiles),
}));

// Items → Materials
export const quotationItemsRelations = relations(
  quotationItems,
  ({ one, many }) => ({
    quotation: one(quotations, {
      fields: [quotationItems.quotationId],
      references: [quotations.id],
    }),
    materials: many(quotationMaterials),
  })
);

// Materials → Item
export const quotationMaterialsRelations = relations(
  quotationMaterials,
  ({ one }) => ({
    item: one(quotationItems, {
      fields: [quotationMaterials.quotationItemId],
      references: [quotationItems.id],
    }),
  })
);

// Files → Quotation
export const quotationFilesRelations = relations(quotationFiles, ({ one }) => ({
  quotation: one(quotations, {
    fields: [quotationFiles.quotationId],
    references: [quotations.id],
  }),
}));

export const phase_statuses = pgTable("phase_statuses", {
  id: serial("id").primaryKey(),
  phaseIndex: integer("phase_index").notNull(),
  mode: text("mode"), // nullable by default
  status: text("status").notNull(),
});

export const phase_updates = pgTable("phase_updates", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id")
    .notNull()
    .references(() => quotation_requests.id, { onDelete: "cascade" }),
  phaseIndex: integer("phase_index").notNull(),
  status: varchar("status", { length: 20 })
    .$type<
      | "Pending"
      | "In-Progress"
      | "Complete"
      | "In-Transit"
      | "Delivered"
      | "Ready"
      | "Collected"
    >()
    .notNull(),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// NEW SCHEMA FOR MATERIAL LIST
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  materialName: varchar("material_name", { length: 255 }).notNull(),
  specifications: text("specifications"),
  pricePerKg: numeric("price_per_kg", { precision: 10, scale: 2 }).notNull(),
  addedBy: varchar("added_by", { length: 255 }).notNull(), // User who added it
  addedAt: timestamp("added_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const materialsRelations = relations(materials, ({}) => ({}));
