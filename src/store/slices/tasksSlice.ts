import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, doc, getDocs, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  difficulty?: "Fácil" | "Média" | "Difícil";
  status: TaskStatus;
  createdAt: number;
}

interface TasksState {
  tasks: Task[];
  isLoaded: boolean;
}

const initialState: TasksState = {
  tasks: [],
  isLoaded: false,
};

// Sincronizar leitura inicial
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (uid: string) => {
    const tasksRef = collection(db, `users/${uid}/tasks`);
    const snapshot = await getDocs(tasksRef);
    const tasks: Task[] = [];
    snapshot.forEach(doc => {
      tasks.push(doc.data() as Task);
    });
    return tasks.sort((a, b) => a.createdAt - b.createdAt);
  }
);

// Sincronizar criação
export const addTaskToFirebase = createAsyncThunk(
  'tasks/addTask',
  async ({ uid, task }: { uid: string, task: Task }) => {
    const docRef = doc(db, `users/${uid}/tasks`, task.id);
    await setDoc(docRef, task);
    return task;
  }
);

// Sincronizar deleção
export const deleteTaskFromFirebase = createAsyncThunk(
  'tasks/deleteTask',
  async ({ uid, taskId }: { uid: string, taskId: string }) => {
    const docRef = doc(db, `users/${uid}/tasks`, taskId);
    await deleteDoc(docRef);
    return taskId;
  }
);

// Sincronizar atualização de status (arrastar)
export const updateTaskStatusInFirebase = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ uid, taskId, status }: { uid: string, taskId: string, status: TaskStatus }) => {
    const docRef = doc(db, `users/${uid}/tasks`, taskId);
    await updateDoc(docRef, { status });
    return { taskId, status };
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    resetTasks: () => initialState,
    // Atualizações otimistas locais (antes da rede confirmar)
    addTaskLocal: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    deleteTaskLocal: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
    moveTaskLocal: (state, action: PayloadAction<{ taskId: string, status: TaskStatus }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.status = action.payload.status;
      }
    },
    reorderTasksLocal: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.tasks = action.payload;
      state.isLoaded = true;
    });
    builder.addCase(fetchTasks.rejected, (state) => {
      state.isLoaded = true;
    });
  }
});

export const { resetTasks, addTaskLocal, deleteTaskLocal, moveTaskLocal, reorderTasksLocal } = tasksSlice.actions;
export default tasksSlice.reducer;
