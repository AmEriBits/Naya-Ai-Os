import type { FormEvent } from "react";

import { ArrowRight, Check, LoaderCircle, Store } from "lucide-react";

export default function VendorOnboarding({
  onSubmit,
  busy,
  business,
  setBusiness,
  area,
  setArea,
}: {
  onSubmit: (e: FormEvent) => void;
  busy: boolean;
  business: string;
  setBusiness: (v: string) => void;
  area: string;
  setArea: (v: string) => void;
}) {
  return (
    <div className="onboarding-card">
      <div className="onboarding-icon vendor-icon">
        <Store size={21} />
      </div>
      <span className="eyebrow">JOIN THE VENDOR NETWORK</span>
      <h2>Bring your shop onto Naya.</h2>
      <p>
        Share your business name and service area. We review every vendor before
        requests are shared.
      </p>
      <form onSubmit={onSubmit} className="onboarding-form">
        <label className="field-label" htmlFor="business-name">
          Business or stall name
        </label>
        <input
          className="text-input"
          id="business-name"
          required
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
          placeholder="e.g. Iya Bola Fresh Foods"
        />
        <label className="field-label" htmlFor="service-area">
          Market and service area
        </label>
        <input
          className="text-input"
          id="service-area"
          required
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="e.g. Wuse Market, Abuja"
        />
        <div className="privacy-hint">
          <Check size={15} /> Verification is required before paid household
          requests appear.
        </div>
        <button className="button button-primary" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={16} /> : null} Submit for
          review <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
