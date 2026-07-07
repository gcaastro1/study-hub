"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { title: string; description: string; subject: string; difficulty: "Fácil" | "Média" | "Difícil" }) => void;
}

export default function TaskModal({ isOpen, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState<"Fácil" | "Média" | "Difícil">("Média");

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setSubject("");
      setDifficulty("Média");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, description, subject, difficulty });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-surface-border p-6 rounded-2xl max-w-md w-full relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6">Nova Tarefa</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Título *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Resolver lista 3"
              className="w-full bg-black/20 border border-surface-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Matéria / Categoria</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Matemática, Programação"
              className="w-full bg-black/20 border border-surface-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes do que precisa ser feito..."
              rows={3}
              className="w-full bg-black/20 border border-surface-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/80 mb-1">Dificuldade</label>
            <div className="flex gap-2">
              {(["Fácil", "Média", "Difícil"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    difficulty === level 
                      ? "border-primary bg-primary/20 text-primary" 
                      : "border-surface-border bg-surface hover:bg-surface-border"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-lg font-bold mt-4 transition-colors"
          >
            Criar Tarefa
          </button>
        </form>
      </div>
    </div>
  );
}
