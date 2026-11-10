"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  Files,
  ReceiptText,
  ListChecks,
  FolderOpen,
  CheckSquare2,
  Settings2,
  ChevronsUpDown,
  ArrowUpRight,
  Menu,
  X,
  Hexagon,
  ShieldCheck,
} from "lucide-react";
import { demoOrganization } from "@/lib/demo";
const navigation = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/contracts", label: "Contracts", icon: Files },
  { href: "/reimbursements", label: "Reimbursements", icon: ReceiptText },
  { href: "/requirements", label: "Requirements", icon: ListChecks },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/tasks", label: "Tasks", icon: CheckSquare2 },
];
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 850px)");
    const sync = () => {
      setMobile(media.matches);
      if (!media.matches) setOpen(false);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!open || !mobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sidebarRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
      if (event.key === "Tab") {
        const elements = [
          toggleRef.current,
          ...Array.from(
            sidebarRef.current?.querySelectorAll<HTMLElement>("a, button") ??
              [],
          ),
        ].filter((element): element is HTMLElement => !!element);
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
      toggleRef.current?.focus();
    };
  }, [open, mobile]);
  return (
    <div className="app-shell">
      <button
        ref={toggleRef}
        className="mobile-toggle"
        aria-controls="workspace-navigation"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
      {open && (
        <button
          tabIndex={-1}
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        id="workspace-navigation"
        ref={sidebarRef}
        inert={mobile && !open}
        className={`sidebar ${open ? "sidebar-open" : ""}`}
      >
        <Link href="/dashboard" className="brand">
          <span className="brand-mark">
            <Hexagon size={23} strokeWidth={2.5} />
          </span>
          Contract<span>Ops</span>
        </Link>
        <div className="organization">
          <span className="organization-monogram">HC</span>
          <div>
            <strong>Harbor Community</strong>
            <small>Nonprofit workspace</small>
          </div>
          <ChevronsUpDown size={14} />
        </div>
        <nav aria-label="Main navigation">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`nav-item ${pathname.startsWith(href) ? "nav-active" : ""}`}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-note">
            <ShieldCheck size={19} />
            <strong>A little more coordinated.</strong>
            <p>One place for the details that keep your mission moving.</p>
            <Link href="/about">
              About this demo <ArrowUpRight size={13} />
            </Link>
          </div>
          <Link
            href="/settings"
            className={`nav-item ${pathname === "/settings" ? "nav-active" : ""}`}
          >
            <Settings2 size={19} />
            Organization settings
          </Link>
          <div className="profile">
            <span className="avatar">MC</span>
            <div>
              <strong>Maya Chen</strong>
              <small>Finance director · Demo</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-column" inert={mobile && open}>
        <header className="topbar">
          <span>{demoOrganization}</span>
          <span className="demo-chip">
            <span />
            Demo workspace
          </span>
        </header>
        <main id="main-content">{children}</main>
        <footer className="footer">
          Made for the work behind the mission.
          <span>ContractOps · Fictional demonstration data</span>
        </footer>
      </div>
    </div>
  );
}
