import React, { useState, useEffect, useRef } from 'react';
import {
  ScanSearch,
  Upload,
  Camera,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Clock,
  Trash2,
  Info,
  ExternalLink,
} from 'lucide-react';
import { api } from '../utils/api.js';
import { LanguageCode, getTranslation } from '../utils/translations.js';

interface DiseaseDetectionViewProps {
  lang: LanguageCode;
  user: any;
}

export const DiseaseDetectionView: React.FC<DiseaseDetectionViewProps> = ({ lang }) => {
  const [samples, setSamples] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentReport, setCurrentReport] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: string) => getTranslation(lang, key);

  useEffect(() => {
    // Load samples & history
    api.disease.getSamples().then((res) => setSamples(res.samples || [])).catch(console.error);
    api.disease.getHistory().then((res) => {
      setHistory(res.reports || []);
      if (res.reports && res.reports.length > 0) {
        setCurrentReport(res.reports[0]);
      }
    }).catch(console.error);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setSelectedSampleId(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: any) => {
    setSelectedSampleId(sample.id);
    setSelectedImage(sample.image);
    setError(null);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage && !selectedSampleId) {
      setError('Please upload a leaf photo or pick a sample leaf.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const res = await api.disease.analyze({
        imageBase64: selectedSampleId ? undefined : selectedImage || undefined,
        sampleId: selectedSampleId || undefined,
        preferredLanguage: lang,
      });

      if (res.success && res.report) {
        setCurrentReport(res.report);
        setHistory((prev) => [res.report, ...prev]);
      }
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await api.disease.deleteReport(id);
      setHistory((prev) => prev.filter((r) => r._id !== id));
      if (currentReport?._id === id) {
        setCurrentReport(history.find((r) => r._id !== id) || null);
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              ICAR Vision Model
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Gemini 3.8 Flash Vision</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1 flex items-center gap-2.5">
            <ScanSearch className="w-6 h-6 text-emerald-600" />
            <span>{t('diseaseDetection')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Upload or capture an affected plant leaf to identify fungal, bacterial, viral diseases, or pest attacks. Powered by plant pathology knowledge and organic/chemical treatments.
          </p>
        </div>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Sample Selector */}
        <div className="lg:col-span-5 space-y-5">
          {/* Upload Card */}
          <div className="bg-white rounded-3xl border border-emerald-100 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>{t('uploadPhoto')}</span>
            </h2>

            {/* Dropzone / Preview */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative aspect-4/3 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 transition-all cursor-pointer flex flex-col items-center justify-center p-4 overflow-hidden group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              {selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt="Selected leaf"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                    <Camera className="w-4 h-4" />
                    <span>Change Image</span>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">
                      Tap to capture or upload leaf photo
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Clear close-up of leaf symptoms works best
                    </p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Run Analysis Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing || (!selectedImage && !selectedSampleId)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white font-extrabold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-lime-300" />
                  <span>{t('analyzing')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-lime-300" />
                  <span>Diagnose Foliage with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Verified Samples */}
          <div className="bg-white rounded-3xl border border-emerald-100 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                {t('useSampleLeaf')}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">1-Click Test</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className={`p-2 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                    selectedSampleId === s.id
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                      : 'border-gray-200 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{s.title}</p>
                    <span className="text-[10px] text-gray-500 block truncate">{s.crop}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pathology Report Card */}
        <div className="lg:col-span-7 space-y-5">
          {currentReport ? (
            <div className="bg-white rounded-3xl border border-emerald-100 p-6 sm:p-7 shadow-xs space-y-6">
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Crop: {currentReport.cropName}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        currentReport.healthStatus === 'Healthy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {currentReport.healthStatus}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                    {currentReport.diseaseName}
                  </h3>
                  {currentReport.vernacularName && (
                    <p className="text-sm font-semibold text-emerald-700">
                      {currentReport.vernacularName}
                    </p>
                  )}
                </div>

                {/* Confidence Pill */}
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 text-center shrink-0">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">
                    {t('confidence')}
                  </span>
                  <span className="text-2xl font-extrabold text-emerald-700">
                    {currentReport.confidence}%
                  </span>
                </div>
              </div>

              {/* Observed Symptoms */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>{t('symptoms')}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {currentReport.symptoms?.map((symptom: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Probable Causes */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>{t('causes')}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {currentReport.probableCauses?.map((cause: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preventive Measures */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t('prevention')}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {currentReport.preventiveMeasures?.map((measure: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{measure}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ICAR Recommended Treatments */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{t('treatments')}</span>
                </h4>
                <div className="space-y-2">
                  {currentReport.recommendedTreatments?.map((treatment: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 text-xs font-medium text-emerald-950 leading-relaxed"
                    >
                      {treatment}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prominent Agricultural Safety Disclaimer */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{t('disclaimerTitle')}</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  {currentReport.disclaimer || t('disclaimerText')}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-emerald-100 p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ScanSearch className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-gray-800 text-base">No Diagnosis Selected</h3>
              <p className="text-xs text-gray-500 max-w-sm">
                Upload a leaf image on the left or select a sample leaf to view full disease analysis, symptoms, and ICAR treatment guidelines.
              </p>
            </div>
          )}

          {/* Past Diagnosis History */}
          {history.length > 0 && (
            <div className="bg-white rounded-3xl border border-emerald-100 p-5 shadow-xs space-y-3">
              <span className="text-xs font-extrabold text-gray-900 uppercase tracking-wider block">
                Recent Diagnosis Reports ({history.length})
              </span>
              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                {history.map((rep) => (
                  <div
                    key={rep._id}
                    onClick={() => setCurrentReport(rep)}
                    className={`py-2.5 px-3 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      currentReport?._id === rep._id ? 'bg-emerald-50 font-bold' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                        {rep.cropName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{rep.diseaseName}</p>
                        <span className="text-[10px] text-gray-400">
                          {rep.createdAt ? new Date(rep.createdAt).toLocaleDateString() : 'Recent'} • {rep.confidence}% Confidence
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHistory(rep._id);
                      }}
                      className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
