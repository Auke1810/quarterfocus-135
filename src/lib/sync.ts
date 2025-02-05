import { getUserPreferences, saveUserPreferences, type UserPreferences } from "./api";
import { toast } from "sonner";

export async function syncUserSettings() {
  try {
    // Get settings from chrome.storage
    const chromePrefs = await chrome.storage.sync.get(['userPreferences']);
    if (!chromePrefs.userPreferences) return;

    // Save to Supabase
    await saveUserPreferences(chromePrefs.userPreferences);
  } catch (error) {
    console.error('Error syncing user settings:', error);
    throw error;
  }
}

export async function syncAll() {
  try {
    // 1. Sync user settings
    await syncUserSettings();
    
    // 2. Get latest settings from Supabase and update chrome.storage
    const supabasePrefs = await getUserPreferences();
    if (supabasePrefs) {
      await chrome.storage.sync.set({ userPreferences: supabasePrefs });
    }

    // TODO: Add more sync operations here as needed
    // - Tasks sync
    // - Goals sync
    // - etc.

    toast.success("Synchronization completed successfully");
  } catch (error) {
    console.error('Error during sync:', error);
    toast.error("Synchronization failed. Please try again.");
  }
}
