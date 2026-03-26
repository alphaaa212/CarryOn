import { defaultChecklists } from '../../../config/default-checklists.js';
import { getChecklist, saveChecklist, getAllSavedLists } from '../modules/storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = sessionStorage.getItem('carryOn_currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sceneId = urlParams.get('scene'); // これがストレージのキーになる
    const isEditMode = urlParams.get('mode') === 'edit';
    const isNewOther = urlParams.get('isNew') === 'true';

    if (!sceneId) {
        window.location.href = 'scene-select.html';
        return;
    }

    const sceneData = defaultChecklists.find(s => s.id === sceneId);
    if (!sceneData && sceneId !== 'other' && !sceneId.startsWith('other_')) {
        alert('場面データが見つかりません');
        window.location.href = 'scene-select.html';
        return;
    }

    const titleDisplay = document.getElementById('scene-title-display');
    const titleEditArea = document.getElementById('title-edit-area');
    const titleInput = document.getElementById('list-title-input');
    const errorMessage = document.getElementById('error-message');
    
    // データの読み込み
    let savedData = getChecklist(currentUser, sceneId);
    let savedItems = savedData ? savedData.items : null;
    let listTitle = savedData ? savedData.title : (sceneData ? sceneData.name : 'その他');

    // 「その他」の新規作成時または編集時、タイトルを編集可能に
    const isOther = sceneId.startsWith('other'); // sceneIdが'other'単体か'other_xxx'か
    if (isOther && isEditMode) {
        titleDisplay.style.display = 'none';
        titleEditArea.style.display = 'block';
        // 新規作成時は空、既存編集時は既存タイトル
        titleInput.value = isNewOther ? '' : (listTitle === 'その他' ? '' : listTitle);
    } else {
        titleDisplay.textContent = listTitle;
    }

    if (!savedItems || !Array.isArray(savedItems)) {
        const initialItems = sceneData ? sceneData.items : [];
        savedItems = initialItems.filter(text => text.trim() !== "").map(text => ({ text, checked: false, time: null }));
    }

    const itemListElement = document.getElementById('item-list');
    const addArea = document.getElementById('add-item-area');
    const editModeBtn = document.getElementById('edit-mode-btn');
    
    if (isEditMode) {
        addArea.style.display = 'block';
        editModeBtn.textContent = '完了';
    } else {
        editModeBtn.textContent = '編集';
    }

    const updateProgress = () => {
        const total = savedItems.length;
        const checked = savedItems.filter(i => i.checked).length;
        const percent = total > 0 ? Math.round((checked / total) * 100) : 0;
        document.getElementById('checked-count').textContent = checked;
        document.getElementById('total-count').textContent = total;
        document.getElementById('progress-percent').textContent = `${percent}%`;
        document.getElementById('progress-bar').style.width = `${percent}%`;
    };

    const renderItems = () => {
        itemListElement.innerHTML = '';
        savedItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'item-row';
            if (isEditMode) {
                li.innerHTML = `
                    <input type="text" value="${item.text}" class="edit-input" data-index="${index}" placeholder="項目名を入力">
                    <button class="btn-compact-delete" data-index="${index}">削除</button>
                `;
            } else {
                li.innerHTML = `
                    <label class="item-label">
                        <input type="checkbox" ${item.checked ? 'checked' : ''} data-index="${index}">
                        <span class="item-text ${item.checked ? 'strikethrough' : ''}">${item.text}</span>
                        ${item.checked && item.time ? `<span class="check-time">${item.time}</span>` : ''}
                    </label>
                `;
            }
            itemListElement.appendChild(li);
        });
        updateProgress();
    };

    renderItems();

    // 保存処理（共通化）
    const performSave = (newSceneId = null) => {
        const targetId = newSceneId || sceneId;
        const titleToSave = isOther ? titleInput.value.trim() : listTitle;
        saveChecklist(currentUser, targetId, savedItems, titleToSave);
    };

    // 項目追加
    document.getElementById('add-item-btn').onclick = () => {
        savedItems.push({ text: '', checked: false, time: null });
        renderItems();
        const inputs = document.querySelectorAll('.item-row .edit-input');
        if (inputs.length > 0) inputs[inputs.length - 1].focus();
    };

    // イベントリスナー
    itemListElement.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            const index = e.target.dataset.index;
            savedItems[index].checked = e.target.checked;
            savedItems[index].time = e.target.checked ? 
                (() => { 
                    const n = new Date(); 
                    const date = `${n.getMonth() + 1}/${n.getDate()}`;
                    const time = `${n.getHours()}:${n.getMinutes().toString().padStart(2, '0')}`;
                    return `${date} ${time}`; 
                })() : null;
            performSave();
            renderItems();
        }
    });

    itemListElement.addEventListener('input', (e) => {
        if (e.target.classList.contains('edit-input')) {
            const index = e.target.dataset.index;
            savedItems[index].text = e.target.value;
            performSave();
        }
    });

    // 編集/完了ボタンの挙動
    editModeBtn.onclick = () => {
        if (isEditMode) {
            // 保存前のバリデーション（その他）
            if (isOther) {
                const newTitle = titleInput.value.trim();
                if (!newTitle) {
                    errorMessage.textContent = 'タイトルを入力してください';
                    errorMessage.style.display = 'block';
                    return;
                }

                // 重複チェック
                const allLists = getAllSavedLists(currentUser);
                const isDuplicate = Object.keys(allLists).some(id => {
                    if (id === sceneId) return false;
                    const list = allLists[id];
                    const existingTitle = Array.isArray(list) ? null : list.title;
                    return existingTitle === newTitle;
                });

                if (isDuplicate) {
                    errorMessage.textContent = '既にリストが作成されています';
                    errorMessage.style.display = 'block';
                    return;
                }
                
                // タイトルを反映して保存
                performSave();
            }
            window.location.href = `checklist.html?scene=${sceneId}&mode=view`;
        } else {
            window.location.href = `checklist.html?scene=${sceneId}&mode=edit`;
        }
    };

    // 削除イベントの委譲
    itemListElement.onclick = (e) => {
        if (e.target.classList.contains('btn-compact-delete')) {
            const idx = e.target.dataset.index;
            savedItems.splice(idx, 1);
            performSave();
            renderItems();
        }
    };

    document.getElementById('back-btn').onclick = () => {
        window.location.href = 'scene-select.html';
    };
});
