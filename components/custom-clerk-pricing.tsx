'use client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import Link from "next/link"

export default function CustomClerkPricing() {
    const plans = [
        {
            title: "Core Block",
            subtitle: "Best for short rotations",
            hours: "60 hours",
            price: "$695",
            priceDetail: "≈ $11.58/hr",
            features: [
                "Guaranteed preceptor match",
                "Standard support + hour tracking", 
                "Bank unused hours within semester"
            ],
            buttonText: "Get Started",
            popular: false
        },
        {
            title: "Pro Block", 
            subtitle: "Best value",
            hours: "120 hours",
            price: "$1,295",
            priceDetail: "≈ $10.79/hr",
            features: [
                "Everything in Core",
                "Priority matching (within 14 days)",
                "Dedicated student support rep",
                "Midpoint check-in with student + preceptor"
            ],
            buttonText: "Get Started",
            popular: true
        },
        {
            title: "Premium Block",
            subtitle: "Best for full-semester placements", 
            hours: "180 hours",
            price: "$1,895",
            priceDetail: "≈ $10.53/hr",
            features: [
                "Everything in Pro",
                "Top-priority placement (within 7–10 days)",
                "Dedicated Success Coordinator",
                "Flexible rollover (into next semester)",
                "Free access to mentorship resources",
                "Preceptor evaluation coaching included"
            ],
            buttonText: "Get Started",
            popular: false
        }
    ]

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => (
                <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}>
                    {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                            Most Popular
                        </Badge>
                    )}
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl font-semibold">{plan.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                        <div className="mt-4">
                            <div className="text-3xl font-bold">{plan.price}</div>
                            <div className="text-sm text-muted-foreground">{plan.priceDetail}</div>
                            <div className="text-lg font-medium text-primary mt-1">{plan.hours}</div>
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
                        <Button asChild className="w-full" size="lg" variant={plan.popular ? "default" : "outline"}>
                            <Link href="/student-intake">
                                {plan.buttonText}
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}