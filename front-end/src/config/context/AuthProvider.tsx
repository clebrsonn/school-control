import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {
    login as loginService,
    logout as logoutService,
    me,
    register as registerService
} from "../../services/AuthService";
import {IUser} from "@hyteck/shared";

interface AuthContextType {
    user: IUser | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<IUser | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            me({ headers: { Authorization: `Bearer ${token}` } })
                .then(user => setUser(user))
                .catch(() => {
                    logout();
                });
        }
    }, []);

    const login = async (email: string, password: string) => {
        const data = await loginService(email, password);
        setUser(data.user);
    };

    const register = async (email: string, password: string) => {
        const data = await registerService({ email, passwordHash: password } as Partial<IUser>);
        setUser(data.user);
    };

    const logout = () => {
        logoutService();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};