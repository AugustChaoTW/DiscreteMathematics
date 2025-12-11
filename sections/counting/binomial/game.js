// 遊戲狀態
let n = 7;
let turn = "A";
let runes = [];
let gameEnded = false;

// 魔力系統
let magicA = 3;
let magicB = 3;
let maxMagic = 3;
let scoreA = 0;
let scoreB = 0;

// 特殊狀態
let lockedCells = new Set();
let lockMode = null;
let swapMode = null;
let targetAchieved = { A: false, B: false };

// 初始化遊戲
function initGame() {
    runes = Array(n).fill(null);
    turn = "A";
    gameEnded = false;
    lockedCells = new Set();
    lockMode = null;
    swapMode = null;
    targetAchieved = { A: false, B: false };
    magicA = 3;
    magicB = 3;

    const container = document.getElementById("runes");
    container.innerHTML = "";

    for (let i = 0; i < n; i++) {
        const div = document.createElement("div");
        div.className = "rune empty";
        div.id = `rune-${i}`;
        div.onclick = () => chooseRune(i);
        container.appendChild(div);
    }

    updateDisplay();
    showMagicAura();
    updateMagicButtons();
}

// 玩家選擇符文
function chooseRune(i) {
    // 處理特殊魔法模式
    if (lockMode) {
        handleLockClick(i);
        return;
    }
    
    if (swapMode) {
        handleSwapClick(i);
        return;
    }

    // 正常放置
    if (runes[i] !== null || gameEnded || lockedCells.has(i)) return;

    runes[i] = turn === "A" ? "X" : "Y";
    renderRunes();
    updateDisplay();

    // 檢查是否達到目標
    checkTargetAchieved();

    // 檢查遊戲是否結束
    checkGameEnd();

    // 切換玩家
    if (!gameEnded) {
        turn = turn === "A" ? "B" : "A";
        updateDisplay();
        showMagicAura();
        updateMagicButtons();
    }
}

// 檢查遊戲是否結束
function checkGameEnd() {
    // 檢查是否所有格子都已填滿或被鎖定
    const allFilled = runes.every((r, i) => r !== null || lockedCells.has(i));
    
    if (allFilled) {
        gameEnded = true;
        setTimeout(endGame, 500);
    }
}

// 處理鎖定點擊
function handleLockClick(i) {
    if (runes[i] !== null || lockedCells.has(i)) {
        showNotification("❌ 該格子無法鎖定");
        return;
    }

    let currentMagic = lockMode === "A" ? magicA : magicB;
    if (currentMagic < 1) {
        showNotification("❌ 魔力不足");
        return;
    }

    // 消耗魔力
    if (lockMode === "A") {
        magicA -= 1;
    } else {
        magicB -= 1;
    }

    lockedCells.add(i);
    cancelLockMode();
    renderRunes();
    updateMagicButtons();
    updateDisplay();
    showNotification(`🔒 格子 ${i} 已被鎖定！`);
    
    // 檢查遊戲是否結束
    checkGameEnd();
}

// 處理交換點擊
function handleSwapClick(i) {
    if (runes[i] === null) {
        showNotification("❌ 該格子沒有符文");
        return;
    }

    let currentMagic = swapMode === "A" ? magicA : magicB;
    if (currentMagic < 2) {
        showNotification("❌ 魔力不足");
        return;
    }

    // 改變符文
    runes[i] = swapMode === "A" ? "X" : "Y";

    // 消耗魔力
    if (swapMode === "A") {
        magicA -= 2;
    } else {
        magicB -= 2;
    }

    cancelSwapMode();
    renderRunes();
    updateMagicButtons();
    updateDisplay();
    showNotification(`🔄 符文已改變！`);
}

// 檢查是否達到最優目標
function checkTargetAchieved() {
    if (targetAchieved[turn]) return;

    let k = runes.filter(r => r === "Y").length;
    let optimalK = Math.round(n / 2);

    if (k === optimalK && !targetAchieved[turn]) {
        targetAchieved[turn] = true;
        const currentPlayer = turn === "A" ? "玩家 A" : "玩家 B";
        showNotification(`🎉 ${currentPlayer} 首先達到最優 k 值！+30 分`);
    }
}

// 顯示通知
function showNotification(msg) {
    const notif = document.createElement("div");
    notif.style.cssText = `
        position: fixed;
        top: 50px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #333;
        padding: 15px 30px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 1.1em;
        z-index: 2000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        animation: slideDown 0.3s ease;
    `;
    notif.innerText = msg;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

// 使用魔法 - 鎖定
function useMagic(player, type) {
    if (gameEnded) return;
    if (turn !== player) {
        showNotification("❌ 不是你的回合！");
        return;
    }

    let currentMagic = player === "A" ? magicA : magicB;

    if (type === "lock") {
        if (currentMagic < 1) {
            showNotification("❌ 魔力不足！");
            return;
        }

        if (lockMode === player) {
            cancelLockMode();
            showNotification("🔓 已取消鎖定模式");
        } else {
            lockMode = player;
            swapMode = null;
            showNotification("🔒 選擇要鎖定的空格子");
            document.querySelectorAll(".rune").forEach(box => {
                box.style.cursor = "crosshair";
            });
        }

    } else if (type === "swap") {
        if (currentMagic < 2) {
            showNotification("❌ 魔力不足！需要 2 點");
            return;
        }

        if (swapMode === player) {
            cancelSwapMode();
            showNotification("🔓 已取消交換模式");
        } else {
            swapMode = player;
            lockMode = null;
            showNotification("🔄 點擊符文進行改變");
            document.querySelectorAll(".rune").forEach(box => {
                box.style.cursor = "grab";
            });
        }
    }
}

// 取消鎖定模式
function cancelLockMode() {
    lockMode = null;
    document.querySelectorAll(".rune").forEach(box => {
        box.style.cursor = "pointer";
    });
}

// 取消交換模式
function cancelSwapMode() {
    swapMode = null;
    document.querySelectorAll(".rune").forEach(box => {
        box.style.cursor = "pointer";
    });
}

// 更新魔法按鈕狀態
function updateMagicButtons() {
    const lockBtnA = document.querySelector("#buttonsA .lock-btn");
    const swapBtnA = document.querySelector("#buttonsA .swap-btn");
    const lockBtnB = document.querySelector("#buttonsB .lock-btn");
    const swapBtnB = document.querySelector("#buttonsB .swap-btn");

    if (lockBtnA) lockBtnA.disabled = magicA < 1;
    if (swapBtnA) swapBtnA.disabled = magicA < 2;
    if (lockBtnB) lockBtnB.disabled = magicB < 1;
    if (swapBtnB) swapBtnB.disabled = magicB < 2;
}

// 更新顯示
function updateDisplay() {
    const turnText = turn === "A" ? "玩家 A (X)" : "玩家 B (Y)";
    const turnColor = turn === "A" ? "#7bc4ff" : "#ff7a7a";
    
    const turnElement = document.getElementById("turn");
    if (turnElement) {
        turnElement.innerText = turnText;
        turnElement.style.color = turnColor;
    }

    const placed = runes.filter(r => r !== null).length;
    const progressElement = document.getElementById("progress");
    if (progressElement) {
        progressElement.innerText = `${placed}/${n}`;
    }

    // 更新魔力條
    const magicAElement = document.getElementById("magicA");
    const magicTextAElement = document.getElementById("magicTextA");
    const magicBElement = document.getElementById("magicB");
    const magicTextBElement = document.getElementById("magicTextB");

    if (magicAElement) {
        const magicPercentA = (magicA / maxMagic) * 100;
        magicAElement.style.width = magicPercentA + "%";
        if (magicTextAElement) magicTextAElement.innerText = `${magicA}/${maxMagic} ⚡`;
    }

    if (magicBElement) {
        const magicPercentB = (magicB / maxMagic) * 100;
        magicBElement.style.width = magicPercentB + "%";
        if (magicTextBElement) magicTextBElement.innerText = `${magicB}/${maxMagic} ⚡`;
    }

    // 更新分數
    const scoreAElement = document.getElementById("scoreA");
    const scoreBElement = document.getElementById("scoreB");
    if (scoreAElement) scoreAElement.innerText = scoreA;
    if (scoreBElement) scoreBElement.innerText = scoreB;

    updateHint();
}

// 渲染符文
function renderRunes() {
    document.querySelectorAll(".rune").forEach((box, i) => {
        let className = "rune";

        if (lockedCells.has(i)) {
            className += " locked";
            box.textContent = "🔒";
        } else if (runes[i]) {
            className += " " + runes[i].toLowerCase();
            box.textContent = runes[i];
        } else {
            className += " empty";
            box.textContent = "";
        }

        box.className = className;
    });
}

// 計算階乘
function factorial(n) {
    if (n <= 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
}

// 計算二項式係數
function binomial(n, k) {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;
    
    if (k > n - k) k = n - k;
    
    let res = 1;
    for (let i = 0; i < k; i++) {
        res = res * (n - i) / (i + 1);
    }
    return Math.round(res);
}

// 顯示戰術提示
function updateHint() {
    let k = runes.filter(r => r === "Y").length;
    let best = n / 2;
    let currentC = binomial(n, k);
    let maxC = binomial(n, Math.floor(best));
    let diff = Math.abs(k - best).toFixed(1);

    let hintText = `📊 目前 Y 數量：<strong>${k}</strong> | 最優 k ≈ <strong>${best.toFixed(1)}</strong> | 差距：<strong>${diff}</strong><br>`;
    hintText += `當前係數 C(${n},${k}) = <strong>${currentC}</strong> | 最大係數 C(${n},${Math.floor(best)}) = <strong>${maxC}</strong>`;

    const hintElement = document.getElementById("hint");
    if (hintElement) {
        hintElement.innerHTML = hintText;
    }
}

// 遊戲結束
function endGame() {
    let k = runes.filter(r => r === "Y").length;
    let xCount = n - k;
    let C = binomial(n, k);
    let optimalK = Math.round(n / 2);
    let maxC = binomial(n, optimalK);

    // 計分
    let pointsA = 0;
    let pointsB = 0;

    // 基礎分：最大係數 +50
    if (C === maxC) {
        pointsB += 50;
        pointsA += 25;
    } else {
        let distanceFromOptimal = Math.abs(k - optimalK);
        pointsB += Math.max(10, 40 - distanceFromOptimal * 5);
        pointsA += Math.max(5, 20 - distanceFromOptimal * 3);
    }

    // 搶奪獎勵
    if (targetAchieved.A) pointsA += 30;
    if (targetAchieved.B) pointsB += 30;

    scoreA += pointsA;
    scoreB += pointsB;

    // 顯示魔法動畫
    const magic = document.getElementById("magic");
    if (magic) {
        magic.classList.remove("show-magic");
        setTimeout(() => {
            magic.classList.add("show-magic");
        }, 10);
    }

    // 判斷勝者
    let winner = pointsA > pointsB ? "A" : pointsB > pointsA ? "B" : "平手";
    let winnerText = winner === "A" ? "玩家 A 🎉" : winner === "B" ? "玩家 B 🎉" : "平手 🤝";

    // 顯示完整計算
    let calcHTML = `
        <h2>🎉 本輪結算 🎉</h2>
        <p><strong>符文排列：</strong>${runes.join("")}</p>
        <hr>
        <h3>二項式係數計算</h3>
        <p>C(${n}, ${k}) = ${n}! / (${k}! × ${n-k}!)</p>
        <p>= <strong style="font-size: 1.3em; color: #ff6b6b;">${C}</strong></p>
        <hr>
        <h3>展開式對應項 (x + y)^${n}</h3>
        <p><strong>${C}</strong> · x<sup>${xCount}</sup> · y<sup>${k}</sup></p>
        <hr>
        <h3>📊 本輪計分</h3>
        <p>玩家 A 獲得 <strong style="color: #7bc4ff;">+${pointsA}</strong> 分 | 玩家 B 獲得 <strong style="color: #ff7a7a;">+${pointsB}</strong> 分</p>
        <p style="font-size: 1.2em; margin-top: 15px;">本輪勝者：<strong>${winnerText}</strong></p>
        <hr>
        <h3>📈 累計分數</h3>
        <p>玩家 A：<strong style="color: #7bc4ff;">${scoreA}</strong> | 玩家 B：<strong style="color: #ff7a7a;">${scoreB}</strong></p>
    `;

    const calcElement = document.getElementById("calc-panel");
    if (calcElement) {
        calcElement.innerHTML = calcHTML;
    }

    const turnElement = document.getElementById("turn");
    if (turnElement) {
        turnElement.innerText = "⚔️ 本輪結束！";
        turnElement.style.color = "#ff9933";
    }

    updateDisplay();
}

// 變更難度
function changeDifficulty() {
    n = parseInt(document.getElementById("difficulty").value);
    resetGame();
}

// 重新開始遊戲
function resetGame() {
    if (!gameEnded) {
        if (!confirm("確定要重新開始嗎？")) return;
    }

    cancelLockMode();
    cancelSwapMode();

    const magic = document.getElementById("magic");
    if (magic) magic.classList.remove("show-magic");

    const calcElement = document.getElementById("calc-panel");
    if (calcElement) calcElement.innerHTML = "";

    initGame();
}

// 切換遊戲說明
function toggleInfo() {
    const modal = document.getElementById("infoModal");
    if (modal) {
        modal.style.display = modal.style.display === "block" ? "none" : "block";
    }
}

// 點擊模態框外部關閉
window.onclick = function(event) {
    const modal = document.getElementById("infoModal");
    if (modal && event.target == modal) {
        modal.style.display = "none";
    }
}

// 顯示魔法光圈
function showMagicAura() {
    const aura = document.querySelector(".magic-aura");
    if (aura) {
        aura.style.opacity = "0.6";
        setTimeout(() => {
            aura.style.opacity = "0";
        }, 1000);
    }
}

// 頁面加載完成後初始化
document.addEventListener("DOMContentLoaded", () => {
    initGame();
});
