import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function NotFound() {
  return (
    <main className="lockedScreen">
      <Brand />
      <div className="lockedCard">
        <span className="eyebrow">404</span>
        <h1>Page not found.</h1>
        <p>Esta página não existe ou foi movida.</p>
        <div className="lockedActions">
          <Link className="btn primary" href="/">Home</Link>
          <Link className="btn secondary" href="/studio/create">Open Studio</Link>
        </div>
      </div>
    </main>
  );
}
