"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { addTaskToFirebase, deleteTaskFromFirebase, updateTaskStatusInFirebase, TaskStatus, Task, moveTaskLocal } from "@/store/slices/tasksSlice";
import { addXpThunk, updateStatsThunk, clearDungeonThunk } from "@/store/thunks";
import { useAuth } from "@/context/AuthContext";
import { Plus, Trash2, GripVertical, CheckCircle2, Brain, Tag, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import QuizModal from "./QuizModal";
import TaskModal from "./TaskModal";
import TaskCompletionModal from "./TaskCompletionModal";
import LootChestModal from "./LootChestModal";

export default function KanbanBoard() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { tasks, isLoaded } = useAppSelector(state => state.tasks);
  const { dailyDungeonCleared } = useAppSelector(state => state.player);
  
  const [showLootChest, setShowLootChest] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [activeQuizTopic, setActiveQuizTopic] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [pendingCompletionTask, setPendingCompletionTask] = useState<Task | null>(null);

  // Optimistic UI Drag and Drop Handler
  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !user) return;

    const sourceId = result.source.droppableId as TaskStatus;
    const destId = result.destination.droppableId as TaskStatus;
    const taskId = result.draggableId;

    if (sourceId === destId) return;

    if (destId === "done") {
      const task = tasks.find(t => t.id === taskId);
      if (task) setPendingCompletionTask(task);
      return;
    }

    // Optimistic UI update
    dispatch(moveTaskLocal({ taskId, status: destId }));
    
    // Server Sync
    dispatch(updateTaskStatusInFirebase({ uid: user.uid, taskId, status: destId }));
  };

  const addTask = (data: { title: string; description: string; subject: string; difficulty: "Fácil" | "Média" | "Difícil" }) => {
    if (!user) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      subject: data.subject,
      difficulty: data.difficulty,
      status: "todo",
      createdAt: Date.now()
    };
    dispatch(addTaskToFirebase({ uid: user.uid, task: newTask }));
  };

  const deleteTask = (id: string) => {
    if (!user) return;
    dispatch(deleteTaskFromFirebase({ uid: user.uid, taskId: id }));
  };

  const moveToDone = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) setPendingCompletionTask(task);
  };

  const confirmTaskCompletion = async () => {
    if (!pendingCompletionTask || !user) return;
    
    const task = pendingCompletionTask;
    let xpReward = 100;
    if (task.difficulty === "Fácil") xpReward = 50;
    if (task.difficulty === "Difícil") xpReward = 150;
    
    xpReward += 100; // Boss Battle bonus
    
    // Server Sync - update task
    dispatch(moveTaskLocal({ taskId: task.id, status: "done" }));
    dispatch(updateTaskStatusInFirebase({ uid: user.uid, taskId: task.id, status: "done" }));
    
    // Awards
    dispatch(addXpThunk({ uid: user.uid, amount: xpReward, subject: task.subject || "Geral" }));
    dispatch(updateStatsThunk({ uid: user.uid, updates: { bossBattlesWon: 1 } }));

    const today = new Date().toISOString().split("T")[0];
    const doneTasksCount = tasks.filter(t => t.status === "done").length + 1;
    
    if (doneTasksCount >= 3 && dailyDungeonCleared !== today) {
      dispatch(clearDungeonThunk(user.uid));
      setShowLootChest(true);
    }

    setPendingCompletionTask(null);
  };

  const failTaskCompletion = () => {
    if (!user) return;
    dispatch(updateStatsThunk({ uid: user.uid, updates: { bossBattlesLost: 1 } }));
    setPendingCompletionTask(null);
  };

  const openQuiz = (topic: string) => {
    setActiveQuizTopic(topic);
    setIsQuizOpen(true);
  };

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: "todo", title: "A Fazer", color: "bg-surface" },
    { id: "in-progress", title: "Estudando", color: "bg-primary/20" },
    { id: "done", title: "Concluído", color: "bg-emerald-500/20" },
  ];

  if (!isLoaded) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-panel p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Meu Plano de Estudos
          </h2>
          
          <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" /> Nova Tarefa
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-[400px]">
            {columns.map((col) => (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-xl p-4 flex flex-col gap-3 border transition-colors ${
                      snapshot.isDraggingOver ? "border-primary/50" : "border-surface-border/50"
                    } ${col.color}`}
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
                          .map((task, index) => {
                            let difficultyColor = "bg-blue-500/20 text-blue-400";
                            if (task.difficulty === "Fácil") difficultyColor = "bg-emerald-500/20 text-emerald-400";
                            if (task.difficulty === "Difícil") difficultyColor = "bg-red-500/20 text-red-400";

                            return (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      opacity: snapshot.isDragging ? 0.9 : 1
                                    }}
                                    className={`bg-surface/80 backdrop-blur-md p-4 rounded-lg border shadow-md flex items-start gap-3 group transition-all ${
                                      snapshot.isDragging ? "border-primary scale-[1.02] z-50" : "border-white/5 hover:border-primary/50"
                                    }`}
                                  >
                                    <div {...provided.dragHandleProps} className="mt-1 cursor-grab active:cursor-grabbing">
                                      <GripVertical className="w-5 h-5 text-foreground/30 flex-shrink-0 hover:text-primary transition-colors" />
                                    </div>
                                    
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
                                            onClick={() => moveToDone(task.id)}
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
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                      </AnimatePresence>
                      {provided.placeholder}
                      
                      {tasks.filter((t) => t.status === col.id).length === 0 && !snapshot.isDraggingOver && (
                        <div className="border-2 border-dashed border-white/10 rounded-lg flex-1 min-h-[100px] flex items-center justify-center text-sm text-foreground/30 mt-2">
                          Arraste para cá
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
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
        onFail={failTaskCompletion}
        taskData={pendingCompletionTask}
      />

      <LootChestModal
        isOpen={showLootChest}
        onClose={() => setShowLootChest(false)}
      />
    </>
  );
}
