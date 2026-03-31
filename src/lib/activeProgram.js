const KEY = "cognia.activeProgramId";

export const getActiveProgramId = () => localStorage.getItem(KEY);
export const setActiveProgramId = (id) => id ? localStorage.setItem(KEY, id) : localStorage.removeItem(KEY);
export const clearActiveProgramId = () => localStorage.removeItem(KEY);
