const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
};

export type PlanKey = "starter" | "core" | "advanced" | "pro" | "elite" | "a_la_carte";

export type PlanCategory = "block" | "addon";

interface PlanStripeConfig {
  readonly envKey?: string;
  readonly fallbackPriceId?: string;
  readonly lookupKeys: readonly string[];
  readonly testEnvKey?: string;
}

export interface PlanCatalogEntry {
  readonly key: PlanKey;
  readonly publicName: string;
  readonly shortLabel: string;
  readonly description: string;
  readonly category: PlanCategory;
  readonly hours: number | null;
  readonly basePriceUsd: number;
  readonly priceDetail?: string;
  readonly features: readonly string[];
  readonly ctaPath: string;
  readonly highlight?: "popular" | "premium" | "entry";
  readonly aliases?: readonly string[];
  readonly stripe: PlanStripeConfig;
  readonly sortOrder: number;
}

interface PublicPlanSummary {
  readonly key: PlanKey;
  readonly name: string;
  readonly description: string;
  readonly category: PlanCategory;
  readonly hours: number | null;
  readonly priceUsd: number;
  readonly priceDisplay: string;
  readonly priceDetail?: string;
  readonly features: readonly string[];
  readonly ctaPath: string;
  readonly highlight?: "popular" | "premium" | "entry";
}

const PLAN_SOURCE: readonly PlanCatalogEntry[] = [
  {
    key: "starter",
    publicName: "Starter Block",
    shortLabel: "Starter",
    description: "Essential placement support for shorter rotations",
    category: "block",
    hours: 60,
    basePriceUsd: 495,
    priceDetail: "≈ $8.25/hr",
    features: [
      "60 guaranteed clinical hours",
      "Standard matching timeline",
      "Dedicated student success touchpoints",
      "Hour tracking tools included",
    ],
    ctaPath: "/student-intake",
    highlight: "entry",
    aliases: ["starter_block", "starter plan"],
    stripe: {
      envKey: "STRIPE_PRICE_ID_STARTER",
      lookupKeys: ["mentoloop_starter", "price_starter", "starter"],
      testEnvKey: "STRIPE_TEST_PRICE_ID_STARTER",
    },
    sortOrder: 1,
  },
  {
    key: "core",
    publicName: "Core Block",
    shortLabel: "Core",
    description: "Best-value block with priority placement",
    category: "block",
    hours: 90,
    basePriceUsd: 795,
    priceDetail: "≈ $8.83/hr",
    features: [
      "90 guaranteed clinical hours",
      "Priority matching within 14 days",
      "Dedicated student success manager",
      "Mid-rotation check-in",
    ],
    ctaPath: "/student-intake",
    highlight: "popular",
    aliases: ["core_block"],
    stripe: {
      envKey: "STRIPE_PRICE_ID_CORE",
      fallbackPriceId: "price_1S77IeKVzfTBpytSbMSAb8PK",
      lookupKeys: ["mentoloop_core", "price_core", "core"],
      testEnvKey: "STRIPE_TEST_PRICE_ID_CORE",
    },
    sortOrder: 2,
  },
  {
    key: "advanced",
    publicName: "Advanced Block",
    shortLabel: "Advanced",
    description: "Extended rotations with additional support",
    category: "block",
    hours: 120,
    basePriceUsd: 1195,
    priceDetail: "≈ $9.95/hr",
    features: [
      "120 guaranteed clinical hours",
      "Placement escalation path",
      "Extended document review",
      "Flexible scheduling windows",
    ],
    ctaPath: "/student-intake",
    aliases: ["advanced_block", "premium_120"],
    stripe: {
      envKey: "STRIPE_PRICE_ID_ADVANCED",
      lookupKeys: ["mentoloop_advanced", "price_advanced", "advanced"],
      testEnvKey: "STRIPE_TEST_PRICE_ID_ADVANCED",
    },
    sortOrder: 3,
  },
  {
    key: "pro",
    publicName: "Pro Block",
    shortLabel: "Pro",
    description: "Full-semester support with top-priority matching",
    category: "block",
    hours: 180,
    basePriceUsd: 1495,
    priceDetail: "≈ $8.31/hr",
    features: [
      "180 guaranteed clinical hours",
      "Top-priority matching (7–10 days)",
      "Success coordinator + preceptor coaching",
      "Flexible rollover into next semester",
    ],
    ctaPath: "/student-intake",
    aliases: ["pro_block"],
    stripe: {
      envKey: "STRIPE_PRICE_ID_PRO",
      fallbackPriceId: "price_1S77JeKVzfTBpytS1UfSG4Pl",
      lookupKeys: ["mentoloop_pro", "price_pro", "pro"],
      testEnvKey: "STRIPE_TEST_PRICE_ID_PRO",
    },
    sortOrder: 4,
  },
  {
    key: "elite",
    publicName: "Elite Block",
    shortLabel: "Elite",
    description: "Maximum hours and VIP placement experience",
    category: "block",
    hours: 240,
    basePriceUsd: 1895,
    priceDetail: "≈ $7.90/hr",
    features: [
      "240 guaranteed clinical hours",
      "VIP preceptor network with expedited matching",
      "24/7 priority support",
      "Evaluation assistance + rollover protection",
    ],
    ctaPath: "/student-intake",
    highlight: "premium",
    aliases: ["premium", "premium_block", "premium_plus"],
    stripe: {
      envKey: "STRIPE_PRICE_ID_ELITE",
      fallbackPriceId: "price_1S77KDKVzfTBpytSnfhEuDMi",
      lookupKeys: [
        "mentoloop_elite",
        "price_elite",
        "mentoloop_premium",
        "price_premium",
        "elite",
        "premium",
      ],
      testEnvKey: "STRIPE_TEST_PRICE_ID_ELITE",
    },
    sortOrder: 5,
  },
  {
    key: "a_la_carte",
    publicName: "A La Carte Hours",
    shortLabel: "Add Hours",
    description: "Flexible add-on hours in 30-hour increments",
    category: "addon",
    hours: null,
    basePriceUsd: 10,
    priceDetail: "30 hour minimum",
    features: [
      "Purchase additional 30-hour blocks",
      "Same vetted preceptor network",
      "Bank unused hours within the semester",
      "Great for topping up rotation requirements",
    ],
    ctaPath: "/dashboard/billing",
    aliases: ["alacarte", "add_hours", "a la carte"],
    stripe: {
      envKey: "STRIPE_PRICE_ID_ALACARTE",
      lookupKeys: ["mentoloop_alacarte", "a_la_carte"],
      testEnvKey: "STRIPE_TEST_PRICE_ID_ALACARTE",
    },
    sortOrder: 10,
  },
];

type PlanRecord = Record<PlanKey, PlanCatalogEntry>;

const PLAN_RECORD: PlanRecord = PLAN_SOURCE.reduce((acc, plan) => {
  acc[plan.key] = plan;
  return acc;
}, {} as PlanRecord);

const PLAN_ALIASES: Record<string, PlanKey> = PLAN_SOURCE.reduce((acc, plan) => {
  acc[plan.key] = plan.key;
  plan.aliases?.forEach((alias) => {
    acc[alias.toLowerCase()] = plan.key;
  });
  plan.stripe.lookupKeys.forEach((lookup) => {
    acc[lookup.toLowerCase()] = plan.key;
  });
  return acc;
}, {} as Record<string, PlanKey>);

export class PlanCatalog {
  private static readonly orderedKeys: readonly PlanKey[] = PLAN_SOURCE.map((plan) => plan.key);

  static list(): readonly PlanCatalogEntry[] {
    return PLAN_SOURCE;
  }

  static keys(): readonly PlanKey[] {
    return PlanCatalog.orderedKeys;
  }

  static get(key: PlanKey): PlanCatalogEntry {
    return PLAN_RECORD[key];
  }

  static hasKey(value: string | null | undefined): value is PlanKey {
    if (!value) return false;
    return Object.prototype.hasOwnProperty.call(PLAN_RECORD, value.toLowerCase());
  }

  static resolveKey(value: string | null | undefined): PlanKey {
    if (!value) {
      return "core";
    }
    const normalized = value.toLowerCase();
    return PLAN_ALIASES[normalized] || (PlanCatalog.hasKey(normalized) ? (normalized as PlanKey) : "core");
  }

  static aliasMap(): Readonly<Record<string, PlanKey>> {
    return PLAN_ALIASES;
  }

  static toMembershipConfig<T>(mapper: (plan: PlanCatalogEntry) => T): Record<PlanKey, T> {
    return PlanCatalog.keys().reduce((acc, key) => {
      acc[key] = mapper(PlanCatalog.get(key));
      return acc;
    }, {} as Record<PlanKey, T>);
  }

  static publicSummaries(): readonly PublicPlanSummary[] {
    return PlanCatalog.list()
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((plan) => ({
        key: plan.key,
        name: plan.publicName,
        description: plan.description,
        category: plan.category,
        hours: plan.hours,
        priceUsd: plan.basePriceUsd,
        priceDisplay: formatCurrency(plan.basePriceUsd),
        priceDetail: plan.priceDetail,
        features: plan.features,
        ctaPath: plan.ctaPath,
        highlight: plan.highlight,
      }));
  }

  static formatPlanSummary(keys: readonly PlanKey[] = PlanCatalog.keys()): string {
    const plans = keys
      .map((key) => PlanCatalog.get(key))
      .filter((plan) => plan.category === "block");

    const lines = plans.map((plan) => {
      const price = formatCurrency(plan.basePriceUsd);
      const hours = plan.hours ? `${plan.hours} clinical hours` : "Flexible hours";
      return `- ${plan.publicName} (${price}): ${hours}. ${plan.description}`;
    });

    const addon = PlanCatalog.get("a_la_carte");
    lines.push(
      `- ${addon.publicName} ($${addon.basePriceUsd}/hr, ${addon.priceDetail}): ${addon.description}.`,
    );

    return [
      "We offer structured blocks plus flexible add-ons:",
      ...lines,
      "Installment plans and student discounts (NP12345 for 100% off intake, MENTO12345 for $0.01 verification) are available during checkout.",
    ].join("\n");
  }

  static planForLookup(lookup: string | null | undefined): PlanCatalogEntry {
    return PlanCatalog.get(PlanCatalog.resolveKey(lookup));
  }

  static ctaForPlan(key: PlanKey): string {
    return PlanCatalog.get(key).ctaPath;
  }
}

export type { PublicPlanSummary };

