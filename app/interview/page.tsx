"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ConvAI from "@/components/ConvAI";
import { BackgroundWave } from "@/components/background-wave";
import { PrescriptionCard } from "@/components/PrescriptionCard";
import { ConsultationTracker, analyzeTranscript } from "@/components/ConsultationTracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Timer, Pill, Sparkles, Loader2, FileText, ShoppingBag, Info } from "lucide-react";
import { getScenarioById, simulationScenarios } from "@/data/simulation-scenarios";
import type { SimulationScenario } from "@/data/simulation-scenarios";
import { createClient } from "@/lib/supabase/client";

export default function InterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("applicationId");
  const scenarioId = searchParams.get("scenarioId") || "diuretikum";

  // Load scenario
  const scenario: SimulationScenario | undefined = useMemo(
    () => getScenarioById(scenarioId) || simulationScenarios[0],
    [scenarioId]
  );

  const [isConnected, setIsConnected] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [endSignal, setEndSignal] = useState<number | undefined>(undefined);
  const [transcript, setTranscript] = useState<Array<{ role: "user" | "ai" | "prescription"; text: string; timestamp: string }>>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const prescriptionShownRef = useRef(false);
  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isConnected) return;
    if (!isTimerActive) return;
    if (timeLeft <= 0) {
      handleEndInterview();
      return;
    }
    const id = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isTimerActive, timeLeft]);

  // Auto-scroll transcript
  useEffect(() => {
    const el = document.getElementById("transcriptScroll");
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript]);

  const handleEndInterview = useCallback(async () => {
    setIsAnalyzing(true);
    setIsTimerActive(false);
    setEndSignal(Date.now());

    await new Promise(resolve => setTimeout(resolve, 3000));

    const params = new URLSearchParams(searchParams);
    // Pass scenarioId to the completion page
    if (scenarioId) params.set("scenarioId", scenarioId);
    const nextPath = `/completion_distribution?${params.toString()}`;

    if (!transcript || transcript.length === 0) {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem('dynamicLearningData');
        sessionStorage.removeItem('consultationScore');
      }
      router.push(nextPath);
      return;
    }

    try {
      const appIdToUse = applicationId || crypto.randomUUID();

      // Calculate the consultation score from tracking
      let scoreData = null;
      if (scenario) {
        scoreData = analyzeTranscript(scenario, transcript);
        sessionStorage.setItem('consultationScore', JSON.stringify(scoreData));
      }

      // Save consultation session to Supabase
      if (scoreData && scenario) {
        try {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);

          await supabase.from("consultation_sessions").insert({
            user_id: user?.id ?? null,
            scenario_id: scenarioId,
            scenario_title: scenario.coachingCard.title,
            agent_key: scenario.agentKey,
            score: scoreData.score,
            max_score: scoreData.maxScore,
            percentage: scoreData.percentage,
            phases_completed: scoreData.phasesCompleted,
            phases_total: scoreData.phasesTotal,
            completed_phases: scoreData.completedPhases,
            missed_phases: scoreData.missedPhases,
            products_recommended: scoreData.productsRecommended,
            products_total: scoreData.productsTotal,
            recommended_products: scoreData.recommendedProducts,
            missed_products: scoreData.missedProducts,
            transcript: transcript,
            duration_seconds: durationSeconds,
          });
        } catch (err) {
          console.error("Failed to save consultation session:", err);
        }
      }

      // Use the scenario's agentKey as the analysis type
      const analysisType = scenario?.agentKey || "pharmacy_magnesium";

      const response = await fetch(`/api/analyze-transcript?type=${analysisType}&includeOverview=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          applicationId: appIdToUse,
          // Pass scoring data so the AI can reference it
          consultationScore: scoreData,
          scenarioId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          sessionStorage.setItem('dynamicLearningData', JSON.stringify(data));
          sessionStorage.removeItem('dynamicLearningOverview');
        } else if (data.modules) {
          sessionStorage.setItem('dynamicLearningData', JSON.stringify(data.modules));
          if (data.overview) {
            sessionStorage.setItem('dynamicLearningOverview', data.overview);
          }
        }
      } else {
        sessionStorage.removeItem('dynamicLearningData');
        sessionStorage.removeItem('dynamicLearningOverview');
      }
    } catch {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem('dynamicLearningData');
      }
    }

    router.push(nextPath);
  }, [applicationId, router, scenario, scenarioId, searchParams, transcript]);

  const onConnect = useCallback(() => {
    setIsConnected(true);
    setIsTimerActive(true);
  }, []);

  const onDisconnect = useCallback(() => {
    setIsConnected(false);
    setIsTimerActive(false);
  }, []);

  const onMessage = useCallback((message: unknown) => {
    const m = message as { message: string; source: "user" | "ai" };
    if (!m?.message || !m?.source) return;

    const now = new Date().toISOString();
    const newEntries: Array<{ role: "user" | "ai" | "prescription"; text: string; timestamp: string }> = [
      { role: m.source, text: m.message, timestamp: now },
    ];

    // If AI mentions "Rezept" and we haven't shown the prescription yet, inject it
    if (m.source === "ai" && !prescriptionShownRef.current) {
      const lower = m.message.toLowerCase();
      if (lower.includes("rezept") || lower.includes("verordnung") || lower.includes("verschrieben")) {
        prescriptionShownRef.current = true;
        newEntries.push({ role: "prescription", text: "", timestamp: now });
      }
    }

    setTranscript((prev) => [...prev, ...newEntries]);

    const el = document.getElementById("transcriptScroll");
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 0);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="text-center space-y-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center mx-auto shadow-lg shadow-brand/20">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Analysiere dein Beratungsgespräch...</h2>
          <p className="text-gray-500">Die KI wertet deine Empfehlungen und Gesprächsführung aus.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-gradient relative overflow-hidden">
      <header className="relative glass border-b border-white/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-brand to-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                <Pill className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Beratungssimulation</h1>
                <div className="flex items-center space-x-2 mt-0.5">
                  <p className="text-sm text-gray-600 font-medium">
                    {scenario?.coachingCard.title || "Magnesiumcitrat 130"}:
                    {" "}{scenario?.coachingCard.subtitle}
                  </p>
                  <Badge
                    variant="outline"
                    className={`px-2 py-0.5 text-xs ${isConnected ? "border-green-500 text-green-600 bg-green-50" : "border-gray-300 text-gray-600 bg-gray-50"}`}
                  >
                    {isConnected ? "Gespräch läuft" : "Bereit"}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isConnected && (
                <Badge variant="destructive" className="font-medium tabular-nums py-1 px-3 text-base bg-red-100 text-red-700 border-red-200 hover:bg-red-200">
                  <Timer className="w-4 h-4 mr-2" />
                  {formatTime(timeLeft)}
                </Badge>
              )}
              <Badge variant="outline" className="border-brand text-brand bg-brand/10 font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                KI-Kunde
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Intro Dialog */}
        <Dialog open={showIntro} onOpenChange={setShowIntro}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-brand" />
                Deine Aufgabe im HV
              </DialogTitle>
              <DialogDescription>
                <div className="space-y-3 pt-3 text-gray-700 text-base">
                  <p>
                    Ein Kunde betritt die Apotheke mit einem Rezept für{" "}
                    <strong>{scenario?.prescription.medication}</strong>.
                    Deine Aufgabe:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                      <span><strong>Rezept annehmen</strong> und den Kunden zum Medikament beraten</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                      <span><strong>Wissen abfragen:</strong> Kennt der Kunde das Medikament bereits?</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ShoppingBag className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                      <span><strong>Zusatzempfehlungen:</strong> Passende Produkte empfehlen, die das Medikament ergänzen</span>
                    </li>
                  </ul>

                  {/* Show products they should recommend */}
                  {scenario && (
                    <div className="bg-brand/10 p-3 rounded-lg text-sm text-gray-800 border border-brand/20">
                      <strong>Mögliche Zusatzempfehlungen:</strong>
                      <ul className="mt-1 space-y-0.5">
                        {scenario.upsellPaths.map((p, i) => (
                          <li key={i}>- {p.productName}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-800 border border-amber-200">
                    <strong>Hinweis:</strong> Bitte nutze die Sprachberatung in einer ruhigen Umgebung. Das Rezept wird dir während des Gesprächs angezeigt.
                  </div>
                </div>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="bg-gradient-to-r from-brand to-brand-accent hover:from-brand-dark hover:to-brand text-white shadow-md hover:shadow-lg transition-all"
                onClick={() => setShowIntro(false)}
              >
                Simulation starten
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Main layout */}
        <div className={isConnected
          ? "grid grid-cols-1 lg:grid-cols-[1fr_320px_1fr] gap-6 items-start"
          : "flex flex-col items-center"
        }>
          {/* Left: ConvAI + Buttons */}
          <div className={isConnected ? "w-full flex flex-col" : "w-full md:w-1/2"}>
            <div className={isConnected ? "relative rounded-3xl overflow-hidden shadow-xl border border-white/60 bg-white/90 backdrop-blur-sm" : ""}>
              <ConvAI
                onConnect={onConnect}
                onDisconnect={onDisconnect}
                onMessage={onMessage}
                onEnded={() => { }}
                endSignal={endSignal}
                agentKey={scenario?.agentKey || "pharmacy_magnesium"}
                avatarSrc=""
                hideTranscript
              />
            </div>
            <div className={isConnected ? "mt-4 flex justify-center" : "mt-6 flex justify-center"}>
              {isConnected ? (
                <Button
                  className="rounded-full bg-red-600 hover:bg-red-700 text-white px-8 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  size="lg"
                  onClick={handleEndInterview}
                >
                  Beratung beenden
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-full border-gray-300 hover:bg-gray-100 px-8"
                  size="lg"
                  onClick={handleEndInterview}
                >
                  Überspringen / Beenden
                </Button>
              )}
            </div>
          </div>

          {/* Center: Prescription + Tracker (only when connected) */}
          {isConnected && scenario && (
            <div className="w-full space-y-4">
              {/* Consultation tracker */}
              <div className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur-sm shadow-lg p-4">
                <ConsultationTracker
                  scenario={scenario}
                  transcript={transcript}
                />
              </div>
            </div>
          )}

          {/* Right: Transcript (only when connected) */}
          {isConnected && (
            <div className="w-full">
              <div className="rounded-3xl border border-white/60 bg-white/90 backdrop-blur-sm shadow-xl p-5 h-[700px] flex flex-col" id="transcriptPanel">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <div className="text-sm font-bold text-gray-800 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                    Live Transkript
                  </div>
                  <span className="text-xs text-gray-400">Wird automatisch erstellt</span>
                </div>

                <div className="flex-grow overflow-auto min-h-0 rounded-xl p-3 text-base bg-gray-50 space-y-3" id="transcriptScroll">
                  {transcript.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 italic">
                      <Sparkles className="w-8 h-8 mb-2 opacity-20" />
                      <p>Das Gespräch beginnt...</p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {transcript.map((m, i) => {
                        if (m.role === "prescription" && scenario) {
                          // Map scenarioId to actual image filename in Supabase
                          // (file names may differ from scenarioId, e.g. "diurethikum" vs "diuretikum")
                          const imageNameMap: Record<string, string> = {
                            diuretikum: "pharmacy_diurethikum_rezept",
                            fluoridbehandlung: "pharmacy_fluoridbehandlung_rezept",
                            "gastritis-reflux": "pharmacy_gastritis_reflux_rezept",
                            gicht: "pharmacy_gicht_rezept",
                            eisenmangel: "pharmacy_eisenmangelanaemie_rezept",
                            grippeimpfstoff: "pharmacy_grippeimpfstoff_rezept",
                            helicobacter: "pharmacy_helicobacter_rezept",
                            hyperthyreose: "pharmacy_hyperthyreose_rezept",
                            hypothyreose: "pharmacy_hypothyreose_rezept",
                            kompressionsstruempfe: "pharmacy_kompressionsstruempfe_rezept",
                          };
                          const imageId = imageNameMap[scenarioId];
                          const supabaseBase = process.env.NEXT_PUBLIC_SUPABASE_URL
                            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/training-assets`
                            : "https://dgewbsyvaglfmrlaufkd.supabase.co/storage/v1/object/public/training-assets";
                          const imageUrl = imageId ? `${supabaseBase}/${imageId}.png` : null;

                          // Show image if available, otherwise fall back to PrescriptionCard
                          return (
                            <li key={i} className="flex justify-start">
                              <div className="max-w-[90%]">
                                {imageUrl ? (
                                  <div className="rounded-2xl overflow-hidden shadow-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={imageUrl}
                                      alt="Rezept"
                                      className="rounded-2xl max-w-full"
                                      onLoad={() => {
                                        const el = document.getElementById("transcriptScroll");
                                        if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 50);
                                      }}
                                      onError={(e) => {
                                        // Hide broken image, show fallback
                                        (e.target as HTMLImageElement).style.display = "none";
                                        const fallback = (e.target as HTMLImageElement).nextElementSibling;
                                        if (fallback) (fallback as HTMLElement).style.display = "block";
                                      }}
                                    />
                                    <div style={{ display: "none" }}>
                                      <PrescriptionCard
                                        patientName={scenario.prescription.patientName}
                                        doctorName={scenario.prescription.doctorName}
                                        medication={scenario.prescription.medication}
                                        dosage={scenario.prescription.dosage}
                                        date={scenario.prescription.date}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <PrescriptionCard
                                    patientName={scenario.prescription.patientName}
                                    doctorName={scenario.prescription.doctorName}
                                    medication={scenario.prescription.medication}
                                    dosage={scenario.prescription.dosage}
                                    date={scenario.prescription.date}
                                  />
                                )}
                              </div>
                            </li>
                          );
                        }
                        return (
                          <li key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                            <div className={
                              "max-w-[90%] rounded-2xl px-4 py-3 shadow-sm whitespace-pre-wrap break-words " +
                              (m.role === "user"
                                ? "bg-brand text-white rounded-tr-none"
                                : "bg-white border border-gray-200 text-gray-800 rounded-tl-none")
                            }>
                              <div className={`mb-1 text-xs uppercase tracking-wide font-bold ${m.role === 'user' ? 'text-white/80' : 'text-gray-400'}`}>
                                {m.role === "user" ? "Du (PTA/Apotheker)" : "Kunde"}
                              </div>
                              <div className="text-sm leading-relaxed">{m.text}</div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <div className="opacity-50">
        <BackgroundWave />
      </div>
    </div>
  );
}
