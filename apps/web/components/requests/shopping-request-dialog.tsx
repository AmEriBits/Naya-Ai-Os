import type { ChangeEvent, FormEvent, RefObject } from "react";

import {
  ArrowRight,
  Check,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";

import type { ParsedItem } from "@/app/types";

export default function ShoppingRequestDialog({
  open,
  onClose,
  fileInputRef,
  onUpload,
  listText,
  setListText,
  aiMessage,
  busy,
  onInterpret,
  parsedItems,
  budget,
  setBudget,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  listText: string;
  setListText: (value: string) => void;
  aiMessage: string;
  busy: boolean;
  onInterpret: () => void;
  parsedItems: ParsedItem[];
  budget: string;
  setBudget: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,text/plain"
        hidden
        onChange={onUpload}
      />
      {open && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <section className="composer modal-card">
            <div className="modal-top">
              <div>
                <span className="eyebrow">NEW MARKET REQUEST</span>
                <h2>What does home need?</h2>
                <p>
                  Tell Naya in your own words. You’ll review every item before
                  vendors see it.
                </p>
              </div>
              <button
                className="icon-button"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>
            <form onSubmit={onSubmit}>
              <label className="field-label" htmlFor="shopping-list">
                Your list
              </label>
              <textarea
                id="shopping-list"
                className="list-input"
                value={listText}
                onChange={(event) => setListText(event.target.value)}
                placeholder={
                  "Rice, 10kg\nFresh tomatoes, maybe 2 baskets\nPalm oil, 5 litres\nChicken, 2kg — please keep it fresh"
                }
                required
              />
              <div className="ai-bar">
                <div className="ai-avatar">
                  <Sparkles size={15} />
                </div>
                <div>
                  <strong>Naya AI</strong>
                  <span>
                    {aiMessage ||
                      "I’ll organize your list. You stay in control."}
                  </span>
                </div>
                <button
                  className="button button-ai"
                  type="button"
                  disabled={!listText.trim() || busy}
                  onClick={onInterpret}
                >
                  {busy ? (
                    <LoaderCircle className="spin" size={15} />
                  ) : (
                    <WandSparkles size={15} />
                  )}{" "}
                  Interpret list
                </button>
              </div>
              {parsedItems.length > 0 && (
                <div className="parsed-review">
                  <div className="parsed-title">
                    <span>Review your items</span>
                    <span>{parsedItems.length} items · editable</span>
                  </div>
                  {parsedItems.map((item, index) => (
                    <div
                      className="parsed-item"
                      key={`${index}-${item.item_name}`}
                    >
                      <Check size={15} />
                      <span>{item.item_name}</span>
                      <span className="parsed-qty">
                        {item.quantity} {item.unit}
                      </span>
                      {item.preferred_brand && (
                        <small>{item.preferred_brand}</small>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <label className="field-label" htmlFor="budget">
                Maximum basket budget <span>Optional</span>
              </label>
              <div className="money-input">
                <span>₦</span>
                <input
                  id="budget"
                  type="number"
                  min="1"
                  step="100"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="e.g. 50,000"
                />
              </div>
              <p className="privacy-hint">
                <ShieldCheck size={14} /> Your delivery address is shared only
                after you choose a vendor.
              </p>
              <div className="modal-footer">
                <button
                  type="button"
                  className="button button-light"
                  onClick={onClose}
                >
                  Save for later
                </button>
                <button
                  className="button button-primary"
                  disabled={parsedItems.length === 0 || busy}
                  type="submit"
                >
                  {busy ? <LoaderCircle className="spin" size={16} /> : null}{" "}
                  Send to verified vendors <ArrowRight size={16} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
