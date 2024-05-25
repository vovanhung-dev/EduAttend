// storageService.js

// Lưu trữ một mục vào Local Storage
export const setItemToLocalStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

// Lấy một mục từ Local Storage
export const getItemFromLocalStorage = (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
};

// Xóa một mục khỏi Local Storage
export const removeItemFromLocalStorage = (key) => {
    localStorage.removeItem(key);
};
