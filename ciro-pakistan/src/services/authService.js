import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isMock } from './firebase';

// Helper to sync user profile inside Firestore
async function syncUserProfile(firebaseUser, providerName) {
  if (isMock) return firebaseUser;
  
  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);
  
  const userData = {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName || 'Operations Agent',
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.email}`,
    provider: providerName,
    role: 'operator', // Default level
    lastLogin: serverTimestamp()
  };

  if (!userSnap.exists()) {
    userData.createdAt = serverTimestamp();
    await setDoc(userRef, userData);
  } else {
    await setDoc(userRef, userData, { merge: true });
  }

  const freshSnap = await getDoc(userRef);
  return freshSnap.exists() ? freshSnap.data() : userData;
}

const mockAuthStorageKey = 'ciro_mock_user';

export const authService = {
  loginWithEmail: async (email, password) => {
    if (isMock) {
      if (email && password.length >= 6) {
        const mockUser = {
          uid: 'mock-uid-123',
          displayName: email.split('@')[0],
          email,
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
          provider: 'password',
          role: 'operator',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        localStorage.setItem(mockAuthStorageKey, JSON.stringify(mockUser));
        return mockUser;
      }
      throw new Error('Invalid email or password (min 6 characters)');
    }

    const credential = await signInWithEmailAndPassword(auth, email, password);
    return await syncUserProfile(credential.user, 'password');
  },

  signUpWithEmail: async (email, password, displayName) => {
    if (isMock) {
      if (email && password.length >= 6 && displayName) {
        const mockUser = {
          uid: 'mock-uid-' + Math.random().toString(36).substr(2, 9),
          displayName,
          email,
          photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
          provider: 'password',
          role: 'operator',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
        localStorage.setItem(mockAuthStorageKey, JSON.stringify(mockUser));
        return mockUser;
      }
      throw new Error('Invalid details. Password must be >= 6 characters.');
    }

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    return await syncUserProfile(credential.user, 'password');
  },

  loginWithGoogle: async () => {
    if (isMock) {
      const mockUser = {
        uid: 'mock-google-uid',
        displayName: 'Google Agent',
        email: 'google.agent@ciro.pk',
        photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=google',
        provider: 'google.com',
        role: 'operator',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem(mockAuthStorageKey, JSON.stringify(mockUser));
      return mockUser;
    }

    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    return await syncUserProfile(credential.user, 'google.com');
  },

  loginWithMicrosoft: async () => {
    if (isMock) {
      const mockUser = {
        uid: 'mock-ms-uid',
        displayName: 'Microsoft Officer',
        email: 'ms.officer@ciro.pk',
        photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=microsoft`,
        provider: 'microsoft.com',
        role: 'operator',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem(mockAuthStorageKey, JSON.stringify(mockUser));
      return mockUser;
    }

    const provider = new OAuthProvider('microsoft.com');
    const credential = await signInWithPopup(auth, provider);
    return await syncUserProfile(credential.user, 'microsoft.com');
  },

  logout: async () => {
    if (isMock) {
      localStorage.removeItem(mockAuthStorageKey);
      return;
    }
    await fbSignOut(auth);
  },

  resetPassword: async (email) => {
    if (isMock) {
      console.log(`[Mock Auth] Reset email mock-sent to ${email}`);
      return;
    }
    await sendPasswordResetEmail(auth, email);
  },

  getMockUser: () => {
    const raw = localStorage.getItem(mockAuthStorageKey);
    return raw ? JSON.parse(raw) : null;
  }
};
export { syncUserProfile };
export default authService;
