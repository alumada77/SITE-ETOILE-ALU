import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { auth, database } from '../firebase/config';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole;
  loading: boolean;
  usersList: UserProfile[];
  users: UserProfile[];
  isAdmin: boolean;
  isManager: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role?: UserRole) => Promise<void>;
  loginAsDemo: (role: 'admin' | 'manager') => void;
  logout: () => Promise<void>;
  addUser: (user: Omit<UserProfile, 'uid'>) => Promise<void>;
  updateUserRole: (uid: string, role: UserRole) => Promise<void>;
  updateUser: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  deleteUser: (uid: string) => Promise<void>;
  deleteUserAccount: (uid: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('etoile_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [usersList, setUsersList] = useState<UserProfile[]>(INITIAL_USERS);
  const [loading, setLoading] = useState(true);

  // Sync users list from Firebase Realtime Database
  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(
      usersRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const list: UserProfile[] = Object.keys(data).map(key => ({
            uid: key,
            ...data[key]
          }));
          setUsersList(list);
        } else {
          // Initialize DB with default users
          INITIAL_USERS.forEach(user => {
            set(ref(database, `users/${user.uid}`), user);
          });
          setUsersList(INITIAL_USERS);
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Realtime DB users error, using local fallback:', err);
        setUsersList(INITIAL_USERS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync Firebase Auth state
  useEffect(() => {
    if (loading) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);

      if (!user) {
        setCurrentUser(null);
        localStorage.removeItem("etoile_current_user");
        return;
      }

      // Mitady ilay utilisateur ao amin'ny liste
      const profile = usersList.find(
        (u) => u.uid === user.uid
      );

      if (profile) {
        setCurrentUser(profile);
        localStorage.setItem(
          "etoile_current_user",
          JSON.stringify(profile)
        );

        console.log(
          "Utilisateur connecté :",
          profile.name,
          "- rôle :",
          profile.role
        );

      } else {
        console.error(
          "Utilisateur introuvable dans Database :",
          user.uid
        );

        // Tsy mamorona manager automatique intsony
        setCurrentUser(null);
        localStorage.removeItem("etoile_current_user");
      }
    });

    return () => unsubscribe();

  }, [loading, usersList]);

  const role: UserRole = currentUser ? currentUser.role : 'visitor';
  const isAdmin = role === 'admin';
  const isManager = role === 'manager' || role === 'admin';

  const login = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      // Demo fallback login if firebase auth fails
      const matched = usersList.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
        localStorage.setItem('etoile_current_user', JSON.stringify(matched));
      } else {
        throw new Error('Email ou mot de passe incorrect');
      }
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    userRole: UserRole = 'manager'
  ) => {
    try {

      // Vérification avant Firebase
      if (!email || !pass) {
        throw new Error("Email et mot de passe obligatoires");
      }

      if (pass.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }

      // Création Firebase Authentication
      const res = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        pass
      );


      // Profil utilisateur dans Realtime Database
      const newProfile: UserProfile = {
        uid: res.user.uid,
        name: name.trim(),
        email: email.trim(),
        role: userRole,
        status: 'active',
        createdAt: new Date().toISOString()
      };


      await set(
        ref(database, `users/${res.user.uid}`),
        newProfile
      );


      // Mise à jour état local
      setUsersList(prev => [
        ...prev,
        newProfile
      ]);

      return newProfile;


    } catch (err: any) {

      console.error(
        "Erreur création utilisateur Firebase :",
        err.code,
        err.message
      );


      // Messages plus clairs
      if (err.code === "auth/email-already-in-use") {
        throw new Error("Cet email existe déjà");
      }

      if (err.code === "auth/invalid-email") {
        throw new Error("Adresse email invalide");
      }

      if (err.code === "auth/weak-password") {
        throw new Error("Mot de passe trop faible (minimum 6 caractères)");
      }

      if (err.code === "auth/operation-not-allowed") {
        throw new Error("Email/Password Authentication non activé dans Firebase");
      }


      throw err;
    }
  };

  const loginAsDemo = (demoRole: 'admin' | 'manager') => {
    const demoUser = usersList.find(u => u.role === demoRole) || INITIAL_USERS.find(u => u.role === demoRole) || {
      uid: `${demoRole}-demo-id`,
      name: demoRole === 'admin' ? 'Administrateur Démo' : 'Gestionnaire Démo',
      email: `${demoRole}@etoile-alu.com`,
      role: demoRole,
      status: 'active',
    };
    setCurrentUser(demoUser);
    localStorage.setItem('etoile_current_user', JSON.stringify(demoUser));
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn('Signout exception:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem('etoile_current_user');
  };

  const addUser = async (userData: Omit<UserProfile, 'uid'>) => {
    const newUid = 'usr-' + Date.now();

    const newUser: UserProfile = {
      uid: newUid,
      ...userData,
      createdAt: new Date().toISOString()
    };

    try {
      await set(ref(database, `users/${newUid}`), newUser);

      setUsersList(prev => [...prev, newUser]);

    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    try {
      await update(ref(database, `users/${uid}`), {
        role: newRole
      });

      setUsersList(prev =>
        prev.map(u =>
          u.uid === uid
            ? { ...u, role: newRole }
            : u
        )
      );

    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateUser = async (
    uid: string,
    data: Partial<UserProfile>
  ) => {
    try {
      await update(ref(database, `users/${uid}`), data);

      setUsersList(prev =>
        prev.map(user =>
          user.uid === uid
            ? { ...user, ...data }
            : user
        )
      );

    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deleteUser = async (uid: string) => {
    try {
      await remove(ref(database, `users/${uid}`));

      setUsersList(prev =>
        prev.filter(u => u.uid !== uid)
      );

    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        role,
        loading,
        usersList,
        users: usersList,
        isAdmin,
        isManager,
        login,
        register,
        loginAsDemo,
        logout,
        addUser,
        updateUserRole,
        updateUser,
        deleteUser,
        deleteUserAccount: deleteUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
