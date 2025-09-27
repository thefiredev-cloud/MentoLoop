import { describe, expect, it } from "vitest";
import { PlanCatalog } from "../../convex/constants/planCatalog";

import { buildPricingResponse } from "../../convex/chatbot";

describe("Chatbot pricing intent", () => {
  it("includes core plan names and discount instructions", () => {
    const response = buildPricingResponse();
    const summaries = PlanCatalog.publicSummaries();
    for (const plan of summaries.filter((p) => p.category === "block")) {
      expect(response).toContain(plan.name);
      expect(response).toContain(plan.priceDisplay);
    }
    expect(response).toMatch(/NP12345/);
    expect(response).toMatch(/MENTO12345/);
    expect(response).toMatch(/Add Hours|A La Carte/);
  });
});

