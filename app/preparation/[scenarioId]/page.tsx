"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CheckCircle, Lightbulb, Target, Users, ArrowRight, Info, Pill,
  Play, Volume2, ShoppingBag, FileText, MessageSquare,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getCoachingCardById, type CoachingCard } from "@/data/coaching-cards"
import { getScenarioById } from "@/data/simulation-scenarios"

// Video path mapping per scenario ID (Supabase Storage bucket: learning-videos)
const videoPathMap: Record<string, string> = {
  diuretikum: "diuretikum/pharmacy_diurethikum.mp4",
  fluoridbehandlung: "fluoridbehandlung/pharmacy_fluoridbehandlung.mp4",
  "gastritis-reflux": "gastritis_reflux/pharmacy_gastritis_reflux.mp4",
  gicht: "gicht/pharmacy_gicht.mp4",
  eisenmangel: "eisenmangelanaemie/pharmacy_eisenmangelanaemie.mp4",
  grippeimpfstoff: "grippeimpfstoff/pharmacy_grippeimpfstoff.mp4",
  helicobacter: "helicobacter/pharmacy_helicobacter.mp4",
  hyperthyreose: "hyperthyreose/pharmacy_hyperthyreose.mp4",
  hypothyreose: "hypothyreose/pharmacy_hypothyreose.mp4",
  kompressionsstruempfe: "kompressionsstruempfe/pharmacy_kompressionsstruempfe.mp4",
}

function buildChecklist(card: CoachingCard): string[] {
  const items: string[] = []

  // 1. Greeting / intro
  items.push(`Ich weiß, wie ich den Kunden begrüße und das Rezept annehme.`)

  // 2. Medication knowledge
  if (card.customerDoesNotKnow.length > 0) {
    items.push(`Ich kann dem Kunden das Medikament erklären (Wirkung, Einnahme).`)
  }

  // 3. Bridge to supplement
  if (card.bridgeToSupplement) {
    items.push(`Ich kenne die Überleitung zu Zusatzempfehlungen.`)
  }

  // 4. Primary product
  if (card.products.length > 0) {
    items.push(`Ich kann ${card.products[0].name} empfehlen und die Vorteile erklären.`)
  }

  // 5. Additional products
  if (card.additionalBridges && card.additionalBridges.length > 0) {
    const additionalProducts = card.additionalBridges
      .flatMap(b => b.products)
      .filter(p => p.name && p.benefits.length > 0)
      .map(p => p.name)
    if (additionalProducts.length > 0) {
      items.push(`Ich kenne die weiteren Empfehlungen: ${additionalProducts.join(", ")}.`)
    }
  }

  // 6. Tips
  if (card.tips) {
    items.push(`Ich kann dem Kunden zusätzliche Gesundheitstipps geben.`)
  }

  return items
}

export default function DynamicPreparationPage() {
  const params = useParams()
  const scenarioId = params.scenarioId as string

  const card = useMemo(() => getCoachingCardById(scenarioId), [scenarioId])
  const scenario = useMemo(() => getScenarioById(scenarioId), [scenarioId])

  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
  const [isReady, setIsReady] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoLoading, setVideoLoading] = useState(true)
  const [videoError, setVideoError] = useState(false)

  const checklist = useMemo(() => (card ? buildChecklist(card) : []), [card])

  // Load video from Supabase
  useEffect(() => {
    async function loadVideo() {
      const path = videoPathMap[scenarioId]
      if (!path) {
        setVideoLoading(false)
        setVideoError(true)
        return
      }

      try {
        const supabase = createClient()
        const { data, error } = await supabase.storage
          .from("learning-videos")
          .createSignedUrl(path, 3600)

        if (error) {
          const { data: publicData } = supabase.storage
            .from("learning-videos")
            .getPublicUrl(path)
          if (publicData?.publicUrl) {
            setVideoUrl(publicData.publicUrl)
          } else {
            setVideoError(true)
          }
        } else if (data?.signedUrl) {
          setVideoUrl(data.signedUrl)
        }
      } catch {
        setVideoError(true)
      } finally {
        setVideoLoading(false)
      }
    }
    loadVideo()
  }, [scenarioId])

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newCheckedItems = { ...checkedItems, [index]: checked }
    setCheckedItems(newCheckedItems)
    const allChecked = checklist.every((_, i) => newCheckedItems[i])
    setIsReady(allChecked)
  }

  const handleStartSimulation = () => {
    window.location.href = `/interview?scenarioId=${scenarioId}`
  }

  if (!card || !scenario) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <div className="text-center space-y-4">
          <Pill className="w-12 h-12 text-gray-300 mx-auto" />
          <h2 className="text-xl font-semibold text-gray-700">Szenario nicht gefunden</h2>
          <Button onClick={() => window.location.href = "/start"} variant="outline">
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    )
  }

  // Build training areas from the coaching card data
  const trainingAreas = [
    {
      icon: FileText,
      title: "Rezeptannahme & Medikament",
      description: "Wissen über das verordnete Medikament.",
      topics: [
        `Medikament: ${scenario.prescription.medication}`,
        ...(card.customerDoesNotKnow.length > 0
          ? card.customerDoesNotKnow.slice(0, 2)
          : ["Einnahmehinweise kennen"]),
      ],
    },
    {
      icon: ShoppingBag,
      title: "Zusatzempfehlungen",
      description: "Passende Produkte zur Ergänzung empfehlen.",
      topics: [
        ...card.products.map(p => p.name),
        ...(card.additionalBridges?.flatMap(b => b.products.map(p => p.name)).filter(Boolean) || []),
      ].slice(0, 4),
    },
    {
      icon: MessageSquare,
      title: "Gesprächsführung",
      description: "Natürliche Überleitung und Beratungskompetenz.",
      topics: [
        card.bridgeToSupplement ? "Überleitung zur Zusatzempfehlung" : "Kundenbedürfnisse erkennen",
        "Auf Fragen und Einwände reagieren",
        card.tips ? "Gesundheitstipps geben" : "Freundlich verabschieden",
      ],
    },
  ]

  return (
    <div className="min-h-screen page-gradient relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-brand/15 to-brand-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-gradient-to-br from-brand-light/20 to-purple-200/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/4 w-56 h-56 bg-gradient-to-br from-violet-200/20 to-brand/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative glass border-b border-white/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand-accent rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Beratungssimulation: {card.title}
                </h1>
                <p className="text-gray-500">{card.subtitle} - Bereite dich auf das Kundengespräch vor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hauptinhalt */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Video Section */}
        <Card className="mb-8 overflow-hidden border-brand/20 bg-white/90 backdrop-blur-sm shadow-lg shadow-brand/5">
          <CardHeader className="bg-gradient-to-r from-brand/5 to-brand-accent/5">
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-brand" />
              <span>Einführungsvideo: {card.title}</span>
            </CardTitle>
            <CardDescription>
              Schaue dir das Video an, bevor du in die Simulation startest.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {videoLoading ? (
              <div className="flex items-center justify-center h-72 bg-gray-100">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-500">Video wird geladen...</p>
                </div>
              </div>
            ) : videoUrl ? (
              <div className="bg-black">
                <video
                  controls
                  className="w-full max-h-[500px] mx-auto"
                  preload="metadata"
                  playsInline
                >
                  <source src={videoUrl} type="video/mp4" />
                  Dein Browser unterstützt kein Video.
                </video>
              </div>
            ) : videoError ? (
              <div className="flex items-center justify-center h-48 bg-gray-100">
                <div className="text-center space-y-2">
                  <Volume2 className="w-10 h-10 text-gray-300 mx-auto" />
                  <p className="text-gray-500">Video konnte nicht geladen werden.</p>
                  <p className="text-xs text-gray-400">Du kannst trotzdem mit der Vorbereitung fortfahren.</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Szenario-Info */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-brand" />
              <span>Über diese Simulation</span>
            </CardTitle>
            <CardDescription>
              Trainiere die Beratung für: {card.title} ({card.subtitle})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Ein Kunde kommt mit einem Rezept in die Apotheke.
              Deine Aufgabe ist es, das Rezept entgegenzunehmen, den Kunden über das Medikament zu beraten und passende
              Zusatzprodukte zu empfehlen.
            </p>

            <div className="bg-brand/10 border border-brand/20 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-brand mt-0.5" />
                <div>
                  <h4 className="font-medium text-brand mb-2">Format der Simulation</h4>
                  <ul className="text-sm text-gray-800 space-y-1">
                    <li>- Dauer: ca. 10 Minuten</li>
                    <li>- Format: Gesprächssimulation mit einem KI-Kunden</li>
                    <li>- Sprache: Deutsch</li>
                    <li>- Ziel: Das Gespräch wird zur Verbesserung deiner Beratungsfähigkeiten analysiert.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm mt-4">
              <div className="flex items-start space-x-3">
                <span className="text-lg mt-0.5">🎙️</span>
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">Hinweis zur Sprachinteraktion</h4>
                  <p className="text-sm text-amber-700">
                    Bitte nutze die Voice-Beratung in einer ruhigen Umgebung ohne Hintergrundgeräusche oder andere Gespräche in deiner Nähe. So vermeidest du, dass die KI abbricht oder etwas falsch versteht.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Themenbereiche */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Schwerpunkte der Beratung</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {trainingAreas.map((area, index) => {
              const Icon = area.icon
              return (
                <Card key={index} className="bg-white/90 backdrop-blur-sm shadow-md card-hover">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand/20 to-brand-accent/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-brand" />
                      </div>
                      <span>{area.title}</span>
                    </CardTitle>
                    <CardDescription>{area.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {area.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-brand rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{topic}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Vorbereitungs-Checkliste */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm shadow-md">
          <CardHeader>
            <CardTitle>Vorbereitungs-Checkliste</CardTitle>
            <CardDescription>Geh diese Punkte durch, um sicherzustellen, dass du bereit für das Kundengespräch bist.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checklist.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Checkbox
                    id={`checklist-${index}`}
                    checked={checkedItems[index] || false}
                    onCheckedChange={(checked) => handleCheckboxChange(index, checked as boolean)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`checklist-${index}`}
                    className={`text-sm cursor-pointer ${checkedItems[index]
                      ? "text-gray-900 line-through decoration-brand"
                      : "text-gray-700"
                      }`}
                  >
                    {item}
                  </label>
                </div>
              ))}
            </div>

            {isReady && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-green-900">Du bist startklar!</p>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Alle Punkte der Checkliste sind erledigt. Du kannst jetzt deine Beratungssimulation starten.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            onClick={handleStartSimulation}
            disabled={!isReady}
            className="bg-gradient-to-r from-brand to-brand-accent hover:from-brand-dark hover:to-brand text-white font-medium px-8 py-3 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            size="lg"
          >
            Simulation starten
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/start"} size="lg">
            Zurück zur Übersicht
          </Button>
        </div>
      </main>
    </div>
  )
}
