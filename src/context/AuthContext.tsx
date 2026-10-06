import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '../services/firebase';

type UserProfile = {
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        try {
          setUser(firebaseUser);

          if (firebaseUser) {
            const userDoc = await getDoc(
              doc(
                db,
                'users',
                firebaseUser.uid
              )
            );

            if (userDoc.exists()) {
              setProfile(
                userDoc.data() as UserProfile
              );
            } else {
              setProfile(null);
            }
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error(
            'Auth error:',
            error
          );

          setProfile(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}