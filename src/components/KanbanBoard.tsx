"use client";

import { useState, useEffect } from "react";
import { useGamification } from "@/context/GamificationContext";
import { Plus, Trash2, GripVertical, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type TaskStatus = "todo" | "in-progress" | "done";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

export default function KanbanBoard() {
  const { addXp } = useGamification();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load tasks from local storage
  useEffect(() => {
    const savedTasks = localStorage.getItem("studyHub_tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Default tasks for a new user
      setTasks([
        { id: "1", title: "Ler capítulo 1 de História", status: "todo" },
        { id: "2", title: "Resolver lista de Matemática", status: "in-progress" },
      ]);
    }
    setIsLoaded(true);
  }, []);

  // Save tasks
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("studyHub_tasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: "todo",
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const moveTask = (id: string, newStatus: TaskStatus) => {
    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === id);
      if (taskIndex === -1) return prev;
      
      const task = prev[taskIndex];
      // If moving to done for the first time
      if (task.status !== "done" && newStatus === "done") {
        addXp(100);
      }
      
      const newTasks = [...prev];
      newTasks[taskIndex] = { ...task, status: newStatus };
      return newTasks;
    });
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("taskId", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
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

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Meu Plano de Estudos
        </h2>
        
        <form onSubmit={addTask} className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Nova matéria ou tarefa..."
            className="bg-black/20 border border-surface-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary w-64 transition-colors"
          />
          <button 
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white p-2 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>
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
                  .map((task) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, task.id)}
                      className="bg-surface/80 backdrop-blur-md p-3 rounded-lg border border-white/5 shadow-md flex items-start gap-2 group cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-foreground/30 mt-1 cursor-grab" />
                      
                      <div className="flex-1">
                        <p className={`text-sm ${task.status === "done" ? "line-through text-foreground/50" : ""}`}>
                          {task.title}
                        </p>
                      </div>
                      
                      <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                        {task.status !== "done" && (
                          <button 
                            onClick={() => moveTask(task.id, "done")}
                            className="p-1 text-emerald-400 hover:bg-emerald-400/20 rounded transition-colors"
                            title="Concluir (+100 XP)"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-red-400 hover:bg-red-400/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
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
  );
}
