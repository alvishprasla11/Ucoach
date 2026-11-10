import { NextResponse } from "next/server";
import { applyToPosting, listStudentApplications } from "@/lib/db";
import { EMAIL_RE, bad, fail, str } from "../_util";

// GET ?student_email=…  -> everything this student has joined
export async function GET(request: Request) {
  try {
    const email = new URL(request.url).searchParams.get("student_email") || "";
    if (!EMAIL_RE.test(email)) return bad("student_email is required");
    return NextResponse.json({ applications: listStudentApplications(email) });
  } catch (error) {
    return fail(error, "GET /api/applications");
  }
}

// POST { posting_id, student_name, student_email, ucid?, message? }
export async function POST(request: Request) {
  try {
    const b = await request.json();
    const postingId = Number(b.posting_id);
    const email = str(b.student_email);
    if (!Number.isInteger(postingId)) return bad("posting_id is required");
    if (!EMAIL_RE.test(email)) return bad("Enter a valid email address");

    const application = applyToPosting({
      posting_id: postingId,
      student_name: str(b.student_name) || email.split("@")[0],
      student_email: email,
      ucid: str(b.ucid) || null,
      message: str(b.message).slice(0, 1000) || null,
    });
    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    return fail(error, "POST /api/applications");
  }
}
