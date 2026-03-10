import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Puzzle, X, Info, HelpCircle, Linkedin, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FOCUS_AREAS = [
  "Grants",
  "Regulations",
  "Legislation",
  "Permits",
  "Public Hearings",
  "Funding Programs",
  "Policy Changes",
  "Market Data",
  "Market Movers",
  "Other",
];

const UPDATE_FREQUENCIES = [
  "Daily",
  "Twice Weekly",
  "Weekly",
  "Biweekly",
  "Monthly",
];

const SOURCE_COUNTS = [3, 5, 7, 10, 15];

export default function BespokeProjectsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showReadMore, setShowReadMore] = useState(false);
  const [showUpdatesForm, setShowUpdatesForm] = useState(false);
  const [showKeyFindingsInfo, setShowKeyFindingsInfo] = useState(false);

  const [projectFormData, setProjectFormData] = useState({
    name: "",
    email: user?.email || "",
    company: "",
    industry_sector: "",
    project_focus: "",
    data_type: "",
    goal: "",
    additional_notes: "",
  });

  const [updatesFormData, setUpdatesFormData] = useState({
    website: "",
    relevant_sources: "",
    focus_areas: [] as string[],
    other_focus_area: "",
    update_frequency: "",
    number_of_sources: "",
    updates_additional_notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleProjectInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProjectFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdatesInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setUpdatesFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocusAreaToggle = (area: string) => {
    setUpdatesFormData((prev) => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(area)
        ? prev.focus_areas.filter((a) => a !== area)
        : [...prev.focus_areas, area],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      if (!user) {
        setSubmitMessage("You must be logged in to submit a project request.");
        setIsSubmitting(false);
        return;
      }

      if (showUpdatesForm && updatesFormData.focus_areas.length === 0) {
        setSubmitMessage("Please select at least one focus area for Bespoke Updates.");
        setIsSubmitting(false);
        return;
      }

      const combinedData = {
        user_id: user.id,
        name: projectFormData.name,
        email: projectFormData.email,
        company: projectFormData.company || null,
        industry_sector: projectFormData.industry_sector,
        project_focus: projectFormData.project_focus,
        data_type: projectFormData.data_type,
        goal: projectFormData.goal,
        additional_notes: projectFormData.additional_notes || null,
        ...(showUpdatesForm && {
          website: updatesFormData.website || null,
          relevant_sources: updatesFormData.relevant_sources || null,
          focus_areas: updatesFormData.focus_areas,
          update_frequency: updatesFormData.update_frequency,
          number_of_sources: parseInt(updatesFormData.number_of_sources),
          updates_additional_notes: updatesFormData.updates_additional_notes || null,
        }),
      };

      const { error: dbError } = await supabase
        .from("custom_projects")
        .insert([combinedData]);

      if (dbError) {
        console.error("Database error:", dbError);
        setSubmitMessage("Error submitting your request. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const webhookData = showUpdatesForm
        ? {
            ...combinedData,
            focus_areas: updatesFormData.focus_areas.join(", "),
            other_focus_area: updatesFormData.other_focus_area,
          }
        : combinedData;

      const webhookResponse = await fetch(
        "https://hook.us2.make.com/av92nyb6qbkx6vmobux3j412qpwmlpkh",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookData),
        }
      );

      if (!webhookResponse.ok) {
        console.warn("Webhook notification failed, but data was saved");
      }

      const successMessage = showUpdatesForm
        ? "Thanks for your submission. A member of the Hilex team will reach out shortly to discuss your project and configure your update feed."
        : "Thanks for your submission. A member of the Hilex team will reach out shortly to discuss your project.";

      setSubmitMessage(successMessage);

      setProjectFormData({
        name: "",
        email: user?.email || "",
        company: "",
        industry_sector: "",
        project_focus: "",
        data_type: "",
        goal: "",
        additional_notes: "",
      });

      setUpdatesFormData({
        website: "",
        relevant_sources: "",
        focus_areas: [],
        other_focus_area: "",
        update_frequency: "",
        number_of_sources: "",
        updates_additional_notes: "",
      });

      setShowUpdatesForm(false);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitMessage("Error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Hilex Bespoke Projects</h1>
          <p className="text-lg text-slate-300">
            Turn your own datasets into optimized trend analyses
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
            <h2 className="text-2xl font-bold text-white mb-4">What Are Bespoke Projects?</h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Hilex Bespoke Projects let you turn your own datasets into optimized trend analyses.
              We identify the parameter sets and patterns that have historically signaled turning
              points—optimizing your data for deeper, more informative analysis.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Whether you have proprietary data or need help sourcing it, our team will work with
              you to build custom analytical frameworks tailored to your specific needs.
            </p>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
            <h3 className="text-xl font-bold text-white mb-4">What to Expect</h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-orange-500 font-bold mt-1">1.</span>
                <span>Initial consultation to understand your objectives and data</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 font-bold mt-1">2.</span>
                <span>Custom parameter optimization and pattern identification</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 font-bold mt-1">3.</span>
                <span>Detailed analysis report with actionable insights</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 font-bold mt-1">4.</span>
                <span>Ongoing support and refinement as needed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Puzzle className="w-6 h-6 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">Custom Analysis Projects</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium text-slate-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="project-name"
                name="name"
                value={projectFormData.name}
                onChange={handleProjectInputChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="project-email" className="block text-sm font-medium text-slate-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="project-email"
                name="email"
                value={projectFormData.email}
                onChange={handleProjectInputChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-300 mb-2">
                Company <span className="text-slate-500 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={projectFormData.company}
                onChange={handleProjectInputChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="industry_sector" className="block text-sm font-medium text-slate-300 mb-2">
                Industry / Sector <span className="text-red-500">*</span>
              </label>
              <select
                id="industry_sector"
                name="industry_sector"
                value={projectFormData.industry_sector}
                onChange={handleProjectInputChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select an industry</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Private Equity">Private Equity</option>
                <option value="Energy">Energy</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="project_focus" className="block text-sm font-medium text-slate-300 mb-2">
                Project Focus <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="project_focus"
                name="project_focus"
                value={projectFormData.project_focus}
                onChange={handleProjectInputChange}
                placeholder="e.g., rental demand trends, deal flow optimization"
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="data_type" className="block text-sm font-medium text-slate-300 mb-2">
                Data Type <span className="text-red-500">*</span>
              </label>
              <select
                id="data_type"
                name="data_type"
                value={projectFormData.data_type}
                onChange={handleProjectInputChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select data type</option>
                <option value="I have my own dataset">I have my own dataset</option>
                <option value="I need help sourcing data">I need help sourcing data</option>
                <option value="Not sure yet">Not sure yet</option>
              </select>
            </div>

            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-slate-300 mb-2">
                Goal <span className="text-red-500">*</span>
              </label>
              <select
                id="goal"
                name="goal"
                value={projectFormData.goal}
                onChange={handleProjectInputChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select a goal</option>
                <option value="Identify patterns">Identify patterns</option>
                <option value="Optimize parameters">Optimize parameters</option>
                <option value="Benchmark performance">Benchmark performance</option>
                <option value="Custom research">Custom research</option>
              </select>
            </div>

            <div>
              <label htmlFor="project-additional_notes" className="block text-sm font-medium text-slate-300 mb-2">
                Additional Notes <span className="text-slate-500 text-xs">(optional)</span>
              </label>
              <textarea
                id="project-additional_notes"
                name="additional_notes"
                value={projectFormData.additional_notes}
                onChange={handleProjectInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />
            </div>

            {!showUpdatesForm && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-blue-400" />
                    <span className="text-slate-200 font-medium">Add Bespoke Updates?</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowReadMore(true)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showUpdatesForm && (
              <div className="space-y-5 pt-6 border-t border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Bespoke Updates Add-On</h3>
                  <button
                    type="button"
                    onClick={() => setShowUpdatesForm(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-slate-300 mb-2">
                    Your Company Website <span className="text-slate-500 text-xs">(optional)</span>
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={updatesFormData.website}
                    onChange={handleUpdatesInputChange}
                    placeholder="https://"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="relevant_sources"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Relevant Sources <span className="text-slate-500 text-xs">(optional)</span>
                  </label>
                  <textarea
                    id="relevant_sources"
                    name="relevant_sources"
                    value={updatesFormData.relevant_sources}
                    onChange={handleUpdatesInputChange}
                    rows={4}
                    placeholder="List any URLs or data sources to monitor"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Focus Areas <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {FOCUS_AREAS.map((area) => (
                      <label
                        key={area}
                        className="flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-750 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={updatesFormData.focus_areas.includes(area)}
                          onChange={() => handleFocusAreaToggle(area)}
                          className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="text-white text-sm">{area}</span>
                      </label>
                    ))}
                  </div>
                  {updatesFormData.focus_areas.includes("Other") && (
                    <div className="mt-4">
                      <label
                        htmlFor="other_focus_area"
                        className="block text-sm font-medium text-slate-300 mb-2"
                      >
                        Please Specify Focus Area <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="other_focus_area"
                        name="other_focus_area"
                        value={updatesFormData.other_focus_area}
                        onChange={handleUpdatesInputChange}
                        required={updatesFormData.focus_areas.includes("Other")}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="update_frequency"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Frequency of Updates <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="update_frequency"
                    name="update_frequency"
                    value={updatesFormData.update_frequency}
                    onChange={handleUpdatesInputChange}
                    required={showUpdatesForm}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select frequency</option>
                    {UPDATE_FREQUENCIES.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Recommended: Weekly</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label
                      htmlFor="number_of_sources"
                      className="block text-sm font-medium text-slate-300"
                    >
                      Key Findings Quantity <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowKeyFindingsInfo(true)}
                      className="text-slate-400 hover:text-slate-300 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                  <select
                    id="number_of_sources"
                    name="number_of_sources"
                    value={updatesFormData.number_of_sources}
                    onChange={handleUpdatesInputChange}
                    required={showUpdatesForm}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select number of key findings</option>
                    {SOURCE_COUNTS.map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Recommended: 4–6 key findings</p>
                </div>

                <div>
                  <label
                    htmlFor="updates-additional_notes"
                    className="block text-sm font-medium text-slate-300 mb-2"
                  >
                    Additional Notes <span className="text-slate-500 text-xs">(optional)</span>
                  </label>
                  <textarea
                    id="updates-additional_notes"
                    name="updates_additional_notes"
                    value={updatesFormData.updates_additional_notes}
                    onChange={handleUpdatesInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                isSubmitting
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Project Request"}
            </button>

            {submitMessage && (
              <div
                className={`p-4 rounded-lg ${
                  submitMessage.includes("Thanks")
                    ? "bg-green-900/30 border border-green-700 text-green-300"
                    : "bg-red-900/30 border border-red-700 text-red-300"
                }`}
              >
                {submitMessage}
              </div>
            )}
          </form>
        </div>
      </div>

      {showReadMore && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full p-8 relative">
            <button
              onClick={() => setShowReadMore(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-4">About Bespoke Updates</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              Hilex Bespoke Updates monitors news, government sites, social media and public data sources for topics that matter to your project. Whether it be new laws, market movers, grant opportunities or other areas of interest, Hilex delivers concise, relevant updates to your inbox — at the frequency you choose.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowReadMore(false);
                  setShowUpdatesForm(true);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Add Bespoke Updates
              </button>
              <button
                onClick={() => setShowReadMore(false)}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors"
              >
                Not Today
              </button>
            </div>
          </div>
        </div>
      )}

      {showKeyFindingsInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 max-w-2xl w-full p-8 relative">
            <button
              onClick={() => setShowKeyFindingsInfo(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-white mb-4">Key Findings Quantity</h2>
            <p className="text-slate-300 leading-relaxed">
              This setting controls how many key findings will appear in each update.
              A 'key finding' is a short, self-contained paragraph that highlights one important development — such as a new grant, regulatory update, policy shift, or credible news item — that matches your chosen project focus. Generally, 4-6 key findings is ideal: any less and you risk missing important updates, any more and the updates may not be as high quality.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-6">
        <a
          href="https://www.linkedin.com/search/results/all/?fetchDeterministicClustersOnly=true&heroEntityKey=urn%3Ali%3Aorganization%3A109950133&keywords=hylex%20optimized%20trends&origin=RICH_QUERY_SUGGESTION&position=0&searchId=193d177c-9b19-4dbf-b348-64d3c5bba970&sid=PLZ&spellCorrectionEnabled=false"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
        >
          <Linkedin className="w-5 h-5" />
          <span>Follow us on LinkedIn!</span>
        </a>
        <a
          href="https://x.com/HilEX_Optimized"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
        >
          <span className="w-5 h-5 flex items-center justify-center font-bold text-lg">𝕏</span>
          <span>Follow us on X!</span>
        </a>
        <a
          href="https://t.me/HilexOptimizedTrendsUpdatebot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors text-sm"
        >
          <Send className="w-5 h-5" />
          <span>Join our Telegram for daily updates!</span>
        </a>
      </div>
    </div>
  );
}
