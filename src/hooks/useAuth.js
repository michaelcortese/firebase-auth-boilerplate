import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [needsUsername, setNeedsUsername] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const hasUsername = await getDoc(doc(db, 'users', user.uid))
                    .then(doc => doc.exists() && doc.data().username)
                    .catch(() => false);
                
                setNeedsUsername(!hasUsername);
            } else {
                setNeedsUsername(false);
            }
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, needsUsername, setNeedsUsername }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
}; 