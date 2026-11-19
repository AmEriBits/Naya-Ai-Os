"use client";

import dynamic from "next/dynamic";

const NayaApp = dynamic(() => import("@/components/NayaApp"), {
  ssr: false,
  loading: () => <main>Loading your Naya workspace…</main>,
});

export default function NayaAppContent() {
  return <NayaApp />;
}
