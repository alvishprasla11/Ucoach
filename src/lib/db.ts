import path from "path";
import fs from "fs";
import type BetterSqlite3 from "better-sqlite3";

export type PostingStatus = "open" | "closed";
export type ApplicationStatus = "pending" | "accepted" | "declined" | "withdrawn";

export interface Posting {
  id: number;
  school_name: string;
  school_email: string;
  school_level: string;
  sport: string;
  team_name: string | null;
  description: string;
  schedule: string;
  contact_name: string;
  contact_email: string;
  num_coaches_needed: number;
  status: PostingStatus;
  created_at: string;
}

export interface PostingWithStats extends Posting {
  pending_count: number;
  accepted_count: number;
  spots_left: number;
  /** Set only when listing for a student. */
  my_application_status: ApplicationStatus | null;
  my_application_id: number | null;
}

export interface Application {
  id: number;
  posting_id: number;
  student_name: string;
  student_email: string;
  ucid: string | null;
  message: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface ApplicationWithPosting extends Application {
  school_name: string;
  school_email: string;
  sport: string;
  team_name: string | null;
  school_level: string;
  schedule: string;
  contact_name: string;
  contact_email: string;
  posting_status: PostingStatus;
}

/** Thrown for expected, user-facing failures. The API maps these to 4xx. */
export class DbError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const globalForDb = globalThis as unknown as { __dinoDb?: BetterSqlite3.Database };

function getDb(): BetterSqlite3.Database {
  if (globalForDb.__dinoDb) return globalForDb.__dinoDb;

  // Dynamic require so the native addon is never touched at build time
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");

  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db: BetterSqlite3.Database = new Database(path.join(dir, "dinocoach.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);

  globalForDb.__dinoDb = db;
  return db;
}

function migrate(db: BetterSqlite3.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS postings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_name TEXT NOT NULL,
      school_email TEXT NOT NULL,
      school_level TEXT NOT NULL,
      sport TEXT NOT NULL,
      team_name TEXT,
      description TEXT NOT NULL,
      schedule TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      num_coaches_needed INTEGER NOT NULL DEFAULT 1 CHECK (num_coaches_needed BETWEEN 1 AND 10),
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Databases created by the first version have no status column.
  const cols = db.prepare("PRAGMA table_info(postings)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "status")) {
    db.exec("ALTER TABLE postings ADD COLUMN status TEXT NOT NULL DEFAULT 'open'");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      posting_id INTEGER NOT NULL REFERENCES postings(id) ON DELETE CASCADE,
      student_name TEXT NOT NULL,
      student_email TEXT NOT NULL,
      ucid TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','accepted','declined','withdrawn')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (posting_id, student_email)
    );
    CREATE INDEX IF NOT EXISTS idx_postings_school ON postings(school_email);
    CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_email);
    CREATE INDEX IF NOT EXISTS idx_applications_posting ON applications(posting_id);
  `);
}

const norm = (e: string) => e.trim().toLowerCase();

/* ---------- Postings ---------- */

export function listPostings(opts: {
  schoolEmail?: string;
  studentEmail?: string;
  openOnly?: boolean;
}): PostingWithStats[] {
  const db = getDb();
  const where: string[] = [];
  const params: Record<string, string> = { student: norm(opts.studentEmail ?? "") };
  if (opts.schoolEmail) {
    where.push("lower(p.school_email) = @school");
    params.school = norm(opts.schoolEmail);
  }
  if (opts.openOnly) where.push("p.status = 'open'");

  const rows = db
    .prepare(
      `SELECT p.*,
        (SELECT COUNT(*) FROM applications a WHERE a.posting_id = p.id AND a.status = 'pending') AS pending_count,
        (SELECT COUNT(*) FROM applications a WHERE a.posting_id = p.id AND a.status = 'accepted') AS accepted_count,
        (SELECT a.status FROM applications a WHERE a.posting_id = p.id AND a.student_email = @student) AS my_application_status,
        (SELECT a.id FROM applications a WHERE a.posting_id = p.id AND a.student_email = @student) AS my_application_id
       FROM postings p
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY p.created_at DESC, p.id DESC`
    )
    .all(params) as (Omit<PostingWithStats, "spots_left"> & { spots_left?: number })[];

  return rows.map((r) => ({
    ...r,
    spots_left: Math.max(0, r.num_coaches_needed - r.accepted_count),
  }));
}

export function createPosting(
  data: Omit<Posting, "id" | "created_at" | "status">
): Posting {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO postings (
        school_name, school_email, school_level, sport, team_name,
        description, schedule, contact_name, contact_email, num_coaches_needed
      ) VALUES (
        @school_name, @school_email, @school_level, @sport, @team_name,
        @description, @schedule, @contact_name, @contact_email, @num_coaches_needed
      )`
    )
    .run({ ...data, school_email: norm(data.school_email) });
  return db.prepare("SELECT * FROM postings WHERE id = ?").get(result.lastInsertRowid) as Posting;
}

function ownedPosting(db: BetterSqlite3.Database, id: number, schoolEmail: string): Posting {
  const p = db.prepare("SELECT * FROM postings WHERE id = ?").get(id) as Posting | undefined;
  if (!p) throw new DbError("Posting not found", 404);
  if (norm(p.school_email) !== norm(schoolEmail)) throw new DbError("Not your posting", 403);
  return p;
}

export function setPostingStatus(id: number, schoolEmail: string, status: PostingStatus) {
  const db = getDb();
  ownedPosting(db, id, schoolEmail);
  db.prepare("UPDATE postings SET status = ? WHERE id = ?").run(status, id);
}

export function deletePosting(id: number, schoolEmail: string) {
  const db = getDb();
  ownedPosting(db, id, schoolEmail);
  db.prepare("DELETE FROM postings WHERE id = ?").run(id);
}

/* ---------- Applications ---------- */

export function applyToPosting(data: {
  posting_id: number;
  student_name: string;
  student_email: string;
  ucid?: string | null;
  message?: string | null;
}): Application {
  const db = getDb();
  const email = norm(data.student_email);

  const tx = db.transaction(() => {
    const p = db.prepare("SELECT * FROM postings WHERE id = ?").get(data.posting_id) as
      | Posting
      | undefined;
    if (!p) throw new DbError("Posting not found", 404);
    if (p.status !== "open") throw new DbError("This posting is closed", 409);

    const accepted = (
      db
        .prepare("SELECT COUNT(*) c FROM applications WHERE posting_id = ? AND status = 'accepted'")
        .get(p.id) as { c: number }
    ).c;
    if (accepted >= p.num_coaches_needed) throw new DbError("All coaching spots are filled", 409);

    const existing = db
      .prepare("SELECT * FROM applications WHERE posting_id = ? AND student_email = ?")
      .get(p.id, email) as Application | undefined;

    if (existing && (existing.status === "pending" || existing.status === "accepted")) {
      throw new DbError("You have already joined this posting", 409);
    }
    if (existing?.status === "declined") {
      throw new DbError("The school has declined your earlier request", 409);
    }

    if (existing) {
      // Re-joining after a withdrawal
      db.prepare(
        `UPDATE applications SET status = 'pending', student_name = @name, ucid = @ucid,
         message = @message, updated_at = CURRENT_TIMESTAMP WHERE id = @id`
      ).run({
        id: existing.id,
        name: data.student_name,
        ucid: data.ucid || null,
        message: data.message || null,
      });
      return db.prepare("SELECT * FROM applications WHERE id = ?").get(existing.id) as Application;
    }

    const r = db
      .prepare(
        `INSERT INTO applications (posting_id, student_name, student_email, ucid, message)
         VALUES (@posting_id, @name, @email, @ucid, @message)`
      )
      .run({
        posting_id: p.id,
        name: data.student_name,
        email,
        ucid: data.ucid || null,
        message: data.message || null,
      });
    return db.prepare("SELECT * FROM applications WHERE id = ?").get(r.lastInsertRowid) as Application;
  });

  return tx();
}

export function listStudentApplications(studentEmail: string): ApplicationWithPosting[] {
  return getDb()
    .prepare(
      `SELECT a.*, p.school_name, p.school_email, p.sport, p.team_name, p.school_level,
              p.schedule, p.contact_name, p.contact_email, p.status AS posting_status
       FROM applications a JOIN postings p ON p.id = a.posting_id
       WHERE a.student_email = ?
       ORDER BY a.updated_at DESC, a.id DESC`
    )
    .all(norm(studentEmail)) as ApplicationWithPosting[];
}

export function listPostingApplications(postingId: number, schoolEmail: string): Application[] {
  const db = getDb();
  ownedPosting(db, postingId, schoolEmail);
  return db
    .prepare("SELECT * FROM applications WHERE posting_id = ? ORDER BY created_at ASC, id ASC")
    .all(postingId) as Application[];
}

export function updateApplication(
  id: number,
  actor: { role: "student" | "school"; email: string },
  status: ApplicationStatus
) {
  const db = getDb();
  const tx = db.transaction(() => {
    const a = db.prepare("SELECT * FROM applications WHERE id = ?").get(id) as
      | Application
      | undefined;
    if (!a) throw new DbError("Request not found", 404);
    const p = db.prepare("SELECT * FROM postings WHERE id = ?").get(a.posting_id) as Posting;

    if (actor.role === "student") {
      if (norm(a.student_email) !== norm(actor.email)) throw new DbError("Not your request", 403);
      if (status !== "withdrawn") throw new DbError("Students can only withdraw", 400);
      if (a.status !== "pending" && a.status !== "accepted") {
        throw new DbError("This request can no longer be withdrawn", 409);
      }
    } else {
      if (norm(p.school_email) !== norm(actor.email)) throw new DbError("Not your posting", 403);
      if (status !== "accepted" && status !== "declined") {
        throw new DbError("Schools can accept or decline", 400);
      }
      if (a.status === "withdrawn") throw new DbError("The athlete withdrew", 409);
      if (status === "accepted" && a.status !== "accepted") {
        const accepted = (
          db
            .prepare("SELECT COUNT(*) c FROM applications WHERE posting_id = ? AND status = 'accepted'")
            .get(p.id) as { c: number }
        ).c;
        if (accepted >= p.num_coaches_needed) throw new DbError("All spots are filled", 409);
      }
    }

    db.prepare("UPDATE applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
      status,
      id
    );
  });
  tx();
}
