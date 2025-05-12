import { supabase } from './supabase';

/**
 * Get all tasks for the current user
 * @param {string} userId - User ID
 * @returns {Promise<{data: Array, error: Error}>} - Tasks data and any error
 */
export const getTasks = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { data: null, error };
  }
};

/**
 * Get a single task by ID
 * @param {string} id - Task ID
 * @returns {Promise<{data: Object, error: Error}>} - Task data and any error
 */
export const getTaskById = async (id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };
  
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    // Handle the "no rows returned" error specifically
    if (error && error.code === 'PGRST116') {
      return { data: null, error: null }; // Not finding a task isn't an error
    }
    
    return { data, error };
  } catch (err) {
    console.error('Error in getTaskById:', err);
    return { data: null, error: err };
  }
};

/**
 * Create a new task
 * @param {Object} taskData - Task data to create
 * @param {string} taskData.title - Task title
 * @param {string} taskData.description - Task description
 * @returns {Promise<{data: Object, error: Error}>} - Created task and any error
 */
export const createTask = async (taskData) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating task:', error);
    return { data: null, error };
  }
};

/**
 * Update an existing task
 * @param {string} id - Task ID to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<{data: Object, error: Error}>} - Updated task and any error
 */
export const updateTask = async (taskId, updates) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating task:', error);
    return { data: null, error };
  }
};

/**
 * Delete a task
 * @param {string} id - Task ID to delete
 * @returns {Promise<{error: Error}>} - Any error that occurred
 */
export const deleteTask = async (taskId) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { error };
  }
}; 