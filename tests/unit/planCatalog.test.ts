import { describe, expect, it } from "vitest";
import { PlanCatalog } from "../../convex/constants/planCatalog";

describe("PlanCatalog", () => {
  it("resolves aliases to canonical keys", () => {
    expect(PlanCatalog.resolveKey("core_block")).toBe("core");
    expect(PlanCatalog.resolveKey("premium")).toBe("elite");
    expect(PlanCatalog.resolveKey("unknown"))
      .toBe("core");
  });

  it("formats plan summary with block plans and add-on", () => {
    const summary = PlanCatalog.formatPlanSummary();
    expect(summary).toContain("Starter Block");
    expect(summary).toContain("A La Carte Hours");
    expect(summary).toMatch(/Installment plans and student discounts/);
  });

  it("exposes public summaries with CTA paths and pricing", () => {
    const summaries = PlanCatalog.publicSummaries();
    expect(summaries.length).toBeGreaterThan(0);

    for (const summary of summaries) {
      expect(summary.name).toBeTruthy();
      expect(summary.priceDisplay).toMatch(/\$/);
      expect(summary.ctaPath).toMatch(/^\//);
    }
  });
});

