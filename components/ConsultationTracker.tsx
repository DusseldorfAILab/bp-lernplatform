"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Circle, ChevronRight, ShoppingBag, TrendingUp } from "lucide-react";
import type { ConsultationPhase, UpsellPath, SimulationScenario } from "@/data/simulation-scenarios";

export interface TranscriptMessage {
  role: "user" | "ai" | "prescription";
  text: string;
}

interface ConsultationTrackerProps {
  scenario: SimulationScenario;
  transcript: TranscriptMessage[];
  className?: string;
}

interface PhaseStatus {
  completed: boolean;
  timestamp?: string;
}

interface UpsellStatus {
  recommended: boolean;
  timestamp?: string;
}

/**
 * Normalize text for keyword matching.
 * Handles umlaut variants (ä/ae, ö/oe, ü/ue, ß/ss) that
 * speech-to-text may produce inconsistently.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[.,;:!?()'"]/g, "");
}

/** Check if normalized text contains a keyword (also normalized) */
function matchesKeyword(text: string, keyword: string): boolean {
  const normText = normalizeText(text);
  const normKw = normalizeText(keyword);
  return normText.includes(normKw);
}

export interface ConsultationScore {
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

/**
 * Analyzes the transcript and returns a score.
 * Exported so it can be used by the interview page for final scoring.
 */
export function analyzeTranscript(
  scenario: SimulationScenario,
  transcript: TranscriptMessage[]
): ConsultationScore {
  // Only look at employee messages (role === "user")
  const allEmployeeText = transcript
    .filter(m => m.role === "user")
    .map(m => m.text)
    .join(" ");

  // Check phases
  const completedPhases: string[] = [];
  let phaseScore = 0;
  for (const phase of scenario.phases) {
    const found = phase.keywords.some(kw => matchesKeyword(allEmployeeText, kw));
    if (found) {
      completedPhases.push(phase.id);
      phaseScore += phase.points;
    }
  }

  // Check upsell paths
  const recommendedProducts: string[] = [];
  let upsellScore = 0;
  for (const path of scenario.upsellPaths) {
    const found = path.keywords.some(kw => matchesKeyword(allEmployeeText, kw));
    if (found) {
      recommendedProducts.push(path.productName);
      upsellScore += path.points;
    }
  }

  const missedPhases = scenario.phases
    .filter(p => !completedPhases.includes(p.id))
    .map(p => p.label);

  const missedProducts = scenario.upsellPaths
    .filter(p => !recommendedProducts.includes(p.productName))
    .map(p => p.productName);

  const totalScore = phaseScore + upsellScore;
  const percentage = scenario.maxScore > 0 ? Math.round((totalScore / scenario.maxScore) * 100) : 0;

  return {
    phasesCompleted: completedPhases.length,
    phasesTotal: scenario.phases.length,
    productsRecommended: recommendedProducts.length,
    productsTotal: scenario.upsellPaths.length,
    score: totalScore,
    maxScore: scenario.maxScore,
    percentage,
    completedPhases,
    recommendedProducts,
    missedPhases,
    missedProducts,
  };
}

/**
 * Visual tracker component shown during the conversation.
 * Does NOT show scoring to the employee - just tracks progress internally.
 * Shows a simplified "consultation steps" view.
 */
export function ConsultationTracker({ scenario, transcript, className = "" }: ConsultationTrackerProps) {
  const [phaseStatuses, setPhaseStatuses] = useState<Record<string, PhaseStatus>>({});
  const [upsellStatuses, setUpsellStatuses] = useState<Record<string, UpsellStatus>>({});

  useEffect(() => {
    const allText = transcript
      .filter(m => m.role === "user")
      .map(m => m.text)
      .join(" ");

    // Update phases
    const newPhases: Record<string, PhaseStatus> = {};
    for (const phase of scenario.phases) {
      const wasCompleted = phaseStatuses[phase.id]?.completed;
      const isNowCompleted = phase.keywords.some(kw => matchesKeyword(allText, kw));
      newPhases[phase.id] = {
        completed: wasCompleted || isNowCompleted,
        timestamp: (wasCompleted || isNowCompleted) ? (phaseStatuses[phase.id]?.timestamp || new Date().toISOString()) : undefined,
      };
    }
    setPhaseStatuses(newPhases);

    // Update upsells
    const newUpsells: Record<string, UpsellStatus> = {};
    for (const path of scenario.upsellPaths) {
      const wasRecommended = upsellStatuses[path.productName]?.recommended;
      const isNowRecommended = path.keywords.some(kw => matchesKeyword(allText, kw));
      newUpsells[path.productName] = {
        recommended: wasRecommended || isNowRecommended,
        timestamp: (wasRecommended || isNowRecommended) ? (upsellStatuses[path.productName]?.timestamp || new Date().toISOString()) : undefined,
      };
    }
    setUpsellStatuses(newUpsells);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, scenario]);

  const completedPhasesCount = Object.values(phaseStatuses).filter(s => s.completed).length;
  const recommendedCount = Object.values(upsellStatuses).filter(s => s.recommended).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Consultation phases */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-brand" />
          <h4 className="text-sm font-bold text-gray-800">Gespraechsverlauf</h4>
          <span className="text-xs text-gray-400 ml-auto">
            {completedPhasesCount}/{scenario.phases.length}
          </span>
        </div>
        <div className="space-y-2">
          {scenario.phases.map((phase) => {
            const status = phaseStatuses[phase.id];
            const isCompleted = status?.completed;
            return (
              <div
                key={phase.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isCompleted
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
                <span className={`text-sm ${isCompleted ? "text-green-800 font-medium" : "text-gray-500"}`}>
                  {phase.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag className="w-4 h-4 text-brand" />
          <h4 className="text-sm font-bold text-gray-800">Produktempfehlungen</h4>
          <span className="text-xs text-gray-400 ml-auto">
            {recommendedCount}/{scenario.upsellPaths.length}
          </span>
        </div>
        <div className="space-y-2">
          {scenario.upsellPaths.map((path) => {
            const status = upsellStatuses[path.productName];
            const isRecommended = status?.recommended;
            return (
              <div
                key={path.productName}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isRecommended
                    ? "bg-brand/10 border border-brand/20"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                {isRecommended ? (
                  <CheckCircle className="w-4 h-4 text-brand flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
                <span className={`text-sm ${isRecommended ? "text-brand font-medium" : "text-gray-500"}`}>
                  {path.productName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
