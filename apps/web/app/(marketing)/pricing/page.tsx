import type { Metadata } from "next";

import NayaAppContent from "@/components/NayaAppContent";

export const metadata: Metadata = {
  title: "Plans & Pricing | Naya",
  description:
    "Explore Naya household plans, proposed pricing, and the AI capabilities planned for each tier.",
};

export default function PricingRoute() {
  return <NayaAppContent />;
}
