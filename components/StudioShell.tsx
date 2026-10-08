"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/Brand";
import { useAuth } from "@/components/AuthProvider";

const NAV = [
  { href: "/studio/create", label: "Create", icon: "✦" },
  { href: "/studio/library", label: "Library", icon: "♫" },
  { href: "/studio/explore", label: "Explore", icon: "◉" },
  { href: "/studio/tools", label: "Tools", icon: "◇" },
  { href: "/studio/pricing", label: "Credits", icon: "◆" },
];

export function StudioShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, loading, credits, logout } = useAuth();

  if (loading) return <div className="centerScreen"><div className="spinner" /></div>;

  if (!session) {
    return (
      <div className="lockedScreen">
        <Brand />
        <div className="lockedCard">
          <span className="eyebrow">BRUNIUH AI MUSIC STUDIO</span>
          <h1>Entra para abrir o Studio.</h1>
          <p>Cria música, guarda a tua Library e gere os teus créditos.</p>
          <div className="lockedActions">
            <Link className="btn primary" href="/login">Entrar</Link>
            <Link className="btn secondary" href="/signup">Criar conta</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="studioApp">
      <aside className="studioSidebar">
        <Brand compact />
        <nav className="studioNav" aria-label="Studio">
          {NAV.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={active ? "active" : ""}>
                <span className="navIcon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sideSpacer" />
        <div className="sideCredits">
          <span>YOUR BALANCE</span>
          <strong>{credits}</strong>
          <small>credits</small>
          <Link href="/studio/pricing">Buy credits</Link>
        </div>
        <div className="sideUser">
          <div className="avatar">B</div>
          <div className="sideUserText">
            <strong>{session.user.email}</strong>
            <button type="button" onClick={logout}>Sign out</button>
          </div>
        </div>
      </aside>

      <div className="studioMain">
        <header className="studioTopbar">
          <div className="mobileBrand"><Brand compact /></div>
          <div className="topbarRight">
            <Link href="/studio/pricing" className="creditPill">{credits} credits</Link>
            <Link href="/studio/account" className="avatar">B</Link>
          </div>
        </header>
        <div className="studioContent">{children}</div>

        <nav className="mobileNav">
          {NAV.slice(0,5).map(item => {
            const active = pathname.startsWith(item.href);
            return <Link key={item.href} href={item.href} className={active ? "active" : ""}><span>{item.icon}</span><small>{item.label}</small></Link>;
          })}
        </nav>
      </div>
    </div>
  );
}
