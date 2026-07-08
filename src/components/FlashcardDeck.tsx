"use client";

import { useState } from "react";
import { useFlashcards, Flashcard } from "@/context/FlashcardContext";
import { useAppDispatch } from "@/store";
import { addXpThunk } from "@/store/thunks";
import { useAuth } from "@/context/AuthContext";
import { Layers, Brain, Check, X, RotateCcw, Frown, Meh, Smile, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FlashcardDeck() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { dueCards, reviewFlashcard, deleteFlashcard, isLoaded } = useFlashcards();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (!isLoaded) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (dueCards.length === 0) {
    return (
      <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Tudo em dia!</h2>
        <p className="text-foreground/70 max-w-md">
          Você não tem nenhum flashcard pendente para revisar hoje. Ótimo trabalho! Volte amanhã ou salve novos cartões errando Quizzes.
        </p>
      </div>
    );
  }

  const currentCard = dueCards[currentIndex];

  const handleReview = async (quality: number) => {
    // Quality: 0 (Errou feio), 3 (Acertou com dificuldade), 5 (Acertou fácil)
    await reviewFlashcard(currentCard.id, quality);
    
    if (quality >= 3 && user) {
      dispatch(addXpThunk({ uid: user.uid, amount: 20 }));
    }
    
    setShowAnswer(false);
    
    // We don't advance the index because the array `dueCards` will dynamically shrink 
    // when a card is reviewed and its nextReviewDate gets pushed to the future.
    // However, if we just reviewed the last one, it handles itself.
  };

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir este cartão permanentemente?")) {
      await deleteFlashcard(currentCard.id);
      setShowAnswer(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-foreground/70">
          <Layers className="w-5 h-5 text-primary" />
          <span className="font-medium">
            Restam {dueCards.length} para hoje
          </span>
        </div>
        
        <div className="text-sm bg-surface-border px-3 py-1 rounded-full text-foreground/50">
          {currentCard.subject}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard.id + (showAnswer ? "-back" : "-front")}
          initial={{ rotateY: 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: -90, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <div className="glass-panel min-h-[300px] p-8 md:p-12 flex flex-col justify-center items-center text-center relative shadow-2xl border-primary/20">
            <button 
              onClick={handleDelete}
              className="absolute top-4 right-4 text-foreground/30 hover:text-red-400 transition-colors"
              title="Excluir Cartão"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">
              {showAnswer ? currentCard.answer : currentCard.question}
            </h3>

            {!showAnswer && (
              <div className="absolute bottom-8">
                <Brain className="w-12 h-12 text-primary/20 animate-pulse" />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="w-full mt-8 flex justify-center">
        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="px-8 py-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-transform hover:scale-105 w-full md:w-auto"
          >
            Mostrar Resposta
          </button>
        ) : (
          <div className="flex flex-col w-full gap-4">
            <p className="text-center text-sm text-foreground/50 mb-2">Como você se saiu?</p>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleReview(1)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors"
              >
                <Frown className="w-8 h-8" />
                <span className="font-bold text-sm">Errei</span>
                <span className="text-xs opacity-60">&lt; 1 min</span>
              </button>
              
              <button
                onClick={() => handleReview(3)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-colors"
              >
                <Meh className="w-8 h-8" />
                <span className="font-bold text-sm">Difícil</span>
                <span className="text-xs opacity-60">
                  {currentCard.interval === 0 ? "1 d" : `${Math.round(currentCard.interval * 1.5)} d`}
                </span>
              </button>

              <button
                onClick={() => handleReview(5)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-colors"
              >
                <Smile className="w-8 h-8" />
                <span className="font-bold text-sm">Fácil</span>
                <span className="text-xs opacity-60">
                  {currentCard.interval === 0 ? "4 d" : `${Math.round(currentCard.interval * currentCard.easeFactor * 1.2)} d`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
