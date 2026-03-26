import { getAllUsers, saveUser } from "../modules/storage.js";

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const errorMsg = document.getElementById('error-msg');
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username || !password) {
            errorMsg.textContent = "ユーザー名とパスワードを入力してください。";
            errorMsg.style.display = "block";
            return;
        }

        const users = getAllUsers();
        if (users[username]) {
            errorMsg.textContent = "既にそのユーザー名は存在しています";
            errorMsg.style.display = "block";
            return;
        }

        saveUser(username, password);
        alert('登録が完了しました。ログインしてください。');
        window.location.href = 'login.html';
    });
});
