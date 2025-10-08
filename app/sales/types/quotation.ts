// app/sales/types/quotation.ts

export type Customer = {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
};

export type MaterialRow = {
  id: string;
  name: string;
  specification: string;
  quantity: number;
};

export type QuotationItem = {
  itemName: string;
  scopeOfWork: string;
  materials: MaterialRow[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type SavedQuotation = {
  id: string;
  saved?: boolean;
  requestId?: number;
  status?: string;
  //notes: string;
  quotationNotes?: string;
  projectName?: string;
  mode?: string;
  vat?: number;
  markup?: number;
  items: QuotationItem[];
  delivery: string;
  warranty: string;
  validity: string;
  //cadSketch?: string | null;
  cadSketchFile?: PreviewFile[];
  revisionLabel?: string;
  baseQuotationId?: number;
  quotationNumber?: string;
  customer?: Customer;
};

export type PreviewFile = {
  id: number;
  name: string;
  //fileName: string;
  filePath: string;
  url?: string;
};

