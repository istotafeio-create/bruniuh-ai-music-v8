"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getBrowserSession, useAuth } from "@/components/AuthProvider";
import { creditCostForDuration } from "@/lib/credits";

export default function CreatePage() {
  const { credits, refreshCredits } = useAuth();

  const [mode, setMode] = useState<"simple" | "custom">("simple");
  const [title, setTitle] = useState("You Are Still My Home");

  const [style, setStyle] = useState(
    "Romantic Angolan Kizomba, 94 BPM, deep warm bass, emotional male vocal, modern polished production"
  );

  const [lyrics, setLyrics] = useState(
    "[Chorus]\nYou are still my home\nEven when the lights are gone"
  );

  const [voice, setVoice] = useState(
    "ONE male lead singer, close-mic, centered"
  );

  const [language, setLanguage] = useState("English");
  const [bpm, setBpm] = useState(94);
  const [duration, setDuration] = useState(180);

  const [negative, setNegative] = useState(
    "No backing vocals, no choir, no doubles, no harsh EDM"
  );

  const [instrumental, setInstrumental] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const cost = useMemo(
    () => creditCostForDuration(duration),
    [duration]
  );

  async function generate() {
    setError("");
    setLoading(true);

    try {
      const current = await getBrowserSession();

      if (!current) {
        throw new Error("Faz login primeiro.");
      }

      const r = await fetch("/api/music", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${current.access_token}`,
        },
        body: JSON.stringify({
          title: mode === "custom" ? title : "BRUNIUH AI Song",
          prompt: style,
          lyrics:
            mode === "custom" && !instrumental
              ? lyrics
              : "",
          voice,
          language,
          bpm,
          durationSeconds: duration,
          instrumental,
          negativePrompt: negative,
        }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || "Falha na geração.");
      }

      setResults(d.songs || []);
      await refreshCredits();
    } catch (e: any) {
      setError(e?.message || "Erro inesperado.");
      await refreshCredits();
    } finally {
      setLoading(false);
    }
  }

  const presets = [
    [
      "Kizomba",
      "Romantic Angolan Kizomba, 94 BPM, deep warm bass, emotional male vocal, modern polished production",
    ],
    [
      "Afrobeat",
      "Modern Afrobeat, 108 BPM, bouncy groove, catchy hook, rich bass, polished international production",
    ],
    [
      "Afro House",
      "Modern Afro House, 124 BPM, African percussion, deep sub bass, hypnotic synths, powerful hook",
    ],
    [
      "Kompa",
      "Modern Kompa, 110 BPM, warm bass guitar, clean keys, smooth dance groove, emotional lead vocal",
    ],
  ];

  return (
    <div className="pageStack">
      <header className="pageHeader">
        <div>
          <span className="eyebrow">AI MUSIC GENERATOR</span>
          <h1>Create</h1>
          <p>
            Uma área só para criação. Nada misturado com Library
            ou pagamentos.
          </p>
        </div>

        <div className="headerMetric">
          <strong>{credits}</strong>
          <span>credits available</span>
        </div>
      </header>

      <div className="createLayout">
        <section className="panel createPanel">
          <div className="tabs">
            <button
              className={mode === "simple" ? "active" : ""}
              onClick={() => setMode("simple")}
            >
              Simple
            </button>

            <button
              className={mode === "custom" ? "active" : ""}
              onClick={() => setMode("custom")}
            >
              Custom
            </button>
          </div>

          <div className="presetRow">
            {presets.map(([name, prompt]) => (
              <button
                key={name}
                onClick={() => setStyle(prompt)}
              >
                {name}
              </button>
            ))}
          </div>

          {mode === "simple" ? (
            <div className="formStack">
              <div className="fieldGroup">
                <label>Describe your song</label>

                <textarea
                  className="input textareaXL"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                />
              </div>

              <div className="fieldGroup">
                <label>Duration</label>

                <select
                  className="input"
                  value={duration}
                  onChange={(e) =>
                    setDuration(Number(e.target.value))
                  }
                >
                  <option value={60}>1 minute</option>
                  <option value={120}>2 minutes</option>
                  <option value={180}>3 minutes</option>
                  <option value={240}>4 minutes</option>
                  <option value={360}>6 minutes</option>
                  <option value={480}>8 minutes</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="formStack">
              <div className="grid2">
                <div className="fieldGroup">
                  <label>Title</label>

                  <input
                    className="input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="fieldGroup">
                  <label>Duration</label>

                  <select
                    className="input"
                    value={duration}
                    onChange={(e) =>
                      setDuration(Number(e.target.value))
                    }
                  >
                    <option value={60}>1 minute</option>
                    <option value={120}>2 minutes</option>
                    <option value={180}>3 minutes</option>
                    <option value={240}>4 minutes</option>
                    <option value={360}>6 minutes</option>
                    <option value={480}>8 minutes</option>
                  </select>
                </div>
              </div>

              <div className="fieldGroup">
                <label>Lyrics</label>

                <textarea
                  className="input textareaLyrics"
                  disabled={instrumental}
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                />
              </div>

              <div className="fieldGroup">
                <label>Style of music</label>

                <textarea
                  className="input textareaStyle"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                />
              </div>

              <div className="grid3">
                <div className="fieldGroup">
                  <label>Voice</label>

                  <input
                    className="input"
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                  />
                </div>

                <div className="fieldGroup">
                  <label>Language</label>

                  <select
                    className="input"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option>English</option>
                    <option>Portuguese</option>
                    <option>French</option>
                    <option>Spanish</option>
                    <option>Korean</option>
                    <option>Kriolu</option>
                  </select>
                </div>

                <div className="fieldGroup">
                  <label>BPM</label>

                  <input
                    className="input"
                    type="number"
                    value={bpm}
                    onChange={(e) =>
                      setBpm(Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="instrumentalBox">
                <button
                  className={
                    instrumental ? "switch on" : "switch"
                  }
                  onClick={() =>
                    setInstrumental((v) => !v)
                  }
                >
                  <i />
                </button>

                <div>
                  <strong>Instrumental</strong>
                  <span>Generate without vocals.</span>
                </div>
              </div>

              <div className="fieldGroup">
                <label>Negative prompt</label>

                <input
                  className="input"
                  value={negative}
                  onChange={(e) => setNegative(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="errorBox">{error}</div>
          )}

          <div className="createFooter">
            <div>
              <strong>{cost} credits</strong>
              <span>2 songs generated</span>
            </div>

            <button
              className="btn primary large"
              disabled={
                loading ||
                credits < cost ||
                style.trim().length < 4
              }
              onClick={generate}
            >
              {loading
                ? "GENERATING…"
                : "✦ CREATE 2 SONGS"}
            </button>
          </div>
        </section>

        <aside className="panel resultPanel">
          <div className="panelTitle">
            <div>
              <span className="eyebrow">OUTPUT</span>
              <h2>Generation</h2>
            </div>

            <span>
              {results.length
                ? `${results.length} ready`
                : "Waiting"}
            </span>
          </div>

          {loading ? (
            <div className="generatingState">
              <div className="loaderWave">
                {Array.from({ length: 22 }).map((_, i) => (
                  <i key={i} />
                ))}
              </div>

              <h3>Creating two versions…</h3>

              <p>
                Quando terminar, as músicas são guardadas
                automaticamente na Library.
              </p>
            </div>
          ) : results.length ? (
            <div className="resultList">
              {results.map((song: any, i: number) => (
                <article
                  key={song.id}
                  className="resultCard"
                >
                  <div className="resultArtwork">
                    <Image
                      src={
                        i % 2 === 0
                          ? "/covers/still-my-home.svg"
                          : "/covers/neon-nights.svg"
                      }
                      alt={`${song.title} artwork`}
                      width={240}
                      height={180}
                    />
                  </div>

                  <div className="resultInfo">
                    <strong>{song.title}</strong>

                    <span>
                      {Math.round(
                        (song.durationSeconds || 180) / 60
                      )}{" "}
                      min · AI generated
                    </span>

                    {song.audioUrl && (
                      <audio
                        controls
                        preload="none"
                        src={song.audioUrl}
                      />
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="emptyState">
              <div className="disc">♫</div>
              <h3>Ready when you are</h3>
              <p>
                Configura a música à esquerda. Aqui aparecem
                apenas as duas versões geradas.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}