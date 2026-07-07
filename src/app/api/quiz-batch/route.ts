import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { title, description, subject } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "O título da tarefa é obrigatório" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY não configurada no servidor" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const prompt = `Gere exatamente 5 perguntas de múltipla escolha sobre a seguinte tarefa de estudo:
Título: "${title}"
Matéria: "${subject || "Geral"}"
Descrição: "${description || "Sem descrição"}"

As perguntas devem testar o conhecimento do usuário para garantir que ele aprendeu o assunto antes de concluir a tarefa. O nível de dificuldade deve aumentar progressivamente.
Forneça 4 opções (A, B, C, D) para cada pergunta.
A resposta final DEVE ser um objeto JSON puro, sem marcações markdown ou blocos de código (não use \`\`\`json).
Formato exato esperado (um array de 5 objetos):
[
  {
    "question": "A pergunta gerada",
    "options": [
      "A) opção 1",
      "B) opção 2",
      "C) opção 3",
      "D) opção 4"
    ],
    "correctAnswerIndex": 0
  },
  ... mais 4 perguntas
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;
    if (!text) {
      throw new Error("Resposta vazia da IA");
    }

    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const quizData = JSON.parse(cleanText);

    if (!Array.isArray(quizData) || quizData.length !== 5) {
      throw new Error("A IA não retornou um array de 5 perguntas válido.");
    }

    return NextResponse.json(quizData);
  } catch (error) {
    console.error("Erro ao gerar quiz batch:", error);
    return NextResponse.json({ error: "Falha ao gerar o quiz com a IA" }, { status: 500 });
  }
}
