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
import { useI18n } from "@/context/I18nContext";

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

  const { t } = useI18n();

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: "todo", title: t("kanban.todo"), color: "bg-surface" },
    { id: "in-progress", title: t("kanban.inProgress"), color: "bg-primary/20" },
    { id: "done", title: t("kanban.done"), color: "bg-emerald-500/20" },
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
      <div className="flex-1 flex flex-col h-full bg-background relative overflow-hidden font-sans">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 flex-1 h-full border border-surface-border">
            {columns.map((col, i) => (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col bg-surface/30 transition-colors ${
                      snapshot.isDraggingOver ? "bg-surface" : ""
                    } ${i !== 0 ? "border-l border-surface-border" : ""}`}
                  >
                    <div className="bg-surface border-b border-surface-border p-2">
                      <h3 className="font-technical text-[10px] text-foreground/50 tracking-widest flex justify-between">
                        [{col.title.toUpperCase()}]
                        <span className="text-primary font-bold">
                          {tasks.filter((t) => t.status === col.id).length.toString().padStart(2, '0')}
                        </span>
                      </h3>
                    </div>
                    
                    <div className="flex-1 flex flex-col p-2 gap-2 overflow-y-auto min-h-[300px]">
                      <AnimatePresence>
                        {tasks
                          .filter((t) => t.status === col.id)
                          .map((task, index) => {
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
                                    className={`bg-background border flex flex-col group transition-all relative ${
                                      snapshot.isDragging ? "border-primary shadow-[0_0_15px_rgba(168,26,36,0.2)] z-50" : "border-surface-border hover:border-foreground/30"
                                    }`}
                                  >
                                    <div className="flex border-b border-surface-border/50 bg-surface/50 p-1.5 items-center gap-2">
                                       <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-foreground/20 hover:text-primary">
                                         <GripVertical className="w-3 h-3" />
                                       </div>
                                       <span className="text-[9px] font-technical text-foreground/40 tracking-widest flex-1">
                                         {task.subject ? `${task.subject.toUpperCase()} // ` : ""}
                                         {task.difficulty ? `${t("kanban.diff")} ${task.difficulty.toUpperCase()}` : ""}
                                       </span>
                                       
                                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                         {task.status !== "done" && (
                                            <>
                                              <button onClick={() => openQuiz(task.subject || task.title)} className="text-[9px] font-technical text-purple-400 hover:bg-purple-400/20 px-1 border border-transparent hover:border-purple-400/50">{t("kanban.quiz")}</button>
                                              <button onClick={() => moveToDone(task.id)} className="text-[9px] font-technical text-emerald-400 hover:bg-emerald-400/20 px-1 border border-transparent hover:border-emerald-400/50">{t("kanban.ok")}</button>
                                            </>
                                         )}
                                         <button onClick={() => deleteTask(task.id)} className="text-[9px] font-technical text-red-500 hover:bg-red-500/20 px-1 border border-transparent hover:border-red-500/50">{t("kanban.del")}</button>
                                       </div>
                                    </div>
                                    
                                    <div className={`p-2 py-3 ${task.status === "done" ? "opacity-30" : ""}`}>
                                      <p className="font-bold text-xs uppercase tracking-wide text-foreground">
                                        {task.title}
                                      </p>
                                      {task.description && (
                                        <p className="text-[10px] mt-1 text-foreground/50 font-mono line-clamp-2">
                                          &gt; {task.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                      </AnimatePresence>
                      {provided.placeholder}
                      
                      {/* Fixed "Add Mission" button at the bottom of ToDo */}
                      {col.id === "todo" && (
                         <button 
                           onClick={() => setIsTaskModalOpen(true)}
                           className="mt-auto border border-dashed border-surface-border text-foreground/40 hover:text-primary hover:border-primary p-2 text-[10px] font-technical tracking-widest flex justify-center items-center gap-2 transition-colors"
                         >
                           <Plus className="w-3 h-3" /> {t("kanban.addDirective")}
                         </button>
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
