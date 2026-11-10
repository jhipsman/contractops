"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Search, SlidersHorizontal } from "lucide-react";
import { reimbursements } from "@/lib/demo";
import { money } from "@/lib/utils";
import { StatusBadge } from "./status-badge";
export function ReimbursementTable({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All requests");
  const rows = reimbursements.filter(
    (r) =>
      `${r.contract} ${r.id}`.toLowerCase().includes(query.toLowerCase()) &&
      (filter === "All requests" || r.status === filter),
  );
  return (
    <section className="panel requests-panel">
      <div className="panel-heading">
        <div>
          <h2>{compact ? "Reimbursement pipeline" : "Reimbursements"}</h2>
          <p>From preparation to payment, all in one place.</p>
        </div>
        {compact && (
          <Link className="text-link" href="/reimbursements">
            View all <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
      <div className="table-toolbar">
        <div className="tabs" role="group" aria-label="Filter requests">
          {["All requests", "Blocked", "Submitted"].map((tab) => (
            <button
              key={tab}
              aria-pressed={filter === tab}
              className={filter === tab ? "tab-active" : ""}
              onClick={() => setFilter(tab)}
            >
              {tab}
              {tab === "All requests" && <span>{reimbursements.length}</span>}
            </button>
          ))}
        </div>
        <div className="table-tools">
          <label className="search">
            <Search size={16} />
            <input
              aria-label="Search reimbursements"
              placeholder="Find a request…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <SlidersHorizontal
            size={16}
            className="filter-decoration"
            aria-hidden="true"
          />
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Contract / period</th>
              <th>Amount requested</th>
              <th>Status</th>
              <th>Evidence</th>
              <th>Due date</th>
              <th>Owner</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link
                    href={`/contracts/${row.contractId}`}
                    className="table-title"
                  >
                    {row.contract}
                  </Link>
                  <small>
                    {row.id} <span>·</span> {row.period}
                  </small>
                </td>
                <td className="amount">{money(row.amount)}</td>
                <td>
                  <StatusBadge status={row.status} />
                </td>
                <td>
                  <span
                    className={`evidence ${row.evidence === "7 of 7" || row.evidence === "5 of 5" ? "evidence-complete" : ""}`}
                  >
                    {row.evidence}
                  </span>
                  <small>documents</small>
                </td>
                <td>
                  {row.due}
                  <small>2026</small>
                </td>
                <td>
                  <span
                    className="avatar avatar-small"
                    aria-label={`Owner ${row.owner}`}
                  >
                    {row.owner}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && (
          <div className="empty-state">
            <Search size={26} />
            <h3>No matching requests</h3>
            <p>Try another contract name or choose All requests.</p>
            <button
              className="text-link"
              onClick={() => {
                setQuery("");
                setFilter("All requests");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      <div className="table-footer">
        Showing {rows.length} of {reimbursements.length} requests
        <span>All amounts in USD</span>
      </div>
    </section>
  );
}
