import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { supabase } from "../lib/supabase";
import { CheckCircle2, XCircle, ArrowLeft, CreditCard } from "lucide-react";
import { generateRandomAnimalName, getDefaultNotificationPreferences } from "../utils/animalNames";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState(""); // Honeypot field
  const [message, setMessage] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [cardError, setCardError] = useState("");
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const plan = searchParams.get("plan");
  
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(plan);

  // Logical derived state
  const cardComplete = selectedPlan === 'free' || (cardNumberComplete && cardExpiryComplete && cardCvcComplete);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setMessage("Please agree to the Terms and Conditions to create an account.");
      return;
    }

    if (!isPasswordValid) {
      setMessage("Please ensure your password meets all requirements.");
      return;
    }

    if (!doPasswordsMatch) {
      setMessage("Passwords do not match. Please try again.");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setMessage("Please enter your email address.");
      return;
    }

    if (selectedPlan !== "free" && !cardComplete) {
      setMessage("Please enter valid payment information to continue.");
      return;
    }
    
    if (selectedPlan !== "free" && (!stripe || !elements)) {
      setMessage("Payment system is not ready. Please refresh and try again.");
      return;
    }

    setProcessing(true);
    let paymentMethodId = null;
    let customerId = null;

    try {
      if (selectedPlan !== "free") {
        setMessage("Validating payment information...");
        const cardNumberElement = elements!.getElement(CardNumberElement);
        if (!cardNumberElement) {
          throw new Error("Card element not found");
        }

        const setupIntentResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-setup-intent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              "X-API-Key": import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ email }),
          }
        );

        if (!setupIntentResponse.ok) {
          const errorData = await setupIntentResponse.json();
          throw new Error(errorData.error || "Failed to initialize payment setup");
        }

        const setupData = await setupIntentResponse.json();
        const clientSecret = setupData.clientSecret;
        customerId = setupData.customerId;

        const { setupIntent, error: stripeError } = await stripe!.confirmCardSetup(
          clientSecret,
          {
            payment_method: {
              card: cardNumberElement,
              billing_details: {
                email,
                name: `${firstName} ${lastName}`.trim(),
              },
            },
          }
        );

        if (stripeError) {
          setMessage(`Payment validation failed: ${stripeError.message}`);
          setProcessing(false);
          return;
        }

        if (!setupIntent?.payment_method) {
          throw new Error("No payment method returned from Stripe");
        }

        paymentMethodId = typeof setupIntent.payment_method === 'string'
          ? setupIntent.payment_method
          : setupIntent.payment_method.id;
      }

      setMessage("Creating account...");

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            business_name: businessName,
          },
        },
      });

      if (signUpError) {
        console.error("Signup error details:", signUpError);
        setMessage("Error: " + signUpError.message);
        setProcessing(false);
        return;
      }

      if (signUpData.user && signUpData.session) {
        if (selectedPlan !== "free" && paymentMethodId && customerId) {
          const { error: customerUpdateError } = await supabase
            .from('stripe_customers')
            .update({ payment_method_id: paymentMethodId })
            .eq('customer_id', customerId);

          if (customerUpdateError) {
            console.error("Failed to store payment method:", customerUpdateError);
          }
        }

        const fullName = `${firstName} ${lastName}`.trim();
        const randomAnimalName = generateRandomAnimalName();
        const defaultNotificationPreferences = getDefaultNotificationPreferences();

        setTimeout(async () => {
          try {
            await supabase
              .from('profiles')
              .update({
                display_name: randomAnimalName,
                notification_preferences: defaultNotificationPreferences,
              })
              .eq('id', signUpData.user!.id);
          } catch (error) {
            console.error("Background profile update failed:", error);
          }
        }, 1500);

        setTimeout(async () => {
          try {
            const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/signup-webhook`;
            await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': import.meta.env.VITE_SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                full_name: fullName,
                email: email,
                website: website,
              }),
            });
          } catch (error) {
            console.error('Webhook notification failed:', error);
          }
        }, 100);

        setMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          const redirect = searchParams.get('redirect');
          if (redirect === 'bespoke-projects') {
            navigate('/bespoke-projects');
          } else if (redirect === 'get-premium') {
            navigate('/get-premium');
          } else {
            navigate('/');
          }
        }, 1000);
      } else if (signUpData.user && !signUpData.session) {
        setMessage("Email confirmation is enabled. Please disable it in Supabase Auth settings.");
        setProcessing(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
      setProcessing(false);
    }
  };

  // UI Step Renderers
  const renderIdentityStep = () => (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
          className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 w-1/2"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
          className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 w-1/2"
          required
        />
      </div>
      <input
        type="text"
        placeholder="Business Name (Optional)"
        value={businessName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusinessName(e.target.value)}
        className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
      />
      <div style={{ display: 'none' }} aria-hidden="true">
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
        className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
        className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
        className="p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
        required
      />

      <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
        <div className="text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">Password Requirements</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className={`flex items-center gap-1.5 text-xs ${passwordRequirements.minLength ? "text-green-400" : "text-slate-500"}`}>
            {passwordRequirements.minLength ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            8+ characters
          </div>
          <div className={`flex items-center gap-1.5 text-xs ${passwordRequirements.hasUpperCase ? "text-green-400" : "text-slate-500"}`}>
            {passwordRequirements.hasUpperCase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            Uppercase
          </div>
          <div className={`flex items-center gap-1.5 text-xs ${passwordRequirements.hasLowerCase ? "text-green-400" : "text-slate-500"}`}>
            {passwordRequirements.hasLowerCase ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            Lowercase
          </div>
          <div className={`flex items-center gap-1.5 text-xs ${passwordRequirements.hasNumber ? "text-green-400" : "text-slate-500"}`}>
            {passwordRequirements.hasNumber ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            Number
          </div>
          <div className={`flex items-center gap-1.5 text-xs ${passwordRequirements.hasSymbol ? "text-green-400" : "text-slate-500"}`}>
            {passwordRequirements.hasSymbol ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            Symbol
          </div>
          <div className={`flex items-center gap-1.5 text-xs ${doPasswordsMatch ? "text-green-400" : "text-slate-500"}`}>
            {doPasswordsMatch ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            Matches
          </div>
        </div>
      </div>
      
      <button
        type="button"
        disabled={!firstName.trim() || !lastName.trim() || !email.trim() || !password || !confirmPassword || !isPasswordValid || !doPasswordsMatch}
        onClick={() => setStep(2)}
        className="p-3 mt-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 transition-all font-bold shadow-lg"
      >
        Continue to Plans
      </button>
    </div>
  );

  const renderPlanSelectionStep = () => (
    <div className="flex flex-col gap-4">
      <div 
        onClick={() => setSelectedPlan("free")}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
          selectedPlan === "free" ? "border-orange-500 bg-orange-500/10" : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
        }`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-white text-lg">Free</span>
          <span className="text-orange-500 font-bold">$0/mo</span>
        </div>
        <p className="text-xs text-slate-400 italic">No credit card required</p>
      </div>

      <div 
        onClick={() => setSelectedPlan("premium")}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
          selectedPlan === "premium" ? "border-orange-500 bg-orange-500/10" : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
        }`}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="font-bold text-white text-lg">Premium</span>
          <span className="text-orange-500 font-bold">$199/mo</span>
        </div>
        <p className="text-xs text-slate-300">Full access to Hilex tools and indicators</p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={() => setStep(1)} className="flex-1 p-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-bold">Back</button>
        <button
          type="button"
          disabled={!selectedPlan}
          onClick={() => setStep(selectedPlan === "free" ? 4 : 3)}
          className="flex-1 p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 font-bold"
        >
          {selectedPlan === "free" ? "Continue" : "Next: Payment"}
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold mb-2">
          <CreditCard className="w-5 h-5 text-orange-500" />
          <span>Secure Card Setup</span>
        </div>
        
        <div className="space-y-3">
          <div className="p-3 bg-slate-800 rounded border border-slate-600 focus-within:border-orange-500 transition-colors">
            <CardNumberElement 
              options={{ style: { base: { color: '#fff', fontSize: '16px', '::placeholder': { color: '#64748b' } } } }}
              onChange={(e) => { setCardNumberComplete(e.complete); if (e.error) setCardError(e.error.message); else setCardError(""); }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-800 rounded border border-slate-600 focus-within:border-orange-500 transition-colors">
              <CardExpiryElement 
                options={{ style: { base: { color: '#fff', fontSize: '16px', '::placeholder': { color: '#64748b' } } } }}
                onChange={(e) => { setCardExpiryComplete(e.complete); if (e.error) setCardError(e.error.message); else setCardError(""); }}
              />
            </div>
            <div className="p-3 bg-slate-800 rounded border border-slate-600 focus-within:border-orange-500 transition-colors">
              <CardCvcElement 
                options={{ style: { base: { color: '#fff', fontSize: '16px', '::placeholder': { color: '#64748b' } } } }}
                onChange={(e) => { setCardCvcComplete(e.complete); if (e.error) setCardError(e.error.message); else setCardError(""); }}
              />
            </div>
          </div>
        </div>
      </div>
      {cardError && <p className="text-red-500 text-xs">{cardError}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={() => setStep(2)} className="flex-1 p-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-bold">Back</button>
        <button
          type="button"
          disabled={!cardNumberComplete || !cardExpiryComplete || !cardCvcComplete}
          onClick={() => setStep(4)}
          className="flex-1 p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 font-bold"
        >
          Review
        </button>
      </div>
    </div>
  );

  const renderFinalStep = () => (
    <div className="flex flex-col gap-4">
      <div className="p-4 bg-orange-500/5 rounded-lg border border-orange-500/20 text-center">
        <span className="text-slate-400 text-xs uppercase tracking-widest block mb-1">Plan Selection</span>
        <span className="text-white font-black text-xl tracking-tighter uppercase italic">{selectedPlan}</span>
      </div>
      
      <div className="flex items-start gap-2 p-1">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreedToTerms(e.target.checked)}
          className="mt-1 flex-shrink-0"
          required
        />
        <label htmlFor="terms" className="text-xs text-slate-400 leading-normal">
          I agree to the <button type="button" onClick={() => setShowTermsModal(true)} className="text-orange-500 underline">Terms and Conditions</button> and acknowledge the high risks of trading.
        </label>
      </div>

      <div className="flex gap-3 mt-2">
        <button type="button" onClick={() => setStep(selectedPlan === "free" ? 2 : 3)} className="flex-1 p-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-bold">Back</button>
        <button
          type="submit"
          disabled={!agreedToTerms || processing}
          className="flex-[2] p-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-slate-700 disabled:text-slate-500 font-black uppercase tracking-tight shadow-xl active:scale-95 transition-all"
        >
          {processing ? "Starting..." : "Complete Setup"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-4 max-w-sm w-full mx-auto p-8 bg-slate-800 rounded-xl shadow-2xl border border-slate-700"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase">
            {step === 1 && "Identity"}
            {step === 2 && "Plan"}
            {step === 3 && "Payment"}
            {step === 4 && "Finalize"}
          </h1>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`w-2 h-2 rounded-full transition-all duration-300 ${step === s ? 'bg-orange-500 w-4' : 'bg-slate-700'}`} />
            ))}
          </div>
        </div>

        {step === 1 && renderIdentityStep()}
        {step === 2 && renderPlanSelectionStep()}
        {step === 3 && renderPaymentStep()}
        {step === 4 && renderFinalStep()}

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-xs text-slate-500 hover:text-white transition-colors mt-6 uppercase tracking-widest font-bold flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3 h-3" /> Already have an account? Login
        </button>

        {message && (
          <p className={`text-xs text-center mt-4 p-3 rounded border font-bold uppercase tracking-tight ${
            message.includes('successfully') ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {message}
          </p>
        )}
      </form>

      {showTermsModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-hidden border-2 border-slate-700 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-700 text-center">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Hilex Terms of Service</h2>
            </div>
            <div className="p-8 overflow-y-auto text-sm text-slate-300 space-y-6 leading-relaxed">
              <section>
                <h3 className="font-bold text-white uppercase text-xs mb-2">1. Nature of Service</h3>
                <p>Hilex provides educational tools and analysis. We are not a broker, advisor, or investment manager.</p>
              </section>
              <section>
                <h3 className="font-bold text-red-500 uppercase text-xs mb-2">2. Massive Risk Warning</h3>
                <p className="font-bold italic">Trading financial markets involves extreme risk. You may lose all your capital. Past performance is zero guarantee of future success.</p>
              </section>
              <section>
                <h3 className="font-bold text-white uppercase text-xs mb-2">3. No Guarantees</h3>
                <p>We provide indicators and data as-is. We do not guarantee accuracy, reliability, or profitability.</p>
              </section>
              <section>
                <h3 className="font-bold text-white uppercase text-xs mb-2">4. Subscriptions</h3>
                <p>Premium tiers are billed monthly. Cancellations take effect at the end of the current cycle. No refunds.</p>
              </section>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-4">
              <button 
                onClick={() => { setAgreedToTerms(false); setShowTermsModal(false); }}
                className="flex-1 p-3 bg-slate-700 text-white font-bold rounded-lg uppercase text-xs tracking-widest"
              >
                Decline
              </button>
              <button 
                onClick={() => { setAgreedToTerms(true); setShowTermsModal(false); }}
                className="flex-1 p-3 bg-orange-500 text-white font-bold rounded-lg uppercase text-xs tracking-widest"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
