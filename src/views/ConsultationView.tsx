import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  MessageSquare,
  ShieldCheck,
  Send,
  Camera,
} from 'lucide-react';
import { api } from '../utils/api.js';
import { LanguageCode, getTranslation } from '../utils/translations.js';

interface ConsultationViewProps {
  lang: LanguageCode;
  user: any;
}

export const ConsultationView: React.FC<ConsultationViewProps> = ({ lang }) => {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [subject, setSubject] = useState('');
  const [cropName, setCropName] = useState('Mustard');
  const [plotName, setPlotName] = useState('South Meadow');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Normal');

  const t = (key: string) => getTranslation(lang, key);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const [consRes, cropRes] = await Promise.all([
        api.consultations.getAll(),
        api.crops.getAll(),
      ]);
      setConsultations(consRes.consultations || []);
      setCrops(cropRes.crops || []);
      if (cropRes.crops && cropRes.crops.length > 0) {
        setCropName(cropRes.crops[0].cropName);
      }
    } catch (err) {
      console.error('Failed to load consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;
    try {
      await api.consultations.create({
        subject,
        cropName,
        plotName,
        description,
        urgency,
      });
      setShowModal(false);
      setSubject('');
      setDescription('');
      fetchConsultations();
    } catch (err) {
      console.error('Failed to create consultation:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              KVK & ICAR Scientists
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Krishi Vigyan Kendra Network</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1 flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-emerald-600" />
            <span>{t('expertConsultation')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 max-w-2xl">
            Submit complex crop pathology questions, soil reports, or pest outbreaks directly to regional agricultural scientists and extension officers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Consultation Request</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {consultations.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs space-y-4 hover:border-emerald-200 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      item.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    Status: {item.status}
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    Crop: {item.cropName} ({item.plotName})
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mt-1.5">{item.subject}</h3>
              </div>

              <span className="text-xs text-gray-400">
                Logged on {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-700 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 leading-relaxed">
              <span className="font-bold text-gray-900 block mb-1">Farmer Query:</span>
              {item.description}
            </p>

            {item.expertReply && (
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-extrabold text-emerald-950">
                    Prescription by {item.assignedExpert}
                  </span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  {item.expertReply}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Consultation Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 w-full max-w-md overflow-hidden">
            <div className="p-6 bg-emerald-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-lime-400" />
                <h3 className="font-extrabold text-lg">Consult Agronomist</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full bg-emerald-800 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Query Subject
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Leaf spot identification & dosage advice"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Affected Crop
                  </label>
                  <select
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    {crops.map((c) => (
                      <option key={c._id} value={c.cropName}>
                        {c.cropName}
                      </option>
                    ))}
                    <option value="Other">Other Crop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Urgency
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High (Severe Pest Attack)">High (Severe Attack)</option>
                    <option value="Low">Low (General Guidance)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Detailed Description & Symptoms
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe leaf discoloration, soil moisture, previous fertilizer doses, and age of crop..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] mt-2"
              >
                Submit Consultation Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
