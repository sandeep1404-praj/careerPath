import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { roadmapAPI } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import toast from '../utils/toast.js';

// Roadmap Context
const RoadmapContext = createContext();

// Action types
const ROADMAP_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_STATIC_ROADMAPS: 'SET_STATIC_ROADMAPS',
  SET_USER_ROADMAP: 'SET_USER_ROADMAP',
  ADD_TASK_TO_USER: 'ADD_TASK_TO_USER',
  UPDATE_TASK: 'UPDATE_TASK',
  REMOVE_TASK: 'REMOVE_TASK',
  SET_PREFERENCES: 'SET_PREFERENCES',
  REORDER_TASKS: 'REORDER_TASKS',
  CLEAR_DATA: 'CLEAR_DATA'
};

// Initial state
const initialState = {
  loading: false,
  error: null,
  staticRoadmaps: [],
  userRoadmap: null,
  preferences: {
    defaultTrack: '',
    showCompleted: true,
    sortBy: 'order'
  }
};

// Reducer function
const roadmapReducer = (state, action) => {
  switch (action.type) {
    case ROADMAP_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ROADMAP_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case ROADMAP_ACTIONS.SET_STATIC_ROADMAPS:
      return { ...state, staticRoadmaps: action.payload, loading: false };

    case ROADMAP_ACTIONS.SET_USER_ROADMAP:
      return {
        ...state,
        userRoadmap: action.payload,
        preferences: action.payload?.preferences || state.preferences,
        loading: false
      };

    case ROADMAP_ACTIONS.ADD_TASK_TO_USER:
      if (!state.userRoadmap) return state;
      return {
        ...state,
        userRoadmap: {
          ...state.userRoadmap,
          tasks: [...state.userRoadmap.tasks, action.payload],
          stats: {
            ...state.userRoadmap.stats,
            totalTasks: state.userRoadmap.tasks.length + 1
          }
        }
      };

    case ROADMAP_ACTIONS.UPDATE_TASK: {
      if (!state.userRoadmap) return state;
      const updatedTasks = state.userRoadmap.tasks.map(task =>
        task.taskId === action.payload.taskId
          ? { ...task, ...action.payload.updates }
          : task
      );
      return {
        ...state,
        userRoadmap: {
          ...state.userRoadmap,
          tasks: updatedTasks,
          stats: {
            totalTasks: updatedTasks.length,
            completedTasks: updatedTasks.filter(t => t.status === 'completed').length,
            inProgressTasks: updatedTasks.filter(t => t.status === 'in-progress').length
          }
        }
      };
    }

    case ROADMAP_ACTIONS.REMOVE_TASK: {
      if (!state.userRoadmap) return state;
      const filteredTasks = state.userRoadmap.tasks.filter(task => task.taskId !== action.payload);
      return {
        ...state,
        userRoadmap: {
          ...state.userRoadmap,
          tasks: filteredTasks,
          stats: {
            totalTasks: filteredTasks.length,
            completedTasks: filteredTasks.filter(t => t.status === 'completed').length,
            inProgressTasks: filteredTasks.filter(t => t.status === 'in-progress').length
          }
        }
      };
    }

    case ROADMAP_ACTIONS.SET_PREFERENCES:
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      };

    case ROADMAP_ACTIONS.REORDER_TASKS:
      if (!state.userRoadmap) return state;
      return {
        ...state,
        userRoadmap: {
          ...state.userRoadmap,
          tasks: action.payload
        }
      };

    case ROADMAP_ACTIONS.CLEAR_DATA:
      return initialState;

    default:
      return state;
  }
};

// Provider component
export const RoadmapProvider = ({ children }) => {
  const [state, dispatch] = useReducer(roadmapReducer, initialState);
  const { user, token } = useAuth();

  // Helper function to handle errors
  const handleError = useCallback((error, defaultMessage) => {
    console.error(defaultMessage, error);
    const message = error.message || defaultMessage;
    dispatch({ type: ROADMAP_ACTIONS.SET_ERROR, payload: message });
    toast.error(message);
  }, [dispatch]);

  // Load static roadmaps
  const loadStaticRoadmaps = useCallback(async () => {
    try {
      dispatch({ type: ROADMAP_ACTIONS.SET_LOADING, payload: true });
      const data = await roadmapAPI.getStaticRoadmaps();
      dispatch({ type: ROADMAP_ACTIONS.SET_STATIC_ROADMAPS, payload: data });
    } catch (error) {
      handleError(error, 'Failed to load roadmaps');
    }
  }, [dispatch, handleError]);

  // Load user roadmap
  const loadUserRoadmap = useCallback(async () => {
    if (!token) return;
    
    try {
      dispatch({ type: ROADMAP_ACTIONS.SET_LOADING, payload: true });
      const data = await roadmapAPI.getUserRoadmap(token);
      dispatch({ type: ROADMAP_ACTIONS.SET_USER_ROADMAP, payload: data });
    } catch (error) {
      handleError(error, 'Failed to load your roadmap');
    }
  }, [dispatch, handleError, token]);

  // Load static roadmaps on mount (available to everyone)
  useEffect(() => {
    loadStaticRoadmaps();
  }, [loadStaticRoadmaps]);

  // Load user roadmap when user is authenticated
  useEffect(() => {
    if (user && token) {
      loadUserRoadmap();
    } else {
      // Clear user-specific data but keep static roadmaps
      dispatch({ 
        type: ROADMAP_ACTIONS.SET_USER_ROADMAP, 
        payload: null 
      });
    }
  }, [user, token, loadUserRoadmap]);

  // Add task to user roadmap
  const addTaskToUser = async (taskData) => {
    if (!token) {
      toast.error('Please log in to add tasks');
      return false;
    }

    try {
      const response = await roadmapAPI.addTaskToUserRoadmap(token, taskData);
      dispatch({ type: ROADMAP_ACTIONS.ADD_TASK_TO_USER, payload: response.task });
      toast.success('Task added to your roadmap');
      return true;
    } catch (error) {
      handleError(error, 'Failed to add task');
      return false;
    }
  };

  // Update task in user roadmap
  const updateTask = async (taskId, action, updates) => {
    if (!token) return false;

    try {
      await roadmapAPI.updateUserRoadmap(token, { action, taskId, updates });
      
      if (action === 'remove') {
        dispatch({ type: ROADMAP_ACTIONS.REMOVE_TASK, payload: taskId });
        toast.success('Task removed');
      } else {
        dispatch({ 
          type: ROADMAP_ACTIONS.UPDATE_TASK, 
          payload: { taskId, updates } 
        });
        
        if (action === 'update-status' && updates.status === 'completed') {
          toast.success('Task completed! 🎉');
        }
      }
      return true;
    } catch (error) {
      handleError(error, 'Failed to update task');
      return false;
    }
  };

  // Update preferences
  const updatePreferences = async (newPreferences) => {
    if (!token) return false;

    try {
      await roadmapAPI.updateUserPreferences(token, newPreferences);
      dispatch({ type: ROADMAP_ACTIONS.SET_PREFERENCES, payload: newPreferences });
      toast.success('Preferences updated');
      return true;
    } catch (error) {
      handleError(error, 'Failed to update preferences');
      return false;
    }
  };

  // Reorder tasks (local first, then sync)
  const reorderTasks = async (newOrderedTasks) => {
    if (!token) return false;

    // Update locally first for immediate feedback
    dispatch({ type: ROADMAP_ACTIONS.REORDER_TASKS, payload: newOrderedTasks });

    try {
      // Sync each task's new order to the backend
      const promises = newOrderedTasks.map((task, index) =>
        roadmapAPI.updateUserRoadmap(token, {
          action: 'reorder',
          taskId: task.taskId,
          newOrder: index + 1
        })
      );
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      handleError(error, 'Failed to save new order');
      // Reload to restore correct order
      loadUserRoadmap();
      return false;
    }
  };

  // Create custom task
  const createCustomTask = async (taskData) => {
    if (!token) return false;

    const customTask = {
      ...taskData,
      taskId: `custom_${Date.now()}`,
      isCustom: true,
      staticTaskId: null
    };

    return await addTaskToUser(customTask);
  };

  // Get tasks by status
  const getTasksByStatus = (status) => {
    if (!state.userRoadmap) return [];
    return state.userRoadmap.tasks.filter(task => task.status === status);
  };

  // Get tasks by track
  const getTasksByTrack = (track) => {
    if (!state.userRoadmap) return [];
    return state.userRoadmap.tasks.filter(task => task.roadmapTrack === track);
  };

  // Check if task is already added
  const isTaskAdded = (taskId) => {
    if (!state.userRoadmap) return false;
    return state.userRoadmap.tasks.some(task => task.taskId === taskId || task.staticTaskId === taskId);
  };

  const value = {
    // State
    ...state,
    
    // Actions
    loadStaticRoadmaps,
    loadUserRoadmap,
    addTaskToUser,
    updateTask,
    updatePreferences,
    reorderTasks,
    createCustomTask,
    
    // Getters
    getTasksByStatus,
    getTasksByTrack,
    isTaskAdded
  };

  return (
    <RoadmapContext.Provider value={value}>
      {children}
    </RoadmapContext.Provider>
  );
};

// Custom hook to use roadmap context
export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
};