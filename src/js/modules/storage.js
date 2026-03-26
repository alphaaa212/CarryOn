const STORAGE_KEY = "carryOn_users";

export const getAllUsers = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
};

export const saveUser = (username, password) => {
    const users = getAllUsers();
    if (!users[username]) {
        users[username] = { password, savedLists: {} };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
};

export const authenticate = (username, password) => {
    const users = getAllUsers();
    return users[username] && users[username].password === password;
};

export const saveChecklist = (username, listId, items, title = null) => {
    const users = getAllUsers();
    if (users[username]) {
        if (!users[username].savedLists) users[username].savedLists = {};
        // 既存のタイトルを保持するか、新しいタイトルを設定
        const existing = users[username].savedLists[listId];
        const newTitle = title || (existing && typeof existing === 'object' ? existing.title : null);
        
        users[username].savedLists[listId] = { items, title: newTitle };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
};

export const getChecklist = (username, listId) => {
    const users = getAllUsers();
    const data = users[username]?.savedLists?.[listId];
    if (!data) return null;
    // 互換性維持：配列ならitemsとしてラップして返す
    if (Array.isArray(data)) return { items: data, title: null };
    return data;
};

export const getAllSavedLists = (username) => {
    const users = getAllUsers();
    return users[username]?.savedLists || {};
};

// リストそのものを削除する機能を追加
export const deleteChecklist = (username, sceneId) => {
    const users = getAllUsers();
    if (users[username] && users[username].savedLists) {
        delete users[username].savedLists[sceneId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
};
