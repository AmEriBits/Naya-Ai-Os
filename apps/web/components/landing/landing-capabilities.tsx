import { useEffect, useState } from "react";

import type { LucideIcon } from "lucide-react";

import {
  ArrowRight,
  Bell,
  Bike,
  Check,
  ChevronRight,
  Gift,
  Heart,
  Receipt,
  ShoppingBasket,
  Sparkles,
  TrendingUp,
  Utensils,
  Users,
  Wrench,
  X,
} from "lucide-react";

type Capability = {
  number: string;
  name: string;
  headline: string;
  summary: string;
  icon: LucideIcon;
  points: string[];
};

const capabilities: Capability[] = [
  {
    number: "01",
    name: "Chief of Staff",
    headline: "Smart reminders that know your home",
    summary:
      "A thoughtful weekly view of the little things that keep a household moving.",
    icon: Bell,
    points: [
      "Pantry restock reminder — illustrative",
      "Appointment reminder — example",
      "Household maintenance reminder — example",
    ],
  },
  {
    number: "02",
    name: "Gift Concierge",
    headline: "Secret Mode gifting",
    summary: "Plan a thoughtful surprise without giving it away.",
    icon: Gift,
    points: [
      "Keep gift plans private from your household feed",
      "Choose an occasion, budget, and delivery date",
      "Get ideas and coordinate sourcing, wrapping, and delivery",
      "Follow the plan from preparation to delivery",
    ],
  },
  {
    number: "03",
    name: "Errands",
    headline: "Your personal assistant",
    summary:
      "A simple place to organize the jobs that do not fit in the shopping basket.",
    icon: Bike,
    points: [
      "Dry cleaning pickup",
      "Pharmacy refill",
      "School run — 2:30pm",
      "Tailor drop-off",
      "Pickup task — illustrative",
    ],
  },
  {
    number: "04",
    name: "Home services",
    headline: "Explore a future home-services idea",
    summary: "Find trusted help for the things that need a skilled hand.",
    icon: Wrench,
    points: [
      "Electrician listing — illustrative",
      "Plumber listing — illustrative",
      "AC servicing listing — illustrative",
      "Fumigation listing — illustrative",
      "Cleaner listing — illustrative",
    ],
  },
  {
    number: "05",
    name: "Smart Bills",
    headline: "A clearer view of household bills",
    summary:
      "Keep household bills, due dates, and recurring costs in one calm view.",
    icon: Receipt,
    points: [
      "Track DSTV, EKEDC, water, internet, rent, and subscriptions",
      "See month-over-month changes",
      "Review each bill before taking action",
      "Plan bill payments alongside household spending",
    ],
  },
  {
    number: "06",
    name: "Family Care",
    headline: "A calmer view of family routines",
    summary:
      "Gentle reminders for the people and routines your household cares for.",
    icon: Heart,
    points: [
      "Family routine reminder — illustrative",
      "School calendar reminder — example",
      "Household chore reminder — example",
      "Pet care reminder — example",
    ],
  },
  {
    number: "07",
    name: "Meal Intelligence",
    headline: "Plan meals around your week",
    summary:
      "Plan meals around your week, then turn the ingredients into a shopping list.",
    icon: Utensils,
    points: [
      "Build an editable Monday–Sunday meal plan",
      "Adjust servings and ingredients as you go",
      "Bring meal ingredients together in one list",
      "Review the list before requesting vendor quotes",
    ],
  },
  {
    number: "08",
    name: "Community",
    headline: "Local recommendations, together",
    summary: "Discover useful local recommendations shared by people nearby.",
    icon: Users,
    points: [
      "Local produce recommendation — illustrative",
      "Fish market recommendation — example",
      "Bakery recommendation — example",
      "Home supplies recommendation — example",
    ],
  },
  {
    number: "09",
    name: "Group Buy",
    headline: "Bulk power",
    summary:
      "Pool demand with nearby households and make bulk buying work harder.",
    icon: ShoppingBasket,
    points: [
      "See a clear group price before joining",
      "Track how many neighbours have joined",
      "Know when a group closes",
      "Choose whether the offer works for your household",
    ],
  },
  {
    number: "10",
    name: "Financial Intelligence",
    headline: "Spot useful spending patterns",
    summary:
      "Understand where household money goes and spot practical ways to save.",
    icon: TrendingUp,
    points: [
      "Set a monthly income and category budgets",
      "Log spending and see category progress",
      "Get spending insights when a budget is running high",
      "Move money toward a savings goal with intention",
    ],
  },
];

export default function LandingCapabilities() {
  const [active, setActive] = useState<Capability | null>(null);
  const [checkedPoints, setCheckedPoints] = useState<number[]>([]);

  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [active]);

  function openCapability(capability: Capability) {
    setCheckedPoints([]);
    setActive(capability);
  }

  function togglePoint(index: number) {
    setCheckedPoints((current) =>
      current.includes(index)
        ? current.filter((point) => point !== index)
        : [...current, index],
    );
  }

  return (
    <section className="landing-capabilities" id="capabilities">
      <div className="capabilities-inner">
        <div className="capabilities-heading">
          <div>
            <span className="eyebrow">A BIGGER IDEA OF HOME</span>
            <h2>
              One thoughtful OS.
              <br />
              <em>Ten ways to make life lighter.</em>
            </h2>
          </div>
          <p>
            These are future product concepts. The invite-only pilot currently
            supports grocery requests and vendor quotes only.
          </p>
        </div>
        <div className="capabilities-grid">
          {capabilities.map(({ number, name, headline, icon: Icon }, index) => (
            <button
              className="capability-card"
              key={number}
              type="button"
              onClick={() => openCapability(capabilities[index])}
              aria-haspopup="dialog"
            >
              <span className="capability-card-top">
                <span>
                  {number} <i>·</i> {name}
                </span>
                <ArrowRight size={16} />
              </span>
              <span className="capability-icon">
                <Icon size={20} />
              </span>
              <strong>{headline}</strong>
              <span className="capability-card-link">
                View concept <ChevronRight size={14} />
              </span>
            </button>
          ))}
        </div>
        <p className="capabilities-note">
          <Sparkles size={14} /> Roadmap concepts only · not available in the
          private beta.
        </p>
      </div>
      {active && (
        <div
          className="capability-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setActive(null);
          }}
        >
          <section
            className="capability-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="capability-modal-title"
          >
            <button
              className="capability-modal-close"
              type="button"
              onClick={() => setActive(null)}
              aria-label="Close capability preview"
            >
              <X size={18} />
            </button>
            <span className="capability-modal-kicker">
              <active.icon size={13} />
              {active.number} · {active.name}
            </span>
            <h2 id="capability-modal-title">{active.headline}</h2>
            <p className="capability-modal-summary">{active.summary}</p>
            <ul className="capability-points">
              {active.points.map((point, index) => {
                const checked = checkedPoints.includes(index);
                return (
                  <li key={point}>
                    <button
                      type="button"
                      aria-pressed={checked}
                      onClick={() => togglePoint(index)}
                    >
                      <span
                        className={`capability-point-check${checked ? " is-checked" : ""}`}
                      >
                        {checked && <Check size={12} />}
                      </span>
                      <span>{point}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              className="capability-modal-action"
              type="button"
              onClick={() => setActive(null)}
            >
              Not available in the pilot
              <ArrowRight size={16} />
            </button>
            <p className="capability-modal-note">
              Concept preview · not a current service
            </p>
          </section>
        </div>
      )}
    </section>
  );
}
