import FlashcardDeck from "@/components/FlashcardDeck";

export default function FlashcardsPage() {
  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-6">
      <header className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Revisão Espaçada
          </h1>
          <p className="text-foreground/60 mt-1">
            Treine sua memória com flashcards que se adaptam à sua dificuldade
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center pt-8">
        <FlashcardDeck />
      </div>
    </div>
  );
}
