'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  UserCredential,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, query, where, getDocs, collection } from 'firebase/firestore';
import { auth, db, googleProvider, appleProvider } from './firebase';

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
  signInWithGoogle: (inviteCode?: string) => Promise<void>;
  signInWithApple: (inviteCode?: string) => Promise<void>;
  sendMagicLink: (email: string, inviteCode?: string) => Promise<void>;
  completeMagicLinkSignIn: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
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

  // Helper: Verificar y usar código de invitación
  const verifyAndUseInviteCode = async (inviteCode: string, email: string) => {
    if (!inviteCode) {
      throw new Error('Se requiere un código de invitación para registrarse');
    }

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
  };

  // Helper: Crear perfil de usuario en Firestore
  const createUserProfile = async (
    userCredential: UserCredential,
    displayName?: string
  ) => {
    const user = userCredential.user;
    const email = user.email!;

    // Verificar si el perfil ya existe
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists()) {
      // Crear perfil si no existe
      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName: displayName || user.displayName || '',
        role: 'user',
        createdAt: new Date(),
        emailVerified: user.emailVerified,
      });
    }
  };

  const signUp = async (email: string, password: string, displayName?: string, inviteCode?: string) => {
    // Verificar código de invitación
    await verifyAndUseInviteCode(inviteCode!, email);

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Crear perfil en Firestore
    await createUserProfile(userCredential, displayName);

    // Enviar email de verificación
    if (!userCredential.user.emailVerified) {
      await sendEmailVerification(userCredential.user);
    }
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Google Auth
  const signInWithGoogle = async (inviteCode?: string) => {
    const result = await signInWithPopup(auth, googleProvider);
    const email = result.user.email!;
    const uid = result.user.uid;

    // Verificar si el usuario ya existe en Firestore
    const userDoc = await getDoc(doc(db, 'users', uid));
    const isNewUser = !userDoc.exists();

    // Si es un usuario nuevo, verificar código de invitación
    if (isNewUser) {
      if (!inviteCode || inviteCode.trim() === '') {
        // Hacer logout para no dejar el usuario autenticado sin código
        await signOut(auth);
        throw new Error('NEW_USER_NO_INVITE');
      }
      await verifyAndUseInviteCode(inviteCode, email);
    }

    // Crear o actualizar perfil
    await createUserProfile(result);
  };

  // Apple Auth
  const signInWithApple = async (inviteCode?: string) => {
    const result = await signInWithPopup(auth, appleProvider);
    const email = result.user.email!;
    const uid = result.user.uid;

    // Verificar si el usuario ya existe en Firestore
    const userDoc = await getDoc(doc(db, 'users', uid));
    const isNewUser = !userDoc.exists();

    // Si es un usuario nuevo, verificar código de invitación
    if (isNewUser) {
      if (!inviteCode || inviteCode.trim() === '') {
        // Hacer logout para no dejar el usuario autenticado sin código
        await signOut(auth);
        throw new Error('NEW_USER_NO_INVITE');
      }
      await verifyAndUseInviteCode(inviteCode, email);
    }

    // Crear o actualizar perfil
    await createUserProfile(result);
  };

  // Magic Link (Email Link)
  const sendMagicLink = async (email: string, inviteCode?: string) => {
    // Guardar email y código de invitación en localStorage para completar después
    if (typeof window !== 'undefined') {
      localStorage.setItem('emailForSignIn', email);
      if (inviteCode) {
        localStorage.setItem('inviteCodeForSignIn', inviteCode);
      }
    }

    const actionCodeSettings = {
      url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  };

  // Completar Magic Link
  const completeMagicLinkSignIn = async (email: string) => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      const inviteCode = window.localStorage.getItem('inviteCodeForSignIn');

      if (!email) {
        email = window.prompt('Por favor proporciona tu email para confirmar');
      }

      if (!email) {
        throw new Error('Email es requerido');
      }

      const result = await signInWithEmailLink(auth, email, window.location.href);

      // Limpiar localStorage
      window.localStorage.removeItem('emailForSignIn');
      window.localStorage.removeItem('inviteCodeForSignIn');

      // Si es un usuario nuevo, verificar código de invitación
      if (inviteCode) {
        await verifyAndUseInviteCode(inviteCode, email);
      }

      // Crear o actualizar perfil
      await createUserProfile(result);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerificationEmail = async () => {
    if (!auth.currentUser) {
      throw new Error('No hay usuario autenticado');
    }
    await sendEmailVerification(auth.currentUser);
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
        signInWithGoogle,
        signInWithApple,
        sendMagicLink,
        completeMagicLinkSignIn,
        logout,
        resetPassword,
        sendVerificationEmail,
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
