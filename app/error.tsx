"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="lockedScreen">
      <div className="lockedCard">
        <span className="eyebrow">SYSTEM</span>
        <h1>Something went wrong.</h1>
        <p>O Studio encontrou um erro inesperado. Podes tentar novamente sem perder a estrutura da conta.</p>
        <button className="btn primary" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
