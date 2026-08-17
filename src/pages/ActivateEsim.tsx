import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { activateSim } from "@/lib/apigate";
import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export function ActivateEsim() {
  const { isAuthenticated } = useAuth();
  const [iccid, setIccid] = useState("");
  const [imsi, setImsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleActivate = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isAuthenticated) {
      setError("Sign in first so ApiGate can attach this eSIM to your account.");
      return;
    }

    const trimmedIccid = iccid.replace(/\s+/g, "");
    const trimmedImsi = imsi.replace(/\s+/g, "");
    if (trimmedIccid.length < 19 || trimmedIccid.length > 20) {
      setError("ICCID must be 19 or 20 digits.");
      return;
    }
    if (trimmedImsi.length !== 15) {
      setError("IMSI must be exactly 15 digits.");
      return;
    }

    setLoading(true);
    try {
      const sim = await activateSim(trimmedIccid, trimmedImsi);
      setSuccess(`eSIM ${sim.iccid} is now ${sim.status} on ApiGate.`);
      setIccid("");
      setImsi("");
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })?.response;
      setError(status?.data?.message || "Activation failed. Check the ICCID/IMSI and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center py-24 bg-background">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <h1 className="text-4xl font-heading font-bold mb-6">Activate Your eSIM</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Ready to join the Telebey network? Enter the ICCID and IMSI from your eSIM kit. Activation is processed by ApiGate.
        </p>
        
        <form onSubmit={handleActivate} className="bg-card border border-border rounded-xl p-8 shadow-sm text-left">
          {error && (
            <div className="mb-4 flex gap-2 items-start text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 flex gap-2 items-start text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-bold mb-2" htmlFor="iccid">ICCID (19–20 digits)</label>
            <input 
              id="iccid"
              type="text" 
              value={iccid}
              onChange={(e) => setIccid(e.target.value)}
              placeholder="e.g. 89101234567890123456" 
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2" htmlFor="imsi">IMSI (15 digits)</label>
            <input 
              id="imsi"
              type="text" 
              value={imsi}
              onChange={(e) => setImsi(e.target.value)}
              placeholder="e.g. 310260000000001" 
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button size="lg" className="w-full font-bold" type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Activate Now"}
          </Button>
          {!isAuthenticated && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link to="/auth" className="text-primary font-semibold hover:underline">Sign in</Link> to attach this eSIM to your account.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
