// import EncryptedStorage from 'react-native-encrypted-storage';
import RNSecureStorage, { ACCESSIBLE } from "killuhwhal3-rn-secure-storage";

const JWT_ACCESS_TOKEN_KEY = "__jwttoken_access";
const JWT_REFRESH_TOKEN_KEY = "__jwttoken_refresh";

export const clearToken = async () => {
  try {
    await RNSecureStorage.remove(JWT_ACCESS_TOKEN_KEY);
    await RNSecureStorage.remove(JWT_REFRESH_TOKEN_KEY);
    return true;
  } catch (e) {
    // saving error
    console.log("Error clearing from storage: ", e);
    return false;
  }
};
export const storeToken = async (value: any, access = true) => {
  try {
    if (access) {
      await RNSecureStorage.set(JWT_ACCESS_TOKEN_KEY, value, {
        accessible: ACCESSIBLE.WHEN_UNLOCKED,
      });
    } else {
      await RNSecureStorage.set(JWT_REFRESH_TOKEN_KEY, value, {
        accessible: ACCESSIBLE.WHEN_UNLOCKED,
      });
    }
    return true;
  } catch (e) {
    // saving error
    console.log("Errorsaving to storage: ", e);
    return false;
  }
};

export const getToken = async (access = true) => {
  try {
    if (access) {
      return await RNSecureStorage.get(JWT_ACCESS_TOKEN_KEY);
    } else {
      return await RNSecureStorage.get(JWT_REFRESH_TOKEN_KEY);
    }
  } catch (e) {
    // error reading value
    console.log("Error getting from storage: ", e);
    return null;
  }
};

// Key constants for theme storage
const THEME_MODE_KEY = "__app_theme_mode";

/**
 * Store the user's theme preference
 * @param themeName String identifier for the selected theme
 * @returns Promise<boolean> Success state of the operation
 */
export const storeThemePreference = async (
  themeName: string
): Promise<boolean> => {
  try {
    await RNSecureStorage.set(THEME_MODE_KEY, themeName, {
      accessible: ACCESSIBLE.WHEN_UNLOCKED,
    });
    return true;
  } catch (e) {
    console.log("Error saving theme preference to storage: ", e);
    return false;
  }
};

/**
 * Get the user's theme preference
 * @param defaultTheme Default theme name if no preference is found
 * @returns Promise<string> The name of the selected theme
 */
export const getThemePreference = async (
  defaultTheme: string
): Promise<string> => {
  try {
    const themePreference = await RNSecureStorage.get(THEME_MODE_KEY);

    // If no preference is stored yet, return the default
    if (themePreference === null) {
      return defaultTheme;
    }

    return themePreference;
  } catch (e) {
    console.log("Error getting theme preference from storage: ", e);
    return defaultTheme;
  }
};

/**
 * Clear the user's theme preference (reset to default)
 * @returns Promise<boolean> Success state of the operation
 */
export const clearThemePreference = async (): Promise<boolean> => {
  try {
    await RNSecureStorage.remove(THEME_MODE_KEY);
    return true;
  } catch (e) {
    console.log("Error clearing theme preference from storage: ", e);
    return false;
  }
};
