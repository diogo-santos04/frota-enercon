import React, { useState, createContext, ReactNode, useEffect } from "react";
import { api } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import axios from "axios";

type AuthContextData = {
    user: UserProps;
    profissional: ProfissionalProps;
    motorista: MotoristaProps;
    isAuthenticated: boolean;
    signIn: (credentials: SignInProps) => Promise<void>;
    loadingAuth: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
};

type UserProps = {
    id: string;
    nome: string;
    email: string;
    token: string;
};

type ProfissionalProps = {
    id: string;
    user_id: string;
    nome: string;
    cpf: string;
    matricula: string;
    celular: string;
    codigo: string;
};

type MotoristaProps = {
    id: string;
    profissional_id: string;
    cnh: string | null;
    validade: Date;
    categoria: string[];
};

type AuthProviderProps = {
    children: ReactNode;
};

type SignInProps = {
    email: string;
    password: string;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProps>({
        id: "",
        nome: "",
        email: "",
        token: "",
    });

    const [profissional, setProfissional] = useState<ProfissionalProps>({
        id: "",
        user_id: "",
        nome: "",
        celular: "",
        codigo: "",
        cpf: "",
        matricula: "",
    });

    const [motorista, setMotorista] = useState<MotoristaProps>({
        id: "",
        profissional_id: "",
        categoria: [], 
        cnh: "",
        validade: new Date(),
    });

    const [loadingAuth, setLoadingAuth] = useState(false);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!user.token;

    useEffect(() => {
        async function loadStorage() {
            const userInfo = await AsyncStorage.getItem("@sesau");
            let savedUser: UserProps = JSON.parse(userInfo || "{}");

            const profissionalInfo = await AsyncStorage.getItem("@profissional");
            let savedProfissional: ProfissionalProps = JSON.parse(profissionalInfo || "{}");
            
            const motoristaInfo = await AsyncStorage.getItem("@motorista");
            let savedMotorista: MotoristaProps = JSON.parse(motoristaInfo || "{}");

            if (savedUser.token) {
                api.defaults.headers.common["Authorization"] = `Bearer ${savedUser.token}`;
                setUser(savedUser);
            }

            setProfissional(savedProfissional);
            setMotorista(savedMotorista);

            setLoading(false);
        }

        loadStorage();
    }, []);

    async function signIn({ email, password }: SignInProps) {
        setLoadingAuth(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            const { user, token } = response.data.data;

            const userData: UserProps = {
                id: String(user.id),
                nome: user.nome,
                email: user.email,
                token: token,
            };

            const profissionalResponse = await api.post("/profissional/detalhes", {
                user_id: userData.id,
            });

            const profissionalData: ProfissionalProps = profissionalResponse.data;

            const motoristaResponse = await api.post("/motorista/dados", {
                user_id: userData.id  
            })

            const motoristaData: MotoristaProps = motoristaResponse.data;

            await AsyncStorage.setItem("@sesau", JSON.stringify(userData));
            await AsyncStorage.setItem("@profissional", JSON.stringify(profissionalData));
            await AsyncStorage.setItem("@motorista", JSON.stringify(motoristaData));

            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            setUser(userData);
            setProfissional(profissionalData);
            setMotorista(motoristaData);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                console.log("Erro da API:", error.response.data);
            }
            console.log(error);
            // console.log("Erro no login:", error);
            Toast.show({
                text1: "Login ou senha incorretos.",
                type: "error"
            })
        } finally {
            setLoadingAuth(false);
        }
    }

    async function signOut() {
        try {
            await api.post("/auth/logout");
        } catch (e) {
            console.log("Erro ao fazer logout na API:", e);
        } finally {
            await AsyncStorage.clear();
            setUser({ id: "", nome: "", email: "", token: "" });
            setProfissional({
                id: "",
                user_id: "",
                nome: "",
                celular: "",
                codigo: "",
                cpf: "",
                matricula: "",
            });
        }
    }

    return <AuthContext.Provider value={{ user, profissional, motorista, isAuthenticated, signIn, loading, loadingAuth, signOut }}>{children}</AuthContext.Provider>;
}
