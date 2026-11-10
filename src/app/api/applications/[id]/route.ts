import { NextResponse } from "next/server";
import { updateApplication, type ApplicationStatus } from "@/lib/db";
import { bad, fail, str } from "../../_util";

// PATCH { role: "student" | "school", email, status }
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id);
    const b = await request.json();
    const role = str(b.role);
    const status = str(b.status) as ApplicationStatus;
    if (!Number.isInteger(id)) return bad("Invalid id");
    if (role !== "student" && role !== "school") return bad("Invalid role");
    if (!["accepted", "declined", "withdrawn"].includes(status)) return bad("Invalid status");
    updateApplication(id, { role, email: str(b.email) }, status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error, "PATCH /api/applications/[id]");
  }
}
