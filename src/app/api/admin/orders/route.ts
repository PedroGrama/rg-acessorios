import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCost,
      shippingMethod,
      items,
      paymentMethod,
      total,
    } = body;

    // Validar estoque e criar itens do pedido
    const orderItems = [];
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Estoque insuficiente para ${item.name}` },
          { status: 400 }
        );
      }

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    // Criar pedido
    const order = await prisma.order.create({
      data: {
        userId,
        customerName,
        customerEmail,
        customerPhone,
        status: "PENDING",
        paymentMethod,
        shippingAddress,
        shippingCost: parseFloat(shippingCost.toString()),
        shippingMethod,
        total: parseFloat(total.toString()),
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // Atualizar estoque (não faz a baixa ainda, apenas reserva o item)
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido" },
      { status: 500 }
    );
  }
}
