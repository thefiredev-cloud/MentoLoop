'use client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import Link from "next/link"

export default function CustomClerkPricing() {
    const plans = [
        {
            title: "Starter Block",
            subtitle: "Best for short rotations",
            hours: "60 hours",
            price: "$495",
            priceDetail: "≈ $8.25/hr",
            features: [
                "Guaranteed preceptor match",
                "Standard support + hour tracking", 
                "Bank unused hours within semester"
            ],
            buttonText: "Get Started",
            popular: false
        },
        {
            title: "Core Block", 
            subtitle: "Best value",
            hours: "90 hours",
            price: "$795",
            priceDetail: "≈ $8.83/hr",
            features: [
                "Everything in Starter",
                "Priority matching (within 14 days)",
                "Dedicated student support rep",
                "Midpoint check-in with student + preceptor"
            ],
            buttonText: "Get Started",
            popular: true
        },
        {
            title: "Pro Block",
            subtitle: "Best for full-semester placements", 
            hours: "180 hours",
            price: "$1,495",
            priceDetail: "≈ $8.31/hr",
            features: [
                "Everything in Core",
                "Top-priority placement (within 7–10 days)",
                "Dedicated Success Coordinator",
                "Flexible rollover (into next semester)",
                "Free access to mentorship resources",
                "Preceptor evaluation coaching included"
            ],
            buttonText: "Get Started",
            popular: false
        },
        {
            title: "Elite Block",
            subtitle: "Maximum hours and premium service", 
            hours: "240 hours",
            price: "$1,895",
            priceDetail: "≈ $7.90/hr",
            features: [
                "Everything in Pro",
                "Maximum rotation hours",
                "VIP preceptor matching",
                "24/7 priority support",
                "Immediate processing (24 hours)",
                "Bank unused hours within semester",
                "Evaluation assistance"
            ],
            buttonText: "Get Started",
            popular: false
        }
    ]

    return (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            
            {/* A La Carte Add-On Section */}
            <div className="flex justify-center">
                <Card className="max-w-md border-2 border-dashed border-primary/30">
                    <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl font-semibold">A La Carte Add-On</CardTitle>
                        <p className="text-sm text-muted-foreground">Flexible extras when you need more hours</p>
                        <div className="mt-4">
                            <div className="text-3xl font-bold">$10/hr</div>
                            <div className="text-lg font-medium text-primary mt-1">30hr blocks minimum</div>
                            <div className="text-sm text-muted-foreground">Aligns with institutional intervals</div>
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
                            <Link href="/student-intake">
                                Add Hours
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
            
            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    Installment plans and student discounts available.
                </p>
            </div>
        </div>
    )
}