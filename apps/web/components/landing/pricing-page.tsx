"use client";

import {
  ArrowRight,
  Check,
  Clock3,
  Minus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import LandingFooter from "@/components/landing/landing-footer";
import LandingNav from "@/components/landing/landing-nav";
import {
  pricingComparison,
  pricingPlans,
  type PricingFeatureStatus,
} from "@/app/lib/pricing-plans";

export default function PricingPage({
  onLogin,
  onStart,
  startLabel,
}: {
  onLogin: () => void;
  onStart: () => void;
  startLabel: string;
}) {
  const statusLabel: Record<PricingFeatureStatus, string> = {
    live: "Beta",
    planned: "Planned",
    "not-included": "Not in plan",
    "not-live": "Not live",
  };

  return (
    <div className="landing-page pricing-page">
      <LandingNav
        onLogin={onLogin}
        onStart={onStart}
        startLabel={startLabel}
        isPricing
      />
      <main>
        <section className="pricing-hero">
          <span className="landing-kicker">
            <span /> PLANS FOR THE EVERYDAY RHYTHMS OF HOME
          </span>
          <h1>
            Start with a basket.
            <br />
            <em>Grow with your household.</em>
          </h1>
          <p>
            Begin with clearer grocery choices, then add the AI planning and
            household intelligence your family needs as Naya grows.
          </p>
          <div className="pricing-proposal">
            <Sparkles size={16} />
            <span>
              Proposed monthly pricing · per household · in Nigerian naira
            </span>
          </div>
        </section>

        <section className="pricing-plans-section" aria-label="Household plans">
          <div className="pricing-plan-grid">
            {pricingPlans.map((plan) => (
              <article
                className={`pricing-plan-card${plan.popular ? " is-popular" : ""}`}
                key={plan.id}
              >
                {plan.badge && (
                  <span className="pricing-plan-badge">{plan.badge}</span>
                )}
                <span className="pricing-plan-audience">{plan.audience}</span>
                <h2>{plan.name}</h2>
                <p className="pricing-plan-tagline">{plan.tagline}</p>
                <div className="pricing-plan-price">
                  <strong>{plan.price}</strong>
                  <span>
                    {plan.price === "₦0" ? "no monthly fee" : "/ month"}
                  </span>
                </div>
                <small className="pricing-plan-status">
                  {plan.price === "₦0"
                    ? "Core beta access"
                    : "Planned · not yet purchasable"}
                </small>
                <div className="pricing-plan-details">
                  <h3>Included in this plan</h3>
                  <ul>
                    {plan.liveFeatures.map((feature) => (
                      <li key={feature}>
                        <Check size={15} />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.plannedFeatures.map((feature) => (
                      <li className="is-planned" key={feature}>
                        <Sparkles size={15} />
                        <span>
                          {feature} <small>Planned</small>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <details className="pricing-omissions">
                  <summary>What this plan leaves out</summary>
                  <ul>
                    {plan.omissions.map((feature) => (
                      <li key={feature}>
                        <Minus size={13} /> {feature}
                      </li>
                    ))}
                  </ul>
                </details>
                <button
                  className={
                    plan.popular
                      ? "button button-primary pricing-plan-cta"
                      : "button button-light pricing-plan-cta"
                  }
                  onClick={onStart}
                >
                  {plan.price === "₦0" ? startLabel : "Join the beta"}{" "}
                  <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
          <p className="pricing-plan-note">
            These are proposed prices, not active subscriptions. AI usage limits
            and any service fees will be published before paid plans open.
          </p>
        </section>

        <section className="pricing-ai-roadmap">
          <div className="pricing-section-heading">
            <span className="eyebrow">MORE THAN A LIST ASSISTANT</span>
            <h2>AI that grows from the basket to the whole home.</h2>
            <p>
              Naya’s AI is designed to help a household plan, remember, and
              coordinate—not make purchases or important decisions without you.
            </p>
          </div>
          <div className="pricing-roadmap-grid">
            <article>
              <span className="pricing-roadmap-icon">
                <Check size={17} />
              </span>
              <small>IN THE CURRENT BETA</small>
              <h3>Organize and compare</h3>
              <p>
                Interpret a typed shopping list, review the suggested items,
                then compare real vendor quotes by price, availability, and
                estimated delivery time.
              </p>
            </article>
            <article>
              <span className="pricing-roadmap-icon is-planned">
                <Sparkles size={17} />
              </span>
              <small>HOUSEHOLD +</small>
              <h3>Plan with your budget</h3>
              <p>
                Build budget-aware meal plans, turn them into shopping lists,
                and keep household preferences in one place.
              </p>
            </article>
            <article>
              <span className="pricing-roadmap-icon is-planned">
                <Sparkles size={17} />
              </span>
              <small>PRO</small>
              <h3>Anticipate and find value</h3>
              <p>
                Learn recurring needs from real order history, surface price
                patterns, and explain vendor recommendations using transparent
                factors.
              </p>
            </article>
            <article>
              <span className="pricing-roadmap-icon is-planned">
                <Sparkles size={17} />
              </span>
              <small>ELITE</small>
              <h3>Coordinate the household</h3>
              <p>
                Add household memory, event-aware reminders, gift planning, and
                coordination across errands and trusted home-service partners.
              </p>
            </article>
          </div>
        </section>

        <section className="pricing-comparison-section">
          <div className="pricing-section-heading">
            <span className="eyebrow">FEATURE-BY-FEATURE</span>
            <h2>Know what is included—and what is still ahead.</h2>
            <p>
              “Planned” describes the product roadmap, not a feature available
              in today’s beta.
            </p>
          </div>
          <div className="pricing-comparison-scroll">
            <table className="pricing-comparison">
              <thead>
                <tr>
                  <th scope="col">Capability</th>
                  {pricingPlans.map((plan) => (
                    <th scope="col" key={plan.id}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              {pricingComparison.map((group) => (
                <tbody key={group.title}>
                  <tr className="pricing-comparison-group">
                    <th colSpan={pricingPlans.length + 1} scope="colgroup">
                      {group.title}
                    </th>
                  </tr>
                  {group.rows.map((row) => (
                    <tr key={row.feature}>
                      <th scope="row">{row.feature}</th>
                      {row.values.map((status, index) => (
                        <td key={`${row.feature}-${pricingPlans[index].id}`}>
                          <span className={`pricing-status is-${status}`}>
                            {status === "live" && <Check size={12} />}
                            {status === "not-included" && <Minus size={12} />}
                            {status === "not-live" && <Clock3 size={12} />}
                            {statusLabel[status]}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </section>

        <section className="pricing-boundaries">
          <div>
            <span className="eyebrow">IMPORTANT TO KNOW</span>
            <h2>Plan fees are not shopping money.</h2>
            <p>
              The plan price covers Naya features only. A basket’s vendor price,
              delivery, utilities, and any third-party service are separate
              costs and must be shown clearly before purchase.
            </p>
          </div>
          <ul>
            <li>
              <ShieldCheck size={16} /> No subscription billing is connected
              today.
            </li>
            <li>
              <Clock3 size={16} /> Accepting a quote currently records
              awaiting_payment only.
            </li>
            <li>
              <Minus size={16} /> No payment, escrow, delivery, or payout is
              available in the beta.
            </li>
            <li>
              <Minus size={16} /> No plan guarantees savings, live market
              prices, or delivery times.
            </li>
          </ul>
        </section>

        <section className="pricing-faq">
          <div className="pricing-section-heading">
            <span className="eyebrow">BEFORE YOU CHOOSE</span>
            <h2>Clear answers, as Naya grows.</h2>
          </div>
          <div className="pricing-faq-list">
            <details>
              <summary>Can I subscribe to a paid plan now?</summary>
              <p>
                Not yet. These prices and paid capabilities are a proposal for
                the roadmap. The current beta supports grocery requests and
                quotes; subscription billing is not connected.
              </p>
            </details>
            <details>
              <summary>Which AI features work today?</summary>
              <p>
                When the AI service is configured, Naya can interpret a typed
                shopping list into editable items. You review the result before
                it is sent. Meal planning, budget intelligence, predictive
                shopping, and price forecasting are planned features.
              </p>
            </details>
            <details>
              <summary>Are groceries or delivery included in the plan price?</summary>
              <p>
                No. The plan price is separate from the vendor’s basket price
                and any future delivery or service fee. No money is collected
                in the current beta.
              </p>
            </details>
            <details>
              <summary>Will Naya buy or pay for something automatically?</summary>
              <p>
                No. AI suggestions are for household review. Naya should ask
                for your approval before sharing a request, accepting a quote,
                or making a purchase.
              </p>
            </details>
          </div>
        </section>

        <section className="pricing-final">
          <span className="eyebrow">START WITH THE REAL WORKFLOW</span>
          <h2>
            A clearer market run,
            <br />
            <em>with your household in control.</em>
          </h2>
          <p>
            Explore the current request-and-quote beta. Paid subscriptions and
            the broader AI roadmap will open as those capabilities are ready.
          </p>
          <button className="button button-primary" onClick={onStart}>
            {startLabel} <ArrowRight size={15} />
          </button>
        </section>
      </main>
      <LandingFooter onStart={onStart} />
    </div>
  );
}
