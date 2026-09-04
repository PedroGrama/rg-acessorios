import { NextResponse } from "next/server";
import { buildShippingPayload, sortShippingOptions, type ShippingItem } from "@/lib/melhor-envio";

export async function POST(request: Request) {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) {
    console.error("MELHOR_ENVIO_TOKEN ausente. A cotação de frete não pode ser calculada.");
    return NextResponse.json(
      { error: "Não foi possível calcular a melhor opção de frete no momento. Tente novamente em alguns minutos ou entre em contato com a loja." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as { postalCode?: string; items?: ShippingItem[] };
    const payload = buildShippingPayload(body.postalCode ?? "", body.items ?? []);

    const response = await fetch("https://melhorenvio.com.br/api/v2/me/shipment/calculate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "rg-acessorios pedro.phfg11@gmail.com",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.message ?? "A cotação de frete não foi retornada pelo Melhor Envio.";
      console.error("Melhor Envio respondeu com erro de cotação:", message, data);
      return NextResponse.json(
        { error: "Não foi possível encontrar a melhor opção de frete para este CEP no momento. Verifique o endereço e tente novamente." },
        { status: response.status }
      );
    }

    // 1. Garante que sejam apenas opções sem erros
    const validOptions = Array.isArray(data) ? data.filter((o: any) => !o.error) : [];

    // 2. Ordena todas as opções válidas (menor preço primeiro)
    const sortedOptions = sortShippingOptions(validOptions);

    if (sortedOptions.length === 0) {
      return NextResponse.json([]);
    }

    // 3. Seleciona a opção mais barata
    const cheapest = sortedOptions[0];

    // 4. Seleciona a opção mais rápida (menor prazo de entrega)
    const fastest = sortedOptions.reduce((prev: any, curr: any) => {
      const prevDelivery = Number(prev.custom_delivery_time || prev.delivery_time || Infinity);
      const currDelivery = Number(curr.custom_delivery_time || curr.delivery_time || Infinity);
      return currDelivery < prevDelivery ? curr : prev;
    }, sortedOptions[0]);

    // 5. Monta a lista com no máximo 2 opções distintas (Standard vs Express)
    const filteredOptions = [cheapest];

    // Se a opção mais rápida for diferente da mais barata, adiciona como Express
    if (fastest && fastest.id !== cheapest.id) {
      filteredOptions.push(fastest);
    }

    // 6. Mapeia nomes amigáveis mantendo o nome original se for outra transportadora
    const formattedOptions = filteredOptions.map((option: any) => {
      const isCheapest = option.id === cheapest.id;
      const originalName = option.company?.name || option.name;

      // Se for Loggi, formata para Standard e Express. Se for outra empresa (ex: Correios), usa o nome original
      let displayName = originalName;
      if (originalName?.toLowerCase().includes("loggi")) {
        displayName = isCheapest ? "Loggi Standard" : "Loggi Express";
      }

      return {
        ...option,
        name: displayName,
        tag: isCheapest ? "Mais Barato" : "Mais Rápido",
      };
    });

    return NextResponse.json(formattedOptions);
  } catch (error) {
    console.error("Erro ao calcular frete com Melhor Envio:", error);
    return NextResponse.json(
      { error: "Não foi possível calcular a melhor opção de frete agora. Verifique o CEP informado e tente novamente." },
      { status: 400 }
    );
  }
}