'use client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import Link from "next/link"
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PlanCatalog } from "@/convex/constants/planCatalog";

export default function CustomClerkPricing() {
  const catalog = useQuery(api.billing.getPlanCatalog);
  const resolvedCatalog = catalog ?? PlanCatalog.publicSummaries();
  const plans = resolvedCatalog.filter((plan) => plan.category === "block");
  const addon = resolvedCatalog.find((plan) => plan.key === "a_la_carte");

    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan) => (
                <Card key={plan.key} className={`relative ${plan.highlight === 'popular' ? 'border-primary shadow-lg scale-105' : ''}`}>
                    {plan.highlight === 'popular' && (
                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                            Most Popular
                        </Badge>
                    )}
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                        <div className="mt-4">
                            <div className="text-3xl font-bold">{plan.priceDisplay}</div>
                            {plan.priceDetail ? (
                                <div className="text-sm text-muted-foreground">{plan.priceDetail}</div>
                            ) : null}
                            <div className="text-lg font-medium text-primary mt-1">{plan.hours ? `${plan.hours} hours` : 'Flexible hours'}</div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {plan.features.map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full" size="lg" variant={plan.highlight === 'popular' ? "default" : "outline"}>
                            <Link href={plan.ctaPath}>
                                Get Started
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
            </div>
            
            {addon ? (
                <div className="flex justify-center">
                    <Card className="max-w-md border-2 border-dashed border-primary/30">
                        <CardHeader className="text-center pb-4">
                            <CardTitle className="text-xl font-semibold">{addon.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{addon.description}</p>
                            <div className="mt-4">
                                <div className="text-3xl font-bold">{addon.priceUsd === 10 ? "$10/hr" : addon.priceDisplay}</div>
                                {addon.priceDetail ? (
                                    <div className="text-lg font-medium text-primary mt-1">{addon.priceDetail}</div>
                                ) : null}
                                <div className="text-sm text-muted-foreground">Same premium placement support</div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm">Purchase additional hours as needed</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm">Same quality preceptor matching</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <span className="text-sm">Bank unused hours within semester</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full" size="lg" variant="outline">
                                <Link href={addon.ctaPath}>
                                    Add Hours
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            ) : null}
            
            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Installment plans and student discounts available.
                </p>
            </div>
        </div>
    )
}