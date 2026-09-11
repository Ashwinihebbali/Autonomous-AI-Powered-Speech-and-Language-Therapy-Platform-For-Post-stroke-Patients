import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Save, Edit3, CheckCircle2, X } from "lucide-react";

interface PatientNotesProps {
  patientId: number;
  initialNotes?: string | null;
}

export function PatientNotes({ patientId, initialNotes }: PatientNotesProps) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setNotes(initialNotes || "");
  }, [initialNotes]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/patients/${patientId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ therapistNotes: notes }),
      });
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    } catch (err) {
      console.error("Failed to save notes", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNotes(initialNotes || "");
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-foreground">Therapist Notes</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            {notes ? "Edit" : "Add Note"}
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Add observations, areas to focus on, or recommendations for this patient..."
            autoFocus
            className="w-full p-4 rounded-2xl border border-border resize-none text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Notes"}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          {notes ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {notes}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No notes yet. Add observations or recommendations for this patient.
            </p>
          )}
          {saved && (
            <p className="flex items-center gap-1 text-sm text-green-600 mt-3">
              <CheckCircle2 className="w-4 h-4" /> Notes saved
            </p>
          )}
        </div>
      )}
    </div>
  );
}
