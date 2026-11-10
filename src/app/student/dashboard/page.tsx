"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApplicationWithPosting, PostingWithStats } from "@/lib/db";
import {
  DashboardShell, Badge, Stat, Empty, Tabs, Chips, Modal, ToastView, useToast,
  useRequireUser, api, LEVELS,
} from "../../../components/dashboard";
import {
  Search, CalendarDays, Users, Mail, Hourglass, CircleCheck, Inbox, Loader2, Handshake, UserRound,
} from "../../../components/icons";

type Tab = "commitments" | "find";

function StatusBadge({ s, postingStatus }: { s: string; postingStatus?: string }) {
  if (s === "accepted") return <Badge tone="green"><CircleCheck size={13} /> Confirmed</Badge>;
  if (s === "pending") return <Badge tone="amber"><Hourglass size={13} /> Waiting for reply</Badge>;
  if (s === "declined") return <Badge tone="grey">Not selected</Badge>;
  return <Badge tone="grey">{postingStatus === "closed" ? "Closed" : "Withdrawn"}</Badge>;
}

function CommitmentCard({ a, onWithdraw }: { a: ApplicationWithPosting; onWithdraw: (a: ApplicationWithPosting) => void }) {
  return (
  <article className="rounded-2xl border border-line bg-white p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-red">{a.sport} · {a.school_level.split(" (")[0]}</p>
        <h3 className="mt-1 text-xl font-bold">{a.school_name}</h3>
        {a.team_name && <p className="text-sm text-muted">{a.team_name}</p>}
      </div>
      <StatusBadge s={a.status} postingStatus={a.posting_status} />
    </div>
    <ul className="mt-4 space-y-2 text-sm">
      <li className="flex items-start gap-2.5"><CalendarDays size={16} className="mt-0.5 shrink-0 text-muted" />{a.schedule}</li>
      {a.status === "accepted" ? (
        <li className="flex items-start gap-2.5">
          <Mail size={16} className="mt-0.5 shrink-0 text-muted" />
          <span>
            {a.contact_name} ·{" "}
            <a className="link-draw font-medium text-red" href={`mailto:${a.contact_email}`}>{a.contact_email}</a>
          </span>
        </li>
      ) : (
        <li className="flex items-start gap-2.5"><UserRound size={16} className="mt-0.5 shrink-0 text-muted" />Contact: {a.contact_name}</li>
      )}
    </ul>
    {a.status === "accepted" && (
      <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
        You&rsquo;re in. Email {a.contact_name.split(" ")[0]} to confirm your first practice.
      </p>
    )}
    <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
      <span>Requested {new Date(a.created_at.replace(" ", "T") + "Z").toLocaleDateString("en-CA")}</span>
      {(a.status === "pending" || a.status === "accepted") && (
        <button onClick={() => onWithdraw(a)} className="link-draw font-semibold hover:text-red">Withdraw</button>
      )}
    </div>
  </article>
  );
}

function Section({ title, items, onWithdraw }: { title: string; items: ApplicationWithPosting[]; onWithdraw: (a: ApplicationWithPosting) => void }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold">{title} <span className="text-muted">({items.length})</span></h2>
      <div className="grid gap-4 md:grid-cols-2">{items.map((a) => <CommitmentCard key={a.id} a={a} onWithdraw={onWithdraw} />)}</div>
    </section>
  );
}

export default function StudentDashboard() {
  const user = useRequireUser("student");
  const { toast, show } = useToast();

  const [tab, setTab] = useState<Tab | null>(null);
  const [apps, setApps] = useState<ApplicationWithPosting[]>([]);
  const [postings, setPostings] = useState<PostingWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sport, setSport] = useState("All");
  const [level, setLevel] = useState("All");

  const [joining, setJoining] = useState<PostingWithStats | null>(null);
  const [note, setNote] = useState("");
  const [ucid, setUcid] = useState("");
  const [busy, setBusy] = useState(false);

  const email = user?.email;

  const load = useCallback(async () => {
    if (!email) return;
    try {
      const q = encodeURIComponent(email);
      const [a, p] = await Promise.all([
        api<{ applications: ApplicationWithPosting[] }>(`/api/applications?student_email=${q}`),
        api<{ postings: PostingWithStats[] }>(`/api/postings?student_email=${q}`),
      ]);
      setApps(a.applications);
      setPostings(p.postings);
      // Land on commitments if there are any, otherwise straight to finding a team.
      setTab((t) => t ?? (a.applications.some((x) => x.status !== "withdrawn") ? "commitments" : "find"));
    } catch {
      show("error", "Couldn't load your data. Check your connection and refresh.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // Fetch on mount: state is only set after the await, not synchronously.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const groups = useMemo(() => ({
    confirmed: apps.filter((a) => a.status === "accepted"),
    pending: apps.filter((a) => a.status === "pending"),
    past: apps.filter((a) => a.status === "declined" || a.status === "withdrawn"),
  }), [apps]);

  const sports = useMemo(() => ["All", ...Array.from(new Set(postings.map((p) => p.sport)))], [postings]);
  const levelOpts = ["All", ...LEVELS];

  const visible = postings.filter((p) => {
    if (sport !== "All" && p.sport !== sport) return false;
    if (level !== "All" && p.school_level !== level) return false;
    const q = search.trim().toLowerCase();
    return !q || [p.school_name, p.sport, p.team_name, p.description].some((v) => v?.toLowerCase().includes(q));
  });

  if (!user) return null;

  const openJoin = (p: PostingWithStats) => { setJoining(p); setNote(""); setUcid(user.ucid ?? ""); };

  const submitJoin = async () => {
    if (!joining) return;
    setBusy(true);
    try {
      await api("/api/applications", {
        method: "POST",
        body: JSON.stringify({
          posting_id: joining.id, student_name: user.name, student_email: user.email, ucid, message: note,
        }),
      });
      show("ok", `Request sent to ${joining.school_name}`);
      setJoining(null);
      await load();
      setTab("commitments");
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Couldn't send your request");
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async (a: ApplicationWithPosting) => {
    if (!confirm(`Withdraw from ${a.school_name}${a.team_name ? ` · ${a.team_name}` : ""}?`)) return;
    try {
      await api(`/api/applications/${a.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: "student", email: user.email, status: "withdrawn" }),
      });
      show("ok", "You've withdrawn from this team");
      await load();
    } catch (e) {
      show("error", e instanceof Error ? e.message : "Couldn't withdraw");
    }
  };

  return (
    <DashboardShell user={user} roleLabel="UCalgary athlete">
      <h1 className="text-4xl font-bold">Hi {user.name.split(" ")[0]}.</h1>
      <p className="mt-1 text-muted">Your coaching commitments, and the teams that still need a coach.</p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Confirmed" value={groups.confirmed.length} />
        <Stat label="Waiting for reply" value={groups.pending.length} />
        <Stat label="Open teams" value={postings.filter((p) => p.spots_left > 0 && !p.my_application_status).length} />
      </div>

      <div className="mt-8">
        <Tabs
          value={tab ?? "commitments"}
          onChange={setTab}
          tabs={[
            { id: "commitments", label: "My commitments", count: groups.confirmed.length + groups.pending.length },
            { id: "find", label: "Find a team", count: postings.length },
          ]}
        />
      </div>

      {loading ? (
        <p className="flex items-center justify-center gap-2 py-20 text-muted"><Loader2 className="animate-spin" size={18} /> Loading</p>
      ) : tab === "find" ? (
        <div className="mt-6">
          <div className="relative">
            <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="field !pl-10"
              placeholder="Search by school, sport or team"
              aria-label="Search teams"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {postings.length > 0 && (
            <div className="mt-4 space-y-3">
              {sports.length > 2 && <Chips label="Sport" options={sports} value={sport} onChange={setSport} />}
              <Chips label="School level" options={levelOpts} value={level} onChange={setLevel} />
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {visible.map((p) => {
              const mine = p.my_application_status;
              const joined = mine === "pending" || mine === "accepted";
              const full = p.spots_left <= 0;
              return (
                <article key={p.id} className="card-link flex flex-col rounded-2xl border border-line bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red">{p.sport} · {p.school_level.split(" (")[0]}</p>
                    {joined && <StatusBadge s={mine!} />}
                  </div>
                  <h3 className="mt-1 text-xl font-bold">{p.school_name}</h3>
                  {p.team_name && <p className="text-sm text-muted">{p.team_name}</p>}
                  <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{p.description}</p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    <li className="flex items-start gap-2.5"><CalendarDays size={16} className="mt-0.5 shrink-0 text-muted" />{p.schedule}</li>
                    <li className="flex items-center gap-2.5">
                      <Users size={16} className="shrink-0 text-muted" />
                      {full ? "All spots filled" : `${p.spots_left} coach${p.spots_left === 1 ? "" : "es"} needed`}
                    </li>
                  </ul>
                  {joined ? (
                    <button onClick={() => setTab("commitments")} className="btn btn-ghost mt-5 w-full">View in my commitments</button>
                  ) : mine === "declined" ? (
                    <button disabled className="btn btn-ghost mt-5 w-full opacity-60">Not selected</button>
                  ) : full ? (
                    <button disabled className="btn btn-ghost mt-5 w-full opacity-60">Spots filled</button>
                  ) : (
                    <button onClick={() => openJoin(p)} className="btn btn-primary mt-5 w-full">
                      {mine === "withdrawn" ? "Join again" : "Join this team"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
          {visible.length === 0 && (
            <Empty
              icon={<Inbox size={24} />}
              title={postings.length === 0 ? "No teams posted yet" : "No teams match"}
              body={postings.length === 0 ? "Schools are still adding teams. Check back soon." : "Try a different sport or level, or clear your search."}
            />
          )}
        </div>
      ) : apps.length === 0 ? (
        <div className="mt-8">
          <Empty
            icon={<Handshake size={24} />}
            title="You haven't joined a team yet"
            body="Browse teams that need a coach and join in two clicks."
            action={<button onClick={() => setTab("find")} className="btn btn-primary">Find a team</button>}
          />
        </div>
      ) : (
        <>
          <Section title="Confirmed" items={groups.confirmed} onWithdraw={withdraw} />
          <Section title="Waiting for a reply" items={groups.pending} onWithdraw={withdraw} />
          <Section title="Past requests" items={groups.past} onWithdraw={withdraw} />
        </>
      )}

      <Modal open={!!joining} onClose={() => setJoining(null)} title="Join this team">
        {joining && (
          <div>
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="font-display text-lg font-bold">{joining.school_name}</p>
              <p className="text-sm text-muted">{joining.team_name ? `${joining.team_name} · ` : ""}{joining.sport}</p>
              <p className="mt-2 flex items-start gap-2 text-sm"><CalendarDays size={16} className="mt-0.5 shrink-0 text-muted" />{joining.schedule}</p>
            </div>
            <p className="mt-4 text-sm text-muted">
              We&rsquo;ll send your name and UCalgary email ({user.email}) to {joining.contact_name}.
            </p>
            <label className="mt-5 block text-sm font-medium" htmlFor="note">Add a note <span className="text-muted">(optional)</span></label>
            <textarea
              id="note" rows={3} className="field mt-1.5 resize-none" value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Your sport, your experience, nights you can't make"
            />
            <label className="mt-4 block text-sm font-medium" htmlFor="ucid">UCID <span className="text-muted">(optional)</span></label>
            <input id="ucid" className="field mt-1.5" value={ucid} onChange={(e) => setUcid(e.target.value)} placeholder="30123456" />
            <div className="mt-6 flex gap-3">
              <button onClick={() => setJoining(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={submitJoin} disabled={busy} className="btn btn-primary flex-1 disabled:opacity-60">
                {busy ? "Sending..." : "Send request"}
              </button>
            </div>
          </div>
        )}
      </Modal>
      <ToastView toast={toast} />
    </DashboardShell>
  );
}
