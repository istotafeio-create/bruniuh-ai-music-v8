import { StudioShell } from "@/components/StudioShell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <StudioShell>{children}</StudioShell>;
}
