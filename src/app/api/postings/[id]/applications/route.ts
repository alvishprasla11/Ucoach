import { NextResponse } from "next/server";
import { listPostingApplications } from "@/lib/db";
import { bad, fail } from "../../../_util";

// GET ?school_email=…  -> the athletes who joined this posting (owner only)
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return bad("Invalid id");
    const email = new URL(request.url).searchParams.get("school_email") || "";
    return NextResponse.json({ applications: listPostingApplications(id, email) });
  } catch (error) {
    return fail(error, "GET /api/postings/[id]/applications");
  }
}
