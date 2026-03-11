"use client"

import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ArrowRight, Zap, Sparkles, Loader2, LogOut, FileText,
  Droplets, Baby, Flame, Bone, Heart, Syringe, Bug,
  Activity, Pill, Footprints
} from "lucide-react"
import { signout } from "@/app/auth/actions"
import { useEffect, useState } from "react"
import { coachingCards } from "@/data/coaching-cards"

// Icon mapping for coaching cards
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Droplets, Baby, Flame, Bone, Heart, Syringe, Bug,
  Activity, Pill, Footprints, Zap,
}

interface UserProgress {
  status: 'started' | 'interview_completed' | 'training_completed';
  training_modules: { icon: string; title: string; description: string }[];
  training_overview: string;
}

export default function StartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get("applicationId")

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<UserProgress | null>(null)

  useEffect(() => {
    async function fetchProgress() {
      if (!applicationId) { setLoading(false); return }
      try {
        const res = await fetch(`/api/user-progress?applicationId=${applicationId}`)
        if (res.ok) {
          const data = await res.json()
          if (data?.status) setProgress(data)
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProgress()
  }, [applicationId])

  const navigateTo = (path: string, extraParams?: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => params.set(k, v))
    }
    router.push(`${path}?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen page-gradient flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen page-gradient relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-brand/20 to-brand-accent/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-brand-light/30 to-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-gradient-to-br from-violet-200/30 to-brand/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative glass border-b border-white/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src="/lilavita-logo.png"
                  alt="Lilavita Logo"
                  width={180}
                  height={50}
                  className="h-12 w-auto"
                />
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Lilavita Lernplattform</h1>
                <p className="text-xs text-gray-500">Apotheken-Coaching</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4 text-brand" />
                <span>Interaktive Beratungssimulation</span>
              </div>
              <form action={signout}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Abmelden
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand/10 text-brand text-sm font-medium mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Praxisnahes Training fuer den HV
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            Willkommen bei
            <span className="block bg-gradient-to-r from-brand via-brand-accent to-brand-light bg-clip-text text-transparent mt-2">
              Lilavita Lernplattform
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Perfektioniere deine Beratungskompetenz mit interaktiven KI-Simulationen.
            Trainiere realistische Kundengespraeche und erhalte personalisiertes Feedback.
          </p>
        </div>

        {/* ============================================================ */}
        {/* SECTION 1: Original Magnesium Module (featured) */}
        {/* ============================================================ */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Magnesium-Modul</h3>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Aktiv</span>
          </div>

          <Card className="group relative overflow-hidden bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-500 border-2 border-brand/20 shadow-xl shadow-brand/10 hover:shadow-2xl hover:shadow-brand/15 hover:-translate-y-1 hover:border-brand/40">
            <div className="h-2 bg-gradient-to-r from-brand via-brand-accent to-brand-light" />
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0">
                <Zap className="w-10 h-10 text-white" />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Magnesiumcitrat 130
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Beratung bei Muskelkraempfen, Stress und erhoehtem Bedarf. Ideal fuer Sportler und bei Diuretika-Einnahme. Inklusive Video-Einfuehrung und Vorbereitungs-Checkliste.
                </CardDescription>
              </div>
              <Button
                onClick={() => navigateTo("/preparation")}
                className="bg-gradient-to-r from-brand to-brand-accent hover:from-brand-dark hover:to-brand text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl group/btn flex-shrink-0"
                size="lg"
              >
                <span>Starten</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-brand to-brand-accent opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700" />
          </Card>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: Rezept-Simulationen (10 Coaching Cards) */}
        {/* ============================================================ */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Rezept-Simulationen</h3>
            <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-semibold">Neu</span>
          </div>
          <p className="text-gray-500 mb-8 ml-11">
            Kunden kommen mit einem Rezept in die Apotheke. Berate sie und empfehle passende Zusatzprodukte.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coachingCards.map((card) => {
              const Icon = iconMap[card.icon] || Pill
              return (
                <Card
                  key={card.id}
                  className="group relative overflow-hidden bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 border border-gray-200 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-brand/30 cursor-pointer"
                  onClick={() => navigateTo(`/preparation/${card.id}`)}
                >
                  {/* Color bar */}
                  <div className={`h-1.5 bg-gradient-to-r ${card.color}`} />

                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <CardTitle className="text-base font-bold text-gray-900 mb-1">
                          {card.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-500 leading-snug">
                          {card.subtitle}
                        </CardDescription>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1" />
                    </div>

                    {/* Products preview */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1.5">
                        {card.products.slice(0, 2).map((p, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-600">
                            {p.name}
                          </span>
                        ))}
                        {card.additionalBridges && card.additionalBridges.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand/10 text-xs text-brand font-medium">
                            +{card.additionalBridges.reduce((sum, b) => sum + b.products.length, 0)} weitere
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Bottom info section */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-brand" />
              <span>KI-gestuetzt</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-brand-accent" />
              <span>Direktes Feedback</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-brand-light" />
              <span>Praxisnah</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-auto py-6 border-t border-white/50 glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center text-sm text-gray-500">
            <p>&copy; 2024 Lilavita Lernplattform. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
