import { invoke } from '@tauri-apps/api/core';

export const perimetrDB = {
    getProfile: async () => {
        try {
            return await invoke('get_profile');
        } catch (e) {
            console.error("DB Error getProfile:", e);
            return null;
        }
    },

    // --- BASE ---
    logBaseSession: async (date: string, durationMs: number, mode: string) => {
        try {
            await invoke('log_base_session', { date, durationMs, mode });
        } catch (e) {
            console.error("DB Error logBaseSession:", e);
        }
    },

    // --- PERIMETR ---
    getPerimetrState: async () => {
        try {
            return await invoke('get_perimetr_state');
        } catch (e) {
            console.error("DB Error getPerimetrState:", e);
            return null;
        }
    },
    savePerimetrState: async (payload: any) => {
        try {
            await invoke('save_perimetr_state', { payload });
        } catch (e) {
            console.error("DB Error savePerimetrState:", e);
        }
    },

    // --- KPT ---
    getKptState: async () => {
        try {
            return await invoke('get_kpt_state');
        } catch (e) {
            console.error("DB Error getKptState:", e);
            return null;
        }
    },
    saveKptState: async (payload: any) => {
        try {
            await invoke('save_kpt_state', { payload });
        } catch (e) {
            console.error("DB Error saveKptState:", e);
        }
    }
};
