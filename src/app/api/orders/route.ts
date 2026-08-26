import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  addProductOrder,
  getContent,
  getProductOrders,
  saveProductOrders,
} from "@/lib/data";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(getProductOrders());
}

export async function POST(req: Request) {
  const body = await req.json();
  const productId = String(body.productId || "");
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const note = String(body.note || "").trim();

  if (!productId || !name || !email) {
    return NextResponse.json(
      { error: "Product, name, and email are required" },
      { status: 400 }
    );
  }

  const product = getContent().products.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const order = addProductOrder({
    productId: product.id,
    productTitle: product.title,
    price: product.price,
    currency: product.currency,
    name,
    email,
    note,
  });

  return NextResponse.json({
    ok: true,
    order,
    buyUrl: product.buyUrl,
    message: `Order received for ${product.title}. We'll follow up by email.`,
  });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const id = String(body.id || "");
  const list = getProductOrders();
  const idx = list.findIndex((o) => o.id === id);
  if (idx < 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (body.status) list[idx].status = body.status;
  saveProductOrders(list);
  return NextResponse.json({ ok: true, order: list[idx] });
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  saveProductOrders(getProductOrders().filter((o) => o.id !== id));
  return NextResponse.json({ ok: true });
}
