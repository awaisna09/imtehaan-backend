/* Simple in-memory key-value store for Imtehaan app */

// In-memory storage for demo purposes
const memoryStore = new Map<string, any>();

// Simple logging
const log = (message: string) => {
  console.log(`[KV Store] ${message}`);
};

// Set stores a key-value pair in memory.
export const set = async (key: string, value: any): Promise<void> => {
  memoryStore.set(key, value);
  log(`Set key: ${key}`);
};

// Get retrieves a key-value pair from memory.
export const get = async (key: string): Promise<any> => {
  const value = memoryStore.get(key);
  log(`Get key: ${key}, found: ${value !== undefined}`);
  return value;
};

// Delete deletes a key-value pair from memory.
export const del = async (key: string): Promise<void> => {
  const deleted = memoryStore.delete(key);
  log(`Delete key: ${key}, deleted: ${deleted}`);
};

// Sets multiple key-value pairs in memory.
export const mset = async (keys: string[], values: any[]): Promise<void> => {
  keys.forEach((key, i) => memoryStore.set(key, values[i]));
  log(`Set multiple keys: ${keys.length} items`);
};

// Gets multiple key-value pairs from memory.
export const mget = async (keys: string[]): Promise<any[]> => {
  const values = keys.map(key => memoryStore.get(key)).filter(value => value !== undefined);
  log(`Get multiple keys: ${keys.length} requested, ${values.length} found`);
  return values;
};

// Deletes multiple key-value pairs from the database.
export const mdel = async (keys: string[]): Promise<void> => {
  const supabase = client();
  
  if (!supabase) {
    // Fallback to memory store
    keys.forEach(key => memoryStore.delete(key));
    return;
  }
  
  try {
    const { error } = await supabase.from("kv_store_a54671ae").delete().in("key", keys);
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.warn("Database error, falling back to memory store:", error.message);
    keys.forEach(key => memoryStore.delete(key));
  }
};

// Search for key-value pairs by prefix.
export const getByPrefix = async (prefix: string): Promise<any[]> => {
  const supabase = client();
  
  if (!supabase) {
    // Fallback to memory store
    const results: any[] = [];
    for (const [key, value] of memoryStore.entries()) {
      if (key.startsWith(prefix)) {
        results.push(value);
      }
    }
    return results;
  }
  
  try {
    const { data, error } = await supabase.from("kv_store_a54671ae").select("key, value").like("key", prefix + "%");
    if (error) {
      throw new Error(error.message);
    }
    return data?.map((d) => d.value) ?? [];
  } catch (error) {
    console.warn("Database error, falling back to memory store:", error.message);
    const results: any[] = [];
    for (const [key, value] of memoryStore.entries()) {
      if (key.startsWith(prefix)) {
        results.push(value);
      }
    }
    return results;
  }
};