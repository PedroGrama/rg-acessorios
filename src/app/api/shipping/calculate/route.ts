import { NextResponse } from "next/server";
import { buildShippingPayload, sortShippingOptions, type ShippingItem } from "@/lib/melhor-envio";

export async function POST(request: Request) {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) return NextResponse.json({ error: "Configure MELHOR_ENVIO_TOKEN para calcular o frete." }, { status: 503 });
  try {
    const body = await request.json() as { postalCode?: string; items?: ShippingItem[] };
    const payload = buildShippingPayload(body.postalCode ?? "", body.items ?? []);
    const response = await fetch("https://melhorenvio.com.br/api/v2/me/shipment/calculate", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload), cache: "no-store" });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.message ?? "O Melhor Envio recusou a cotação." }, { status: response.status });
    return NextResponse.json(sortShippingOptions(Array.isArray(data) ? data : []));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível calcular o frete." }, { status: 400 }); }
}
