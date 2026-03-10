import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(10).max(2000),
  property_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Geçersiz form verisi." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.from("contact_requests").insert({
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      message: parsed.data.message,
      property_id: parsed.data.property_id || null,
      status: "new",
    });

    if (error) {
      return NextResponse.json(
        { error: "Mesaj gönderilemedi." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Sunucu hatası." },
      { status: 500 }
    );
  }
}
