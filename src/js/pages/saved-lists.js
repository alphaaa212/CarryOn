import { getAllSavedLists, deleteChecklist } from '../modules/storage.js';
import { defaultChecklists } from '../../../config/default-checklists.js';

const sceneEmojis = {
    'school': '🏫',
    'work': '💼',
    'abroad': '✈️',
    'japanTrip': '🚄',
    'AmusementPark': '🎡',
    'gym': '💪',
    'businessTrip': '👔',
    'returningHome': '🏠',
    'other': '✨'
};

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = sessionStorage.getItem('carryOn_currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const container = document.getElementById('saved-lists-container');
    
    const renderSavedLists = () => {
        const savedLists = getAllSavedLists(currentUser);
        const sceneIds = Object.keys(savedLists);
        container.innerHTML = '';

        if (sceneIds.length === 0) {
            container.innerHTML = '<div class="card text-center mt-4"><p style="color: var(--text-muted);">まだ保存されたリストはありません。</p></div>';
            return;
        }

        sceneIds.forEach(id => {
            const data = savedLists[id];
            // 互換性維持：配列なら直接、オブジェクトなら中身を取り出す
            const items = Array.isArray(data) ? data : (data.items || []);
            const savedTitle = Array.isArray(data) ? null : data.title;
            
            const sceneData = defaultChecklists.find(s => s.id === id);
            // タイトルの決定：保存されたタイトル > デフォルトのシーン名 > ID (その他等)
            const name = savedTitle || (sceneData ? sceneData.name : (id === 'other' ? 'その他' : id));
            
            // アイコン判定：'other_' で始まるものは 'other' とみなす
            const emojiKey = id.startsWith('other_') ? 'other' : id;
            const emoji = sceneEmojis[emojiKey] || '📍';
            
            const checkedCount = items.filter(i => i.checked).length;
            const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;
            
            const row = document.createElement('div');
            row.className = 'saved-list-row';
            
            row.innerHTML = `
                <a href="checklist.html?scene=${id}&mode=view" class="saved-list-link">
                    <span class="list-title">${emoji} ${name}</span>
                    <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                        <span class="progress-text">${checkedCount} / ${items.length} 完了</span>
                        <span class="progress-text">${Math.round(progress)}%</span>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                </a>
                <button class="btn-list-delete" data-id="${id}">削除</button>
            `;
            
            container.appendChild(row);
        });

        // 削除ボタンのイベント紐付け
        document.querySelectorAll('.btn-list-delete').forEach(btn => {
            btn.onclick = (e) => {
                const id = e.target.closest('.btn-list-delete').dataset.id;
                if (confirm('このリストを削除してもよろしいですか？')) {
                    deleteChecklist(currentUser, id);
                    renderSavedLists();
                }
            };
        });
    };

    renderSavedLists();
});
