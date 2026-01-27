'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { auth, db } from './firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, displayName?: string, inviteCode?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Obtener perfil del usuario desde Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile({
              uid: user.uid,
              email: user.email!,
              displayName: userDoc.data().displayName || '',
              role: userDoc.data().role || 'user',
              createdAt: userDoc.data().createdAt?.toDate() || new Date(),
            });
          } else {
            // Crear perfil si no existe (no debería pasar aquí)
            const newProfile = {
              uid: user.uid,
              email: user.email!,
              displayName: '',
              role: 'user' as const,
              createdAt: new Date(),
            };
            await setDoc(doc(db, 'users', user.uid), {
              email: user.email!,
              displayName: '',
              role: 'user',
              createdAt: new Date(),
            });
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [mounted]);

  const signUp = async (email: string, password: string, displayName?: string, inviteCode?: string) => {
    // Verificar código de invitación si se proporciona
    if (inviteCode) {
      const inviteQuery = query(
        collection(db, 'invites'),
        where('code', '==', inviteCode),
        where('used', '==', false)
      );
      const inviteSnapshot = await getDocs(inviteQuery);

      if (inviteSnapshot.empty) {
        throw new Error('Código de invitación inválido o ya usado');
      }

      const inviteDoc = inviteSnapshot.docs[0];
      // Marcar como usado
      await updateDoc(doc(db, 'invites', inviteDoc.id), {
        used: true,
        usedBy: email,
        usedAt: new Date(),
      });
    } else {
      throw new Error('Se requiere un código de invitación para registrarse');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Crear perfil en Firestore con rol 'user' por defecto
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName: displayName || '',
      role: 'user',
      createdAt: new Date(),
    });
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Evitar flash de contenido durante SSR
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        signUp,
        signIn,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
