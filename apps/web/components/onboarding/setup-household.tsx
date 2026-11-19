import type { FormEvent } from "react";

import { ArrowRight, Home, LoaderCircle, MapPin } from "lucide-react";

export default function SetupHousehold({
  onSubmit,
  busy,
  name,
  setName,
  address,
  setAddress,
  serviceArea,
  setServiceArea,
  familySize,
  setFamilySize,
  localPreview,
  onSkipLocal,
}: {
  onSubmit: (e: FormEvent) => void;
  busy: boolean;
  error: string;
  name: string;
  setName: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  serviceArea: string;
  setServiceArea: (v: string) => void;
  familySize: string;
  setFamilySize: (v: string) => void;
  localPreview: boolean;
  onSkipLocal: () => void;
}) {
  return (
    <div className="onboarding-card">
      <div className="onboarding-icon">
        <Home size={21} />
      </div>
      <span className="eyebrow">FIRST, YOUR HOUSEHOLD</span>
      <h2>Let’s set up your home base.</h2>
      <p>
        This connects your requests to the right people in your household. Your
        address stays private until a vendor is selected.
      </p>
      <form onSubmit={onSubmit} className="onboarding-form">
        <label className="field-label" htmlFor="household-name">
          Household name
        </label>
        <input
          className="text-input"
          id="household-name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. The Adeyemi Home"
        />
        <label className="field-label" htmlFor="household-address">
          Delivery address
        </label>
        <textarea
          className="note-input"
          id="household-address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street and estate"
        />
        <label className="field-label" htmlFor="household-area">
          Neighbourhood or market area
        </label>
        <input
          className="text-input"
          id="household-area"
          required
          value={serviceArea}
          onChange={(e) => setServiceArea(e.target.value)}
          placeholder="e.g. Wuse 2, Abuja"
        />
        <span className="privacy-hint">
          <MapPin size={14} /> Requests are matched to vendors using this area.
        </span>
        <label className="field-label" htmlFor="family-size">
          People at home
        </label>
        <input
          className="text-input"
          id="family-size"
          type="number"
          min="1"
          max="30"
          required
          value={familySize}
          onChange={(e) => setFamilySize(e.target.value)}
        />
        <button className="button button-primary" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="spin" size={16} /> : null} Create
          household <ArrowRight size={16} />
        </button>
      </form>
      {localPreview && (
        <button
          className="button button-light preview-skip"
          onClick={onSkipLocal}
        >
          View the empty household dashboard
        </button>
      )}
    </div>
  );
}
