export type PricingFeatureStatus = "live" | "planned" | "not-included" | "not-live";

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  tagline: string;
  teaserFeature: string;
  audience: string;
  badge?: string;
  popular?: boolean;
  liveFeatures: string[];
  plannedFeatures: string[];
  omissions: string[];
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "just-basket",
    name: "Just Basket",
    price: "₦0",
    tagline: "A smarter way to start your market run.",
    teaserFeature: "AI list help and clearer vendor quotes.",
    audience: "For occasional shoppers who want clear vendor offers.",
    badge: "Start here",
    liveFeatures: [
      "Create a grocery request and review your list before sharing it.",
      "Get itemized quotes from eligible, approved vendors.",
      "Compare item prices, availability, and estimated delivery time.",
      "Use AI list interpretation when the service is configured.",
    ],
    plannedFeatures: [],
    omissions: [
      "AI meal plans and a household budget planner.",
      "Predictive restock reminders and price intelligence.",
      "Family calendar, gift planning, and concierge workflows.",
    ],
  },
  {
    id: "naya-household",
    name: "Naya Household",
    price: "₦2,000",
    tagline: "Make the weekly shop work better for everyone at home.",
    teaserFeature: "Budget-aware meal and shopping plans.",
    audience: "For households building calmer, more consistent routines.",
    liveFeatures: [
      "Everything in Just Basket.",
      "Keep household requests and vendor quotes in one place.",
    ],
    plannedFeatures: [
      "Budget-aware meal plans that turn a weekly menu into a shopping list.",
      "A household budget planner with weekly allocations and spend summaries.",
      "Remember preferred brands, household staples, and dietary preferences.",
      "Capture lists from photos, then review every suggestion.",
    ],
    omissions: [
      "Predictive restocking and market-price alerts.",
      "AI-ranked vendor recommendations based on verified price history.",
      "Family event, gift, bill, and home-service concierge features.",
    ],
  },
  {
    id: "naya-household-pro",
    name: "Naya Household Pro",
    price: "₦3,500",
    tagline: "A more proactive household, with useful intelligence behind it.",
    teaserFeature: "Predictive shopping and price intelligence.",
    audience: "For busy families who want to plan ahead and make informed choices.",
    badge: "Most popular",
    popular: true,
    liveFeatures: [
      "The current request-and-quote workflow from Naya Household.",
      "Review vendor quotes by item, availability, and delivery estimate.",
    ],
    plannedFeatures: [
      "Predict repeat purchases from completed household shopping history.",
      "Track price trends and flag quotes that appear unusually high when reliable data is available.",
      "Get directional price forecasts without treating them as guaranteed market prices.",
      "Get vendor recommendations that weigh total price, availability, ETA, and verified history.",
      "Ask AI to draft a vendor clarification or counter-offer for household review.",
      "See budget patterns and potential savings based on actual order records.",
      "Build reusable baskets and plan group-buying opportunities.",
    ],
    omissions: [
      "AI gift and family-event concierge.",
      "Bill payment, errands, and home-service execution.",
      "Guaranteed savings, fixed market prices, or guaranteed delivery times.",
    ],
  },
  {
    id: "naya-elite",
    name: "Naya Elite",
    price: "₦5,000",
    tagline: "Your vision of an AI chief of staff for the home.",
    teaserFeature: "A more personal AI for the whole household.",
    audience: "For households coordinating many people, plans, and responsibilities.",
    badge: "Full household vision",
    liveFeatures: [
      "The current request-and-quote workflow from Naya Household Pro.",
      "Keep current household requests and selected quotes together.",
    ],
    plannedFeatures: [
      "Household memory for routines, important dates, and recurring needs.",
      "Smart reminders for family events, school dates, baby essentials, and care routines.",
      "Plan gifts and event shopping around a budget and the household calendar.",
      "Build a household timeline for recurring bills, utility and subscription due dates, school dates, and family events.",
      "Coordinate errands, bill reminders, and trusted home services as partners become available.",
      "Get more tailored meal, budget, and vendor suggestions across the household.",
    ],
    omissions: [
      "The cost of groceries, delivery, utilities, or third-party services.",
      "Guaranteed human concierge availability or service coverage.",
      "Medical, financial, or nutrition advice that replaces a qualified professional.",
    ],
  },
];

export const pricingComparison = [
  {
    title: "Shopping with clarity",
    rows: [
      {
        feature: "Editable AI-assisted typed shopping list",
        values: ["live", "live", "live", "live"],
      },
      {
        feature: "Vendor quotes with item prices, availability, and ETA",
        values: ["live", "live", "live", "live"],
      },
      {
        feature: "Voice list input on supported devices",
        values: ["live", "live", "live", "live"],
      },
      {
        feature: "Photo-to-list interpretation",
        values: ["not-included", "planned", "planned", "planned"],
      },
      {
        feature: "Payment, safeguarded funds, and delivery tracking",
        values: ["not-live", "not-live", "not-live", "not-live"],
      },
    ],
  },
  {
    title: "AI household planning",
    rows: [
      {
        feature: "Budget-aware meal plans and shopping lists",
        values: ["not-included", "planned", "planned", "planned"],
      },
      {
        feature: "Household budget planner and spending insights",
        values: ["not-included", "planned", "planned", "planned"],
      },
      {
        feature: "Saved household preferences and memory",
        values: ["not-included", "planned", "planned", "planned"],
      },
      {
        feature: "Predictive restock reminders",
        values: ["not-included", "not-included", "planned", "planned"],
      },
      {
        feature: "Price trends, quote alerts, and savings insights",
        values: ["not-included", "not-included", "planned", "planned"],
      },
      {
        feature: "Personalized vendor recommendations",
        values: ["not-included", "not-included", "planned", "planned"],
      },
      {
        feature: "AI-drafted vendor clarification or counter-offer",
        values: ["not-included", "not-included", "planned", "planned"],
      },
    ],
  },
  {
    title: "Household chief of staff",
    rows: [
      {
        feature: "Family calendar, event, and gift planning",
        values: ["not-included", "not-included", "not-included", "planned"],
      },
      {
        feature: "Family-care and household-essentials reminders",
        values: ["not-included", "not-included", "not-included", "planned"],
      },
      {
        feature: "Household timeline for bills, utilities, and school dates",
        values: ["not-included", "not-included", "not-included", "planned"],
      },
      {
        feature: "Errands, bill reminders, and home-service coordination",
        values: ["not-included", "not-included", "not-included", "planned"],
      },
      {
        feature: "Group buying and neighborhood circles",
        values: ["not-included", "not-included", "planned", "planned"],
      },
    ],
  },
] satisfies {
  title: string;
  rows: { feature: string; values: PricingFeatureStatus[] }[];
}[];
