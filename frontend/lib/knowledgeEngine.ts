import { ALL_SCHEMES, SCHEME_TRANSLATIONS, SchemeRecord } from "./knowledgeData";
import { ChatResponse, Language, SourceRef, StructuredAnswer } from "./types";

const SCRIPT_RANGES: Record<Language, [number, number]> = {
  hi: [0x0900, 0x097f], // Devanagari
  te: [0x0c00, 0x0c7f], // Telugu
  kn: [0x0c80, 0x0cff], // Kannada
  en: [0x0041, 0x007a], // Basic Latin
};

export function detectLanguage(text: string, fallback: Language = "en"): Language {
  const counts: Record<Language, number> = { hi: 0, te: 0, kn: 0, en: 0 };
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    for (const [lang, [start, end]] of Object.entries(SCRIPT_RANGES) as [Language, [number, number]][]) {
      if (code >= start && code <= end) {
        counts[lang]++;
      }
    }
  }

  // Priority to Indian regional scripts if detected
  if (counts.te > 0 && counts.te >= counts.hi && counts.te >= counts.kn) return "te";
  if (counts.hi > 0 && counts.hi >= counts.kn) return "hi";
  if (counts.kn > 0) return "kn";

  return fallback || "en";
}

const SYNONYMS: Record<string, string[]> = {
  scholarship: ["scholarship", "merit", "pragati", "deevena", "vidya", "education", "student", "students", "fee", "college", "school", "छात्रवृत्ति", "छात्र", "विद्या", "विद्यार्थी", "స్కాలర్‌షిప్", "విద్యార్థి", "విద్యార్థులకు", "విద్య", "ఫీజు", "ವಿದ್ಯಾರ್ಥಿವೇತನ", "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ", "ವಿದ್ಯಾರ್ಥಿ"],
  agriculture: ["agriculture", "farmer", "farmers", "kisan", "crop", "fertilizer", "soil", "rythu", "bharosa", "pm-kisan", "pm kisan", "कृषि", "किसान", "किसानों", "खेती", "రైతు", "రైతులకు", "రైతులు", "వ్యవసాయం", "రైతు భరోసా", "ಕೃಷಿ", "ರೈತ", "ರೈತರಿಗೆ", "ರೈತರು"],
  education: ["education", "loan", "vidyalaxmi", "vidya", "neet", "study", "degree", "school", "college", "ಶಿಕ್ಷಣ", "ಶಾಲೆ", "ವಿದ್ಯಾ", "విద్య", "చదువు", "शिक्षा", "पढ़ाई"],
  employment: ["employment", "job", "jobs", "mudra", "skill", "training", "startup", "business", "loan", "credit", "rozgar", "ಉದ್ಯೋಗ", "ಕೆಲಸ", "ಉದ್ಯೋಗಗಳು", "ఉపాధి", "ఉద్యోగం", "ఉద్యోగాలు", "రుణం", "रोजगार", "नौकरी", "ऋण"],
  health: ["health", "ayushman", "bharat", "hospital", "treatment", "medicine", "insurance", "card", "aarogya", "ఆరోగ్యం", "ఆస్పత్రి", "చికిత్స", "ಆರೋಗ್ಯ", "ಆಸ್ಪತ್ರೆ", "स्वास्थ्य", "इलाज", "अस्पताल"],
  welfare: ["welfare", "pension", "ration", "food", "poor", "senior", "poverty", "कल्याण", "सहायता", "पेंशन", "राशन", "సంక్షేమం", "రేషన్", "పెన్షన్", "ಸಹಾಯಧನ", "ಪಿಂಚಣಿ", "ಪಡಿತರ"],
  services: ["services", "aadhaar", "pan", "certificate", "caste", "income", "portal", "identity", "सेवाएं", "कार्ड", "प्रमाणपत्र", "సేవలు", "సర్టిఫికేట్", "ఆధార్", "ಪ್ರಮಾಣಪತ್ರ", "ಸೇವೆಗಳು"],
};

const GENERAL_SCHEME_WORDS = ["scheme", "schemes", "yojana", "yojanagalu", "yojanaye", "pathakam", "pathakalu", "యొజన", "పథకం", "పథకాలు", "యोजनाలు", "योजना", "योजनाएं", "ಯೋಜನೆ", "ಯೋಜನೆಗಳು"];

export function searchSchemes(query: string, limit = 4): { scheme: SchemeRecord; score: number }[] {
  const qLower = query.toLowerCase();
  const words = qLower.split(/[\s,?.!;:()\[\]{}]+/).filter((w) => w.length > 1);

  const isGeneralQuery = GENERAL_SCHEME_WORDS.some((gw) => qLower.includes(gw));

  const scored = ALL_SCHEMES.map((scheme) => {
    let score = isGeneralQuery ? 2 : 0;
    const sTitle = scheme.title.toLowerCase();
    const sCat = scheme.category.toLowerCase();
    const sDesc = scheme.description.toLowerCase();
    const sAll = `${sTitle} ${sCat} ${sDesc} ${(scheme.eligibility || []).join(" ")} ${(scheme.benefits || []).join(" ")}`.toLowerCase();

    // Exact query inside title/description
    if (sTitle.includes(qLower)) score += 50;
    if (sDesc.includes(qLower)) score += 25;

    // Word matching
    for (const word of words) {
      if (sTitle.includes(word)) score += 12;
      else if (sCat.includes(word)) score += 8;
      else if (sDesc.includes(word)) score += 5;
      else if (sAll.includes(word)) score += 2;

      // Synonym expansion
      for (const [key, list] of Object.entries(SYNONYMS)) {
        if (list.some((syn) => word.includes(syn) || syn.includes(word))) {
          if (sCat.toLowerCase().includes(key) || sTitle.toLowerCase().includes(key)) score += 18;
          if (sAll.includes(key)) score += 8;
        }
      }
    }

    return { scheme, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

const LOCALIZED_FOLLOWUPS: Record<Language, string[]> = {
  en: [
    "What documents do I need for this?",
    "Am I eligible based on my state?",
    "How do I apply step by step?",
  ],
  hi: [
    "इसके लिए कौन-से दस्तावेज चाहिए?",
    "क्या मैं इसके लिए पात्र हूँ?",
    "आवेदन प्रक्रिया विस्तार से बताएं",
  ],
  te: [
    "దీనికి కావలసిన పత్రాలు ఏమిటి?",
    "నేను దరఖాస్తు చేసుకోవడానికి అర్హుడనా?",
    "దరఖాస్తు విధానం దశలవారీగా చెప్పండి",
  ],
  kn: [
    "ಇದಕ್ಕೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?",
    "ನಾನು ಇದಕ್ಕೆ ಅರ್ಹನೇ?",
    "ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ವಿಧಾನವನ್ನು ತಿಳಿಸಿ",
  ],
};

const NO_SOURCE_MSGS: Record<Language, string> = {
  en: "I could not find an official government scheme matching your specific request. Please specify the state, sector (e.g., scholarships, agriculture, employment), or category.",
  hi: "मुझे आपके इस अनुरोध से मेल खाती कोई आधिकारिक सरकारी योजना नहीं मिली। कृपया अपना राज्य, क्षेत्र (जैसे छात्रवृत्ति, कृषि, रोजगार) या श्रेणी बताएं।",
  te: "మీ ప్రశ్నకు సంబంధించిన అధికారిక ప్రభుత్వ పథకం లభించలేదు. దయచేసి మీ రాష్ట్రం, రంగం (ఉదాహరణకు స్కాలర్‌షిప్‌లు, వ్యవసాయం, ఉద్యోగం) పేర్కొనండి.",
  kn: "ನಿಮ್ಮ ಕೋರಿಕೆಗೆ ಸರಿಹೊಂದುವ ಯಾವುದೇ ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಯೋಜನೆ ಕಂಡುಬಂದಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಾಜ್ಯ ಅಥವಾ ಕ್ಷೇತ್ರವನ್ನು (ವಿದ್ಯಾರ್ಥಿವೇತನ, ಕೃಷಿ, ಉದ್ಯೋಗ) ತಿಳಿಸಿ.",
};

export function generateKnowledgeResponse(
  query: string,
  requestedLanguage: Language,
  conversationId?: string
): ChatResponse {
  const language = detectLanguage(query, requestedLanguage);
  const searchResults = searchSchemes(query, 4);

  const top = searchResults[0];
  const grounded = top && top.score > 0;

  if (!grounded) {
    const msg = NO_SOURCE_MSGS[language] || NO_SOURCE_MSGS.en;
    return {
      conversation_id: conversationId || `conv-${Date.now()}`,
      message_id: `msg-${Date.now()}`,
      answer: {
        summary: msg,
        eligibility: [],
        benefits: [],
        documents_required: [],
        application_steps: [],
        clarifying_question: msg,
        grounded: false,
      },
      sources: [],
      language,
      suggested_followups: LOCALIZED_FOLLOWUPS[language] || LOCALIZED_FOLLOWUPS.en,
    };
  }

  const topScheme = top.scheme;
  let structured: StructuredAnswer;

  // 1. Check if translated cache exists for the scheme
  const translationsForLang = SCHEME_TRANSLATIONS[language];
  if (language !== "en" && translationsForLang && translationsForLang[topScheme.id]) {
    const t = translationsForLang[topScheme.id];
    structured = {
      scheme_name: t.title || topScheme.title,
      summary: t.summary || topScheme.description,
      eligibility: t.eligibility || topScheme.eligibility || [],
      benefits: t.benefits || topScheme.benefits || [],
      documents_required: t.documents_required || topScheme.documents_required || [],
      application_steps: t.application_process || topScheme.application_process || [],
      grounded: true,
    };
  } else {
    // English default
    structured = {
      scheme_name: topScheme.title,
      summary: `${topScheme.title}: ${topScheme.description}`,
      eligibility: topScheme.eligibility || [],
      benefits: topScheme.benefits || [],
      documents_required: topScheme.documents_required || [],
      application_steps: topScheme.application_process || [],
      grounded: true,
    };
  }

  // Build sources from all matched results
  const sources: SourceRef[] = searchResults
    .filter((r) => r.score > 0)
    .map((r) => ({
      title: r.scheme.title,
      category: r.scheme.category,
      source: r.scheme.source,
      last_updated: r.scheme.last_updated,
      doc_id: r.scheme.id,
      url: r.scheme.url,
      verified: true,
    }));

  return {
    conversation_id: conversationId || `conv-${Date.now()}`,
    message_id: `msg-${Date.now()}`,
    answer: structured,
    sources,
    language,
    suggested_followups: LOCALIZED_FOLLOWUPS[language] || LOCALIZED_FOLLOWUPS.en,
  };
}
