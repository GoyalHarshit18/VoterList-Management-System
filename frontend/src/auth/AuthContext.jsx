import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user"))
    );

    useEffect(() => {
        const expiry = localStorage.getItem("expiry");
        if (expiry && Date.now() > expiry) {
            logout();
        }
    }, []);

    const login = ({ token, user, expiresIn }) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("expiry", Date.now() + expiresIn);
        setUser(user);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.href = "/blo-login";
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
