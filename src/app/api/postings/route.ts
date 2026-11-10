import { NextResponse } from "next/server";
import { listPostings, createPosting } from "@/lib/db";
import { EMAIL_RE, bad, fail, str } from "../_util";

// GET /api/postings?school_email=…  -> that school's postings
// GET /api/postings?student_email=… -> open postings, with the student's own request status
export async function GET(request: Request) {
  try {
    const q = new URL(request.url).searchParams;
    const schoolEmail = q.get("school_email") || undefined;
    const studentEmail = q.get("student_email") || undefined;
    const postings = listPostings({
      schoolEmail,
      studentEmail,
      openOnly: !schoolEmail,
    });
    return NextResponse.json({ postings });
  } catch (error) {
    return fail(error, "GET /api/postings");
  }
}

export async function POST(request: Request) {
  try {
    const b = await request.json();
    const data = {
      school_name: str(b.school_name),
      school_email: str(b.school_email),
      school_level: str(b.school_level),
      sport: str(b.sport),
      team_name: str(b.team_name) || null,
      description: str(b.description),
      schedule: str(b.schedule),
      contact_name: str(b.contact_name),
      contact_email: str(b.contact_email),
      num_coaches_needed: Math.min(10, Math.max(1, Number(b.num_coaches_needed) || 1)),
    };

    const required = ["school_name", "school_email", "school_level", "sport", "description", "schedule", "contact_name", "contact_email"] as const;
    if (required.some((k) => !data[k])) return bad("Missing required fields");
    if (!EMAIL_RE.test(data.school_email) || !EMAIL_RE.test(data.contact_email)) {
      return bad("Enter a valid email address");
    }

    return NextResponse.json({ posting: createPosting(data) }, { status: 201 });
  } catch (error) {
    return fail(error, "POST /api/postings");
  }
}
