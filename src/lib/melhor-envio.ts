export type ShippingItem = {
  quantity?: number;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
};

export function buildShippingPayload(destinationPostalCode: string, items: ShippingItem[]) {
  const postalCode = destinationPostalCode.replace(/\D/g, "");
  const from = process.env.MELHOR_ENVIO_POSTAL_CODE?.replace(/\D/g, "");
  if (!from || from.length !== 8) throw new Error("Configure MELHOR_ENVIO_POSTAL_CODE com 8 dígitos.");
  if (postalCode.length !== 8) throw new Error("Informe um CEP de destino válido.");

  const quantity = Math.max(1, items.reduce((total, item) => total + Math.max(1, Number(item.quantity ?? 1)), 0));
  const weight = items.reduce((total, item) => total + Math.max(0.01, Number(item.weight ?? 0.1)) * Math.max(1, Number(item.quantity ?? 1)), 0.1);
  return {
    from: { postal_code: from },
    to: { postal_code: postalCode },
    products: [{ name: "Pedido RG Acessórios", quantity, unitary_value: 1, weight, length: 16, width: 11, height: 4 }],
  };
}

export function sortShippingOptions(options: Array<{ price?: number | string; delivery_time?: number }>) {
  return [...options].sort((first, second) => Number(first.price ?? 0) - Number(second.price ?? 0));
}