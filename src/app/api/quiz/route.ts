import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "O tópico é obrigatório" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY não configurada no servidor" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Gere exatamente 1 pergunta de múltipla escolha sobre o seguinte tópico de estudo: "${topic}".
A pergunta deve ser útil para testar os conhecimentos de um estudante.
Forneça 4 opções (A, B, C, D).
A resposta final DEVE ser um objeto JSON puro, sem marcações markdown ou blocos de código (não use \`\`\`json).
Formato exato esperado:
{
  "question": "A pergunta gerada",
  "options": [
    "A) opção 1",
    "B) opção 2",
    "C) opção 3",
    "D) opção 4"
  ],
  "correctAnswerIndex": 0 // de 0 a 3, indicando a opção correta
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      throw new Error("Resposta vazia da IA");
    }

    // Try to parse the JSON string, removing any accidental markdown blocks if the model ignored instructions
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const quizData = JSON.parse(cleanText);

    return NextResponse.json(quizData);
  } catch (error) {
    console.error("Erro ao gerar quiz:", error);
    return NextResponse.json({ error: "Falha ao gerar o quiz com a IA" }, { status: 500 });
  }
}
