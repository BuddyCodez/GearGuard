import { create } from "zustand"

interface AuthDrawerStore {
    isOpen: boolean
    open: () => void
    close: () => void
    toggle: () => void
}

export const useAuthDrawer = create<AuthDrawerStore>((set: any) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state: AuthDrawerStore) => ({ isOpen: !state.isOpen })),
}))
