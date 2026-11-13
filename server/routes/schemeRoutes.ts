import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../auth.js';
import { getGeminiClient, GEMINI_MODEL } from '../gemini.js';

const router = Router();

router.use(authMiddleware);

export interface GovScheme {
  id: string;
  code: string;
  name: string;
  hindiName: string;
  category: 'Direct Income' | 'Insurance' | 'Credit' | 'Irrigation' | 'Mechanization' | 'Organic Farming' | 'Solar Energy';
  targetAudience: string;
  financialBenefit: string;
  eligibility: string[];
  documentsRequired: string[];
  applicationProcedure: string[];
  officialPortal: string;
  helpline: string;
  tags: string[];
}

export const VERIFIED_SCHEMES: GovScheme[] = [
  {
    id: 'pm-kisan',
    code: 'PM-KISAN',
    name: 'Pradhan Mantri Kisan Samman Nidhi',
    hindiName: 'प्रधानमंत्री किसान सम्मान निधि योजना',
    category: 'Direct Income',
    targetAudience: 'All landholding farmer families across India',
    financialBenefit: '₹6,000 per year directly transferred into Aadhaar-seeded bank accounts in 3 equal installments of ₹2,000 every 4 months.',
    eligibility: [
      'All landholder farmer families with cultivable landholding in their names',
      'Small, marginal, and medium farmers eligible',
      'Exclusions: Institutional landholders, former/present constitutional post holders, serving/retired government officers, income tax payees of last assessment year.'
    ],
    documentsRequired: [
      'Aadhaar Card (Mandatory biometric / e-KYC)',
      'Land Ownership Record (Khatauni / Jamabandi / 7/12 extract)',
      'Aadhaar-linked active Bank Account with IFSC',
      'Active mobile number linked with Aadhaar OTP'
    ],
    applicationProcedure: [
      'Visit the official PM-KISAN portal (pmkisan.gov.in) or visit nearest Common Service Centre (CSC).',
      'Click on "Farmers Corner" -> "New Farmer Registration".',
      'Enter Aadhaar number and state, verify via mobile OTP.',
      'Fill in rural/urban land registration details, survey number, and upload land khatauni document.',
      'Complete mandatory e-KYC via facial authentication on PM-KISAN mobile app or biometric OTP at CSC.'
    ],
    officialPortal: 'https://pmkisan.gov.in',
    helpline: '155261 / 011-24300606 / Toll Free 1800-115-526',
    tags: ['income support', 'cash transfer', 'dbt', 'central government', 'pmkisan']
  },
  {
    id: 'pmfby',
    code: 'PMFBY',
    name: 'Pradhan Mantri Fasal Bima Yojana (Crop Insurance)',
    hindiName: 'प्रधानमंत्री फसल बीमा योजना',
    category: 'Insurance',
    targetAudience: 'All farmers growing notified food crops, oilseeds, and commercial/horticultural crops',
    financialBenefit: 'Comprehensive crop insurance from pre-sowing to post-harvest against non-preventable natural risks (drought, flood, unseasonal hail, pests). Nominal premium of only 2% for Kharif crops, 1.5% for Rabi crops, and 5% for annual commercial/horticultural crops; balance subsidy funded by Gov.',
    eligibility: [
      'All farmers growing notified crops in notified areas (both loanee and non-loanee farmers)',
      'Sharecroppers and tenant farmers with valid cultivation agreements',
      'Mandatory cut-off date enrollment before sowing deadline set by respective State Government.'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land revenue document (RoR / Khasra / B-1 / Khatauni)',
      'Sowing certificate issued by Patwari / Gram Pradhan / Agricultural Extension Officer',
      'Cancelled cheque or Bank Passbook copy with IFSC',
      'Tenancy agreement if applicable'
    ],
    applicationProcedure: [
      'Enroll through your bank branch (for KCC loan holders, enrollment is streamlined) or via pmfby.gov.in.',
      'Non-loanee farmers can apply online via the National Crop Insurance Portal or CSC.',
      'In case of localized calamity or post-harvest loss, intimation must be registered within 72 hours via Crop Insurance App or toll-free number.'
    ],
    officialPortal: 'https://pmfby.gov.in',
    helpline: 'Toll-Free 14447 / 1800-180-1551',
    tags: ['crop insurance', 'fasal bima', 'hailstorm', 'drought compensation', 'pmfby']
  },
  {
    id: 'kcc',
    code: 'KCC',
    name: 'Kisan Credit Card Scheme',
    hindiName: 'किसान क्रेडिट कार्ड योजना',
    category: 'Credit',
    targetAudience: 'Individual/joint farmers, tenant farmers, self-help groups, animal husbandry & fisheries farmers',
    financialBenefit: 'Flexible, affordable working capital credit up to ₹3,00,000 at a nominal base interest rate of 7%, reduced to effectively 4% per annum upon prompt repayment with 3% prompt repayment incentive.',
    eligibility: [
      'All farmers cultivating agricultural land (owner-cultivators)',
      'Tenant farmers, oral lessees, and sharecroppers with cultivating proof',
      'Minimum age 18 years, maximum 75 years (co-borrower needed if above 60)'
    ],
    documentsRequired: [
      'Application form filled with passport photos',
      'Identity Proof (Aadhaar, Voter ID, PAN)',
      'Address Proof (Aadhaar / Ration Card)',
      'Land records (certified copy of title/revenue record from Tehsildar)',
      'No-dues certificate from nearby commercial banks'
    ],
    applicationProcedure: [
      'Download KCC one-page simplified application form from official bank portal or Indian Bank Association.',
      'Submit the form along with land documents and crop declaration at your local commercial, rural (RRB), or cooperative bank.',
      'Bank processes and issues KCC RuPay debit card within 14 working days without any processing fee up to ₹3 lakh limit.'
    ],
    officialPortal: 'https://myscheme.gov.in/schemes/kcc',
    helpline: '1800-180-1111 (Kisan Call Centre)',
    tags: ['loan', 'credit', 'interest subvention', 'working capital', 'kcc']
  },
  {
    id: 'pmksy',
    code: 'PMKSY',
    name: 'Pradhan Mantri Krishi Sinchayee Yojana (Per Drop More Crop)',
    hindiName: 'प्रधानमंत्री कृषि सिंचाई योजना (प्रति बूंद अधिक फसल)',
    category: 'Irrigation',
    targetAudience: 'Farmers seeking micro-irrigation (Drip & Sprinkler) installations',
    financialBenefit: 'Capital subsidy of up to 55% for small and marginal farmers (SC/ST/Women preferential) and up to 45% for other farmers on micro-irrigation systems.',
    eligibility: [
      'Farmers having land with assured irrigation water source (well, borewell, farm pond)',
      'Landholding of at least 0.2 hectares',
      'Preference given to water-stressed and rainfed blocks'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land ownership extract (7/12, Khatauni)',
      'Water source certificate / electricity connection receipt',
      'Bank passbook copy',
      'Soil & water testing report (if requested by district horticulture department)'
    ],
    applicationProcedure: [
      'Apply through the State Horticulture / Agriculture Department portal (e.g. DBT Agriculture / e-Horticulture).',
      'Select registered and certified micro-irrigation vendor (Jain Irrigation, Netafim, EPC, etc.).',
      'Department engineer conducts pre-installation physical site survey and approves work order.',
      'Subsidy amount is credited via DBT to the farmer or manufacturer based on state guidelines.'
    ],
    officialPortal: 'https://pmksy.gov.in',
    helpline: 'State Agriculture / Horticulture Mission Helpline',
    tags: ['drip irrigation', 'sprinkler', 'subsidy', 'water saving', 'pmksy']
  },
  {
    id: 'smam',
    code: 'SMAM',
    name: 'Sub-Mission on Agricultural Mechanization',
    hindiName: 'कृषि यंत्रीकरण उप-मिशन',
    category: 'Mechanization',
    targetAudience: 'Small/marginal farmers, farmer producer organizations (FPOs), custom hiring centers',
    financialBenefit: 'Financial assistance of 40% to 50% subsidy on purchase of tractors, power tillers, rotavators, happy seeders, zero-till drills, and laser land levelers. Up to 80% subsidy for setting up Custom Hiring Centres (CHCs).',
    eligibility: [
      'Individual farmers who have not availed machinery subsidy in previous 3-5 years',
      'Special preference to small, marginal, SC/ST, and women farmers'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land documents (Khatauni / Khasra)',
      'Bank Passbook copy',
      'Caste certificate (if claiming SC/ST quota)'
    ],
    applicationProcedure: [
      'Register on agrimachinery.nic.in using Aadhaar number.',
      'Select desired machine and authorized dealer quote.',
      'Upload required documents and submit for district agriculture engineer verification.',
      'Upon lottery / approval, purchase equipment and upload invoice for direct subsidy credit.'
    ],
    officialPortal: 'https://agrimachinery.nic.in',
    helpline: '011-23382012',
    tags: ['tractor subsidy', 'machinery', 'custom hiring centre', 'rotavator', 'smam']
  },
  {
    id: 'kusum',
    code: 'PM-KUSUM',
    name: 'Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan',
    hindiName: 'पीएम-कुसुम सोलर पंप योजना',
    category: 'Solar Energy',
    targetAudience: 'Farmers seeking off-grid solar water pumps or solarization of existing grid-connected tube wells',
    financialBenefit: '60% subsidy (30% Central Gov + 30% State Gov) for standalone solar agriculture pumps (up to 7.5 HP). Farmer pays only 10% upfront; remaining 30% available via bank loan.',
    eligibility: [
      'Individual farmers, cooperatives, panchayats, and water user associations',
      'Land must have borewell/open well with valid water yield'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land ownership proof',
      'Water source declaration certificate',
      'Bank passbook copy'
    ],
    applicationProcedure: [
      'Apply online on your respective State Renewable Energy Development Agency portal (e.g. HAREDA, UPNEDA, MEDA, RREC).',
      'Pay beneficiary share (10%) upon application approval.',
      'Authorized solar vendor conducts site survey and installs solar PV array and pump.'
    ],
    officialPortal: 'https://pmkusum.mnre.gov.in',
    helpline: '1800-180-3333',
    tags: ['solar pump', 'kusum', 'solar electricity', 'green energy']
  }
];

// GET all schemes with filtering
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, search } = req.query;
    let schemes = [...VERIFIED_SCHEMES];

    if (category && category !== 'All') {
      schemes = schemes.filter(s => s.category.toLowerCase() === (category as string).toLowerCase());
    }

    if (search) {
      const q = (search as string).toLowerCase().trim();
      schemes = schemes.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.hindiName.includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.financialBenefit.toLowerCase().includes(q) ||
        s.tags.some(t => t.includes(q))
      );
    }

    res.json({ schemes });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch government schemes' });
  }
});

// GET single scheme
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  const scheme = VERIFIED_SCHEMES.find(s => s.id === req.params.id);
  if (!scheme) {
    res.status(404).json({ error: 'Scheme not found' });
    return;
  }
  res.json({ scheme });
});

// AI Scheme Inquiry & Eligibility Assistant
router.post('/ask', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question, preferredLanguage = 'English' } = req.body;

    if (!question) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const schemesSummary = VERIFIED_SCHEMES.map(s => 
          `[${s.code}] ${s.name} (${s.hindiName}): Benefit: ${s.financialBenefit}. Eligibility: ${s.eligibility.join('; ')}. Documents: ${s.documentsRequired.join('; ')}. Portal: ${s.officialPortal}`
        ).join('\n\n');

        const systemPrompt = `You are a certified Government Agricultural Welfare Advisor for Indian farmers.
You explain authentic Indian agricultural schemes, eligibility, documents, and application steps strictly based on official Ministry guidelines.
NEVER invent false benefits, fake schemes, or fictitious subsidies. Always provide the official government portal link and helpline.
Answer in ${preferredLanguage}.

Official Verified Schemes Knowledge Base:
${schemesSummary}

Farmer's Question: "${question}"

Provide a clear, respectful, step-by-step answer detailing:
1. Which scheme(s) apply directly to their situation
2. Exact official financial benefit
3. Eligibility criteria check
4. Documents required checklist
5. How and where to apply (official portal link)`;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: systemPrompt,
        });

        res.json({
          answer: response.text || '',
          sourceLinks: [
            'https://pmkisan.gov.in',
            'https://pmfby.gov.in',
            'https://myscheme.gov.in',
            'https://agrimachinery.nic.in'
          ],
        });
        return;
      } catch (geminiError: any) {
        console.error('Gemini scheme query error, using rule-based resolver:', geminiError);
      }
    }

    // Rule-based matcher fallback
    const q = question.toLowerCase();
    let matched = VERIFIED_SCHEMES[0]; // default PM-KISAN
    if (q.includes('insurance') || q.includes('fasal') || q.includes('bima') || q.includes('crop damage') || q.includes('loss')) {
      matched = VERIFIED_SCHEMES.find(s => s.id === 'pmfby') || matched;
    } else if (q.includes('loan') || q.includes('credit') || q.includes('kcc') || q.includes('card')) {
      matched = VERIFIED_SCHEMES.find(s => s.id === 'kcc') || matched;
    } else if (q.includes('irrigation') || q.includes('drip') || q.includes('sprinkler') || q.includes('sinchayee')) {
      matched = VERIFIED_SCHEMES.find(s => s.id === 'pmksy') || matched;
    } else if (q.includes('tractor') || q.includes('machine') || q.includes('rotavator')) {
      matched = VERIFIED_SCHEMES.find(s => s.id === 'smam') || matched;
    } else if (q.includes('solar') || q.includes('pump') || q.includes('kusum')) {
      matched = VERIFIED_SCHEMES.find(s => s.id === 'kusum') || matched;
    }

    const fallbackAnswer = `### **${matched.name} (${matched.hindiName})**\n\n**Financial Benefit:**\n${matched.financialBenefit}\n\n**Eligibility Checklist:**\n${matched.eligibility.map(e => `• ${e}`).join('\n')}\n\n**Required Documents:**\n${matched.documentsRequired.map(d => `• ${d}`).join('\n')}\n\n**Application Steps:**\n${matched.applicationProcedure.map((p, idx) => `${idx + 1}. ${p}`).join('\n')}\n\n**Official Portal:** ${matched.officialPortal}\n**Helpline:** ${matched.helpline}`;

    res.json({
      answer: fallbackAnswer,
      sourceLinks: [matched.officialPortal],
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process scheme inquiry' });
  }
});

export default router;
