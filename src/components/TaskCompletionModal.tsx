"use client";

import { useState, useEffect } from "react";
import { X, BrainCircuit, Loader2, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { playTaskComplete } from "@/lib/audio";

import { useFlashcards } from "@/context/FlashcardContext";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

interface TaskCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onFail: () => void;
  taskData: { title: string; description?: string; subject?: string } | null;
}

export default function TaskCompletionModal({ isOpen, onClose, onSuccess, onFail, taskData }: TaskCompletionModalProps) {
  const { addFlashcard } = useFlashcards();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"success" | "error" | null>(null);
  const [battleWon, setBattleWon] = useState(false);

  useEffect(() => {
    if (isOpen && taskData) {
      playTaskComplete();
      setQuestions([]);
      setCurrentIndex(0);
      setLoading(true);
      setError(null);
      setSelectedOption(null);
      setFeedback(null);
      setBattleWon(false);
      fetchQuestions();
    }
  }, [isOpen, taskData]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch("/api/quiz-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) throw new Error("Erro ao gerar Boss Battle");

      const data = await res.json();
      setQuestions(data);
    } catch (err) {
      setError("A IA não conseguiu invocar o desafio final. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (feedback !== null || battleWon) return; // Prevent double clicking
    
    setSelectedOption(index);
    const correctIndex = questions[currentIndex].correctAnswerIndex;

    if (index === correctIndex) {
      setFeedback("success");
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          // Next Question
          setCurrentIndex(curr => curr + 1);
          setFeedback(null);
          setSelectedOption(null);
        } else {
          // Boss Defeated!
          setBattleWon(true);
        }
      }, 1500);
    } else {
      setFeedback("error");
      setTimeout(() => {
        onFail();
        onClose();
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-surface border-2 border-primary/50 p-6 md:p-8 rounded-2xl max-w-2xl w-full relative shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)] overflow-hidden"
      >
        {!battleWon && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-foreground/50 hover:text-foreground transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <BrainCircuit className="w-64 h-64 text-primary" />
        </div>

        <div className="relative z-10">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
              <h2 className="text-2xl font-black mb-2 animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                Invocando a Batalha Final...
              </h2>
              <p className="text-foreground/70">A IA está analisando sua tarefa para gerar 5 perguntas.</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-8 text-center text-red-400">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="text-lg font-bold mb-6">{error}</p>
              <button 
                onClick={onClose}
                className="px-6 py-2 bg-surface-border hover:bg-white/10 rounded-lg text-white font-medium"
              >
                Voltar
              </button>
            </div>
          )}

          {!loading && !error && !battleWon && questions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-orange-500" /> Batalha Final
                </h2>
                <div className="flex gap-2">
                  {questions.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-8 h-2 rounded-full transition-colors ${
                        i < currentIndex ? "bg-emerald-500" : i === currentIndex ? "bg-primary animate-pulse" : "bg-surface-border"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                    {questions[currentIndex].question}
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    {questions[currentIndex].options.map((option, idx) => {
                      let buttonStyle = "bg-surface-border hover:bg-white/10";
                      
                      if (feedback) {
                        if (idx === questions[currentIndex].correctAnswerIndex) {
                          buttonStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold border";
                        } else if (idx === selectedOption) {
                          buttonStyle = "bg-red-500/20 border-red-500 text-red-400 font-bold border";
                        } else {
                          buttonStyle = "bg-surface-border opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={feedback !== null}
                          onClick={() => handleAnswer(idx)}
                          className={`p-4 text-left rounded-xl transition-all border border-transparent ${buttonStyle}`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>

              {feedback === "error" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex flex-col gap-2"
                >
                  <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl text-center font-bold text-lg">
                    Ataque falhou! Você errou a pergunta. A tarefa não pode ser concluída ainda.
                  </div>
                  <button 
                    onClick={() => {
                      const q = questions[currentIndex];
                      const correctAnswer = q.options[q.correctAnswerIndex];
                      addFlashcard(q.question, correctAnswer, taskData?.subject || "Boss Battle");
                      alert("Salvo no seu baralho de Flashcards para revisão!");
                    }}
                    className="w-full p-2 bg-surface-border hover:bg-white/10 text-foreground/80 rounded-lg text-center font-medium transition-colors text-sm"
                  >
                    Salvar Questão para Revisão
                  </button>
                </motion.div>
              )}
              {feedback === "success" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-xl text-center font-bold text-lg"
                >
                  Acertou! Preparando próximo ataque...
                </motion.div>
              )}
            </div>
          )}

          {battleWon && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Chefe Derrotado!
              </h2>
              <p className="text-lg text-foreground/80 mb-8">
                Você provou seu conhecimento e acertou todas as 5 perguntas. O conteúdo foi dominado!
              </p>
              <button 
                onClick={onSuccess}
                className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] transition-all hover:scale-105"
              >
                Reivindicar Recompensas
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
