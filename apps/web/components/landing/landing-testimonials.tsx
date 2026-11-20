"use client";

import { useEffect, useState, type CSSProperties } from "react";

import { ArrowLeft, ArrowRight, MapPin, Quote } from "lucide-react";

const stories = [
  {
    title: "The Busy Working Mother",
    city: "Lagos",
    area: "Lekki",
    category: "Time management",
    household: "Mother, father and two children",
    quote:
      "Between my office, the children, school activities and running the house, I was constantly overwhelmed. I used to spend my evenings calling different market women and comparing prices. With Naya, I can submit my shopping list, compare quotations and arrange delivery. I also get reminders when we're running low on essentials. I finally have more time for myself and my family.",
    author: "Amaka",
    initials: "A",
  },
  {
    title: "The Growing Family",
    city: "Abuja",
    area: "Gwarinpa",
    category: "Household budgeting",
    household: "Couple with three children",
    quote:
      "Feeding a family of five is not a small responsibility, especially with prices changing almost every week. We used to shop without a proper plan and sometimes exceed our budget. Naya helps us organize our shopping, plan meals and compare vendors before spending. We can now make more deliberate decisions about our household expenses.",
    author: "Chinedu and Grace",
    initials: "C+G",
  },
  {
    title: "The Multigenerational Household",
    city: "Kano",
    area: "",
    category: "Family coordination",
    household: "Parents, grandparents and grandchildren",
    quote:
      "Managing a home with different generations means there is always something to remember. From groceries to household supplies and important family dates, something can easily slip through the cracks. Naya gives us one place to organize these responsibilities. The reminders and shared shopping lists make coordinating the home much easier.",
    author: "Hadiza",
    initials: "H",
  },
  {
    title: "The Independent Single Mother",
    city: "Port Harcourt",
    area: "",
    category: "Personal errands",
    household: "Mother and one child",
    quote:
      "As a working single mother, I have to be intentional about how I spend my time. There are days when I finish work and still have groceries to buy, clothes to pick up and household needs to sort out. What I love about the Naya concept is having a household assistant that can coordinate these little responsibilities instead of me having to manage everything myself.",
    author: "Blessing",
    initials: "B",
  },
  {
    title: "The Young Professional Couple",
    city: "Enugu",
    area: "",
    category: "Meal planning",
    household: "Newly married couple",
    quote:
      "We both work, and deciding what to cook every day used to become another responsibility. Sometimes we bought ingredients without knowing exactly what we would prepare. Naya's meal planning and shopping list concept makes household planning easier. We can organize our meals around a budget and shop with more intention.",
    author: "Daniel and Ifunanya",
    initials: "D+I",
  },
  {
    title: "The Budget-Conscious Household",
    city: "Ibadan",
    area: "",
    category: "Price intelligence",
    household: "Couple with four children",
    quote:
      "One of our biggest challenges has always been knowing where to get quality groceries at reasonable prices. You could buy something at one price today and find it cheaper somewhere else tomorrow. Naya's vendor comparison and price intelligence features are exactly what households need. Instead of guessing, we can make more informed purchasing decisions.",
    author: "Mrs. Olufunke",
    initials: "O",
  },
  {
    title: "The New Parents",
    city: "Kaduna",
    area: "",
    category: "Baby essentials",
    household: "Young couple with a newborn",
    quote:
      "Having a baby changes everything. There are diapers, wipes, formula, groceries and so many things to keep track of. Sometimes you only realize something has finished when you need it urgently. We love the idea of Naya remembering our recurring household purchases and reminding us before we run out.",
    author: "Aisha and Yusuf",
    initials: "A+Y",
  },
  {
    title: "The Busy Entrepreneur",
    city: "Benin City",
    area: "",
    category: "Household automation",
    household: "Father, mother and two children",
    quote:
      "Running a business already takes most of my attention. I don't want to spend the little time I have outside work chasing electricians, arranging shopping or remembering every household bill. Naya's vision of a household chief of staff makes sense to me. I want one place where my family and I can coordinate everything that keeps our home running.",
    author: "Osagie",
    initials: "O",
  },
  {
    title: "The Independent Young Professional",
    city: "Owerri",
    area: "",
    category: "Personal household management",
    household: "Young woman living independently",
    quote:
      "Living alone means you are responsible for absolutely everything. From food shopping and electricity bills to cleaning supplies and home maintenance. I like the idea that Naya can help me keep track of my expenses, organize my shopping and connect me with trusted home service providers. It makes independent living feel less stressful.",
    author: "Chisom",
    initials: "C",
  },
  {
    title: "The Extended Family Household",
    city: "Jos",
    area: "",
    category: "Community commerce",
    household: "Extended family of eight",
    quote:
      "When you have a large household, you buy groceries in large quantities. We are always looking for ways to reduce costs without compromising quality. The group-buying idea is particularly interesting because families within our community could combine their orders and potentially access better prices. That is the kind of innovation that can genuinely benefit everyday households.",
    author: "Mr. and Mrs. Danjuma",
    initials: "D",
  },
];

export default function LandingTestimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % stories.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, [paused]);

  function showPrevious() {
    setActiveIndex((index) => (index - 1 + stories.length) % stories.length);
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % stories.length);
  }

  const activeStory = stories[activeIndex];

  return (
    <section className="landing-testimonials" id="testimonials">
      <div className="testimonials-heading">
        <span className="eyebrow">HOUSEHOLD STORIES · NIGERIA</span>
        <h2>Every Home Has a Story. Naya Makes Every Home Easier.</h2>
        <h3>Naya. Your Home, Understood.</h3>
        <p>
          From Lagos, Kano and Abuja. From busy professionals to growing
          families. A smarter way to manage everyday life.
        </p>
      </div>
      <div
        className={`testimonials-carousel${paused ? " is-paused" : ""}`}
        aria-label="Household testimonials from across Nigeria"
        role="group"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(event) => {
          const nextTarget = event.relatedTarget;
          if (!(
            nextTarget instanceof Node &&
            event.currentTarget.contains(nextTarget)
          ))
            setPaused(false);
        }}
      >
        <div className="testimonials-stage">
          <div className="testimonial-orbit-ring" aria-hidden="true" />
          <div className="testimonial-orbit">
            {stories.map((story, index) => (
              <button
                type="button"
                aria-label={`Show ${story.title} testimonial from ${story.city} about ${story.category}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`testimonial-orbit-marker${index === activeIndex ? " is-active" : ""}`}
                key={story.title}
                onClick={() => setActiveIndex(index)}
                style={
                  {
                    "--angle": `${index * (360 / stories.length)}deg`,
                    "--counter-angle": `${index * (-360 / stories.length)}deg`,
                  } as CSSProperties
                }
              >
                <span className="testimonial-orbit-content">
                  <strong>{story.city}</strong>
                  <small>{story.category}</small>
                </span>
              </button>
            ))}
          </div>
          <article
            aria-label={`${activeStory.title}, ${activeStory.city}`}
            aria-roledescription="testimonial"
            className="testimonial-spotlight"
            key={activeStory.title}
            role="group"
          >
            <div className="testimonial-spotlight-top">
              <span>
                <MapPin size={13} />
                {activeStory.area
                  ? `${activeStory.area}, ${activeStory.city}`
                  : activeStory.city}
              </span>
              <small>
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(stories.length).padStart(2, "0")}
              </small>
            </div>
            <span className="testimonial-category">{activeStory.category}</span>
            <Quote className="testimonial-quote-icon" size={27} />
            <blockquote>{activeStory.quote}</blockquote>
            <p className="testimonial-household">
              Household: {activeStory.household}
            </p>
            <footer className="testimonial-attribution">
              <span className="testimonial-avatar" aria-hidden="true">
                {activeStory.initials}
              </span>
              <span>
                <strong>— {activeStory.author}</strong>
                <small>{activeStory.city}</small>
              </span>
            </footer>
          </article>
        </div>
        <div className="testimonials-controls">
          <button
            type="button"
            className="testimonials-arrow"
            aria-label="Previous testimonial"
            onClick={showPrevious}
          >
            <ArrowLeft size={17} />
          </button>
          <div className="testimonials-progress" aria-hidden="true">
            <span
              style={{
                width: `${((activeIndex + 1) / stories.length) * 100}%`,
              }}
            />
          </div>
          <span className="testimonials-counter" aria-live="polite">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(stories.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            className="testimonials-arrow"
            aria-label="Next testimonial"
            onClick={showNext}
          >
            <ArrowRight size={17} />
          </button>
        </div>
        <p className="testimonials-caption">
          Shared with permission. Some stories mention features in development;
          the current pilot supports grocery requests and vendor quotes only.
        </p>
      </div>
    </section>
  );
}
