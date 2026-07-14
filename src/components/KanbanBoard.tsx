"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { addTaskToFirebase, deleteTaskFromFirebase, updateTaskStatusInFirebase, TaskStatus, Task, moveTaskLocal, fetchTasks } from "@/store/slices/tasksSlice";
import { useAuth } from "@/context/AuthContext";
import { Plus, GripVertical, Lock } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import TaskModal from "./TaskModal";
import { useI18n } from "@/context/I18nContext";

export default function KanbanBoard() {
  const { user, signInWithGoogle } = useAuth();
  const dispatch = useAppDispatch();
  const { tasks, isLoaded } = useAppSelector(state => state.tasks);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    if (user && !isLoaded) {
      dispatch(fetchTasks(user.uid));
    }
  }, [user, isLoaded, dispatch]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !user) return;

    const sourceId = result.source.droppableId as TaskStatus;
    const destId = result.destination.droppableId as TaskStatus;
    const taskId = result.draggableId;

    if (sourceId === destId) return;

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
    if (!user) return;
    dispatch(moveTaskLocal({ taskId: id, status: "done" }));
    dispatch(updateTaskStatusInFirebase({ uid: user.uid, taskId: id, status: "done" }));
  };

  const { t } = useI18n();

  const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: "todo", title: t("kanban.todo"), color: "bg-surface" },
    { id: "in-progress", title: t("kanban.inProgress"), color: "bg-primary/20" },
    { id: "done", title: t("kanban.done"), color: "bg-emerald-500/20" },
  ];

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-background/50 p-6 text-center">
        <Lock className="w-12 h-12 text-foreground/30 mb-4" />
        <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
        <p className="text-foreground/60 mb-6 max-w-md">
          Você precisa estar logado para criar, visualizar e gerenciar suas tarefas no painel.
        </p>
        <button 
          onClick={signInWithGoogle}
          className="bg-primary text-white hover:bg-primary-hover px-6 py-2 rounded-lg font-bold transition-all"
        >
          Fazer Login com Google
        </button>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col h-full bg-transparent relative overflow-hidden font-sans">
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Scroll Horizontal Adicionado no grid */}
          <div className="grid grid-flow-col auto-cols-[100%] md:auto-cols-[minmax(300px,1fr)] gap-4 flex-1 h-full overflow-x-auto overflow-y-hidden touch-pan-x snap-x snap-mandatory pb-4 px-4 pt-4 scrollbar-thin">
            {columns.map((col, i) => (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col snap-center h-full glass-panel backdrop-blur-md transition-all duration-300 ${
                      snapshot.isDraggingOver ? "bg-surface/80 border-primary/50 shadow-lg" : "bg-surface/40"
                    }`}
                  >
                    <div className="bg-surface/50 backdrop-blur-sm border-b border-surface-border p-3 flex-shrink-0">
                      <h3 className="font-technical text-xs font-bold text-foreground/70 flex justify-between items-center">
                        {col.title.toUpperCase()}
                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full font-bold text-[10px]">
                          {tasks.filter((t) => t.status === col.id).length}
                        </span>
                      </h3>
                    </div>
                    
                    <div className="flex-1 flex flex-col p-3 gap-3 overflow-y-auto min-h-[400px]">
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
                                      opacity: snapshot.isDragging ? 0.95 : 1
                                    }}
                                    className={`bg-surface/80 backdrop-blur-sm border rounded-xl flex flex-col group transition-all duration-200 relative overflow-hidden ${
                                      snapshot.isDragging ? "border-primary shadow-xl scale-105 z-50 ring-2 ring-primary/20" : "border-surface-border hover:border-foreground/20 shadow-sm hover:shadow-md"
                                    }`}
                                  >
                                    <div className="flex border-b border-surface-border/30 bg-background/30 p-2 items-center gap-2">
                                       <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing text-foreground/30 hover:text-primary transition-colors p-1 -ml-1 rounded hover:bg-surface">
                                         <GripVertical className="w-3 h-3" />
                                       </div>
                                       <span className="text-[9px] font-technical text-foreground/40 tracking-widest flex-1">
                                         {task.subject ? `${task.subject.toUpperCase()} // ` : ""}
                                         {task.difficulty ? `${t("kanban.diff")} ${task.difficulty.toUpperCase()}` : ""}
                                       </span>
                                       
                                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                         {task.status !== "done" && (
                                            <button onClick={() => moveToDone(task.id)} className="text-[9px] font-technical text-emerald-400 hover:bg-emerald-400/20 px-1 border border-transparent hover:border-emerald-400/50">{t("kanban.ok")}</button>
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
    </>
  );
}
