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

    // Garantir que o usuário existe no banco
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: customerEmail,
        role: "USER",
      },
    });

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
        shippingMethod: shippingMethod?.toString(),
        total: parseFloat(total.toString()),
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // Atualizar estoque
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
  } catch (error: any) {
    console.error("Erro ao criar pedido:", JSON.stringify(error, null, 2));
    console.error("Mensagem:", error?.message);
    console.error("Código:", error?.code);
    return NextResponse.json(
      { error: error?.message ?? "Erro ao criar pedido" },
      { status: 500 }
    );
  }
}