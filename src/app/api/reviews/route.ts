import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  addReview,
  getApprovedReviews,
  getReviews,
  saveReviews,
} from "@/lib/data";
import { beginData, endData } from "@/lib/api-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await beginData();
    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "1";
    if (all) {
      const session = await getSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json(getReviews());
    }
    return NextResponse.json(getApprovedReviews());
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Reviews error";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await beginData();
    const body = await req.json();
    const name = String(body.name || "").trim();
    const comment = String(body.comment || "").trim();
    const role = String(body.role || "Client").trim();
    const company = String(body.company || "").trim();
    const avatar = String(body.avatar || "").trim();
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));

    if (!name || !comment) {
      return NextResponse.json(
        { error: "Name and review comment are required" },
        { status: 400 }
      );
    }

    const review = addReview({
      name,
      role,
      company,
      rating,
      comment,
      avatar,
      approved: false,
    });
    await endData();

    return NextResponse.json({
      ok: true,
      review,
      message: "Thanks! Your review is pending approval.",
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Review failed";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await beginData();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const id = String(body.id || "");
    const reviews = getReviews();
    const idx = reviews.findIndex((r) => r.id === id);
    if (idx < 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (typeof body.approved === "boolean") reviews[idx].approved = body.approved;
    saveReviews(reviews);
    await endData();
    return NextResponse.json({ ok: true, review: reviews[idx] });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Review update failed";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await beginData();
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    saveReviews(getReviews().filter((r) => r.id !== id));
    await endData();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Review delete failed";
    return NextResponse.json({ error: detail }, { status: 500 });
  }
}
