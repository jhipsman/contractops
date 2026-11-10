import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  FileCheck2,
  ArrowDownLeft,
  Clock3,
  Check,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import { getDemoDashboard } from "@/lib/services/dashboard";
import { money } from "@/lib/utils";
import { ReimbursementTable } from "@/components/reimbursement-table";
import { Button } from "@/components/ui/button";
export default async function Dashboard() {
  const data = await getDemoDashboard();
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>A clearer view of what’s next.</h1>
          <p>Your contracts, reimbursements, and next steps—connected.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/requirements">
            <CalendarDays size={16} />
            Upcoming deadlines
          </Link>
        </Button>
      </div>
      <div className="demo-notice">
        <span className="demo-label">Fictional demo</span>
        <p>
          Explore a sample nonprofit workspace. No real contracts or client
          information.
        </p>
        <Link href="/about">
          What’s included <ArrowRight size={14} />
        </Link>
      </div>
      <section className="metrics" aria-label="Portfolio summary">
        <div className="metric">
          <div>
            <span>Active contracts</span>
            <FileCheck2 size={18} />
          </div>
          <strong>
            {data.contracts.length}
            <small>contracts</small>
          </strong>
          <p>
            {money(data.contracts.reduce((n, c) => n + c.amount, 0))} total
            contract value
          </p>
        </div>
        <div className="metric">
          <div>
            <span>Awaiting reimbursement</span>
            <ArrowDownLeft size={18} />
          </div>
          <strong>{money(data.outstanding)}</strong>
          <p>Across {data.reimbursements.length} open requests</p>
        </div>
        <div className="metric">
          <div>
            <span>Missing evidence</span>
            <CircleAlert size={18} />
          </div>
          <strong>
            {data.missingEvidence}
            <small>documents</small>
          </strong>
          <p>
            <span className="small-dot amber" />2 requests need supporting files
          </p>
        </div>
        <div className="metric">
          <div>
            <span>Due in the next 14 days</span>
            <Clock3 size={18} />
          </div>
          <strong>
            3<small>requirements</small>
          </strong>
          <p>Next deadline: November 12</p>
        </div>
      </section>
      <section className="attention-strip">
        <span className="attention-icon">
          <CircleAlert size={21} />
        </span>
        <div>
          <h2>One request needs a hand.</h2>
          <p>
            Family Support Services is missing 2 documents before its November
            15 deadline.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/contracts/family-support">
            Review blocker <ArrowRight size={15} />
          </Link>
        </Button>
      </section>
      <ReimbursementTable compact />
      <div className="dashboard-bottom">
        <section className="panel deadlines">
          <div className="panel-heading">
            <div>
              <h2>Coming up next</h2>
              <p>Ahead of the deadline. Out of your inbox.</p>
            </div>
            <Link className="text-link" href="/requirements">
              All requirements <ArrowUpRight size={15} />
            </Link>
          </div>
          {data.requirements.map((r, i) => (
            <Link href="/requirements" className="deadline-row" key={r.title}>
              <div className={`date-block ${i === 0 ? "date-urgent" : ""}`}>
                <span>NOV</span>
                <strong>{r.due.split(" ")[1]}</strong>
              </div>
              <div>
                <h3>{r.title}</h3>
                <p>{r.contract}</p>
              </div>
              <span className="deadline-owner">{r.owner.split(" ")[0]}</span>
              <ChevronRight size={16} />
            </Link>
          ))}
        </section>
        <section className="panel activity">
          <div className="panel-heading">
            <div>
              <h2>The latest activity</h2>
              <p>A shared picture of the work.</p>
            </div>
            <span className="subtle">Demo timeline</span>
          </div>
          <div className="activity-row">
            <span className="activity-icon green">
              <Check size={15} />
            </span>
            <div>
              <p>
                <strong>Elena Rivera</strong> completed evidence review
              </p>
              <span>Youth Pathways Initiative</span>
              <small>Today, 9:42 AM</small>
            </div>
          </div>
          <div className="activity-row">
            <span className="activity-icon">
              <ArrowUpRight size={15} />
            </span>
            <div>
              <p>
                <strong>Maya Chen</strong> marked a request as submitted
              </p>
              <span>Community Nutrition Access</span>
              <small>Yesterday, 3:18 PM</small>
            </div>
          </div>
          <div className="activity-row">
            <span className="activity-icon">
              <FileCheck2 size={15} />
            </span>
            <div>
              <p>
                <strong>James Wilson</strong> added an expense report
              </p>
              <span>Housing Stability Program</span>
              <small>Yesterday, 11:06 AM</small>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
