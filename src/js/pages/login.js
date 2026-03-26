// storageモジュールから必要な関数をインポート
import { getAllUsers, saveUser, authenticate } from "../modules/storage.js";

const loginBtn = document.getElementById("login-btn");
const errorMsg = document.getElementById("error-msg");

loginBtn.addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    errorMsg.textContent = "名前とパスワードを入力してください。";
    errorMsg.style.display = "block";
    return;
  }

  const users = getAllUsers();

  // ユーザーが存在しない、またはパスワードが一致しない場合に統一したエラーメッセージを表示
  if (!users[username] || !authenticate(username, password)) {
    errorMsg.textContent = "ユーザー名かパスワードが間違っています";
    errorMsg.style.display = "block";
    return;
  }

  // セッションに保存して画面遷移
  sessionStorage.setItem("carryOn_currentUser", username);
  window.location.href = "scene-select.html";
});
