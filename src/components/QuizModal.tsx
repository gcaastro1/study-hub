"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store";
import { addXpThunk } from "@/store/thunks";
import { useAuth } from "@/context/AuthContext";
import { useFlashcards } from "@/context/FlashcardContext";
import { Brain, X, Loader2, Sparkles } from "lucide-react";

interface QuizData {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

interface QuizModalProps {
  topic: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuizModal({ topic, isOpen, onClose }: QuizModalProps) {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { addFlashcard } = useFlashcards();
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const generateQuiz = async () => {
    setLoading(true);
    setQuizData(null);
    setResult(null);
    setSelectedOption(null);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });

      if (!res.ok) throw new Error("Erro na API");

      const data = await res.json();
      setQuizData(data);
    } catch (error) {
      console.error(error);
      alert("Falha ao gerar o Quiz. Verifique se a chave do Gemini foi configurada.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number) => {
    setSelectedOption(index);
    if (index === quizData?.correctAnswerIndex) {
      setResult("success");
      if (user) {
        dispatch(addXpThunk({ uid: user.uid, amount: 200 })); // 200 XP for correct answer!
      }
    } else {
      setResult("error");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-surface-border p-6 rounded-2xl max-w-lg w-full relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/50 hover:text-foreground"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
          <Brain className="text-primary w-6 h-6" />
          IA Quiz: {topic}
        </h2>

        {!quizData && !loading && (
          <div className="text-center py-8">
            <p className="text-foreground/70 mb-6">
              Teste seus conhecimentos! Nossa Inteligência Artificial vai ler seu tópico e criar uma pergunta exclusiva para você. Acertar dá +200 XP!
            </p>
            <button 
              onClick={generateQuiz}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 w-full transition-colors"
            >
              <Sparkles className="w-5 h-5" /> Gerar Desafio com IA
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12 flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-foreground/70 animate-pulse">A IA está pensando na pergunta perfeita...</p>
          </div>
        )}

        {quizData && (
          <div className="flex flex-col gap-4">
            <p className="text-lg font-medium mb-2">{quizData.question}</p>
            
            <div className="flex flex-col gap-2">
              {quizData.options.map((option, idx) => {
                let buttonStyle = "bg-surface-border hover:bg-white/10";
                
                if (result) {
                  if (idx === quizData.correctAnswerIndex) {
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
                    disabled={result !== null}
                    onClick={() => handleAnswer(idx)}
                    className={`p-3 text-left rounded-lg transition-all ${buttonStyle}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {result === "success" && (
              <div className="mt-4 p-3 bg-emerald-500/20 text-emerald-400 rounded-lg text-center font-bold animate-bounce">
                Correto! Você ganhou +200 XP e Moedas! 🎉
              </div>
            )}

            {result === "error" && (
              <div className="mt-4 p-3 bg-red-500/20 text-red-400 rounded-lg text-center font-bold">
                Ops, não foi dessa vez. Continue estudando!
              </div>
            )}

            {result && (
              <button 
                onClick={() => {
                  const correctAnswer = quizData.options[quizData.correctAnswerIndex];
                  addFlashcard(quizData.question, correctAnswer, topic);
                  alert("Salvo no seu baralho de Flashcards para revisão!");
                }}
                className="mt-2 w-full p-3 bg-surface-border hover:bg-white/10 text-foreground/80 rounded-lg text-center font-medium transition-colors"
              >
                Salvar para Revisão (Flashcard)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
