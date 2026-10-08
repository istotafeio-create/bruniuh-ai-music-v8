import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/components/Brand";

const FEATURES = [
  ["Two versions", "Cada geração cria duas versões diferentes da tua música."],
  ["Custom mode", "Controla letra, estilo, BPM, idioma, duração e instrumental."],
  ["Private library", "As tuas criações ficam organizadas na tua conta."],
  ["Creator tools", "Estrutura preparada para Extend, Remix, Cover, Stems e Live Mode."]
];

export default function Home() {
  return (
    <main className="publicSite">
      <header className="publicNav">
        <Brand />
        <nav>
          <Link href="#features">Features</Link>
          <Link href="/studio/explore">Explore</Link>
          <Link href="/studio/pricing">Pricing</Link>
        </nav>
        <div className="publicActions">
          <Link className="textLink" href="/login">Log in</Link>
          <Link className="btn primary" href="/signup">Start creating</Link>
        </div>
      </header>

      <section className="landingHero">
        <div className="landingBadge">BRUNIUHMUSIC · OFFICIAL AI MUSIC PLATFORM</div>
        <h1>Your next song<br/><span>starts with one idea.</span></h1>
        <p>Cria músicas completas com IA, com letra, voz, estilo, BPM e duração. Recebe duas versões por geração e mantém tudo organizado num Studio profissional.</p>
        <div className="heroActions">
          <Link className="btn primary large" href="/signup">Create your first song</Link>
          <Link className="btn secondary large" href="/studio/explore">Explore the platform</Link>
        </div>

        <div className="heroProductFrame">
          <div className="frameTop">
            <div className="windowDots"><i/><i/><i/></div>
            <span>BRUNIUHMUSIC AI MUSIC · Studio</span>
          </div>
          <div className="frameBody">
            <div className="frameSide">
              <span className="fakeBrand">BRUNIUH</span>
              <b>✦ Create</b><span>♫ Library</span><span>◉ Explore</span><span>◇ Tools</span><span>◆ Credits</span>
            </div>
            <div className="frameCenter">
              <span className="eyebrow">CREATE A SONG</span>
              <h3>Turn a feeling into music.</h3>
              <div className="fakeInput">Romantic Angolan Kizomba, 94 BPM, deep warm bass, emotional male vocal…</div>
              <div className="fakeFields"><span>Male vocal</span><span>English</span><span>3 min</span></div>
              <button>Create 2 songs · 10 credits</button>
            </div>
            <div className="frameRight">
              <div className="fakeTrack"><b>Version A</b><span>03:01</span><div className="miniWave"/></div>
              <div className="fakeTrack"><b>Version B</b><span>02:58</span><div className="miniWave"/></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="publicSection">
        <div className="sectionTitle">
          <span className="eyebrow">BUILT AS A REAL PRODUCT</span>
          <h2>Organizado para crescer contigo.</h2>
          <p>O Studio já nasce dividido por áreas reais, para podermos adicionar novas ferramentas sem transformar o site numa página confusa.</p>
        </div>
        <div className="featureGrid">
          {FEATURES.map(([title,text]) => <article key={title}><span>✦</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="publicSection">
        <div className="sectionTitle">
          <span className="eyebrow">MADE FOR REAL CREATORS</span>
          <h2>Music that looks like a real release.</h2>
          <p>O branding e a apresentação visual também contam. A plataforma já está preparada para mostrar criações com artwork próprio.</p>
        </div>
        <div className="showcaseGrid">
          {[
            ["/covers/still-my-home.svg","Still My Home","Romantic Kizomba"],
            ["/covers/neon-nights.svg","Neon Nights","Afro House"],
            ["/covers/amore-mio.svg","Amore Mio","Afro Pop"],
            ["/covers/golden-hour.svg","Golden Hour","Afrobeat"]
          ].map(([src,title,style]) => (
            <article className="showcaseCard" key={title}>
              <Image src={src} alt={`${title} cover`} width={600} height={450} />
              <div><strong>{title}</strong><span>{style}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="publicCta">
        <div>
          <span className="eyebrow">10 WELCOME CREDITS</span>
          <h2>Experimenta duas músicas.</h2>
          <p>Cria a tua conta e usa os créditos de boas-vindas na primeira geração.</p>
        </div>
        <Link className="btn primary large" href="/signup">Open the Studio</Link>
      </section>

      <footer className="publicFooter">
        <Brand compact />
        <span>BRUNIUHMUSIC AI MUSIC · Beta</span>
        <div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      </footer>
    </main>
  );
}
