import Image from "next/image";

const items = [
  ["/covers/still-my-home.svg","Still My Home","Romantic Kizomba","Kizomba"],
  ["/covers/neon-nights.svg","Neon Nights","Afro House","Afro House"],
  ["/covers/amore-mio.svg","Amore Mio","Afro Pop","Afro Pop"],
  ["/covers/golden-hour.svg","Golden Hour","Afrobeat","Afrobeat"],
  ["/covers/besame.svg","Bésame","Latin Afro","Latin"],
  ["/covers/saranghae.svg","Saranghae","Global Pop","Global"]
];

export default function ExplorePage() {
  return (
    <div className="pageStack">
      <header className="pageHeader">
        <div>
          <span className="eyebrow">DISCOVER</span>
          <h1>Explore</h1>
          <p>Tendências, playlists e criadores numa área separada da tua Library.</p>
        </div>
      </header>

      <div className="exploreHero panel">
        <div>
          <span className="eyebrow">FEATURED</span>
          <h2>Music made inside BRUNIUHMUSIC AI MUSIC.</h2>
          <p>Esta estrutura pode crescer no futuro para charts, perfis públicos, follows e playlists.</p>
        </div>
      </div>

      <div className="exploreGrid">
        {items.map(([src,title,style,tag]) => (
          <article className="exploreCard" key={title}>
            <div className="realArtwork">
              <Image src={src} alt={`${title} cover`} width={600} height={450} />
              <span>{tag}</span>
            </div>
            <div className="exploreBody">
              <strong>{title}</strong>
              <span>{style}</span>
              <button disabled title="Ativamos o áudio público quando o Explore real estiver ligado.">▶ Preview</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
