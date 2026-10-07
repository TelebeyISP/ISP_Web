import { useNavigate } from "react-router-dom";
import { Check, ShieldCheck, Zap, Globe, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/hooks/use-shop";
import { useEffect, useState } from "react";
import { fetchPlans, type ApiGatePlan } from "@/lib/apigate";

type DisplayPlan = {
  id: string;
  code: string;
  variantCode: string;
  name: string;
  price: number;
  data: string;
  description: string;
  features: string[];
  color: string;
  popular?: boolean;
};

const FALLBACK_PLANS: DisplayPlan[] = [
  {
    id: "plan-starter",
    code: "starter_plan",
    variantCode: "STARTER_PLAN_VARIANT",
    name: "Starter Plan",
    price: 15.00,
    data: "5GB",
    description: "A single line for light 5G use at home, on campus, or around town.",
    features: ["5GB of 5G data", "Unlimited talk and text", "Bring your own phone", "eSIM ready", "Change or pause anytime"],
    color: "blue"
  },
  {
    id: "plan-unlimited",
    code: "unlimited_pro",
    variantCode: "UNLIMITED_PRO_VARIANT",
    name: "Unlimited Pro",
    price: 45.00,
    data: "Unlimited",
    description: "Full-speed data for streaming, hotspot, and a busy household.",
    features: ["Unlimited 5G data", "Mobile hotspot included", "Works alongside home internet", "Priority on the Telebey network", "The price on the card is the monthly price"],
    color: "indigo",
    popular: true
  },
  {
    id: "plan-explorer",
    code: "explorer_plus",
    variantCode: "EXPLORER_PLUS_VARIANT",
    name: "Global Explorer",
    price: 30.00,
    data: "20GB",
    description: "20GB you can use at home and while you travel.",
    features: ["20GB of travel-ready data", "Coverage in 150+ countries", "Turn the eSIM on before you fly", "Travel data is included in this plan"],
    color: "teal"
  }
];

function formatDataAllowance(dataLimitMb: number): string {
  if (dataLimitMb >= 999_999) return "Unlimited";
  if (dataLimitMb >= 1024) return `${Math.round(dataLimitMb / 1024)}GB`;
  return `${dataLimitMb}MB`;
}

function mapApiPlan(plan: ApiGatePlan, index: number): DisplayPlan {
  const data = formatDataAllowance(plan.dataLimitMb);
  const features = [
    `${data} 5G data`,
    `${plan.validityDays}-day validity`,
    "eSIM included",
    plan.description || "Telebey network access",
  ];
  return {
    id: plan.id,
    code: plan.name.toLowerCase().replace(/\s+/g, "_"),
    variantCode: plan.id,
    name: plan.name,
    price: plan.priceCents / 100,
    data,
    description: plan.description || "Telebey data plan",
    features,
    color: ["blue", "indigo", "teal"][index % 3],
    popular: index === 1,
  };
}

export function Plans() {
  const { addToCart } = useShop();
  const navigate = useNavigate();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [plans, setPlans] = useState<DisplayPlan[]>(FALLBACK_PLANS);
  const [fromApiGate, setFromApiGate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchPlans()
      .then((apiPlans) => {
        if (cancelled || !apiPlans.length) return;
        setPlans(apiPlans.map(mapApiPlan));
        setFromApiGate(true);
      })
      .catch(() => {
        if (!cancelled) setFromApiGate(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddToCart = async (plan: DisplayPlan) => {
    setAddingId(plan.id);
    try {
      await addToCart(plan.variantCode, 1, {
        productName: plan.name,
        variantName: plan.data,
        unitPrice: Math.round(plan.price * 100),
      });
      navigate("/cart");
    } catch (err) {
      console.error("Add to cart failed", err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <main className="flex-1 flex flex-col py-16 bg-muted/10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 tracking-tight">
            Choose a <span className="text-primary italic">Telebey</span> mobile plan
          </h1>
          <p className="text-lg text-muted-foreground">
            Three 5G plans. The price you see is the monthly price. Bring your own phone, or add a device from the shop and pair the line with home internet.
          </p>
          <p className="mt-3 text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
            {fromApiGate ? "Live catalog from ApiGate" : "Showing catalog (ApiGate offline — local fallback)"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-card border ${plan.popular ? 'border-primary ring-1 ring-primary/20' : 'border-border'} rounded-2xl p-8 flex flex-col shadow-sm hover:shadow-xl transition-all hover:translate-y-[-4px] active:scale-[0.99] group`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-2 translate-y-[-10px] bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg z-10">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-primary/10 text-primary`}>
                  {plan.data === "Unlimited" ? <Zap className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                </div>
                <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{plan.name}</h2>
                <p className="text-muted-foreground text-sm h-10 overflow-hidden line-clamp-2 italic">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-foreground tracking-tight">${plan.price}</span>
                  <span className="text-muted-foreground font-medium text-sm">/mo</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 p-0.5 rounded-full bg-green-500/10 text-green-500">
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground leading-snug">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handleAddToCart(plan)}
                disabled={addingId === plan.id}
                className={`w-full h-12 font-bold text-lg rounded-xl shadow-md transition-all ${plan.popular ? 'bg-primary hover:bg-primary-dark shadow-primary/20' : 'bg-foreground hover:bg-foreground/90'}`}
              >
                {addingId === plan.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Select Plan"
                )}
              </Button>
              
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Secure Checkout
              </div>
            </div>
          ))}
        </div>

        {/* Global Features Banner */}
        <div className="mt-20 p-10 bg-primary/5 border border-primary/10 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
            <Globe className="w-8 h-8 text-primary opacity-50" />
            <span className="font-bold text-lg leading-tight">Use your plan at home and in 150+ countries</span>
          </div>
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-primary opacity-50" />
            <span className="font-bold text-lg leading-tight">Change, pause, or stop a plan</span>
          </div>
          <div className="flex items-center gap-4">
            <Zap className="w-8 h-8 text-primary opacity-50" />
            <span className="font-bold text-lg leading-tight">eSIM activation in minutes</span>
          </div>
        </div>
      </div>
    </main>
  );
}
