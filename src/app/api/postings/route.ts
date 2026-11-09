import { NextResponse } from "next/server";
import { getAllPostings, createPosting } from "@/lib/db";

export async function GET() {
  try {
    const postings = getAllPostings();
    return NextResponse.json({ postings });
  } catch (error) {
    console.error("GET /api/postings error:", error);
    return NextResponse.json({ error: "Failed to fetch postings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      school_name,
      school_email,
      school_level,
      sport,
      team_name,
      description,
      schedule,
      contact_name,
      contact_email,
      num_coaches_needed,
    } = body;

    if (
      !school_name ||
      !school_email ||
      !school_level ||
      !sport ||
      !description ||
      !schedule ||
      !contact_name ||
      !contact_email
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const posting = createPosting({
      school_name,
      school_email,
      school_level,
      sport,
      team_name: team_name || null,
      description,
      schedule,
      contact_name,
      contact_email,
      num_coaches_needed: num_coaches_needed || 1,
    });

    return NextResponse.json({ posting }, { status: 201 });
  } catch (error) {
    console.error("POST /api/postings error:", error);
    return NextResponse.json({ error: "Failed to create posting" }, { status: 500 });
  }
}
