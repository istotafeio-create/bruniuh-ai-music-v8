"use client";
import Image from "next/image";
import { useEffect,useState } from "react";
import { getBrowserSession } from "@/components/AuthProvider";

type Song={id:string;title:string;style:string;durationSeconds:number;createdAt:string;audioUrl:string|null};

const ARTWORKS=["/covers/still-my-home.svg","/covers/neon-nights.svg","/covers/amore-mio.svg","/covers/golden-hour.svg","/covers/besame.svg","/covers/saranghae.svg"];

export default function LibraryPage(){
 const [songs,setSongs]=useState<Song[]>([]),[loading,setLoading]=useState(true),[q,setQ]=useState("");
 async function refresh(){setLoading(true);const s=await getBrowserSession();if(!s)return;const r=await fetch("/api/library",{headers:{Authorization:`Bearer ${s.access_token}`}});if(r.ok){const d=await r.json();setSongs(d.songs||[])}setLoading(false)}
 useEffect(()=>{refresh()},[]);
 const filtered=songs.filter(s=>(s.title+" "+s.style).toLowerCase().includes(q.toLowerCase()));
 return <div className="pageStack">
  <header className="pageHeader"><div><span className="eyebrow">YOUR COLLECTION</span><h1>Library</h1><p>Uma área dedicada apenas às tuas músicas.</p></div><button className="btn secondary" onClick={refresh}>Refresh</button></header>
  <div className="libraryToolbar"><input className="input" placeholder="Search by title or style…" value={q} onChange={e=>setQ(e.target.value)}/><span>{filtered.length} songs</span></div>
  {loading?<div className="panel emptyState"><div className="spinner"/></div>:!filtered.length?<div className="panel emptyState"><div className="disc">♫</div><h3>No songs here yet</h3><p>Cria a primeira música na aba Create.</p></div>:
  <div className="libraryCards">{filtered.map((song,i)=><article className="librarySong" key={song.id}><div className="libraryArtwork"><Image src={ARTWORKS[i%ARTWORKS.length]} alt={`${song.title} artwork`} width={600} height={450}/></div><div className="librarySongBody"><strong>{song.title}</strong><p>{song.style}</p><div className="songMeta"><span>{Math.round(song.durationSeconds/60)} min</span><span>{new Date(song.createdAt).toLocaleDateString()}</span></div>{song.audioUrl?<><audio controls preload="none" src={song.audioUrl}/><a className="btn secondary full" href={song.audioUrl} download>Download audio</a></>:<small>Refresh to renew audio link</small>}</div></article>)}</div>}
 </div>
}
