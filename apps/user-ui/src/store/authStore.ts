import { create } from "zustand";

type AuthState = {
    isLoggedIn: boolean;
    setLoggedIn: (isLoggedIn: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
    isLoggedIn: false,
    setLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
}));