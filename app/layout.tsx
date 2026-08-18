import type { Metadata } from "next";
import "./styles.css";
export const metadata: Metadata = { title: "JamQuest — find your next live moment", description: "Social concert discovery and live-music quests." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body suppressHydrationWarning>{children}</body></html>; }
