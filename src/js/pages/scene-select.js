import { scenesList } from '../../../config/default-checklists.js';

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
    const sceneListElement = document.getElementById('scene-list');
    
    if (!sceneListElement) {
        console.error('Error: #scene-list element not found');
        return;
    }

    if (!scenesList || scenesList.length === 0) {
        sceneListElement.innerHTML = '<div class="card text-center">場面データが見つかりません</div>';
        return;
    }

    // 場面リストを動的に生成
    scenesList.forEach(scene => {
        const sceneId = scene.id || 'other';
        const emoji = sceneEmojis[sceneId] || '📍';
        
        const a = document.createElement('a');
        if (sceneId === 'other') {
            // その場でユニークなIDを生成して遷移
            const newId = `other_${Date.now()}`;
            a.href = `checklist.html?scene=${newId}&mode=edit&isNew=true`;
        } else {
            a.href = `checklist.html?scene=${encodeURIComponent(sceneId)}`;
        }
        a.className = 'scene-card';
        
        a.innerHTML = `
            <div class="scene-icon">${emoji}</div>
            <div class="scene-info">
                <span class="scene-name">${scene.name}</span>
                <span class="scene-desc">${scene.id === 'other' ? '自由に項目を追加' : '標準的な持ち物を確認'}</span>
            </div>
        `;
        
        sceneListElement.appendChild(a);
    });
});
