"use client";
import { useAuth } from "@/components/AuthProvider";
export default function AccountPage(){const {session,credits,logout}=useAuth();return <div className="pageStack">
<header className="pageHeader"><div><span className="eyebrow">PROFILE & SETTINGS</span><h1>Account</h1><p>Dados de conta separados do resto do Studio.</p></div></header>
<div className="accountGrid">
<section className="panel accountPanel"><div className="profileAvatar">B</div><div><h2>BRUNIUH AI user</h2><p>{session?.user.email}</p></div></section>
<section className="panel settingsList"><div><span>Email</span><strong>{session?.user.email}</strong></div><div><span>Credits</span><strong>{credits}</strong></div><div><span>Plan</span><strong>Pay as you go</strong></div><div><span>Status</span><strong>Active</strong></div></section>
</div>
<button className="btn danger" onClick={logout}>Sign out</button>
</div>}
