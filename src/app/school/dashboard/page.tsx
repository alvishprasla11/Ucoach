"use client";

import { useCallback, useEffect, useState } from "react";
import type { Application, PostingWithStats } from "@/lib/db";
import {
  DashboardShell, Badge, Stat, Empty, Chips, Modal, ToastView, useToast,
  useRequireUser, api, LEVELS, SPORTS,
} from "../../../components/dashboard";
import {
  Plus, CalendarDays, Users, Mail, ChevronDown, Trash2, Lock, LockOpen, Loader2, ClipboardList,
  Check, X, UserRound,
} from "../../../components/icons";
import { saveSession } from "../../../lib/session";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}${m ? ":" + String(m).padStart(2, "0") : ""} ${h < 12 ? "am" : "pm"}`;
};

export default function SchoolDashboard() {
  const user = useRequireUser("school");
  const { toast, show } = useToast();

  const [postings, setPostings] = useState<PostingWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);
  const [requests, setRequests] = useState<Record<number, Application[]>>({});

  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    school_name: "", sport: "Basketball", school_level: "High School (10-12)", team_name: "",
    num: 1, days: [] as string[], start: "16:00", end: "17:30", from: "",
    description: "", contact_name: "", contact_email: "",
  });

  const email = user?.email;

  const load = useCallback(async () => {
    if (!email) return;
    try {
      const r = await api<{ postings: PostingWithStats[] }>(`/api/postings?school_email=${encodeURIComponent(email)}`);
      setPostings(r.postings);
    } catch {
      show("error", "Couldn't load your postings. Refresh to try again.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // Fetch on mount: state is only set after the await, not synchronously.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);

  const loadRequests = async (id: number) => {
    if (!email) return;
    try {
      const r = await api<{ applications: Application[] }>(`/api/postings/${id}/applications?school_email=${encodeURIComponent(email)}`);
      setRequests((m) => ({ ...m, [id]: r.applications }));
    } catch {
      show("error", "Couldn't load requests");
    }
  };

  const toggle = (id: number) => {
    if (open === id) return setOpen(null);
    setOpen(id);
    void loadRequests(id);
  };

  if (!user) return null;

  const openForm = () => {
    setF((x) => ({
      ...x,
      school_name: x.school_name || user.name,
      contact_name: x.contact_name || user.contactName || "",
      contact_email: x.contact_email || user.email,
    }));
    setFormOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (f.days.length === 0) return show("error", "Pick at least one practice day");
    if (f.end <= f.start) return show("error", "End time must be after the start time");
    const schedule =
      `${DAYS.filter((d) => f.days.includes(d)).join(", ")} · ${fmtTime(f.start)} to ${fmtTime(f.end)}` +
      (f.from ? ` · from ${new Date(f.from + "T12:00").toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}` : "");
    setBusy(true);
    try {
      await api("/api/postings", {
        method: "POST",
        body: JSON.stringify({
          school_name: f.school_name, school_email: user.email, school_level: f.school_level,
          sport: f.sport, team_name: f.team_name, description: f.description, schedule,
          contact_name: f.contact_name, contact_email: f.contact_email, num_coaches_needed: f.num,
        }),
      });
      saveSession({ contactName: f.contact_name });
      setFormOpen(false);
      setF((x) => ({ ...x, team_name: "", description: "", days: [], num: 1 }));
      show("ok", "Posting is live. Athletes can join now.");
      await load();
    } catch (err) {
      show("error", err instanceof Error ? err.message : "Couldn't publish the posting");
    } finally {
      setBusy(false);
    }
  };

  const decide = async (p: PostingWithStats, a: Application, status: "accepted" | "declined") => {
    try {
      await api(`/api/applications/${a.id}`, {
        method: "PATCH", body: JSON.stringify({ role: "school", email: user.email, status }),
      });
      show("ok", status === "accepted" ? `${a.student_name} is confirmed` : `${a.student_name} declined`);
      await Promise.all([load(), loadRequests(p.id)]);
    } catch (err) {
      show("error", err instanceof Error ? err.message : "Couldn't update");
    }
  };

  const setStatus = async (p: PostingWithStats, status: "open" | "closed") => {
    try {
      await api(`/api/postings/${p.id}`, { method: "PATCH", body: JSON.stringify({ school_email: user.email, status }) });
      show("ok", status === "closed" ? "Posting closed to new athletes" : "Posting reopened");
      await load();
    } catch (err) {
      show("error", err instanceof Error ? err.message : "Couldn't update");
    }
  };

  const remove = async (p: PostingWithStats) => {
    if (!confirm("Delete this posting and all its requests? This can't be undone.")) return;
    try {
      await api(`/api/postings/${p.id}?school_email=${encodeURIComponent(user.email)}`, { method: "DELETE" });
      show("ok", "Posting deleted");
      await load();
    } catch (err) {
      show("error", err instanceof Error ? err.message : "Couldn't delete");
    }
  };

  const toggleDay = (d: string) =>
    setF((x) => ({ ...x, days: x.days.includes(d) ? x.days.filter((v) => v !== d) : [...x.days, d] }));

  const totalPending = postings.reduce((n, p) => n + p.pending_count, 0);
  const totalConfirmed = postings.reduce((n, p) => n + p.accepted_count, 0);

  return (
    <DashboardShell user={user} roleLabel="School">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Your postings</h1>
          <p className="mt-1 text-muted">Teams from {user.name} that are looking for a coach.</p>
        </div>
        <button onClick={openForm} className="btn btn-primary"><Plus size={18} /> New posting</button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Postings" value={postings.length} />
        <Stat label="Need your reply" value={totalPending} />
        <Stat label="Coaches confirmed" value={totalConfirmed} />
      </div>

      {loading ? (
        <p className="flex items-center justify-center gap-2 py-20 text-muted"><Loader2 className="animate-spin" size={18} /> Loading</p>
      ) : postings.length === 0 ? (
        <div className="mt-8">
          <Empty
            icon={<ClipboardList size={24} />}
            title="Post your first team"
            body="Pick a sport, choose practice days and publish. It takes about a minute."
            action={<button onClick={openForm} className="btn btn-primary"><Plus size={18} /> New posting</button>}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {postings.map((p) => {
            const isOpen = open === p.id;
            const reqs = requests[p.id];
            const filled = p.spots_left === 0;
            return (
              <article key={p.id} className="rounded-2xl border border-line bg-white">
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-red">{p.sport} · {p.school_level.split(" (")[0]}</p>
                      <h3 className="mt-1 text-xl font-bold">{p.team_name || `${p.sport} team`}</h3>
                    </div>
                    <div className="flex gap-2">
                      {p.status === "closed" ? <Badge tone="grey">Closed</Badge> : filled ? <Badge tone="green">Filled</Badge> : <Badge tone="amber">Open</Badge>}
                      {p.pending_count > 0 && <Badge tone="red">{p.pending_count} new</Badge>}
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    <li className="flex items-start gap-2.5"><CalendarDays size={16} className="mt-0.5 shrink-0 text-muted" />{p.schedule}</li>
                    <li className="flex items-center gap-2.5">
                      <Users size={16} className="shrink-0 text-muted" />
                      {p.accepted_count} of {p.num_coaches_needed} coach{p.num_coaches_needed === 1 ? "" : "es"} confirmed
                    </li>
                  </ul>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-2">
                    <div className="h-full rounded-full bg-red transition-all" style={{ width: `${Math.min(100, (p.accepted_count / p.num_coaches_needed) * 100)}%` }} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-5 py-3">
                  <button
                    onClick={() => toggle(p.id)}
                    aria-expanded={isOpen}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-red"
                  >
                    Athletes ({p.pending_count + p.accepted_count})
                    <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    {p.status === "open" ? (
                      <button onClick={() => setStatus(p, "closed")} className="inline-flex items-center gap-1.5 hover:text-ink"><Lock size={14} /> Close</button>
                    ) : (
                      <button onClick={() => setStatus(p, "open")} className="inline-flex items-center gap-1.5 hover:text-ink"><LockOpen size={14} /> Reopen</button>
                    )}
                    <button onClick={() => remove(p)} className="inline-flex items-center gap-1.5 hover:text-red"><Trash2 size={14} /> Delete</button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-line bg-paper px-5 py-4">
                    {!reqs ? (
                      <p className="py-4 text-center text-sm text-muted">Loading</p>
                    ) : reqs.filter((a) => a.status !== "withdrawn").length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted">No one has joined yet. Athletes see this posting right now.</p>
                    ) : (
                      <ul className="divide-y divide-line">
                        {reqs.filter((a) => a.status !== "withdrawn").map((a) => (
                          <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                            <div className="min-w-0">
                              <p className="flex items-center gap-2 font-semibold"><UserRound size={16} className="text-muted" />{a.student_name}</p>
                              <a href={`mailto:${a.student_email}`} className="link-draw inline-flex items-center gap-1.5 text-sm text-muted"><Mail size={13} />{a.student_email}</a>
                              {a.ucid && <span className="ml-3 text-sm text-muted">UCID {a.ucid}</span>}
                              {a.message && <p className="mt-1 text-sm">&ldquo;{a.message}&rdquo;</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              {a.status === "accepted" && <Badge tone="green"><Check size={13} /> Confirmed</Badge>}
                              {a.status === "declined" && <Badge tone="grey">Declined</Badge>}
                              {a.status !== "accepted" && (
                                <button onClick={() => decide(p, a, "accepted")} disabled={filled} className="btn btn-primary !px-3 !py-1.5 text-sm disabled:opacity-50">Accept</button>
                              )}
                              {a.status === "pending" && (
                                <button onClick={() => decide(p, a, "declined")} className="btn btn-ghost !px-3 !py-1.5 text-sm"><X size={14} /> Decline</button>
                              )}
                              {a.status === "accepted" && (
                                <button onClick={() => decide(p, a, "declined")} className="text-sm text-muted hover:text-red">Remove</button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="New coaching posting">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium">Sport</p>
            <Chips label="Sport" options={[...SPORTS]} value={f.sport as (typeof SPORTS)[number]} onChange={(v) => setF({ ...f, sport: v })} />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">School level</p>
            <Chips label="School level" options={[...LEVELS]} value={f.school_level as (typeof LEVELS)[number]} onChange={(v) => setF({ ...f, school_level: v })} />
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="team" className="mb-1.5 block text-sm font-medium">Team name <span className="text-muted">(optional)</span></label>
              <input id="team" className="field" placeholder="Junior boys basketball" value={f.team_name} onChange={(e) => setF({ ...f, team_name: e.target.value })} />
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium">Coaches needed</p>
              <div className="flex items-center gap-1 rounded-[0.625rem] border border-line bg-white p-1">
                <button type="button" aria-label="Fewer coaches" className="h-9 w-9 rounded-lg text-lg hover:bg-paper-2" onClick={() => setF({ ...f, num: Math.max(1, f.num - 1) })}>−</button>
                <span className="w-8 text-center font-semibold" aria-live="polite">{f.num}</span>
                <button type="button" aria-label="More coaches" className="h-9 w-9 rounded-lg text-lg hover:bg-paper-2" onClick={() => setF({ ...f, num: Math.min(10, f.num + 1) })}>+</button>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Practice days</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Practice days">
              {DAYS.map((d) => (
                <button key={d} type="button" aria-pressed={f.days.includes(d)} onClick={() => toggleDay(d)}
                  className={`h-10 w-14 rounded-lg border text-sm font-medium transition-colors ${f.days.includes(d) ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}>
                  {d}
                </button>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div><label htmlFor="st" className="mb-1.5 block text-xs text-muted">Starts</label><input id="st" type="time" className="field" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} required /></div>
              <div><label htmlFor="en" className="mb-1.5 block text-xs text-muted">Ends</label><input id="en" type="time" className="field" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} required /></div>
              <div><label htmlFor="fr" className="mb-1.5 block text-xs text-muted">From <span>(optional)</span></label><input id="fr" type="date" className="field" value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} /></div>
            </div>
          </div>

          <div>
            <label htmlFor="desc" className="mb-1.5 block text-sm font-medium">What will the coach do?</label>
            <textarea id="desc" required rows={3} className="field resize-none" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })}
              placeholder="Run drills, help with game days. No experience needed beyond playing the sport." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cn" className="mb-1.5 block text-sm font-medium">Contact person</label>
              <input id="cn" required className="field" placeholder="Athletic director" value={f.contact_name} onChange={(e) => setF({ ...f, contact_name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="ce" className="mb-1.5 block text-sm font-medium">Contact email</label>
              <input id="ce" required type="email" className="field" value={f.contact_email} onChange={(e) => setF({ ...f, contact_email: e.target.value })} />
            </div>
          </div>
          <div>
            <label htmlFor="sn" className="mb-1.5 block text-sm font-medium">School name</label>
            <input id="sn" required className="field" value={f.school_name} onChange={(e) => setF({ ...f, school_name: e.target.value })} />
          </div>

          <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-60">{busy ? "Publishing..." : "Publish posting"}</button>
        </form>
      </Modal>
      <ToastView toast={toast} />
    </DashboardShell>
  );
}
