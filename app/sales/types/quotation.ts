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
  id: number;
  requestId?: number;
  status?: string;
  //notes: string;
  quotationNotes?: string;
  vat?: number;
  markup?: number;
  items: QuotationItem[];
  delivery: string;
  warranty: string;
  validity: string;
};

export type PreviewFile = {
  id: number;
  name: string;
  //fileName: string;
  filePath: string;
  url?: string;
};

