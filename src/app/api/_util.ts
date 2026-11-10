import { NextResponse } from "next/server";
import { DbError } from "@/lib/db";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function fail(error: unknown, label: string) {
  if (error instanceof DbError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(label, error);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

export const bad = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
