/**
 * 马年春节抽奖系统
 * 2026 丙午马年
 */

// ==================== 数据管理 ====================

const StorageKeys = {
    PARTICIPANTS: 'lottery_participants',
    AWARDS: 'lottery_awards',
    RESULTS: 'lottery_results',
    GUEST_HISTORY: 'lottery_guest_history',
    CURRENT_STAGE: 'lottery_current_stage'
};

// 默认奖项配置
const defaultAwards = {
    3: { name: '三等奖', count: 5, amount: '¥100', blessing: '恭喜发财，马到成功！', icon: '🥉' },
    2: { name: '二等奖', count: 3, amount: '¥300', blessing: '龙马精神，步步高升！', icon: '🥈' },
    1: { name: '一等奖', count: 2, amount: '¥500', blessing: '一马当先，前程似锦！', icon: '🥇' },
    0: { name: '特等奖', count: 1, amount: '¥1000', blessing: '马到功成，万事如意！', icon: '👑' }
};

// 卡通头像生成器（使用DiceBear API生成可爱头像）
const avatarStyles = ['adventurer', 'avataaars', 'big-ears', 'bottts', 'fun-emoji', 'lorelei', 'notionists', 'open-peeps'];
let currentAvatarSeed = '';

// 获取存储的数据
function getParticipants() {
    const data = localStorage.getItem(StorageKeys.PARTICIPANTS);
    return data ? JSON.parse(data) : [];
}

function getAwards() {
    const data = localStorage.getItem(StorageKeys.AWARDS);
    return data ? JSON.parse(data) : { ...defaultAwards };
}

function getResults() {
    const data = localStorage.getItem(StorageKeys.RESULTS);
    return data ? JSON.parse(data) : [];
}

function getGuestHistory() {
    const data = localStorage.getItem(StorageKeys.GUEST_HISTORY);
    return data ? JSON.parse(data) : [];
}

function getCurrentStage() {
    return parseInt(localStorage.getItem(StorageKeys.CURRENT_STAGE) || '3');
}

// 保存数据
function saveParticipants(participants) {
    localStorage.setItem(StorageKeys.PARTICIPANTS, JSON.stringify(participants));
}

function saveAwardsData(awards) {
    localStorage.setItem(StorageKeys.AWARDS, JSON.stringify(awards));
}

function saveResults(results) {
    localStorage.setItem(StorageKeys.RESULTS, JSON.stringify(results));
}

function saveGuestHistory(history) {
    localStorage.setItem(StorageKeys.GUEST_HISTORY, JSON.stringify(history));
}

function saveCurrentStage(stage) {
    localStorage.setItem(StorageKeys.CURRENT_STAGE, stage.toString());
}

// ==================== 页面导航 ====================

function showPage(pageName) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageName + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // 页面特定初始化
    if (pageName === 'settings') {
        renderParticipants();
        loadAwardsToForm();
    } else if (pageName === 'lottery') {
        initLotteryPage();
    } else if (pageName === 'results') {
        renderResults();
    } else if (pageName === 'guest-lottery') {
        renderGuestHistory();
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    event.target.classList.add('active');
    document.getElementById(tabName + '-tab').classList.add('active');
}

// ==================== 人员管理 ====================

// 生成随机头像种子
function generateAvatar() {
    currentAvatarSeed = Math.random().toString(36).substring(7);
    const style = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    
    // 使用DiceBear API生成头像
    const avatarUrl = `https://api.dicebear.com/7.x/${style}/svg?seed=${currentAvatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    
    const preview = document.getElementById('avatar-preview');
    preview.innerHTML = `<img src="${avatarUrl}" alt="avatar" style="width:100%;height:100%;border-radius:50%;">`;
    preview.dataset.url = avatarUrl;
}

// 添加参与人员
function addParticipant() {
    const name = document.getElementById('p-name').value.trim();
    const gender = document.getElementById('p-gender').value;
    const blessing = document.getElementById('p-blessing').value.trim();
    const preview = document.getElementById('avatar-preview');
    
    if (!name) {
        alert('请输入姓名！');
        return;
    }
    
    // 如果没有生成头像，自动生成一个
    let avatarUrl = preview.dataset.url;
    if (!avatarUrl) {
        generateAvatar();
        avatarUrl = preview.dataset.url;
    }
    
    const participants = getParticipants();
    const newParticipant = {
        id: Date.now(),
        name,
        gender,
        blessing: blessing || '新春快乐，万事如意！',
        avatar: avatarUrl,
        isWinner: false
    };
    
    participants.push(newParticipant);
    saveParticipants(participants);
    
    // 清空表单
    document.getElementById('p-name').value = '';
    document.getElementById('p-blessing').value = '';
    preview.innerHTML = '';
    delete preview.dataset.url;
    currentAvatarSeed = '';
    
    renderParticipants();
}

// 删除参与人员
function deleteParticipant(id) {
    if (!confirm('确定删除此人吗？')) return;
    
    const participants = getParticipants().filter(p => p.id !== id);
    saveParticipants(participants);
    renderParticipants();
}

// 渲染人员列表
function renderParticipants() {
    const participants = getParticipants();
    const container = document.getElementById('participants-list');
    const countSpan = document.getElementById('p-count');
    
    countSpan.textContent = participants.length;
    
    if (participants.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无参与人员</div>';
        return;
    }
    
    container.innerHTML = participants.map(p => `
        <div class="participant-card ${p.isWinner ? 'winner' : ''}">
            <button class="p-delete" onclick="deleteParticipant(${p.id})" title="删除">×</button>
            <div class="p-avatar">
                ${p.avatar ? `<img src="${p.avatar}" style="width:100%;height:100%;border-radius:50%;" alt="${p.name}" onerror="this.parentElement.innerHTML='${p.gender === 'male' ? '👦' : '👧'}'">` : (p.gender === 'male' ? '👦' : '👧')}
            </div>
            <div class="p-name">${p.name} ${p.isWinner ? '🏆' : ''}</div>
            <div class="p-blessing">${p.blessing}</div>
        </div>
    `).join('');
}

// ==================== 奖项设置 ====================

function loadAwardsToForm() {
    const awards = getAwards();
    
    Object.keys(awards).forEach(level => {
        const award = awards[level];
        const countInput = document.getElementById(`award${level}-count`);
        const amountInput = document.getElementById(`award${level}-amount`);
        const blessingInput = document.getElementById(`award${level}-blessing`);
        
        if (countInput) countInput.value = award.count;
        if (amountInput) amountInput.value = award.amount;
        if (blessingInput) blessingInput.value = award.blessing;
    });
}

function saveAwards() {
    const awards = getAwards();
    
    Object.keys(awards).forEach(level => {
        const countInput = document.getElementById(`award${level}-count`);
        const amountInput = document.getElementById(`award${level}-amount`);
        const blessingInput = document.getElementById(`award${level}-blessing`);
        
        awards[level] = {
            ...awards[level],
            count: parseInt(countInput?.value || 1),
            amount: amountInput?.value || '¥0',
            blessing: blessingInput?.value || '恭喜中奖！'
        };
    });
    
    saveAwardsData(awards);
    alert('奖项设置已保存！');
}

// ==================== 抽奖逻辑 ====================

let lotteryInterval = null;
let isRolling = false;

function initLotteryPage() {
    const currentStage = getCurrentStage();
    const awards = getAwards();
    
    updateAwardDisplay(currentStage, awards);
    updateProgressList();
    
    document.getElementById('winners-display').innerHTML = '';
    document.getElementById('rolling-names').textContent = '准备就绪';
    document.getElementById('start-btn').style.display = 'inline-flex';
    document.getElementById('stop-btn').style.display = 'none';
}

function updateAwardDisplay(stage, awards) {
    const awardDisplay = document.querySelector('.award-display');
    
    if (stage < 0) {
        awardDisplay.textContent = '🎉 抽奖结束';
        document.getElementById('start-btn').style.display = 'none';
        return;
    }
    
    const award = awards[stage];
    awardDisplay.innerHTML = `
        ${award.icon} ${award.name}
        <br>
        <span style="font-size:0.6em;">${award.amount} × ${award.count}人</span>
    `;
}

function updateProgressList() {
    const currentStage = getCurrentStage();
    const awards = getAwards();
    const results = getResults();
    
    const container = document.getElementById('progress-list');
    const stages = [3, 2, 1, 0];
    
    container.innerHTML = stages.map(stage => {
        const award = awards[stage];
        const isCompleted = stage < currentStage;
        const isCurrent = stage === currentStage;
        
        const completedCount = results.filter(r => r.awardLevel === stage).length;
        const totalCount = award.count;
        
        return `
            <div class="progress-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                <span>${award.icon} ${award.name} (${completedCount}/${totalCount})</span>
                <span class="progress-status ${isCompleted ? 'completed' : 'pending'}">
                    ${isCompleted ? '✓ 已完成' : (isCurrent ? '● 进行中' : '○ 待开始')}
                </span>
            </div>
        `;
    }).join('');
}

function startLottery() {
    const participants = getParticipants().filter(p => !p.isWinner);
    const currentStage = getCurrentStage();
    
    if (participants.length === 0) {
        alert('没有可抽奖的参与者！请先添加人员。');
        return;
    }
    
    if (currentStage < 0) {
        alert('抽奖已结束！');
        return;
    }
    
    isRolling = true;
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('stop-btn').style.display = 'inline-flex';
    
    const rollingNames = document.getElementById('rolling-names');
    
    lotteryInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * participants.length);
        const p = participants[randomIndex];
        rollingNames.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;">
                <img src="${p.avatar}" style="width:80px;height:80px;border-radius:50%;margin-bottom:10px;" onerror="this.style.display='none'">
                <span>${p.name}</span>
            </div>
        `;
    }, 100);
}

function stopLottery() {
    if (!isRolling) return;
    
    clearInterval(lotteryInterval);
    isRolling = false;
    
    const participants = getParticipants().filter(p => !p.isWinner);
    const currentStage = getCurrentStage();
    const awards = getAwards();
    const award = awards[currentStage];
    
    // 随机选择一个中奖者
    const winnerIndex = Math.floor(Math.random() * participants.length);
    const winner = participants[winnerIndex];
    
    // 更新数据
    const allParticipants = getParticipants();
    const winnerInList = allParticipants.find(p => p.id === winner.id);
    winnerInList.isWinner = true;
    saveParticipants(allParticipants);
    
    // 保存结果
    const results = getResults();
    results.push({
        participant: winner,
        awardLevel: currentStage,
        awardName: award.name,
        awardIcon: award.icon,
        amount: award.amount,
        blessing: award.blessing,
        time: new Date().toISOString()
    });
    saveResults(results);
    
    // 显示结果
    showWinnerModal(winner, award);
    
    // 更新显示
    document.getElementById('rolling-names').innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;">
            <img src="${winner.avatar}" style="width:80px;height:80px;border-radius:50%;margin-bottom:10px;border:3px solid gold;" onerror="this.style.display='none'">
            <span style="color:#FFD700;">${winner.name}</span>
        </div>
    `;
    
    // 添加到中奖者显示
    addWinnerCard(winner, award);
    
    // 检查是否抽完当前奖项
    const currentWinners = results.filter(r => r.awardLevel === currentStage);
    if (currentWinners.length >= award.count) {
        // 进入下一个奖项
        const nextStage = currentStage - 1;
        saveCurrentStage(nextStage);
        
        if (nextStage >= 0) {
            setTimeout(() => {
                alert(`${award.name}全部抽取完毕！接下来是${awards[nextStage].name}`);
                updateAwardDisplay(nextStage, awards);
            }, 500);
        } else {
            setTimeout(() => {
                alert('🎉 所有奖项抽取完毕！');
                updateAwardDisplay(-1, awards);
            }, 500);
        }
    }
    
    document.getElementById('start-btn').style.display = 'inline-flex';
    document.getElementById('stop-btn').style.display = 'none';
    updateProgressList();
}

function addWinnerCard(winner, award) {
    const container = document.getElementById('winners-display');
    const card = document.createElement('div');
    card.className = 'winner-card';
    card.innerHTML = `
        ${award.icon} ${winner.name}
        <br>
        <span style="font-size:0.8em;">${award.amount}</span>
    `;
    container.appendChild(card);
}

function showWinnerModal(winner, award) {
    document.getElementById('modal-avatar').innerHTML = `
        <img src="${winner.avatar}" style="width:100%;height:100%;border-radius:50%;" onerror="this.parentElement.innerHTML='${winner.gender === 'male' ? '👦' : '👧'}'">
    `;
    document.getElementById('modal-name').textContent = winner.name;
    document.getElementById('modal-award').textContent = `${award.icon} ${award.name}`;
    document.getElementById('modal-amount').textContent = award.amount;
    document.getElementById('modal-blessing').textContent = award.blessing;
    
    document.getElementById('winner-modal').classList.add('active');
}

function closeModal() {
    document.getElementById('winner-modal').classList.remove('active');
}

// ==================== 中奖名单 ====================

function renderResults() {
    const results = getResults();
    const container = document.getElementById('results-container');
    
    if (results.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无中奖记录</div>';
        return;
    }
    
    // 按奖项分组
    const grouped = {};
    results.forEach(r => {
        if (!grouped[r.awardLevel]) {
            grouped[r.awardLevel] = {
                name: r.awardName,
                icon: r.awardIcon,
                winners: []
            };
        }
        grouped[r.awardLevel].winners.push(r);
    });
    
    // 按奖项等级排序（从高到低）
    const levels = [0, 1, 2, 3];
    
    container.innerHTML = levels.map(level => {
        const group = grouped[level];
        if (!group) return '';
        
        return `
            <div class="award-section">
                <div class="award-title">${group.icon} ${group.name}</div>
                ${group.winners.map(w => `
                    <div class="result-item">
                        <div class="result-avatar">
                            <img src="${w.participant.avatar}" style="width:100%;height:100%;border-radius:50%;" onerror="this.style.display='none';this.parentElement.innerHTML='${w.participant.gender === 'male' ? '👦' : '👧'}'">
                        </div>
                        <div class="result-info">
                            <div class="result-name">${w.participant.name}</div>
                            <div class="result-blessing">${w.participant.blessing}</div>
                        </div>
                        <div class="result-amount">${w.amount}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }).join('');
}

// ==================== 大屏幕展示 ====================

function showBigScreen() {
    const results = getResults();
    const container = document.getElementById('big-winners');
    
    if (results.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无中奖者</div>';
    } else {
        // 按奖项分组
        const grouped = {};
        results.forEach(r => {
            if (!grouped[r.awardLevel]) {
                grouped[r.awardLevel] = {
                    name: r.awardName,
                    icon: r.awardIcon,
                    winners: []
                };
            }
            grouped[r.awardLevel].winners.push(r);
        });
        
        const levels = [0, 1, 2, 3];
        container.innerHTML = levels.map(level => {
            const group = grouped[level];
            if (!group) return '';
            
            return `
                <div class="big-winner-card">
                    <div class="big-winner-award">${group.icon} ${group.name}</div>
                    ${group.winners.map(w => `
                        <div style="margin-bottom:20px;padding:15px;background:rgba(255,255,255,0.1);border-radius:15px;">
                            <div class="big-winner-avatar">
                                <img src="${w.participant.avatar}" style="width:100%;height:100%;border-radius:50%;" onerror="this.style.display='none';this.parentElement.innerHTML='${w.participant.gender === 'male' ? '👦' : '👧'}'">
                            </div>
                            <div class="big-winner-name">${w.participant.name}</div>
                            <div class="big-winner-amount">${w.amount}</div>
                            <div class="big-winner-blessing">"${w.participant.blessing}"</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('big-screen-page').classList.add('active');
}

// ==================== 嘉宾赞助抽奖 ====================

function renderGuestHistory() {
    const history = getGuestHistory();
    const container = document.getElementById('guest-history-list');
    
    if (history.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无赞助抽奖记录</div>';
        return;
    }
    
    container.innerHTML = history.map((round, index) => `
        <div class="guest-round">
            <div class="guest-round-header">
                <span>第 ${index + 1} 轮 - ${round.guestName || '神秘嘉宾'}</span>
                <span style="color:#FFD700;">${round.amount}</span>
            </div>
            <div style="color:#FFD700;">${round.blessing}</div>
            <div class="guest-winner-list">
                ${round.winners.map(w => `
                    <span class="guest-winner-tag">${w.name}</span>
                `).join('')}
            </div>
        </div>
    `).reverse().join('');
}

function startGuestLottery() {
    const amount = document.getElementById('guest-amount').value.trim();
    const guestName = document.getElementById('guest-name').value.trim();
    const blessing = document.getElementById('guest-blessing').value.trim();
    const count = parseInt(document.getElementById('guest-count').value) || 1;
    
    if (!amount) {
        alert('请输入赞助金额！');
        return;
    }
    
    const participants = getParticipants().filter(p => !p.isWinner);
    
    if (participants.length === 0) {
        alert('没有可抽奖的参与者！');
        return;
    }
    
    if (count > participants.length) {
        alert(`参与者不足！当前只有 ${participants.length} 人未中奖。`);
        return;
    }
    
    // 随机选择中奖者
    const winners = [];
    const tempParticipants = [...participants];
    
    for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * tempParticipants.length);
        winners.push(tempParticipants.splice(index, 1)[0]);
    }
    
    // 标记为已中奖
    const allParticipants = getParticipants();
    winners.forEach(w => {
        const p = allParticipants.find(x => x.id === w.id);
        if (p) p.isWinner = true;
    });
    saveParticipants(allParticipants);
    
    // 保存记录
    const history = getGuestHistory();
    history.push({
        amount,
        guestName: guestName || '神秘嘉宾',
        blessing: blessing || '新春快乐，恭喜发财！',
        winners,
        time: new Date().toISOString()
    });
    saveGuestHistory(history);
    
    // 显示结果
    const winnerNames = winners.map(w => w.name).join('、');
    alert(`🎉 恭喜 ${winnerNames} 获得 ${guestName || '神秘嘉宾'} 赞助的 ${amount}！\n\n祝福语：${blessing || '新春快乐，恭喜发财！'}`);
    
    // 清空表单
    document.getElementById('guest-amount').value = '';
    document.getElementById('guest-name').value = '';
    document.getElementById('guest-blessing').value = '';
    document.getElementById('guest-count').value = '1';
    
    renderGuestHistory();
}

// ==================== 初始化 ====================

document.addEventListener('DOMContentLoaded', () => {
    // 初始化奖项设置（如果没有）
    if (!localStorage.getItem(StorageKeys.AWARDS)) {
        saveAwardsData(defaultAwards);
    }
    
    // 绑定回车键
    document.getElementById('p-name')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addParticipant();
    });
    
    // 初始化头像预览
    generateAvatar();
});

// 导出函数到全局（供HTML调用）
window.showPage = showPage;
window.switchTab = switchTab;
window.generateAvatar = generateAvatar;
window.addParticipant = addParticipant;
window.deleteParticipant = deleteParticipant;
window.saveAwards = saveAwards;
window.startLottery = startLottery;
window.stopLottery = stopLottery;
window.closeModal = closeModal;
window.showBigScreen = showBigScreen;
window.startGuestLottery = startGuestLottery;
