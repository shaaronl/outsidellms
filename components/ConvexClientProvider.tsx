"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const deploymentUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = deploymentUrl ? new ConvexReactClient(deploymentUrl) : null;

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  if (!client) {
    return <main className="backend-configuration-error" role="alert"><section><p>BACKEND NOT CONFIGURED</p><h1>JamQuest needs its Convex deployment URL.</h1><span>Add <code>NEXT_PUBLIC_CONVEX_URL</code> for this environment, then rebuild. No account actions are available until the connection is configured.</span></section></main>;
  }
  return <ConvexAuthProvider client={client}>{children}</ConvexAuthProvider>;
}
