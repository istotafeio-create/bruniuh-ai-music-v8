"use client";
import { useState } from "react";
import { getBrowserSession,useAuth } from "@/components/AuthProvider";
import type { CreditPackId } from "@/lib/credits";

const plans=[
["mini","Mini","50","2,99 €","Até 5 gerações de duas músicas."],
["starter","Starter","100","4,99 €","Até 10 gerações de duas músicas."],
["creator","Creator","300","12,99 €","Até 30 gerações · 60 músicas."],
["pro","Pro","1.000","34,99 €","Até 100 gerações · 200 músicas."]
] as const;

export default function PricingPage(){
 const {credits}=useAuth();const [error,setError]=useState("");
 async function buy(pack:CreditPackId){setError("");const s=await getBrowserSession();if(!s)return;const r=await fetch("/api/stripe/checkout",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s.access_token}`},body:JSON.stringify({packId:pack})});const d=await r.json();if(!r.ok){setError(d.error||"Checkout error");return}window.location.href=d.url}
 return <div className="pageStack">
 <header className="pageHeader"><div><span className="eyebrow">CREDITS & BILLING</span><h1>Credits</h1><p>Pagamentos e packs ficam numa área própria.</p></div><div className="headerMetric"><strong>{credits}</strong><span>current balance</span></div></header>
 <div className="creditRule panel"><div><strong>10 credits</strong><span>2 songs up to 3 minutes</span></div><div><strong>15 credits</strong><span>2 songs up to 4 minutes</span></div><div><strong>20 credits</strong><span>2 songs up to 6 minutes</span></div><div><strong>30 credits</strong><span>2 songs up to 8 minutes</span></div></div>
 {error&&<div className="errorBox">{error}</div>}
 <div className="pricingCards">{plans.map(([id,name,credits,price,desc])=><article className={id==="creator"?"pricingCard featured":"pricingCard"} key={id}>{id==="creator"&&<span className="popular">MOST POPULAR</span>}<h3>{name}</h3><strong>{credits} credits</strong><div className="priceMoney">{price}</div><p>{desc}</p><button className="btn primary full" onClick={()=>buy(id as CreditPackId)}>Buy {name}</button></article>)}</div>
 <div className="panel billingNote"><h3>Transparent by design</h3><p>O utilizador vê claramente quantos créditos tem, quanto custa cada duração e quanto recebe por pack.</p></div>
 </div>
}
