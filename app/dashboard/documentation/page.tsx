"use client";
import { useEffect, useMemo, useState } from "react";
import { useClinicalDocumentation } from "@/hooks/use-gpt5";

export default function DocumentationPage() {
  const { isGenerating, documentation, generateDocumentation } = useClinicalDocumentation();
  const [notes, setNotes] = useState("");
  const [objectives, setObjectives] = useState<{ assessment: boolean; communication: boolean }>({ assessment: false, communication: false });
  const [phiIssues, setPhiIssues] = useState<string[]>([]);

  const objectiveList = useMemo(() => {
    const list: string[] = [];
    if (objectives.assessment) list.push("Assessment");
    if (objectives.communication) list.push("Communication");
    return list;
  }, [objectives]);

  const onGenerate = async () => {
    setPhiIssues([]);
    try {
      await generateDocumentation(notes, objectiveList, {
        strengths: ["Clinical reasoning"],
        areasForImprovement: ["Time management"],
        clinicalSkillsAssessed: ["IV insertion"],
      });
    } catch (e) {
      if (e instanceof Error && /Invalid content/i.test(e.message)) {
        setPhiIssues(["Remove identifying information"]);
      }
    }
  };

  const onExport = () => {
    const blob = new Blob([documentation || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clinical-documentation-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Clinical Documentation</h1>
      <textarea
        data-testid="session-notes"
        className="w-full border rounded p-3 h-40"
        placeholder="Enter session notes (avoid PHI)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex items-center gap-6">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            data-testid="objective-assessment"
            checked={objectives.assessment}
            onChange={(e) => setObjectives((s) => ({ ...s, assessment: e.target.checked }))}
          />
          Assessment
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            data-testid="objective-communication"
            checked={objectives.communication}
            onChange={(e) => setObjectives((s) => ({ ...s, communication: e.target.checked }))}
          />
          Communication
        </label>
      </div>

      <div className="flex gap-3">
        <button data-testid="generate-doc-btn" className="border rounded px-3 py-2" onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? "Generating…" : "Generate"}
        </button>
        <button data-testid="export-pdf-btn" className="border rounded px-3 py-2" onClick={onExport} disabled={!documentation}>
          Export
        </button>
      </div>

      {phiIssues.length > 0 && (
        <div data-testid="phi-warning" className="text-sm text-amber-700">
          {phiIssues.join(", ")}
        </div>
      )}

      {documentation && (
        <div>
          <h2 className="text-lg font-semibold">Generated</h2>
          <div data-testid="generated-documentation" className="whitespace-pre-wrap border rounded p-3">
            {documentation}
          </div>
        </div>
      )}
    </div>
  );
}

