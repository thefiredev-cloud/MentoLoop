import { internal } from "../../_generated/api";

export class PaymentInvoiceManager {
  async handleInvoiceEvent(ctx: any, event: any): Promise<void> {
    const invoice = event.data.object;
    try {
      await ctx.db.insert("stripeInvoices", {
        stripeInvoiceId: invoice.id,
        stripeCustomerId: invoice.customer,
        subscriptionId: invoice.subscription || undefined,
        amountDue: invoice.amount_due,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
        invoicePdf: invoice.invoice_pdf,
        createdAt: (invoice.created ? invoice.created * 1000 : Date.now()),
        dueDate: invoice.due_date ? invoice.due_date * 1000 : undefined,
        paidAt: invoice.status === "paid" && invoice.status_transitions?.paid_at ? invoice.status_transitions.paid_at * 1000 : undefined,
        metadata: invoice.metadata || {},
      });
    } catch {
      const existing = await ctx.db
        .query("stripeInvoices")
        .withIndex("byInvoiceId", (q: any) => q.eq("stripeInvoiceId", invoice.id))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, {
          status: invoice.status,
          amountPaid: invoice.amount_paid,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf,
          updatedAt: Date.now(),
        } as any);
      }
    }

    try {
      await ctx.db.insert("paymentsAudit", {
        action: `webhook_${event.type}`,
        stripeObject: "invoice",
        stripeId: invoice.id,
        details: { status: invoice.status },
        createdAt: Date.now(),
      });
    } catch {}

    try {
      const status: string = (invoice.status || '').toString();
      const subscriptionId: string | undefined = invoice.subscription || undefined;
      const customerId: string | undefined = invoice.customer || undefined;
      const paidNow = status === 'paid';

      if (subscriptionId && customerId && paidNow) {
        const customerEmail = invoice.customer_email || invoice.customer_details?.email || undefined;
        if (customerEmail) {
          const user = await ctx.runQuery(internal.users.getUserByEmail, { email: customerEmail });
          if (user) {
            await ctx.runMutation(internal.students.updateStudentPaymentStatus, {
              userId: user._id,
              paymentStatus: 'paid',
              membershipPlan: (invoice.metadata?.membershipPlan || '').toString(),
              stripeSessionId: (invoice.metadata?.stripeSessionId || '').toString(),
              stripeCustomerId: customerId.toString(),
              paidAt: Date.now(),
            });
          }
        }
      }
    } catch {}
  }
}
