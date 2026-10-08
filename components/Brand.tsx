import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={compact ? "brand compact" : "brand"}>
      <Image src="/logo-bruniuhmusic.png" alt="BRUNIUHMUSIC" width={compact ? 42 : 58} height={compact ? 42 : 58} priority />
      <span className="brandText">
        <strong>BRUNIUHMUSIC</strong>
        <small>AI MUSIC</small>
      </span>
    </Link>
  );
}
