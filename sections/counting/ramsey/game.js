// Ramsey 豆子遊戲 - 遊戲邏輯
let totalBeans = 0;
let currentBeans = 0;
let currentPlayer = 1;
let gameActive = false;
let moveHistory = [];

// 開始遊戲 - 使用預設的 Ramsey numbers
function startGame(beansCount) {
    totalBeans = beansCount;
    currentBeans = beansCount;
    currentPlayer = 1;
    gameActive = true;
    moveHistory = [];
    
    // 顯示遊戲板
    document.getElementById('gameBoard').style.display = 'block';
    document.getElementById('gameOver').style.display = 'none';
    
    // 初始化顯示
    updateDisplay();
    renderBeans();
    updateHistory(`遊戲開始！初始豆子數：${beansCount}`);
    
    // 滾動到遊戲區域
    document.getElementById('gameBoard').scrollIntoView({ behavior: 'smooth' });
}

// 開始遊戲 - 使用自訂數量
function startCustomGame() {
    const customInput = document.getElementById('customBeans');
    const beansCount = parseInt(customInput.value);
    
    if (beansCount < 1 || beansCount > 50) {
        alert('請輸入 1 到 50 之間的數字！');
        return;
    }
    
    startGame(beansCount);
}

// 拿豆子
function takeBeans(count) {
    if (!gameActive) {
        alert('請先開始遊戲！');
        return;
    }
    
    if (count > currentBeans) {
        alert(`豆子不足！目前只剩 ${currentBeans} 顆`);
        return;
    }
    
    if (count < 1 || count > 3) {
        alert('每次只能拿 1 到 3 顆豆子！');
        return;
    }
    
    // 拿走豆子
    currentBeans -= count;
    
    // 記錄歷史
    updateHistory(`玩家 ${currentPlayer} 拿了 ${count} 顆豆子，剩餘 ${currentBeans} 顆`);
    
    // 檢查遊戲是否結束
    if (currentBeans === 0) {
        endGame(currentPlayer);
        return;
    }
    
    // 切換玩家
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    
    // 更新顯示
    updateDisplay();
    renderBeans();
}

// 更新顯示
function updateDisplay() {
    // 更新豆子計數
    document.getElementById('beansCount').textContent = currentBeans;
    
    // 更新回合指示
    document.getElementById('turnIndicator').textContent = `輪到玩家 ${currentPlayer}`;
    
    // 更新玩家狀態
    const player1Status = document.getElementById('player1Status');
    const player2Status = document.getElementById('player2Status');
    
    if (currentPlayer === 1) {
        player1Status.textContent = '🎯 你的回合';
        player1Status.className = 'player-status active';
        player2Status.textContent = '等待中...';
        player2Status.className = 'player-status';
    } else {
        player1Status.textContent = '等待中...';
        player1Status.className = 'player-status';
        player2Status.textContent = '🎯 你的回合';
        player2Status.className = 'player-status active';
    }
    
    // 更新按鈕可用性
    updateButtons();
}

// 更新按鈕可用性
function updateButtons() {
    const buttons = document.querySelectorAll('.take-btn');
    buttons.forEach((btn, index) => {
        const count = index + 1;
        if (count > currentBeans) {
            btn.disabled = true;
            btn.classList.add('disabled');
        } else {
            btn.disabled = false;
            btn.classList.remove('disabled');
        }
    });
}

// 渲染豆子
function renderBeans() {
    const container = document.getElementById('beansContainer');
    container.innerHTML = '';
    
    // 創建豆子元素
    for (let i = 0; i < currentBeans; i++) {
        const bean = document.createElement('div');
        bean.className = 'bean';
        
        // 添加動畫延遲，讓豆子依次出現
        bean.style.animationDelay = `${i * 0.02}s`;
        
        // 根據位置添加不同的顏色（基於 Ramsey theory 的概念）
        const colorIndex = i % 5;
        bean.classList.add(`bean-color-${colorIndex}`);
        
        container.appendChild(bean);
    }
}

// 更新歷史記錄
function updateHistory(message) {
    const historyLog = document.getElementById('historyLog');
    const entry = document.createElement('div');
    entry.className = 'history-entry';
    entry.textContent = message;
    historyLog.insertBefore(entry, historyLog.firstChild);
    
    // 保持最多 10 條記錄
    while (historyLog.children.length > 10) {
        historyLog.removeChild(historyLog.lastChild);
    }
}

// 結束遊戲
function endGame(loser) {
    gameActive = false;
    const winner = loser === 1 ? 2 : 1;
    
    // 顯示勝利訊息
    const winnerText = document.getElementById('winnerText');
    const winnerMessage = document.getElementById('winnerMessage');
    
    winnerText.textContent = `🎉 玩家 ${winner} 獲勝！`;
    winnerMessage.innerHTML = `
        <p>玩家 ${loser} 拿到了最後一顆豆子，因此輸掉遊戲。</p>
        <p class="strategy-hint">💡 策略提示：在剩餘 ${totalBeans} 顆豆子的遊戲中，
        ${totalBeans % 4 === 1 ? '第二位玩家' : '第一位玩家'}有必勝策略！</p>
    `;
    
    updateHistory(`🏆 遊戲結束！玩家 ${winner} 獲勝！`);
    
    // 顯示遊戲結束畫面
    setTimeout(() => {
        document.getElementById('gameOver').style.display = 'flex';
    }, 500);
}

// 重置遊戲
function resetGame() {
    gameActive = false;
    document.getElementById('gameBoard').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    
    // 滾動回頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 分析當前局勢（給玩家提示）
function analyzePosition() {
    if (!gameActive) return;
    
    const remainder = currentBeans % 4;
    let hint = '';
    
    if (remainder === 1) {
        hint = '⚠️ 當前是危險位置！對手有必勝策略。';
    } else {
        const optimalMove = remainder === 0 ? 3 : remainder - 1;
        hint = `✅ 當前是安全位置！建議拿 ${optimalMove} 顆豆子。`;
    }
    
    alert(hint);
}

// 添加鍵盤快捷鍵
document.addEventListener('keydown', (event) => {
    if (!gameActive) return;
    
    if (event.key === '1') {
        takeBeans(1);
    } else if (event.key === '2') {
        takeBeans(2);
    } else if (event.key === '3') {
        takeBeans(3);
    } else if (event.key === 'h' || event.key === 'H') {
        analyzePosition();
    }
});

// 初始化時隱藏遊戲板
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('gameBoard').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
});
