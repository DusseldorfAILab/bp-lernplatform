"use client";

import { FileText } from "lucide-react";

interface PrescriptionCardProps {
  patientName: string;
  doctorName: string;
  medication: string;
  dosage: string;
  date: string;
  className?: string;
}

export function PrescriptionCard({
  patientName,
  doctorName,
  medication,
  dosage,
  date,
  className = "",
}: PrescriptionCardProps) {
  return (
    <div className={`relative bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden ${className}`}>
      {/* Pink header stripe (like real German prescriptions) */}
      <div className="h-3 bg-gradient-to-r from-pink-400 via-pink-500 to-rose-400" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-pink-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-pink-600">
              Kassenrezept
            </span>
          </div>
          <span className="text-xs text-gray-400">{date}</span>
        </div>

        {/* Doctor info */}
        <div className="mb-4 pb-3 border-b border-dashed border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Verordnender Arzt</p>
          <p className="text-sm font-semibold text-gray-800">{doctorName}</p>
        </div>

        {/* Patient info */}
        <div className="mb-4 pb-3 border-b border-dashed border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Patient/in</p>
          <p className="text-sm font-semibold text-gray-800">{patientName}</p>
        </div>

        {/* Medication - highlighted */}
        <div className="bg-pink-50 border border-pink-100 rounded-xl p-4 mb-3">
          <p className="text-xs text-pink-500 uppercase tracking-wide font-medium mb-1">Verordnung</p>
          <p className="text-base font-bold text-gray-900 leading-snug">{medication}</p>
          <p className="text-sm text-gray-600 mt-1">{dosage}</p>
        </div>

        {/* Signature area */}
        <div className="flex justify-end mt-3">
          <div className="text-right">
            <div className="w-24 h-px bg-gray-300 mb-1" />
            <p className="text-[10px] text-gray-400">Unterschrift Arzt</p>
          </div>
        </div>
      </div>
    </div>
  );
}
