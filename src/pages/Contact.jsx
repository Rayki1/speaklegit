import { useState } from "react";
import LandingLayout from "../layouts/LandingLayout";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    message: "",
  });

  const [submitStatus, setSubmitStatus] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus("");
    setIsSubmitting(true);

    try {
      const payload = {
        access_key: "5b26a08f-303a-40ff-a6ff-48c0db5d7e65",
        subject: "New Contact Message from SPEAKS",
        from_name: "SPEAKS Contact Form",
        name: formData.name,
        contact: formData.contact,
        message: formData.message,
      };

      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to send message.");
      }

      setStatusType("success");
      setSubmitStatus(
        "Thank you for your message! It was sent successfully to Speaksoncloud@gmail.com."
      );

      setFormData({
        name: "",
        contact: "",
        message: "",
      });
    } catch (error) {
      setStatusType("error");
      setSubmitStatus(error.message || "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <LandingLayout>
      <div className="mx-auto max-w-6xl py-10 sm:py-12 md:py-16 px-4">
        <div className="text-center mb-10 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-white/70 text-base sm:text-lg md:text-xl">
            We'd love to hear from you!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 md:p-8 space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 md:mb-6">
                Get In Touch
              </h2>
              <p className="text-white/70 text-base md:text-lg leading-relaxed">
                Have questions or feedback about SPEAKS? Send us a message anytime.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 text-white/80 hover:text-white transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-2xl">📧</span>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 uppercase tracking-wider">
                      Email
                    </p>
                    <p className="font-semibold">Speaksoncloud@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 md:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-purple-400 mb-6 md:mb-8">
              Send Us A Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="hidden"
                name="access_key"
                value="5b26a08f-303a-40ff-a6ff-48c0db5d7e65"
              />

              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Email or Phone Number"
                  required
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                />
              </div>

              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Message"
                  required
                  rows="5"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg rounded-2xl transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-95"
              >
                {isSubmitting ? "Sending..." : "Send"}
              </button>

              {submitStatus && (
                <p
                  className={`rounded-2xl px-4 py-3 text-sm sm:text-base ${
                    statusType === "success"
                      ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                      : "border border-red-500/30 bg-red-500/10 text-red-200"
                  }`}
                >
                  {submitStatus}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}

export default Contact;