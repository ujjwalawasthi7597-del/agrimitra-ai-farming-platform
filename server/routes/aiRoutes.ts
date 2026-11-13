import { Router, Response } from 'express';
import { AIConversationModel } from '../models/AIConversation.js';
import { CropModel } from '../models/Crop.js';
import { UserModel } from '../models/User.js';
import { authMiddleware, AuthenticatedRequest } from '../auth.js';
import { getGeminiClient, GEMINI_MODEL } from '../gemini.js';
import { isMongoConnected } from '../db/connection.js';

const router = Router();

router.use(authMiddleware);

function requireDb(res: Response): boolean {
  if (!isMongoConnected()) {
    res.status(503).json({
      error: 'MongoDB is not connected. Please configure MONGODB_URI in your environment variables.',
    });
    return false;
  }
  return true;
}

function buildSystemPrompt(farmer: any, crops: any[], language: string) {
  const cropList =
    crops.map((c) => `${c.cropName} (${c.stage || 'growing'}, ${c.areaAcres} acres)`).join(', ') ||
    'Wheat, Mustard, Paddy';
  const location = farmer?.location
    ? `${farmer.location.district || 'Karnal'}, ${farmer.location.state || 'Haryana'}`
    : 'Northern Plains, India';

  return `You are AgriMitra (कृषि मित्र), an elite, compassionate AI Agricultural Advisor and Agronomist built for Indian farmers.
You are grounded in authentic agricultural research from ICAR (Indian Council of Agricultural Research), State Agricultural Universities (SAUs), and Krishi Vigyan Kendras (KVKs).

FARMER CONTEXT:
- Name: ${farmer?.name || 'Kisan Bhai'}
- Location: ${location}
- Active Crops: ${cropList}
- Soil Type: ${farmer?.primarySoilType || 'Alluvial Loam'}
- Irrigation Source: ${farmer?.irrigationSource || 'Borewell & Canal'}
- Preferred Language: ${language}

CORE INSTRUCTIONS:
1. Respond primarily in the farmer's selected language: ${language}.
2. Structure your guidance simply:
   - Direct, actionable answer
   - Exact quantities/dosages per acre (e.g., kg/acre or ml/liter of water)
   - Proper timing (e.g. evening spraying, post-irrigation)
   - Organic / biological options first, followed by safe chemical recommendations if necessary
   - Safety disclaimers (gloves, masks, pre-harvest intervals)
3. Never invent unverified schemes or toxic chemical cocktails. Emphasize Integrated Pest Management (IPM).
4. Keep the tone respectful, encouraging, and farmer-friendly.`;
}

function generateFallbackResponse(query: string, language: string): string {
  const q = query.toLowerCase();
  const isHindi = language.toLowerCase().includes('hi') || language.toLowerCase().includes('hindi');

  if (q.includes('urea') || q.includes('fertilizer') || q.includes('dap') || q.includes('खाद')) {
    if (isHindi) {
      return `नमस्ते किसान भाई! उर्वरक (खाद) प्रबंधन के लिए ICAR की संस्तुतियां:\n\n1. **गेहूं के लिए:** 
- बुवाई के समय: 50 किग्रा डीएपी (DAP) + 20 किग्रा यूरिया प्रति एकड़ बेसल डोज।
- पहली सिंचाई (21 दिन बाद, सीआरआई स्टेज): 30-35 किग्रा यूरिया प्रति एकड़ टॉप ड्रेसिंग।
- दूसरी सिंचाई (40-45 दिन बाद): 25 किग्रा यूरिया प्रति एकड़।

2. **सुझाव:**
- यूरिया हमेशा शाम के समय छिटकें और उसके बाद हल्की सिंचाई करें।
- नैनो यूरिया (Nano Urea) 4 मिली प्रति लीटर पानी की दर से कल्ले निकलते समय बहुत लाभकारी है।`;
    }
    return `Hello Farmer Friend! Balanced fertilizer schedule as per ICAR guidelines:\n\n1. **For Wheat / Rabi Cereals (per acre):**
- **Basal Dose (at sowing):** 50 kg DAP + 20 kg Urea + 15 kg MOP + 5 kg Zinc Sulphate (33%).
- **First Top Dressing (CRI stage, 21-25 days):** 30-35 kg Urea per acre.
- **Second Top Dressing (Jointing, 40-45 days):** 25-30 kg Urea per acre.`;
  }

  if (isHindi) {
    return `नमस्ते किसान भाई! AgriMitra में आपका स्वागत है।\n\nआप किसी भी फसल, खाद, रोग या सरकारी योजना के बारे में पूछ सकते हैं!`;
  }

  return `Greetings from AgriMitra! Your smart farming advisory is ready. Feel free to ask any specific question regarding crop varieties, fertilizer calculations, pest identification, or government schemes!`;
}

// POST /chat - Chat with AI assistant and persist to MongoDB
router.post('/chat', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const { message, conversationHistory = [], preferredLanguage } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message text is required' });
      return;
    }

    const user = await UserModel.findById(req.user!.userId);
    const crops = await CropModel.find({ userId: req.user!.userId });
    const lang = preferredLanguage || user?.preferredLanguage || 'English';

    const ai = getGeminiClient();
    let replyText = '';

    if (ai) {
      try {
        const systemInstruction = buildSystemPrompt(user, crops, lang);
        const contents: any[] = [];
        for (const item of conversationHistory.slice(-8)) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content || item.text }],
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents,
          config: { systemInstruction },
        });

        replyText = response.text || '';
      } catch (geminiError: any) {
        console.error('Gemini chat error, using agronomy knowledge base fallback:', geminiError);
        replyText = generateFallbackResponse(message, lang);
      }
    } else {
      replyText = generateFallbackResponse(message, lang);
    }

    // Persist conversation in MongoDB
    await AIConversationModel.create({
      userId: req.user!.userId,
      userMessage: message,
      aiResponse: replyText,
      language: lang,
      timestamp: new Date().toISOString(),
    });

    res.json({
      reply: replyText,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('AI chat route error in MongoDB:', err);
    res.status(500).json({ error: 'Failed to process AI agricultural query' });
  }
});

// GET /history - Get conversation history for authenticated farmer
router.get('/history', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    const conversations = await AIConversationModel.find({ userId: req.user!.userId }).sort({ createdAt: 1 });
    res.json({ conversations });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load conversation history from MongoDB' });
  }
});

// DELETE /history - Clear conversation history for authenticated farmer
router.delete('/history', async (req: AuthenticatedRequest, res: Response) => {
  if (!requireDb(res)) return;

  try {
    await AIConversationModel.deleteMany({ userId: req.user!.userId });
    res.json({ message: 'Conversation history cleared from MongoDB' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear conversation history from MongoDB' });
  }
});

export default router;
