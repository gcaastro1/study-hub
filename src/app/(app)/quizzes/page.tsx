"use client";

import Header from "@/components/Header";
import { useState } from "react";
import { useAppDispatch } from "@/store";
import { addXpThunk } from "@/store/thunks";
import { useAuth } from "@/context/AuthContext";
import { BrainCircuit, Loader2, Sparkles, Send } from "lucide-react";

interface QuizData {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export default function QuizzesPage() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [topicInput, setTopicInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<"success" | "error" | null>(null);

  const generateQuiz = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topicInput.trim()) return;

    setLoading(true);
    setQuizData(null);
    setResult(null);
    setSelectedOption(null);

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicInput }),
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
        dispatch(addXpThunk({ uid: user.uid, amount: 200 }));
      }
    } else {
      setResult("error");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      <Header />
      
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-8">
        <div className="glass-panel p-8 text-center">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/50">
            <BrainCircuit className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-black mb-4">Sessão de Quiz IA</h2>
          <p className="text-foreground/70 mb-8 max-w-lg mx-auto">
            Digite qualquer assunto que você queira revisar. Nossa Inteligência Artificial vai gerar um desafio de múltipla escolha exclusivo para você.
          </p>

          <form onSubmit={generateQuiz} className="flex gap-2 max-w-md mx-auto">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="Ex: Revolução Francesa, React Hooks..."
              className="flex-1 bg-black/20 border border-surface-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            />
            <button 
              type="submit"
              disabled={loading || !topicInput.trim()}
              className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>

        {quizData && (
          <div className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <BrainCircuit className="w-64 h-64" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Desafio Gerado
              </h3>
              <p className="text-xl md:text-2xl font-medium mb-8 leading-relaxed">
                {quizData.question}
              </p>
              
              <div className="flex flex-col gap-3">
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
                      className={`p-4 text-left rounded-xl transition-all border border-transparent ${buttonStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {result === "success" && (
                <div className="mt-8 p-4 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 rounded-xl text-center font-bold animate-bounce text-lg">
                  Correto! Você ganhou +200 XP e Moedas! 🎉
                </div>
              )}

              {result === "error" && (
                <div className="mt-8 p-4 bg-red-500/20 border border-red-500/50 text-red-400 rounded-xl text-center font-bold text-lg">
                  Ops, não foi dessa vez. Continue estudando!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
