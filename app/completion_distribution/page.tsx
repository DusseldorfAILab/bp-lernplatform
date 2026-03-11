"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getQuizModulesForMissedItems, getAllQuizModules } from "@/data/scenario-quizzes"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle,
  XCircle,
  Sparkles,
  Send,
  Zap,
  Pill,
  Brain,
  Activity,
  Baby,
  Sun,
  ShieldCheck,
  Users,
  Target,
  Heart,
  Shield,
  AlertTriangle,
  Plane,
  Star,
  TrendingUp,
  ShoppingBag,
  Circle
} from "lucide-react"

// ==================================================================
// 1. TYPE DEFINITIONS
// ==================================================================

interface QuizAnswer {
  text: string;
  isCorrect: boolean;
}

interface Quiz {
  question: string;
  answers: QuizAnswer[];
}

interface LearningModule {
  icon: string;
  title: string;
  description: string;
  content: string[];
  quiz: Quiz;
}

type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};

interface QuizResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  moduleTopic: string;
}

interface ConsultationScore {
  phasesCompleted: number;
  phasesTotal: number;
  productsRecommended: number;
  productsTotal: number;
  score: number;
  maxScore: number;
  percentage: number;
  completedPhases: string[];
  recommendedProducts: string[];
  missedPhases: string[];
  missedProducts: string[];
}

// ==================================================================
// 2. ICON MAPPING (erweitert für alle Themen)
// ==================================================================
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // B-Vitamine Icons
  Zap: Zap,
  Pill: Pill,
  Brain: Brain,
  Activity: Activity,
  Baby: Baby,
  Sun: Sun,
  // Magnesium Icons
  ShieldCheck: ShieldCheck,
  Users: Users,
  Target: Target,
  Heart: Heart,
  // Perenterol Icons
  Shield: Shield,
  AlertTriangle: AlertTriangle,
  Plane: Plane,
  // Fallback
  Sparkles: Sparkles,
  Default: Sparkles
};

// ==================================================================
// 3. HELPER FUNCTION
// ==================================================================
const cleanText = (text: string) => {
  if (!text) return "";
  return text;
};

// ==================================================================
// 4. FALLBACK DATA 
// ==================================================================
const fallbackModules: LearningModule[] = [
  {
    icon: "Zap",
    title: "Basiswissen: Der B-Komplex",
    description: "Verstehe die Synergien der 'B-Familie'.",
    content: [
      "<b>Die Familie:</b> B-Vitamine sind wasserlöslich und arbeiten synergistisch.",
      "<b>Beratungs-Tipp:</b> Riboflavin (B2) färbt den Urin neongelb – harmlos.",
      "<b>Sicherheit:</b> Überschüsse werden meist einfach ausgeschieden.",
    ],
    quiz: {
      question: "Ein Kunde kommt besorgt zurück: Sein Urin ist neongelb. Deine Reaktion?",
      answers: [
        { text: "Das Präparat wurde nicht aufgenommen.", isCorrect: false },
        { text: "Beruhigen: Das kommt vom Vitamin B2 und ist harmlos.", isCorrect: true },
        { text: "Sofort absetzen, Verdacht auf Allergie.", isCorrect: false },
      ],
    },
  },
  {
    icon: "Pill",
    title: "Indikationen & Risikogruppen",
    description: "Wann ist ein B-Komplex wichtig?",
    content: [
      "<b>Medikamente:</b> PPI (Säureblocker) hemmen die B12-Aufnahme.",
      "<b>Migräne:</b> B2 (400 mg) kann positiv wirken.",
      "<b>Veganer:</b> B12-Supplementierung ist essenziell.",
    ],
    quiz: {
      question: "Welches B-Vitamin wird zur Migräne-Prophylaxe (Hochdosis) empfohlen?",
      answers: [
        { text: "Vitamin B1", isCorrect: false },
        { text: "Vitamin B12", isCorrect: false },
        { text: "Vitamin B2", isCorrect: true },
      ],
    },
  },
  {
    icon: "Sun",
    title: "Haut, Haare & Nägel",
    description: "Einsatz in der Dermatologie.",
    content: [
      "<b>Nagelpilz:</b> Biotin fördert das Herauswachsen des gesunden Nagels.",
      "<b>Akne:</b> B5 spielt eine Rolle im Fettstoffwechsel.",
      "<b>Regeneration:</b> Biotin unterstützt die Zellerneuerung.",
    ],
    quiz: {
      question: "Warum Biotin bei Nagelpilz?",
      answers: [
        { text: "Es tötet den Pilz ab.", isCorrect: false },
        { text: "Es beschleunigt das Nagelwachstum.", isCorrect: true },
        { text: "Es verhindert Ansteckung.", isCorrect: false },
      ],
    },
  },
  {
    icon: "Baby",
    title: "Kinderwunsch & Folsäure",
    description: "Folsäure vs. Folat.",
    content: [
      "<b>Schutz:</b> Senkt Risiko für Fehlbildungen.",
      "<b>Genetik:</b> Viele Frauen können synthetische Folsäure nicht optimal umwandeln.",
      "<b>Lösung:</b> Bioaktives Folat (5-MTHF) nutzen.",
    ],
    quiz: {
      question: "Vorteil von bioaktivem Folat (5-MTHF)?",
      answers: [
        { text: "Umgeht Enzymdefekte, direkt verfügbar.", isCorrect: true },
        { text: "Ist günstiger.", isCorrect: false },
        { text: "Muss seltener eingenommen werden.", isCorrect: false },
      ],
    },
  },
];

export default function CompletionPage() {
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenarioId") || "";

  const [showSuccess, setShowSuccess] = useState(false)
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Record<number, { selectedAnswer: number | null; isCorrect: boolean | null }>>({});
  const [completedModules, setCompletedModules] = useState<boolean[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]); // NEU: Detaillierte Ergebnisse

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isGeminiLoading, setIsGeminiLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const analysisTriggered = useRef(false);

  // Consultation Score aus der Simulation
  const [consultationScore, setConsultationScore] = useState<ConsultationScore | null>(null);

  // Transkript aus dem Interview laden
  const [interviewTranscript, setInterviewTranscript] = useState<string>('');

  // Feedback State
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('feedback')
        .insert({
          rating,
          comment: feedbackText,
          user_id: user?.id || null // Optional: link to user if logged in
        });

      if (error) {
        console.error("Error submitting feedback:", error);
        // Optional: Show error message to user
      } else {
        console.log("Feedback submitted successfully");
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(true), 300);

    const loadData = async () => {
      try {
        // Load consultation score from the simulation
        let score: ConsultationScore | null = null;
        const storedScore = sessionStorage.getItem('consultationScore');
        if (storedScore) {
          try {
            score = JSON.parse(storedScore);
            setConsultationScore(score);
          } catch { /* ignore parse errors */ }
        }

        // 1. If we have a scenarioId and consultationScore, use pre-defined quizzes
        if (scenarioId && score) {
          const missedModules = getQuizModulesForMissedItems(
            scenarioId,
            score.missedPhases || [],
            score.missedProducts || [],
          );

          if (missedModules.length > 0) {
            // Convert ScenarioQuizModule to LearningModule format
            const modules: LearningModule[] = missedModules.map(m => ({
              icon: m.icon,
              title: m.title,
              description: m.description,
              content: m.content,
              quiz: m.quiz,
            }));
            setLearningModules(modules);
            setCompletedModules(Array(modules.length).fill(false));
            setQuizResults([]);
            setIsLoadingModules(false);
            return;
          }

          // If nothing was missed, show all modules for full review
          const allModules = getAllQuizModules(scenarioId);
          if (allModules.length > 0) {
            const modules: LearningModule[] = allModules.map(m => ({
              icon: m.icon,
              title: m.title,
              description: m.description,
              content: m.content,
              quiz: m.quiz,
            }));
            setLearningModules(modules);
            setCompletedModules(Array(modules.length).fill(false));
            setQuizResults([]);
            setIsLoadingModules(false);
            return;
          }
        }

        // 2. Fallback: Try loading Gemini-generated modules from sessionStorage
        const storedData = sessionStorage.getItem('dynamicLearningData');
        if (storedData) {
          const parsed = JSON.parse(storedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLearningModules(parsed);
            setCompletedModules(Array(parsed.length).fill(false));
            setQuizResults([]);
            setIsLoadingModules(false);
            return;
          }
        }

        // 3. Try fetching from API using applicationId
        const params = new URLSearchParams(window.location.search);
        const applicationId = params.get('applicationId');

        if (applicationId) {
          const res = await fetch(`/api/user-progress?applicationId=${applicationId}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.training_modules && Array.isArray(data.training_modules)) {
              setLearningModules(data.training_modules);
              setCompletedModules(Array(data.training_modules.length).fill(false));
              setQuizResults([]);
              setIsLoadingModules(false);
              return;
            }
          }
        }

        // 4. Fallback
        setLearningModules(fallbackModules);
        setCompletedModules(Array(fallbackModules.length).fill(false));
        setQuizResults([]);
        setIsLoadingModules(false);
      } catch (e) {
        console.error("Fehler beim Laden der Daten:", e);
        setLearningModules(fallbackModules);
        setCompletedModules(Array(fallbackModules.length).fill(false));
        setIsLoadingModules(false);
      }
    };

    const loadTimer = setTimeout(loadData, 1500);
    return () => { clearTimeout(timer); clearTimeout(loadTimer); };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // VERBESSERTE GEMINI API FUNKTION
  // ═══════════════════════════════════════════════════════════════
  const callGeminiAPI = useCallback(async (history: ChatMessage[], isInitialAnalysis: boolean = false) => {
    setIsGeminiLoading(true);

    try {
      // Detaillierter System-Prompt für echte Analyse
      const systemPrompt = `Du bist ein erfahrener Apotheken-Coach und Trainer. Deine Aufgabe ist es, dem Mitarbeiter konstruktives, personalisiertes Feedback zu geben.

WICHTIGE REGELN:
1. Beziehe dich KONKRET auf die Quiz-Antworten des Mitarbeiters
2. Nenne SPEZIFISCH welche Fragen richtig/falsch beantwortet wurden
3. Erkläre bei falschen Antworten, warum die richtige Antwort korrekt ist
4. Gib PRAKTISCHE Tipps für den Apothekenalltag
5. Sei motivierend aber ehrlich
6. Verwende "Du" (informell)
7. Halte dich kurz und prägnant (max 200 Wörter)

STRUKTUR DEINER ANTWORT:
- Starte mit einer kurzen Zusammenfassung (X von Y richtig)
- Lobe konkret, was gut war
- Erkläre Fehler und die richtigen Antworten
- Gib 1-2 praktische Tipps für den HV
- Ende mit einer Ermutigung`;

      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: history.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          })),
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Gemini API Error:", response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Entschuldigung, ich konnte keine Analyse erstellen.";
      setChatHistory(prev => [...prev, { role: 'model', text }]);
    } catch (err) {
      console.error("Gemini Fehler:", err);
      setChatHistory(prev => [...prev, {
        role: 'model',
        text: "Es gab ein technisches Problem. Bitte versuche es erneut oder stelle mir eine direkte Frage zu deinen Quiz-Ergebnissen."
      }]);
    } finally {
      setIsGeminiLoading(false);
    }
  }, []);

  // Progress berechnen
  const progress = learningModules.length > 0 ? (completedModules.filter(Boolean).length / learningModules.length) * 100 : 0;
  const allModulesCompleted = progress === 100 && learningModules.length > 0;

  // ═══════════════════════════════════════════════════════════════
  // VERBESSERTE ANALYSE-TRIGGER
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (allModulesCompleted && !analysisTriggered.current && quizResults.length > 0) {
      analysisTriggered.current = true;

      // Detaillierte Zusammenfassung erstellen
      const correctCount = quizResults.filter(r => r.isCorrect).length;
      const totalCount = quizResults.length;

      // Detaillierter Prompt mit allen Informationen
      let analysisPrompt = `Ich habe gerade das Apotheken-Training abgeschlossen. Hier sind meine Quiz-Ergebnisse:

📊 ERGEBNIS: ${correctCount} von ${totalCount} Fragen richtig (${Math.round(correctCount / totalCount * 100)}%)

📝 DETAILLIERTE ANTWORTEN:
`;

      quizResults.forEach((result, index) => {
        const status = result.isCorrect ? '✅' : '❌';
        analysisPrompt += `
${index + 1}. ${result.moduleTopic}
   Frage: "${result.question}"
   ${status} Meine Antwort: "${result.userAnswer}"
   ${!result.isCorrect ? `   ➡️ Richtige Antwort: "${result.correctAnswer}"` : ''}
`;
      });

      // Falls Transkript vorhanden, auch das hinzufügen
      if (interviewTranscript) {
        analysisPrompt += `

📞 AUSZUG AUS MEINEM BERATUNGSGESPRÄCH:
${interviewTranscript.substring(0, 1000)}${interviewTranscript.length > 1000 ? '...' : ''}
`;
      }

      analysisPrompt += `

Bitte gib mir ein persönliches Feedback zu meiner Leistung. Was habe ich gut gemacht? Wo muss ich noch üben? Welche Tipps hast du für meinen nächsten Kundenkontakt?`;

      const msg: ChatMessage = { role: 'user', text: analysisPrompt };
      setChatHistory([msg]);
      callGeminiAPI([msg], true);
    }
  }, [allModulesCompleted, callGeminiAPI, quizResults, interviewTranscript]);

  // ═══════════════════════════════════════════════════════════════
  // VERBESSERTE ANTWORT-AUSWAHL
  // ═══════════════════════════════════════════════════════════════
  const handleAnswerSelect = (modIdx: number, ansIdx: number) => {
    if (completedModules[modIdx]) return;

    const currentModule = learningModules[modIdx];
    const selectedAnswer = currentModule.quiz.answers[ansIdx];
    const isCorrect = selectedAnswer.isCorrect;
    const correctAnswer = currentModule.quiz.answers.find(a => a.isCorrect);

    // Quiz-State aktualisieren
    setActiveQuiz(prev => ({ ...prev, [modIdx]: { selectedAnswer: ansIdx, isCorrect } }));

    // Detailliertes Ergebnis speichern
    setQuizResults(prev => [...prev, {
      question: currentModule.quiz.question,
      userAnswer: selectedAnswer.text,
      correctAnswer: correctAnswer?.text || '',
      isCorrect: isCorrect,
      moduleTopic: currentModule.title
    }]);

    // Modul als abgeschlossen markieren
    setTimeout(() => {
      setCompletedModules(prev => {
        const n = [...prev];
        n[modIdx] = true;
        return n;
      });
    }, 1000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isGeminiLoading) return;

    // Kontext für Folgefragen mitgeben
    const contextMessage = quizResults.length > 0
      ? `(Kontext: Der Nutzer hat ${quizResults.filter(r => r.isCorrect).length}/${quizResults.length} Quiz-Fragen richtig beantwortet)\n\nNutzer fragt: ${userInput}`
      : userInput;

    const newMsg: ChatMessage = { role: 'user', text: userInput }; // Zeige nur die User-Frage an
    const apiMsg: ChatMessage = { role: 'user', text: contextMessage }; // Sende Kontext mit

    setChatHistory(prev => [...prev, newMsg]);
    setUserInput('');
    callGeminiAPI([...chatHistory, apiMsg]);
  };

  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className="min-h-screen page-gradient relative overflow-hidden pb-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-brand/15 to-brand-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-2/3 -left-24 w-64 h-64 bg-gradient-to-br from-brand-light/20 to-purple-200/15 rounded-full blur-3xl" />
      </div>

      <header className="relative glass border-b border-white/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Training abgeschlossen</h1>
                <p className="text-gray-500">Ergebnisse & Vertiefung</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl transition-all duration-700 ${showSuccess ? "bg-gradient-to-br from-green-400 to-emerald-500 scale-100 shadow-lg shadow-green-200" : "bg-gray-100 scale-90"}`}>
            <CheckCircle className={`transition-all duration-700 ${showSuccess ? "w-10 h-10 text-white" : "w-8 h-8 text-gray-400"}`} />
          </div>
          <h2 className={`text-2xl font-bold mt-4 transition-opacity duration-700 ${showSuccess ? "opacity-100" : "opacity-0"}`}>
            Simulation erfolgreich beendet!
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            {consultationScore && consultationScore.percentage < 100
              ? "Hier siehst du, was du gut gemacht hast und wo du dich noch verbessern kannst."
              : "Super gemacht! Nutze die folgenden Module, um dein Wissen zu festigen."
            }
          </p>
        </div>

        {/* Consultation Score Overview */}
        {consultationScore && (
          <div className="mb-10 max-w-3xl mx-auto">
            <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-brand/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-brand" />
                  Deine Beratungsleistung
                </CardTitle>
                <CardDescription>
                  Ergebnis: {consultationScore.score} von {consultationScore.maxScore} Punkten ({consultationScore.percentage}%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score bar */}
                <div>
                  <Progress value={consultationScore.percentage} className={`w-full h-3 ${consultationScore.percentage >= 70 ? '[&>*]:bg-green-500' : consultationScore.percentage >= 40 ? '[&>*]:bg-yellow-500' : '[&>*]:bg-red-500'}`} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phases */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-brand" />
                      <h4 className="text-sm font-bold text-gray-800">
                        Gesprächsphasen ({consultationScore.phasesCompleted}/{consultationScore.phasesTotal})
                      </h4>
                    </div>
                    <div className="space-y-1.5">
                      {consultationScore.completedPhases.map((phase, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-green-700">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{phase}</span>
                        </div>
                      ))}
                      {consultationScore.missedPhases.map((phase, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{phase}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Products */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingBag className="w-4 h-4 text-brand" />
                      <h4 className="text-sm font-bold text-gray-800">
                        Produktempfehlungen ({consultationScore.productsRecommended}/{consultationScore.productsTotal})
                      </h4>
                    </div>
                    <div className="space-y-1.5">
                      {consultationScore.recommendedProducts.map((product, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-green-700">
                          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{product}</span>
                        </div>
                      ))}
                      {consultationScore.missedProducts.map((product, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-red-600">
                          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{product}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hint about learning modules */}
                {(consultationScore.missedPhases.length > 0 || consultationScore.missedProducts.length > 0) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    <strong>Hinweis:</strong> Die folgenden Lernmodule sind gezielt auf deine Lücken zugeschnitten.
                    Beantworte die Fragen, um dein Verständnis zu stärken.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {isLoadingModules ? (
          <Card className="text-center p-8 bg-white/90 backdrop-blur-sm shadow-md">
            <CardHeader><CardTitle>Lade Lerninhalte...</CardTitle></CardHeader>
            <CardContent>
              <div className="flex justify-center items-center space-x-2">
                <div className="w-4 h-4 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-4 h-4 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-4 h-4 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {consultationScore && (consultationScore.missedPhases.length > 0 || consultationScore.missedProducts.length > 0)
                      ? "Vertiefung: Deine Lücken schließen"
                      : "Wissens-Check"
                    }
                  </h3>
                  <p className="text-sm text-gray-500">
                    {consultationScore && (consultationScore.missedPhases.length > 0 || consultationScore.missedProducts.length > 0)
                      ? "Diese Module helfen dir, die verpassten Punkte nachzuholen."
                      : "Beantworte die Fragen, um die Analyse zu starten."
                    }
                  </p>
                </div>
                <div className="text-right w-1/3">
                  <p className="text-xs text-gray-500 mb-1">{Math.round(progress)}% abgeschlossen</p>
                  <Progress value={progress} className="w-full [&>*]:bg-brand" />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {learningModules.map((mod, index) => {
                  const quizState = activeQuiz[index];
                  const isCompleted = completedModules[index];
                  const ModuleIcon = iconMap[mod.icon] || iconMap.Default;

                  return (
                    <Card key={index} className={`bg-white/90 backdrop-blur-sm shadow-md card-hover ${isCompleted ? 'border-green-500 ring-1 ring-green-100' : ''}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className={`w-10 h-10 ${isCompleted ? 'bg-gradient-to-br from-green-100 to-emerald-50' : 'bg-gradient-to-br from-brand/15 to-brand-accent/10'} rounded-lg flex items-center justify-center`}>
                            <ModuleIcon className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-brand'}`} />
                          </div>
                          {isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
                        </div>
                        <CardTitle className="mt-4 text-lg">{mod.title}</CardTitle>
                        <CardDescription>{mod.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Wichtiges Praxiswissen:</h4>
                          <ul className="space-y-2">
                            {mod.content.map((item, i) => (
                              <li key={i} className="flex items-start text-xs text-gray-700">
                                <div className="w-1 h-1 bg-brand rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                <span dangerouslySetInnerHTML={{ __html: cleanText(item) }}></span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-3">{mod.quiz.question}</p>
                          <div className="space-y-2">
                            {mod.quiz.answers.map((answer, answerIndex) => {
                              const isSelected = quizState?.selectedAnswer === answerIndex;
                              const showCorrect = isCompleted && answer.isCorrect;

                              let buttonClass = 'bg-white hover:bg-gray-50';
                              if (isSelected) {
                                buttonClass = quizState.isCorrect
                                  ? 'bg-green-100 border-green-500 text-green-900'
                                  : 'bg-red-100 border-red-500 text-red-900';
                              } else if (showCorrect && !quizState?.isCorrect) {
                                // Zeige die richtige Antwort wenn falsch gewählt
                                buttonClass = 'bg-green-50 border-green-300 text-green-800';
                              }

                              return (
                                <Button
                                  key={answerIndex}
                                  variant="outline"
                                  className={`w-full justify-start text-left h-auto py-2 px-3 whitespace-normal text-sm ${buttonClass}`}
                                  onClick={() => handleAnswerSelect(index, answerIndex)}
                                  disabled={isCompleted}
                                >
                                  {isSelected && (quizState.isCorrect
                                    ? <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                    : <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                  )}
                                  {showCorrect && !isSelected && !quizState?.isCorrect && (
                                    <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-green-600" />
                                  )}
                                  {answer.text}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {allModulesCompleted && (
              <Card className="bg-white/90 backdrop-blur-sm border-brand/20 shadow-lg shadow-brand/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-brand">
                    <Sparkles className="w-5 h-5" />
                    <span>KI-Analyse & Coaching</span>
                  </CardTitle>
                  <CardDescription>
                    Dein persönliches Feedback basierend auf deinen Antworten
                    ({quizResults.filter(r => r.isCorrect).length}/{quizResults.length} richtig)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div ref={chatContainerRef} className="h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg border mb-4 space-y-4">
                    {chatHistory.length === 0 && !isGeminiLoading && (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>Analyse wird geladen...</p>
                      </div>
                    )}
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm ${msg.role === 'user' ? 'bg-brand text-white' : 'bg-white border shadow-sm'}`}>
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {isGeminiLoading && (
                      <div className="flex justify-start">
                        <div className="p-3 rounded-xl bg-white border">
                          <div className="flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <Input
                      placeholder="Stelle eine Frage zu deinen Ergebnissen..."
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={isGeminiLoading}
                      className="flex-grow"
                    />
                    <Button type="submit" disabled={isGeminiLoading || !userInput.trim()} className="bg-brand hover:bg-brand/90">
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* FEEDBACK FORM */}
            {allModulesCompleted && (
              <Card className="bg-white/90 backdrop-blur-sm border-gray-200 shadow-md mt-8">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>Dein Feedback zur Simulation</span>
                  </CardTitle>
                  <CardDescription>
                    Wie hilfreich fandest du dieses Training? Deine Meinung hilft uns, besser zu werden.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {feedbackSubmitted ? (
                    <div className="text-center py-6 bg-green-50 rounded-lg border border-green-100">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-green-900">Vielen Dank!</h3>
                      <p className="text-green-700">Dein Feedback wurde erfolgreich gesendet.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <span className="text-sm font-medium text-gray-700">Wie bewertest du die Simulation?</span>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                  }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="feedback" className="text-sm font-medium text-gray-700">
                          Was hat dir gefallen? Was können wir verbessern?
                        </label>
                        <Textarea
                          id="feedback"
                          placeholder="Dein Feedback..."
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleFeedbackSubmit}
                          disabled={rating === 0}
                          className="bg-brand hover:bg-brand/90"
                        >
                          Feedback senden
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {allModulesCompleted && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => window.location.href = '/'} size="lg">
                  Zurück zur Übersicht
                </Button>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  )
}