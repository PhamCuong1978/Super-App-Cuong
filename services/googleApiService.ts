import { User } from '../types';

// Fix for "Cannot find namespace 'google'." by adding type definitions for the Google Identity Services client library.
declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenResponse {
        access_token: string;
        error?: string;
        error_description?: string;
      }

      interface TokenClient {
        requestAccessToken(overrideConfig?: { prompt: string }): void;
        callback: (response: TokenResponse) => void;
      }

      interface TokenClientConfig {
        client_id: string | undefined;
        scope: string;
        callback: string | ((response: TokenResponse) => void);
      }

      function initTokenClient(config: TokenClientConfig): TokenClient;
    }
    namespace id {
      function disableAutoSelect(): void;
    }
  }
}

// Check for Google Client ID. If not present, we will use a mock service.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const STORAGE_KEY = 'super_app_user_session';

if (!GOOGLE_CLIENT_ID) {
  console.warn("WARNING: GOOGLE_CLIENT_ID environment variable not set. The application will use a mock authentication service. Real Google Sign-In is disabled.");
}


// Module-level state to hold the token client and the current access token
let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let currentAccessToken: string | null = null;

/**
 * Initializes and returns a Google OAuth2 token client instance.
 * (Only used in the real sign-in flow)
 */
const getGoogleTokenClient = (): Promise<google.accounts.oauth2.TokenClient> => {
  return new Promise((resolve, reject) => {
    if (tokenClient) {
      return resolve(tokenClient);
    }
    try {
      if (!(window as any).google || !(window as any).google.accounts) {
        throw new Error("Google Identity Services library not loaded.");
      }
      
      tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/drive.file', // Scope for creating files in Google Drive
        ].join(' '),
        callback: '', // Callback is handled by the promise in `signIn`
      });
      resolve(tokenClient);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Restores the user session from local storage if available.
 */
export const restoreSession = async (): Promise<User | null> => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const user = JSON.parse(storedData) as User;
      // Note: We recover the user profile, but the access token is not stored in localStorage for security.
      // Operations requiring the token (like saveFile) might need to re-trigger auth or handle the missing token.
      return user;
    }
  } catch (error) {
    console.error("Failed to restore session", error);
    localStorage.removeItem(STORAGE_KEY);
  }
  return null;
};

/**
 * Initiates the Google Sign-In flow, gets an access token, and fetches user profile.
 * Falls back to a mock implementation if GOOGLE_CLIENT_ID is not set.
 * @returns A Promise that resolves with the User object.
 */
export const signIn = async (): Promise<User> => {
  if (!GOOGLE_CLIENT_ID) {
    // Mock implementation
    console.log("Using mock Google Sign-In.");
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockUser: User = {
      name: 'Cường',
      email: 'cuong@example.com',
      picture: `https://i.pravatar.cc/150?u=cuong`,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    return mockUser;
  }

  // Real implementation
  const client = await getGoogleTokenClient();
  
  return new Promise<User>((resolve, reject) => {
    const callback = async (tokenResponse: google.accounts.oauth2.TokenResponse) => {
      if (tokenResponse.error) {
        return reject(new Error(tokenResponse.error_description || 'An error occurred during sign-in.'));
      }
      
      currentAccessToken = tokenResponse.access_token;

      try {
        // Use the access token to get user profile information
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${currentAccessToken}`,
          },
        });
        
        if (!userInfoResponse.ok) {
          throw new Error(`Failed to fetch user info. Status: ${userInfoResponse.status}`);
        }

        const userInfo = await userInfoResponse.json();
        
        const user: User = {
          name: userInfo.name || 'Anonymous',
          email: userInfo.email,
          picture: userInfo.picture,
        };
        
        // Persist user profile
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        
        resolve(user);

      } catch (error) {
        console.error("Error fetching user info:", error);
        reject(error);
      }
    };
    
    // Set the callback for this specific sign-in request
    client.callback = callback;
    
    // Request the access token, which will trigger the Google Sign-In popup
    client.requestAccessToken({ prompt: 'consent' });
  });
};

/**
 * Signs the user out.
 * Falls back to a mock implementation if GOOGLE_CLIENT_ID is not set.
 */
export const signOut = async (): Promise<void> => {
  currentAccessToken = null; // Clear token regardless of mode
  localStorage.removeItem(STORAGE_KEY); // Clear persisted session

  if (!GOOGLE_CLIENT_ID) {
    // Mock implementation
    console.log("Using mock Google Sign-Out.");
    return;
  }
  
  // Real implementation
  if ((window as any).google && (window as any).google.accounts) {
    (window as any).google.accounts.id.disableAutoSelect();
  }
  console.log("Sign-Out successful. Auto-login disabled for next time.");
};


/**
 * Saves a file to Google Drive.
 * NOTE: This is a simulation for demonstration purposes.
 * A real implementation would require a secure backend to handle the file creation.
 */
export const saveFile = async (fileName: string, content: string): Promise<string> => {
  
  // If we are "logged in" via localStorage but don't have an access token in memory (e.g. after refresh),
  // we cannot call the API. 
  if (GOOGLE_CLIENT_ID && !currentAccessToken) {
     // In a full production app, we would try to silently refresh the token here.
     // For this demo, we must ask the user to sign in again to get a fresh token.
     throw new Error("Session expired or missing permissions. Please Sign Out and Sign In again to save files.");
  }

  if (!GOOGLE_CLIENT_ID) {
      // Mock behavior
      console.log(`Simulating saving file to Google Drive...`);
      console.log(`File Name: ${fileName}`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockFileUrl = `https://docs.google.com/document/d/mock_${Date.now()}`;
      alert(`File "${fileName}" saved successfully to Google Drive!\n(This is a simulation)\n\nURL: ${mockFileUrl}`);
      return mockFileUrl;
  }

  // Real implementation using Google Drive API
  const metadata = {
    name: fileName,
    mimeType: 'application/vnd.google-apps.document',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([content], { type: 'text/plain' }));

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + currentAccessToken }),
    body: form,
  });

  if (!response.ok) {
      const errorBody = await response.json();
      throw new Error(errorBody.error?.message || 'Failed to save file to Google Drive.');
  }

  const file = await response.json();
  const fileUrl = `https://docs.google.com/document/d/${file.id}/edit`;
  
  alert(`File "${fileName}" saved successfully!\n\nClick OK to copy link to clipboard.`);
  try {
      await navigator.clipboard.writeText(fileUrl);
  } catch (e) {
      console.warn("Could not copy to clipboard", e);
  }
  
  return fileUrl;
};