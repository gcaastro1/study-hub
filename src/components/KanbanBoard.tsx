"use client";

import { useState, useEffect } from "react";
import { useGamification } from "@/context/GamificationContext";
import { Plus, Trash2, GripVertical, CheckCircle2, Brain, Tag, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import QuizModal from "./QuizModal";
import TaskModal from "./TaskModal";
import TaskCompletionModal from "./TaskCompletionModal";

type TaskStatus = "todo" | "in-progress" | "done";

interface Task {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  difficulty?: "Fácil" | "Média" | "Difícil";
  status: TaskStatus;
}

export default function KanbanBoard() {
  const { addXp } = useGamification();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Modals State
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [activeQuizTopic, setActiveQuizTopic] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  
  // Boss Battle State
  const [pendingCompletionTask, setPendingCompletionTask] = useState<Task | null>(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem("studyHub_tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks([
        { id: "1", title: "Ler capítulo 1 de História", subject: "História", difficulty: "Fácil", status: "todo" },
        { id: "2", title: "Resolver lista de Matemática", description: "Exercícios 1 a 15 do livro didático", subject: "Matemática", difficulty: "Difícil", status: "in-progress" },
      ]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("studyHub_tasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = (data: { title: string; description: string; subject: string; difficulty: "Fácil" | "Média" | "Difícil" }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      subject: data.subject,
      difficulty: data.difficulty,
      status: "todo",
    };
    
    setTasks([...tasks, newTask]);
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const moveTask = (id: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    // Intercept to trigger Boss Battle when moving to "done"
    if (task.status !== "done" && newStatus === "done") {
      setPendingCompletionTask(task);
      return; // Do not move yet!
    }

    // Normal move (todo <-> in-progress)
    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === id);
      if (taskIndex === -1) return prev;
      
      const newTasks = [...prev];
      newTasks[taskIndex] = { ...newTasks[taskIndex], status: newStatus };
      return newTasks;
    });
  };

  // Called ONLY when the user defeats the Boss Battle
  const confirmTaskCompletion = () => {
    if (!pendingCompletionTask) return;
    
    const task = pendingCompletionTask;
    let xpReward = 100;
    if (task.difficulty === "Fácil") xpReward = 50;
    if (task.difficulty === "Difícil") xpReward = 150;
    
    // Add Boss Battle bonus XP!
    xpReward += 100;
    
    addXp(xpReward);

    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === task.id);
      if (taskIndex === -1) return prev;
      
      const newTasks = [...prev];
      newTasks[taskIndex] = { ...task, status: "done" };
      return newTasks;
    });

    setPendingCompletionTask(null);
  };

  const openQuiz = (topic: string) => {
    setActiveQuizTopic(topic);
    setIsQuizOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("taskId", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      moveTask(taskId, status);
    }
  };

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: "todo", title: "A Fazer", color: "bg-surface" },
    { id: "in-progress", title: "Estudando", color: "bg-primary/20" },
    { id: "done", title: "Concluído", color: "bg-emerald-500/20" },
  ];

  if (!isLoaded) return null;

  return (
    <>
      <div className="glass-panel p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Meu Plano de Estudos
          </h2>
          
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Nova Tarefa
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          {columns.map((col) => (
            <div 
              key={col.id}
              className={`rounded-xl p-4 flex flex-col gap-3 border border-surface-border/50 ${col.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <h3 className="font-semibold text-foreground/80 mb-2 flex justify-between">
                {col.title}
                <span className="text-xs bg-black/30 px-2 py-1 rounded-full">
                  {tasks.filter((t) => t.status === col.id).length}
                </span>
              </h3>
              
              <div className="flex-1 flex flex-col gap-3">
                <AnimatePresence>
                  {tasks
                    .filter((t) => t.status === col.id)
                    .map((task) => {
                      let difficultyColor = "bg-blue-500/20 text-blue-400";
                      if (task.difficulty === "Fácil") difficultyColor = "bg-emerald-500/20 text-emerald-400";
                      if (task.difficulty === "Difícil") difficultyColor = "bg-red-500/20 text-red-400";

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, task.id)}
                          className="bg-surface/80 backdrop-blur-md p-4 rounded-lg border border-white/5 shadow-md flex items-start gap-3 group cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                        >
                          <GripVertical className="w-5 h-5 text-foreground/30 mt-1 cursor-grab flex-shrink-0" />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap gap-2 mb-2">
                              {task.subject && (
                                <span className="text-xs px-2 py-1 bg-surface-border rounded-md flex items-center gap-1 text-foreground/80">
                                  <Tag className="w-3 h-3" /> {task.subject}
                                </span>
                              )}
                              {task.difficulty && (
                                <span className={`text-xs px-2 py-1 rounded-md font-medium ${difficultyColor}`}>
                                  {task.difficulty}
                                </span>
                              )}
                            </div>
                            
                            <p className={`font-medium ${task.status === "done" ? "line-through text-foreground/50" : ""}`}>
                              {task.title}
                            </p>
                            
                            {task.description && (
                              <p className={`text-sm mt-2 flex items-start gap-1 ${task.status === "done" ? "text-foreground/40" : "text-foreground/70"}`}>
                                <AlignLeft className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                                <span className="line-clamp-2">{task.description}</span>
                              </p>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {task.status !== "done" && (
                              <>
                                <button 
                                  onClick={() => openQuiz(task.subject || task.title)}
                                  className="p-1.5 text-purple-400 hover:bg-purple-400/20 rounded transition-colors"
                                  title="Gerar Quiz IA"
                                >
                                  <Brain className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => moveTask(task.id, "done")}
                                  className="p-1.5 text-emerald-400 hover:bg-emerald-400/20 rounded transition-colors"
                                  title="Concluir"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => deleteTask(task.id)}
                              className="p-1.5 text-red-400 hover:bg-red-400/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                </AnimatePresence>
                
                {tasks.filter((t) => t.status === col.id).length === 0 && (
                  <div className="border-2 border-dashed border-white/10 rounded-lg flex-1 min-h-[100px] flex items-center justify-center text-sm text-foreground/30">
                    Arraste para cá
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={addTask} 
      />

      <QuizModal 
        isOpen={isQuizOpen} 
        onClose={() => setIsQuizOpen(false)} 
        topic={activeQuizTopic} 
      />

      <TaskCompletionModal
        isOpen={!!pendingCompletionTask}
        onClose={() => setPendingCompletionTask(null)}
        onSuccess={confirmTaskCompletion}
        taskData={pendingCompletionTask}
      />
    </>
  );
}
