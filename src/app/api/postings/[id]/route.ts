import { NextResponse } from "next/server";
import { setPostingStatus, deletePosting } from "@/lib/db";
import { bad, fail, str } from "../../_util";

type Ctx = { params: Promise<{ id: string }> };

// PATCH { school_email, status: "open" | "closed" }
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const id = Number((await params).id);
    const b = await request.json();
    const status = str(b.status);
    if (!Number.isInteger(id)) return bad("Invalid id");
    if (status !== "open" && status !== "closed") return bad("Invalid status");
    setPostingStatus(id, str(b.school_email), status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error, "PATCH /api/postings/[id]");
  }
}

// DELETE ?school_email=…
export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return bad("Invalid id");
    deletePosting(id, new URL(request.url).searchParams.get("school_email") || "");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error, "DELETE /api/postings/[id]");
  }
}
