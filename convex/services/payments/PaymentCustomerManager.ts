import { internal } from "../../_generated/api";

export class PaymentCustomerManager {
  async handleCustomerCreated(ctx: any, customer: any): Promise<void> {
    if (customer.email) {
      try {
        const user = await ctx.runQuery(internal.users.getUserByEmail, { email: customer.email });
        if (user) {
          await ctx.runMutation(internal.users.updateUserMetadata, {
            userId: user._id,
            publicMetadata: { stripeCustomerId: customer.id },
          });
        }
      } catch {}
    }
  }

  async handleCustomerUpdated(ctx: any, customer: any): Promise<void> {
    if (customer.email) {
      try {
        const _user = await ctx.runQuery(internal.users.getUserByEmail, { email: customer.email });
        // Optionally sync additional metadata here
      } catch {}
    }
  }
}


