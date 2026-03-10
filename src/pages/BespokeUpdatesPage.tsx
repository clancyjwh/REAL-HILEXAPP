import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { Bell, X, HelpCircle } from "lucide-react";
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

export default function BespokeUpdatesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showKeyFindingsInfo, setShowKeyFindingsInfo] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    project_name: "",
    project_rundown: "",
    website: "",
    relevant_sources: "",
    focus_areas: [] as string[],
    other_focus_area: "",
    update_frequency: "",
    number_of_sources: "",
    additional_notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFocusAreaToggle = (area: string) => {
    setFormData((prev) => ({
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
        setSubmitMessage("You must be logged in to submit a request.");
        setIsSubmitting(false);
        return;
      }

      if (formData.focus_areas.length === 0) {
        setSubmitMessage("Please select at least one focus area.");
        setIsSubmitting(false);
        return;
      }

      const dbData = {
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        project_name: formData.project_name,
        project_rundown: formData.project_rundown,
        website: formData.website || null,
        relevant_sources: formData.relevant_sources || null,
        focus_areas: formData.focus_areas,
        update_frequency: formData.update_frequency,
        number_of_sources: parseInt(formData.number_of_sources),
        additional_notes: formData.additional_notes || null,
      };

      const { error: dbError } = await supabase
        .from("bespoke_updates")
        .insert([dbData]);

      if (dbError) {
        console.error("Database error:", dbError);
        setSubmitMessage("Error submitting your request. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const webhookData = {
        ...dbData,
        focus_areas: formData.focus_areas.join(", "),
        other_focus_area: formData.other_focus_area,
      };

      const webhookResponse = await fetch(
        "https://hook.us2.make.com/6vmmmh41c1y79dki4xyyzsnts2s6g0xk",
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

      setSubmitMessage(
        "Thanks for your submission. You'll start receiving your customized Hilex updates once your project feed is configured."
      );

      setFormData({
        name: "",
        email: user?.email || "",
        project_name: "",
        project_rundown: "",
        website: "",
        relevant_sources: "",
        focus_areas: [],
        other_focus_area: "",
        update_frequency: "",
        number_of_sources: "",
        additional_notes: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitMessage("Error submitting your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Bell className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold text-white">Hilex Bespoke Updates</h1>
          </div>
          <p className="text-lg text-slate-300 leading-relaxed">
            Hilex Bespoke Updates monitors news, government sites, social media and public data sources for topics that matter to your project. Whether it be new laws, market movers, grant opportunities or other areas of interest, Hilex delivers concise, relevant updates to your inbox — at the frequency you choose.
          </p>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Used for update delivery</p>
            </div>

            <div>
              <label
                htmlFor="project_name"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="project_name"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="project_rundown"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Project Rundown <span className="text-red-500">*</span>
              </label>
              <textarea
                id="project_rundown"
                name="project_rundown"
                value={formData.project_rundown}
                onChange={handleInputChange}
                required
                rows={5}
                placeholder="Detailed description of the project and what updates are relevant"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-slate-300 mb-2">
                Website <span className="text-slate-500 text-xs">(optional)</span>
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
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
                value={formData.relevant_sources}
                onChange={handleInputChange}
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
                      checked={formData.focus_areas.includes(area)}
                      onChange={() => handleFocusAreaToggle(area)}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-white text-sm">{area}</span>
                  </label>
                ))}
              </div>
              {formData.focus_areas.includes("Other") && (
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
                    value={formData.other_focus_area}
                    onChange={handleInputChange}
                    required={formData.focus_areas.includes("Other")}
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
                value={formData.update_frequency}
                onChange={handleInputChange}
                required
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
                value={formData.number_of_sources}
                onChange={handleInputChange}
                required
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
                htmlFor="additional_notes"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Additional Notes <span className="text-slate-500 text-xs">(optional)</span>
              </label>
              <textarea
                id="additional_notes"
                name="additional_notes"
                value={formData.additional_notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                isSubmitting
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
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
    </div>
  );
}
