const tools=[
["Extend","Continue a song beyond its current ending.","Planned"],
["Remix","Create a new version from an existing track.","Planned"],
["Cover","Reinterpret a song with a new direction.","Planned"],
["Upload Audio","Use your own audio as a starting point.","Planned"],
["Stems","Separate vocals and instrumental parts.","Planned"],
["Live Mode","Fast creation interface for TikTok and YouTube Live.","Planned"]
];
export default function ToolsPage(){return <div className="pageStack">
<header className="pageHeader"><div><span className="eyebrow">CREATOR SUITE</span><h1>Tools</h1><p>Ferramentas futuras ficam aqui — não misturadas com Create.</p></div></header>
<div className="toolsCards">{tools.map(([name,desc,status])=><article className="toolProduct" key={name}><div className="toolIcon">◇</div><div><h3>{name}</h3><p>{desc}</p></div><span className="statusTag">{status}</span></article>)}</div>
<div className="panel roadmap"><span className="eyebrow">ARCHITECTURE</span><h2>Preparado para crescer.</h2><p>Quando adicionarmos uma ferramenta, ela ganha a sua própria área e fluxo. O Studio não precisa de ser reconstruído nem ficar tudo numa página.</p></div>
</div>}
