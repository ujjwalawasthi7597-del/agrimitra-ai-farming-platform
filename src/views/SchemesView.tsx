import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Search,
  ExternalLink,
  Phone,
  FileText,
  CheckCircle2,
  Sparkles,
  Bot,
  Send,
  X,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../utils/api.js';
import { LanguageCode, getTranslation } from '../utils/translations.js';

interface SchemesViewProps {
  lang: LanguageCode;
  user: any;
}

export const SchemesView: React.FC<SchemesViewProps> = ({ lang }) => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // AI Scheme Advisor
  const [showAiModal, setShowAiModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [sourceLinks, setSourceLinks] = useState<string[]>([]);

  const t = (key: string) => getTranslation(lang, key);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await api.schemes.getAll({
        category: category !== 'All' ? category : undefined,
        search: search.trim() || undefined,
      });
      setSchemes(res.schemes || []);
    } catch (err) {
      console.error('Failed to load schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes();
  };

  const handleAskSchemeAi = async () => {
    if (!question.trim() || aiLoading) return;
    setAiLoading(true);
    setAiAnswer(null);
    try {
      const res = await api.schemes.ask(question, lang);
      setAiAnswer(res.answer);
      setSourceLinks(res.sourceLinks || []);
    } catch (err) {
      console.error('Failed to ask scheme AI:', err);
      setAiAnswer('Unable to query government schemes database. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const categories = [
    'All',
    'Direct Income',
    'Insurance',
    'Credit',
    'Irrigation',
    'Mechanization',
    'Solar Energy',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Verified Central & State Schemes
            </span>
            <span className="text-xs text-emerald-600 font-semibold">100% Official Portals</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1 flex items-center gap-2.5">
            <Landmark className="w-6 h-6 text-emerald-600" />
            <span>{t('schemes')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 max-w-2xl">
            Explore subsidies, direct income support, low-interest credit (KCC), and crop insurance verified by the Ministry of Agriculture & Farmers Welfare.
          </p>
        </div>

        <button
          onClick={() => setShowAiModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 hover:from-emerald-700 hover:to-lime-600 text-emerald-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4 text-emerald-950" />
          <span>AI Scheme Eligibility Check</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                category === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PM-KISAN, KCC, Solar..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl border border-gray-200 bg-white focus:outline-hidden focus:border-emerald-500"
          />
        </form>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs hover:border-emerald-300 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-100 uppercase tracking-wider">
                    {scheme.category}
                  </span>
                  <h3 className="text-lg font-extrabold text-gray-900 mt-1.5">
                    {scheme.name}
                  </h3>
                  <p className="text-xs text-emerald-700 font-semibold">{scheme.hindiName}</p>
                </div>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-xl bg-gray-100 text-gray-800 shrink-0">
                  {scheme.code}
                </span>
              </div>

              {/* Financial Benefit */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 font-medium leading-relaxed">
                <span className="font-bold block text-emerald-900 mb-0.5">💰 Financial Benefit:</span>
                {scheme.financialBenefit}
              </div>

              {/* Eligibility Highlights */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Eligibility Criteria:
                </span>
                <ul className="text-xs text-gray-700 space-y-1">
                  {scheme.eligibility?.slice(0, 2).map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Documents Checklist */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                  Required Documents:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {scheme.documentsRequired?.map((doc: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 text-[10px] font-medium"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with Helpline & Official Portal Link */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
              <span className="text-gray-500 flex items-center gap-1 text-[11px]">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {scheme.helpline}
              </span>

              <a
                href={scheme.officialPortal}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Official Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* AI Scheme Eligibility Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-lime-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg">AI Scheme Eligibility Advisor</h3>
                  <p className="text-xs text-emerald-200">Strictly verified Ministry guidelines</p>
                </div>
              </div>

              <button
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-full bg-emerald-800 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Describe Your Situation or Farming Need:
                </label>
                <textarea
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. I am a small farmer in Karnal with 3 acres. I want to buy a tractor or install drip irrigation. What subsidies am I eligible for?"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-2xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-gray-50/50"
                />
              </div>

              <button
                onClick={handleAskSchemeAi}
                disabled={!question.trim() || aiLoading}
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-lime-300" />
                    <span>Checking Official Schemes...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-lime-300" />
                    <span>Check Scheme Eligibility</span>
                  </>
                )}
              </button>

              {aiAnswer && (
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Scheme Recommendation</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                    {aiAnswer}
                  </div>

                  {sourceLinks.length > 0 && (
                    <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap gap-2">
                      <span className="text-[11px] font-bold text-gray-500">Official Portals:</span>
                      {sourceLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-700 font-bold underline flex items-center gap-1"
                        >
                          <span>{link.replace('https://', '')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
