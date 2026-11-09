import path from "path";
import fs from "fs";

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
  created_at: string;
}

function getDb() {
  // Dynamic require so the native addon is never touched at build time
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");

  const DB_DIR = path.join(process.cwd(), "data");
  const DB_PATH = path.join(DB_DIR, "dinocoach.db");

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);

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
      num_coaches_needed INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
}

export function getAllPostings(): Posting[] {
  const db = getDb();
  return db.prepare("SELECT * FROM postings ORDER BY created_at DESC").all() as Posting[];
}

export function createPosting(data: Omit<Posting, "id" | "created_at">): Posting {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO postings (
      school_name, school_email, school_level, sport, team_name,
      description, schedule, contact_name, contact_email, num_coaches_needed
    ) VALUES (
      @school_name, @school_email, @school_level, @sport, @team_name,
      @description, @schedule, @contact_name, @contact_email, @num_coaches_needed
    )
  `);
  const result = stmt.run(data);
  return db
    .prepare("SELECT * FROM postings WHERE id = ?")
    .get(result.lastInsertRowid) as Posting;
}
