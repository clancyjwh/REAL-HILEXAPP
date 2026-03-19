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
  const isFreePlan = plan === "free";
  const cardComplete = isFreePlan || (cardNumberComplete && cardExpiryComplete && cardCvcComplete);
  const [processing, setProcessing] = useState(false);

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

    if (!isFreePlan && (!cardComplete)) {
      setMessage("Please enter valid payment information to continue.");
      return;
    }
    
    if (!isFreePlan && (!stripe || !elements)) {
      setMessage("Payment system is not ready. Please refresh and try again.");
      return;
    }

    setProcessing(true);
    let paymentMethodId = null;
    let customerId = null;

    try {
      if (!isFreePlan) {
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
          emailRedirectTo: undefined,
        },
      });

      if (signUpError) {
        console.error("Signup error details:", signUpError);
        setMessage("Error: " + signUpError.message);
        setProcessing(false);
        return;
      }

      if (signUpData.user && signUpData.session) {
        console.log("Auth user created:", signUpData.user.id);

        if (!isFreePlan && paymentMethodId && customerId) {
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
              .eq('id', signUpData.user.id);
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
                website: website, // Include honeypot for backend check
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
        console.log("User created but email confirmation is required");
        setMessage("Email confirmation is enabled. Please disable it in Supabase Auth settings (Authentication > Providers > Email > Confirm email = OFF)");
        setProcessing(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <form
        onSubmit={handleSignup}
        className="flex flex-col gap-3 max-w-sm w-full mx-auto p-8 bg-slate-800 rounded-xl shadow-xl"
      >
        <h1 className="text-3xl font-bold text-white mb-4 text-center">Create Account</h1>

        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          className="border border-slate-600 bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          className="border border-slate-600 bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <input
          type="text"
          placeholder="Business Name"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
          className="border border-slate-600 bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {/* Honeypot field - Visually hidden to humans, but bots will fill it */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <input
            type="text"
            name="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-slate-600 bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-slate-600 bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="border border-slate-600 bg-slate-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {confirmPassword.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            {doPasswordsMatch ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-green-500">Passwords match</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-red-500">Passwords do not match</span>
              </>
            )}
          </div>
        )}

        {!isFreePlan && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <CreditCard className="w-4 h-4 text-orange-500" />
              Payment Information
            </label>
            <div className="space-y-3">
              <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                <CardNumberElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#ffffff',
                        '::placeholder': {
                          color: '#94a3b8',
                        },
                      },
                      invalid: {
                        color: '#ef4444',
                      },
                    },
                    placeholder: 'Card number',
                    hidePostalCode: true,
                  }}
                  onChange={(e) => {
                    setCardNumberComplete(e.complete);
                    setCardError(e.error ? e.error.message : "");
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <CardExpiryElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#ffffff',
                          '::placeholder': {
                            color: '#94a3b8',
                          },
                        },
                        invalid: {
                          color: '#ef4444',
                        },
                      },
                    }}
                    onChange={(e) => {
                      setCardExpiryComplete(e.complete);
                      if (e.error) setCardError(e.error.message);
                    }}
                  />
                </div>
                <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <CardCvcElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#ffffff',
                          '::placeholder': {
                            color: '#94a3b8',
                          },
                        },
                        invalid: {
                          color: '#ef4444',
                        },
                      },
                      placeholder: 'CVC',
                    }}
                    onChange={(e) => {
                      setCardCvcComplete(e.complete);
                      if (e.error) setCardError(e.error.message);
                    }}
                  />
                </div>
              </div>
            </div>
            {cardError && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <XCircle className="w-4 h-4" />
                <span>{cardError}</span>
              </div>
            )}
            <p className="text-xs text-slate-400">
              Your card will not be charged now. It will be securely stored for future billing.
            </p>
          </div>
        )}

        <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <div className="text-sm font-semibold text-slate-300 mb-2">Password Requirements:</div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              {passwordRequirements.minLength ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={passwordRequirements.minLength ? "text-green-500" : "text-slate-400"}>
                Minimum 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              {passwordRequirements.hasUpperCase ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={passwordRequirements.hasUpperCase ? "text-green-500" : "text-slate-400"}>
                At least one uppercase letter
              </span>
            </div>
            <div className="flex items-center gap-2">
              {passwordRequirements.hasLowerCase ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={passwordRequirements.hasLowerCase ? "text-green-500" : "text-slate-400"}>
                At least one lowercase letter
              </span>
            </div>
            <div className="flex items-center gap-2">
              {passwordRequirements.hasNumber ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={passwordRequirements.hasNumber ? "text-green-500" : "text-slate-400"}>
                At least one number
              </span>
            </div>
            <div className="flex items-center gap-2">
              {passwordRequirements.hasSymbol ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
              )}
              <span className={passwordRequirements.hasSymbol ? "text-green-500" : "text-slate-400"}>
                At least one symbol
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
          <input
            type="checkbox"
            id="termsCheckbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="termsCheckbox" className="text-sm text-slate-300 cursor-pointer">
            I agree to the{" "}
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-orange-500 hover:text-orange-400 underline font-medium"
            >
              Hilex Terms and Conditions
            </button>
          </label>
        </div>

        <button
          type="submit"
          disabled={!firstName.trim() || !lastName.trim() || !email.trim() || !agreedToTerms || !isPasswordValid || !doPasswordsMatch || !cardComplete || processing}
          className={`p-3 rounded-lg transition-colors font-semibold ${
            agreedToTerms && isPasswordValid && doPasswordsMatch && cardComplete && !processing
              ? "bg-orange-600 text-white hover:bg-orange-700"
              : "bg-slate-600 text-slate-400 cursor-not-allowed"
          }`}
        >
          {processing ? "Processing..." : "Create Account"}
        </button>

        <button
          type="button"
          onClick={() => {
            const redirect = searchParams.get('redirect');
            if (redirect) {
              navigate(`/login?redirect=${redirect}`);
            } else {
              navigate('/login');
            }
          }}
          className="flex items-center justify-center gap-2 p-3 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>

        {message && <p className="text-sm text-center mt-2 text-white">{message}</p>}
      </form>

      {showTermsModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-600">
            <div className="p-8">
              <div className="text-center border-b-2 border-slate-600 pb-6 mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">HYLEX OPTIMIZED TRENDS</h1>
                <h2 className="text-xl text-slate-300">TERMS OF SERVICE AND USER AGREEMENT</h2>
                <p className="text-sm text-slate-400 mt-4">Last Updated: November 7, 2025</p>
              </div>

              <div className="space-y-6 text-slate-200">
                <p className="font-bold text-orange-500">PLEASE READ THESE TERMS CAREFULLY BEFORE USING THIS PLATFORM.</p>

                <p>By creating an account and using Hilex ("the Platform," "we," "us," or "our"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Platform.</p>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">1. NATURE OF SERVICE</h3>
                  <p className="mb-3">Hilex is an educational platform that provides:</p>
                  <ul className="list-disc pl-6 space-y-1 mb-3">
                    <li>Technical analysis tools and calculators</li>
                    <li>Historical market data analysis</li>
                    <li>Algorithmic indicator calculations</li>
                    <li>Market sentiment summaries</li>
                    <li>Educational resources about technical analysis</li>
                  </ul>
                  <p className="mb-3">The Platform does NOT provide:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Personalized investment advice</li>
                    <li>Recommendations to buy or sell specific securities</li>
                    <li>Portfolio management services</li>
                    <li>Broker-dealer services</li>
                    <li>Financial planning or advisory services</li>
                  </ul>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">2. NOT FINANCIAL ADVICE</h3>
                  <p className="font-bold text-red-400 mb-3">CRITICAL DISCLAIMER:</p>
                  <p className="mb-3">All information, data, analytical scores, indicator readings, historical accuracy rates, market sentiment labels, and educational content provided on this Platform are for informational and educational purposes only and do NOT constitute financial, investment, trading, or legal advice.</p>
                  <p className="mb-2">You acknowledge and agree that:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>We are NOT a registered investment advisor, broker-dealer, or financial institution</li>
                    <li>We do NOT provide personalized recommendations tailored to your individual financial situation, goals, or risk tolerance</li>
                    <li>All analytical outputs are generated by algorithms analyzing publicly available historical data</li>
                    <li>No content on this Platform should be construed as a solicitation or offer to buy or sell securities</li>
                    <li>You are solely responsible for your own investment decisions</li>
                    <li>You should consult with a licensed financial advisor before making any investment decisions</li>
                  </ul>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">3. PAST PERFORMANCE DISCLAIMER</h3>
                  <p className="mb-3">Historical performance data, backtests, accuracy rates, win rates, and any references to past results DO NOT guarantee or predict future performance.</p>
                  <p className="mb-2">You acknowledge that:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Historical accuracy rates reflect past data only</li>
                    <li>Market conditions change continuously</li>
                    <li>Technical indicators can and do fail</li>
                    <li>No strategy, parameter set, or analytical approach guarantees profitable outcomes</li>
                    <li>Past success does not ensure future success</li>
                  </ul>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">4. RISK DISCLOSURE</h3>
                  <p className="mb-3">Trading and investing in securities, commodities, derivatives, and other financial instruments involve substantial risk of loss. You may lose some or all of your invested capital.</p>
                  <p className="mb-2">You acknowledge and accept that:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>All investments carry risk</li>
                    <li>You could lose your entire investment</li>
                    <li>Leveraged trading amplifies both gains and losses</li>
                    <li>Market volatility can result in rapid losses</li>
                    <li>We are not responsible for any trading losses you incur</li>
                    <li>You trade and invest at your own risk</li>
                  </ul>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">5. NO GUARANTEES OR WARRANTIES</h3>
                  <p className="mb-3">The Platform and all content are provided "AS IS" without warranties of any kind, either express or implied, including but not limited to:</p>
                  <ul className="list-disc pl-6 space-y-1 mb-3">
                    <li>Accuracy, completeness, or reliability of information</li>
                    <li>Fitness for a particular purpose</li>
                    <li>Uninterrupted or error-free operation</li>
                    <li>Freedom from bugs, viruses, or harmful components</li>
                  </ul>
                  <p className="mb-2">We do not guarantee:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>The accuracy of any data, calculations, or analytical outputs</li>
                    <li>The performance of any indicators or strategies</li>
                    <li>The availability or uptime of the Platform</li>
                    <li>That the Platform meets your specific requirements</li>
                  </ul>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">6. LIMITATION OF LIABILITY</h3>
                  <p className="mb-3">To the fullest extent permitted by law, Hilex, its owners, operators, employees, and affiliates shall NOT be liable for any:</p>
                  <ul className="list-disc pl-6 space-y-1 mb-3">
                    <li>Direct, indirect, incidental, special, or consequential damages</li>
                    <li>Loss of profits, revenue, data, or business opportunities</li>
                    <li>Trading losses or investment losses of any kind</li>
                    <li>Damages arising from your use or inability to use the Platform</li>
                    <li>Damages arising from errors, omissions, or inaccuracies in content</li>
                    <li>Damages arising from third-party actions or content</li>
                  </ul>
                  <p>Your sole remedy for dissatisfaction with the Platform is to discontinue use.</p>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">7. USER RESPONSIBILITIES</h3>
                  <p className="mb-2">You agree to:</p>
                  <ul className="list-disc pl-6 space-y-1 mb-3">
                    <li>Use the Platform for educational purposes only</li>
                    <li>Conduct your own due diligence before making investment decisions</li>
                    <li>Verify all information independently</li>
                    <li>Consult qualified professionals (financial advisors, tax advisors, legal counsel) before acting on any information</li>
                    <li>Not rely solely on Platform outputs for investment decisions</li>
                    <li>Take full responsibility for your investment outcomes</li>
                    <li>Comply with all applicable laws and regulations</li>
                  </ul>
                  <p className="mb-2">You agree NOT to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Use the Platform for illegal purposes</li>
                    <li>Attempt to manipulate, hack, or disrupt the Platform</li>
                    <li>Share your account credentials with others</li>
                    <li>Scrape, copy, or redistribute Platform content without permission</li>
                    <li>Misrepresent the Platform's capabilities to others</li>
                    <li>Use the Platform in violation of securities laws or regulations</li>
                  </ul>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">8. DATA AND INFORMATION SOURCES</h3>
                  <p className="mb-3">All market data and information are obtained from third-party sources we believe to be reliable, but we do not guarantee their accuracy, completeness, or timeliness.</p>
                  <p className="mb-2">You acknowledge that:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Data may contain errors, delays, or omissions</li>
                    <li>We are not responsible for third-party data inaccuracies</li>
                    <li>You should verify all information through official sources</li>
                    <li>Market data is provided for informational purposes only</li>
                  </ul>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">9. INTELLECTUAL PROPERTY</h3>
                  <p className="mb-3">All content, algorithms, design elements, trademarks, and intellectual property on the Platform are owned by or licensed to Hilex and are protected by copyright, trademark, and other intellectual property laws.</p>
                  <p className="mb-2">You may not:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Reproduce, distribute, or create derivative works without permission</li>
                    <li>Reverse-engineer our algorithms or proprietary methods</li>
                    <li>Remove copyright or proprietary notices</li>
                  </ul>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">10. ACCOUNT TERMINATION</h3>
                  <p className="mb-2">We reserve the right to suspend or terminate your account at any time, with or without notice, for:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Violation of these Terms</li>
                    <li>Fraudulent, abusive, or illegal activity</li>
                    <li>Any reason at our sole discretion</li>
                  </ul>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">11. MODIFICATIONS TO TERMS</h3>
                  <p>We may modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the modified Terms. We will notify users of material changes via email or Platform notification.</p>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">12. GOVERNING LAW AND DISPUTES</h3>
                  <p>These Terms are governed by the laws of the United States. Any disputes shall be resolved through binding arbitration, except where prohibited by law.</p>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">13. SEVERABILITY</h3>
                  <p>If any provision of these Terms is found to be unenforceable, the remaining provisions shall remain in full force and effect.</p>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">14. ENTIRE AGREEMENT</h3>
                  <p>These Terms constitute the entire agreement between you and Hilex regarding use of the Platform and supersede all prior agreements.</p>
                </div>

                <div className="border-t border-slate-600 pt-4">
                  <h3 className="text-xl font-bold text-white mb-3">15. CONTACT INFORMATION</h3>
                  <p>For questions about these Terms, contact us at: support@hylextrends.com</p>
                </div>

                <div className="border-t-2 border-slate-600 pt-6 mt-6">
                  <h3 className="text-xl font-bold text-white mb-3 text-center">ACKNOWLEDGMENT AND ACCEPTANCE</h3>
                  <p className="text-center">By clicking "I Agree", you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, including all disclaimers regarding the educational nature of the Platform and the substantial risks involved in trading and investing.</p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setAgreedToTerms(false);
                    setShowTermsModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                >
                  I Disagree
                </button>
                <button
                  onClick={() => {
                    setAgreedToTerms(true);
                    setShowTermsModal(false);
                  }}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
                >
                  I Agree
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
