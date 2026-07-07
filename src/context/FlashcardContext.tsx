"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useGamification } from "./GamificationContext";
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: string;
  nextReviewDate: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

interface FlashcardState {
  flashcards: Flashcard[];
  addFlashcard: (question: string, answer: string, subject: string) => Promise<void>;
  reviewFlashcard: (id: string, quality: number) => Promise<void>;
  deleteFlashcard: (id: string) => Promise<void>;
  dueCards: Flashcard[];
  isLoaded: boolean;
}

const FlashcardContext = createContext<FlashcardState | undefined>(undefined);

export const FlashcardProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { addXp } = useGamification();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setFlashcards([]);
      setIsLoaded(true);
      return;
    }

    const loadCards = async () => {
      try {
        const cardsRef = collection(db, "users", user.uid, "flashcards");
        const snapshot = await getDocs(cardsRef);
        const loadedCards: Flashcard[] = [];
        snapshot.forEach((doc) => {
          loadedCards.push(doc.data() as Flashcard);
        });
        setFlashcards(loadedCards);
        setIsLoaded(true);
      } catch (error) {
        console.error("Erro ao carregar flashcards:", error);
        setIsLoaded(true);
      }
    };
    
    loadCards();
  }, [user, authLoading]);

  const addFlashcard = async (question: string, answer: string, subject: string) => {
    if (!user) return;
    
    const newCard: Flashcard = {
      id: Date.now().toString(),
      question,
      answer,
      subject: subject || "Geral",
      nextReviewDate: new Date().toISOString().split("T")[0], // Due today!
      interval: 0,
      easeFactor: 2.5,
      repetitions: 0,
    };

    setFlashcards((prev) => [...prev, newCard]);

    try {
      const cardRef = doc(db, "users", user.uid, "flashcards", newCard.id);
      await setDoc(cardRef, newCard);
      // Trigger badge check
      addXp(0, undefined, "FLASHCARD_SAVED", { total: flashcards.length + 1 });
    } catch (error) {
      console.error("Erro ao adicionar flashcard:", error);
    }
  };

  // SM-2 Spaced Repetition Algorithm
  const reviewFlashcard = async (id: string, quality: number) => {
    if (!user) return;

    const cardIndex = flashcards.findIndex(c => c.id === id);
    if (cardIndex === -1) return;

    const card = { ...flashcards[cardIndex] };

    // SM-2 Logic
    if (quality >= 3) {
      if (card.repetitions === 0) {
        card.interval = 1;
      } else if (card.repetitions === 1) {
        card.interval = 6;
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }
      card.repetitions += 1;
    } else {
      card.repetitions = 0;
      card.interval = 1;
    }

    card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (card.easeFactor < 1.3) card.easeFactor = 1.3;

    // Calculate next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + card.interval);
    card.nextReviewDate = nextDate.toISOString().split("T")[0];

    const newCards = [...flashcards];
    newCards[cardIndex] = card;
    setFlashcards(newCards);

    try {
      const cardRef = doc(db, "users", user.uid, "flashcards", card.id);
      await setDoc(cardRef, card);
    } catch (error) {
      console.error("Erro ao atualizar flashcard:", error);
    }
  };

  const deleteFlashcard = async (id: string) => {
    if (!user) return;
    setFlashcards((prev) => prev.filter(c => c.id !== id));
    
    try {
      const cardRef = doc(db, "users", user.uid, "flashcards", id);
      await deleteDoc(cardRef);
    } catch (error) {
      console.error("Erro ao deletar flashcard:", error);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const dueCards = flashcards.filter(card => card.nextReviewDate <= today);

  return (
    <FlashcardContext.Provider value={{ flashcards, addFlashcard, reviewFlashcard, deleteFlashcard, dueCards, isLoaded }}>
      {children}
    </FlashcardContext.Provider>
  );
};

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (!context) throw new Error("useFlashcards must be used within FlashcardProvider");
  return context;
};
