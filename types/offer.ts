export type OfferStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export interface CustomOffer {
  id: string;
  property_id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  offer_price: number;
  currency: string;
  notes: string | null;
  status: OfferStatus;
  expires_at: string | null;
  sent_at: string | null;
  responded_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfferCreateInput {
  property_id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  offer_price: number;
  currency?: string;
  notes?: string;
  expires_at?: string;
}

export type OfferUpdateInput = Partial<OfferCreateInput> & {
  status?: OfferStatus;
};
