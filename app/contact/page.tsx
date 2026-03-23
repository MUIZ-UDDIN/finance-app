"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle, Clock, HelpCircle, Bug, Lightbulb } from "lucide-react";
import Link from "next/link";

const CONTACT_EMAIL = "noreply@financeai.app";

const faqItems = [
  { q: "Is FinanceAI free to use?", a: "Yes, FinanceAI is completely free. We may show non-intrusive ads to support development." },
  { q: "Where is my data stored?", a: "All your financial data is stored locally on your device using browser storage. We never send your transaction data to any server." },
  { q: "Can I use it offline?", a: "Yes! Install FinanceAI as a PWA from your browser and use it offline. Your data syncs when you reconnect." },
  { q: "How do I export my data?", a: "Go to Settings > Data Management > Export Backup. You can export as JSON or CSV from the Transactions page." },
  { q: "Can I use it on multiple devices?", a: "Currently, data is stored per device. Use the Export/Import feature in Settings to transfer data between devices." },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    const mailtoSubject = encodeURIComponent(`[FinanceAI ${subject}] ${name}`);
    const mailtoBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCategory: ${subject}\n\n${message}`
    );
    window.open(`mailto:${CONTACT_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`, "_blank");

    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Contact Us</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">We would love to hear from you</p>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <a href={`mailto:${CONTACT_EMAIL}`} className="card text-center hover:border-primary-300 dark:hover:border-primary-700 transition-colors group">
          <Mail className="w-6 h-6 text-primary-600 dark:text-primary-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-medium text-gray-900 dark:text-white">Email Us</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-all">{CONTACT_EMAIL}</p>
        </a>
        <div className="card text-center">
          <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-xs font-medium text-gray-900 dark:text-white">Response Time</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Within 24-48 hours</p>
        </div>
        <Link href="/about" className="card text-center hover:border-primary-300 dark:hover:border-primary-700 transition-colors group">
          <HelpCircle className="w-6 h-6 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-medium text-gray-900 dark:text-white">About Us</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Learn more about FinanceAI</p>
        </Link>
      </div>

      {/* Contact Form */}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/50 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Send a Message</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">This will open your email client</p>
          </div>
        </div>

        {sent && (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            Your email client should have opened. Thank you for reaching out!
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" className="input-field" required />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { value: "general", label: "General", icon: MessageSquare },
              { value: "bug", label: "Bug Report", icon: Bug },
              { value: "feature", label: "Feature Request", icon: Lightbulb },
              { value: "support", label: "Support", icon: HelpCircle },
            ].map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSubject(opt.value)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-medium transition-all border-2 ${
                    subject === opt.value
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us how we can help..."
            rows={4}
            className="input-field resize-none"
            required
          />
        </div>

        <button type="submit" className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2">
          <Send className="w-4 h-4" />
          Send Message
        </button>
      </form>

      {/* FAQ */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqItems.map((item, i) => (
            <div key={i} className="pb-4 border-b border-gray-50 dark:border-gray-800 last:border-0 last:pb-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">{item.q}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
