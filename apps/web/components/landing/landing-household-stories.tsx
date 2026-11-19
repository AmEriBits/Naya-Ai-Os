"use client";

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  MapPin,
  ShoppingBasket,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const stories = [
  {
    city: "Lagos",
    area: "South West",
    label: "CURRENT BETA",
    title: "A clearer market run for a busy week.",
    description:
      "A Lagos household writes a grocery list, reviews Naya’s item suggestions, and compares itemized offers from approved local vendors before choosing.",
    feature: "Editable list · Itemized quotes",
    icon: ShoppingBasket,
    visualTitle: "This week’s market list",
    visualLines: ["Rice · 5 kg", "Tomatoes · 1 basket", "Palm oil · 2 L"],
    visualNote: "Review first. Share when ready.",
  },
  {
    city: "Abuja",
    area: "North Central",
    label: "PLANNED · HOUSEHOLD",
    title: "A meal plan that starts with your budget.",
    description:
      "The planned AI meal planner will help an Abuja family shape a weekly menu around its preferences, then prepare a shopping list to review.",
    feature: "Budget-aware meal planning",
    icon: Sparkles,
    visualTitle: "A more considered week",
    visualLines: ["Household preferences", "Weekly meal plan", "Reviewable shopping list"],
    visualNote: "A roadmap feature—not live yet.",
  },
  {
    city: "Port Harcourt",
    area: "South South",
    label: "PLANNED · PRO",
    title: "Spot the staples your home may need next.",
    description:
      "With enough completed-order history, planned predictive shopping can help a Port Harcourt household notice repeat needs and decide when to make another request.",
    feature: "Predictive shopping · Price insights",
    icon: TrendingUp,
    visualTitle: "Household memory",
    visualLines: ["Learn recurring needs", "Notice price patterns", "Suggest—not purchase"],
    visualNote: "Suggestions stay in your hands.",
  },
  {
    city: "Kano",
    area: "North West",
    label: "PLANNED · ELITE",
    title: "Keep household plans from slipping through the cracks.",
    description:
      "The Elite roadmap imagines family dates, household reminders, and trusted-service coordination gathered in one place—with approval before anything is shared.",
    feature: "Family reminders · Concierge roadmap",
    icon: CalendarDays,
    visualTitle: "A home timeline",
    visualLines: ["Family dates", "Household reminders", "Trusted service requests"],
    visualNote: "Planned for a later Naya release.",
  },
];

export default function LandingHouseholdStories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % stories.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [paused]);

  function showPrevious() {
    setActiveIndex((index) => (index - 1 + stories.length) % stories.length);
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % stories.length);
  }

  return (
    <section className="landing-household-stories" id="household-stories">
      <div className="household-stories-heading">
        <span className="eyebrow">HOUSEHOLD STORIES · PRODUCT PREVIEW</span>
        <h2>
          Made for the many
          <br />
          rhythms of home.
        </h2>
        <p>
          Explore illustrative scenarios from across Nigeria. These are product
          examples, not real customer testimonials.
        </p>
        <span className="household-stories-disclaimer">
          ILLUSTRATIVE STORIES · NOT CUSTOMER REVIEWS
        </span>
      </div>
      <div
        className="household-stories-carousel"
        aria-label="Illustrative household stories from Nigeria"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(event) => {
          const nextTarget = event.relatedTarget;
          if (!(nextTarget instanceof Node && event.currentTarget.contains(nextTarget)))
            setPaused(false);
        }}
      >
        <div className="household-stories-stage" aria-live="off">
          {stories.map((story, index) => {
            const offset = (index - activeIndex + stories.length) % stories.length;
            const position =
              offset === 0
                ? "active"
                : offset === 1
                  ? "next"
                  : offset === stories.length - 1
                    ? "previous"
                    : "hidden";
            const Icon = story.icon;
            return (
              <article
                aria-hidden={position !== "active"}
                aria-roledescription="slide"
                className={`household-story-card is-${position}`}
                key={story.city}
                role="group"
              >
                <div className="household-story-copy">
                  <div className="household-story-meta">
                    <span className="household-story-number">
                      0{index + 1} / 0{stories.length}
                    </span>
                    <span className="household-story-city">
                      <MapPin size={13} /> {story.city}, Nigeria
                    </span>
                  </div>
                  <span className="household-story-label">{story.label}</span>
                  <h3>{story.title}</h3>
                  <p>{story.description}</p>
                  <span className="household-story-feature">
                    <Icon size={15} /> {story.feature}
                  </span>
                </div>
                <div className="household-story-visual" aria-hidden="true">
                  <div className="household-story-window">
                    <div className="household-story-window-top">
                      <span />
                      <span />
                      <span />
                      <small>NAYA HOME</small>
                    </div>
                    <div className="household-story-visual-heading">
                      <span className="household-story-visual-icon">
                        <Icon size={18} />
                      </span>
                      <div>
                        <small>ILLUSTRATIVE SCENARIO</small>
                        <strong>{story.visualTitle}</strong>
                      </div>
                    </div>
                    <ul>
                      {story.visualLines.map((line, lineIndex) => (
                        <li key={line}>
                          <span>{line}</span>
                          <b>{String(lineIndex + 1).padStart(2, "0")}</b>
                        </li>
                      ))}
                    </ul>
                    <div className="household-story-visual-note">
                      <Sparkles size={13} /> {story.visualNote}
                    </div>
                  </div>
                  <span className="household-story-orbit orbit-one" />
                  <span className="household-story-orbit orbit-two" />
                </div>
              </article>
            );
          })}
        </div>
        <div className="household-stories-controls">
          <button
            type="button"
            className="household-stories-arrow"
            aria-label="Previous household story"
            onClick={showPrevious}
          >
            <ArrowLeft size={17} />
          </button>
          <div className="household-stories-dots" aria-label="Choose a story">
            {stories.map((story, index) => (
              <button
                type="button"
                aria-label={`Show ${story.city} story`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={index === activeIndex ? "is-active" : ""}
                key={story.city}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
          <button
            type="button"
            className="household-stories-arrow"
            aria-label="Next household story"
            onClick={showNext}
          >
            <ArrowRight size={17} />
          </button>
        </div>
        <p className="household-stories-caption">
          Scenarios demonstrate Naya’s current workflow and planned roadmap;
          they do not represent actual customer results.
        </p>
      </div>
    </section>
  );
}
