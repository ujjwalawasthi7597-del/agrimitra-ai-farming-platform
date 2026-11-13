import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Sparkles,
  User,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { api } from '../utils/api.js';
import { LanguageCode, getTranslation } from '../utils/translations.js';

interface AIAssistantViewProps {
  lang: LanguageCode;
  user: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({ lang, user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const t = (key: string) => getTranslation(lang, key);

  // Initialize speech recognition & welcome message
  useEffect(() => {
    // Check speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'pa' ? 'pa-IN' : 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Set welcome message in chosen language
    const welcomeText =
      lang === 'hi'
        ? `राम-राम ${user?.name || 'किसान भाई'}! मैं आपका **कृषि मित्र** AI सहायक हूँ। 🌾\n\nआप मुझसे किसी भी फसल (गेहूं, धान, सरसों, मक्का, सब्जी), खाद के हिसाब (NPK/डीएपी/यूरिया), कीट नियंत्रण, सिंचाई या सरकारी योजनाओं के बारे में पूछ सकते हैं। आप बोलकर भी सवाल पूछ सकते हैं!`
        : `Greetings ${user?.name || 'Farmer Friend'}! I am **AgriMitra**, your AI agricultural advisor grounded in ICAR research. 🌾\n\nAsk me anything regarding crop selection, fertilizer doses (per acre), organic pest control (Neem/Trichoderma), irrigation timing, or government schemes like PM-KISAN!`;

    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [lang, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content,
      }));

      const res = await api.ai.chat({
        message: textToSend.trim(),
        conversationHistory: historyPayload,
        preferredLanguage: lang,
      });

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Unable to reach the agricultural server. Please verify your query or network.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognitionRef.current.start();
    }
  };

  const handleSpeakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Strip markdown formatting for cleaner audio
    const clean = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const quickPills = [
    {
      en: 'How much urea should I apply for wheat at tillering?',
      hi: 'गेहूं में कल्ले निकलते समय कितना यूरिया डालना चाहिए?',
    },
    {
      en: 'How to make organic Neem oil spray for aphids?',
      hi: 'माहू (चेपा) की रोकथाम के लिए नीम का तेल कैसे तैयार करें?',
    },
    {
      en: 'What are the required documents for PM-KISAN e-KYC?',
      hi: 'पीएम किसान योजना में ई-केवाईसी के लिए कौन से दस्तावेज चाहिए?',
    },
    {
      en: 'Which crop is best for sandy loam soil with low water in summer?',
      hi: 'कम पानी वाली रेतीली दोमट मिट्टी में जायद में कौन सी फसल लगाएं?',
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-lime-400 text-white flex items-center justify-center shadow-md">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-gray-900">{t('aiAssistant')}</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                ICAR Grounded
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Instant answers in your language on fertilizers, pest management, and farming techniques.
            </p>
          </div>
        </div>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          title="Clear Chat"
          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-gray-400 uppercase shrink-0 flex items-center gap-1 pl-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          Quick Questions:
        </span>
        {quickPills.map((pill, idx) => {
          const text = lang === 'hi' ? pill.hi : pill.en;
          return (
            <button
              key={idx}
              onClick={() => handleSend(text)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-900 border border-emerald-100 text-xs font-semibold shrink-0 shadow-xs transition-colors"
            >
              {text}
            </button>
          );
        })}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-emerald-100 p-4 sm:p-6 shadow-xs flex flex-col h-[520px]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                    isUser
                      ? 'bg-emerald-700 text-white'
                      : 'bg-gradient-to-tr from-emerald-600 to-lime-500 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none space-y-2'
                  }`}
                >
                  <div className="whitespace-pre-line font-normal">{msg.content}</div>

                  <div
                    className={`flex items-center justify-between gap-2 pt-1.5 text-[10px] ${
                      isUser ? 'text-emerald-200' : 'text-gray-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleSpeakText(msg.content)}
                        className="flex items-center gap-1 hover:text-emerald-700 font-semibold"
                        title={t('speakResponse')}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-gray-500">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>AgriMitra is thinking and formulating guidance...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-gray-100 flex items-center gap-2">
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoiceListening}
              className={`p-3 rounded-2xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
              title={isListening ? t('listening') : t('voiceInput')}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? t('listening') : t('typeMessage')}
            className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl border border-gray-200 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-gray-50/50"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold disabled:opacity-40 transition-colors shadow-md active:scale-95"
            title={t('send')}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
