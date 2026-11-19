"use client";

import dynamic from "next/dynamic";

const AdminApp = dynamic(() => import("@/components/AdminApp"), {
  ssr: false,
  loading: () => <main>Loading Naya operations…</main>,
});

export default function AdminPageContent() {
  return <AdminApp />;
}
