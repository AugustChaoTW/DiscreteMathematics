// Ramsey Numbers 遊戲設計專案 - JavaScript 邏輯

// 基礎知識答案
const ANSWERS = {
    q1: 'a',
    q2a: 6,
    q2b: 9,
    q2c: 18
};

// 檔案狀態
let uploadedFiles = {
    html: null,
    css: null,
    js: null
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 設置截止日期（當前日期 + 14 天，給學生兩週時間）
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    document.getElementById('dueDate').textContent = dueDate.toLocaleDateString('zh-TW');
});

// 處理檔案上傳
function handleFileUpload(fileType, input) {
    const file = input.files[0];
    const statusSpan = document.getElementById(`${fileType}Status`);
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedFiles[fileType] = {
                name: file.name,
                content: e.target.result,
                size: file.size
            };
            statusSpan.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            statusSpan.className = 'upload-status success';
        };
        reader.readAsText(file);
    }
}

// 預覽遊戲
function previewGame() {
    if (!uploadedFiles.html) {
        alert('請先上傳 HTML 檔案！');
        return;
    }
    
    // 創建新視窗預覽遊戲
    const previewWindow = window.open('', '_blank');
    let htmlContent = uploadedFiles.html.content;
    
    // 如果有 CSS，嵌入到 HTML
    if (uploadedFiles.css) {
        htmlContent = htmlContent.replace('</head>', `<style>${uploadedFiles.css.content}</style></head>`);
    }
    
    // 如果有 JS，嵌入到 HTML
    if (uploadedFiles.js) {
        htmlContent = htmlContent.replace('</body>', `<script>${uploadedFiles.js.content}</script></body>`);
    }
    
    previewWindow.document.write(htmlContent);
    previewWindow.document.close();
}

// 初始化圖形 (K₆)
function initGraph() {
    canvas = document.getElementById('graphCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // 創建頂點位置
    vertices = [];
    for (let i = 0; i < numVertices; i++) {
        const angle = (i * 2 * Math.PI / numVertices) - Math.PI / 2;
        vertices.push({
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
            id: i
        });
    }
    
    // 創建所有邊
    edges = [];
    for (let i = 0; i < numVertices; i++) {
        for (let j = i + 1; j < numVertices; j++) {
            edges.push({
                from: i,
                to: j,
                color: 'red' // 預設紅色
            });
        }
    }
    
    // 繪製圖形
    drawGraph();
    
    // 添加點擊事件
    canvas.addEventListener('click', handleCanvasClick);
}

// 繪製圖形
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 繪製邊
    edges.forEach(edge => {
        const v1 = vertices[edge.from];
        const v2 = vertices[edge.to];
        
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        ctx.lineTo(v2.x, v2.y);
        ctx.strokeStyle = edge.color;
        ctx.lineWidth = 3;
        ctx.stroke();
    });
    
    // 繪製頂點
    vertices.forEach((v, i) => {
        ctx.beginPath();
        ctx.arc(v.x, v.y, 15, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 頂點標籤
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i + 1, v.x, v.y);
    });
}

// 處理畫布點擊
function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 檢查是否點擊了某條邊
    for (let edge of edges) {
        if (isPointNearEdge(x, y, edge)) {
            // 切換顏色
            edge.color = edge.color === 'red' ? 'blue' : 'red';
            drawGraph();
            break;
        }
    }
}

// 檢查點是否靠近邊
function isPointNearEdge(x, y, edge) {
    const v1 = vertices[edge.from];
    const v2 = vertices[edge.to];
    
    // 計算點到線段的距離
    const distance = pointToLineDistance(x, y, v1.x, v1.y, v2.x, v2.y);
    return distance < 8;
}

// 點到線段的距離
function pointToLineDistance(x, y, x1, y1, x2, y2) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// 重置圖形
function resetGraph() {
    edges.forEach(edge => {
        edge.color = 'red';
    });
    drawGraph();
    document.getElementById('q7-result').innerHTML = '';
}

// 檢查圖形是否有單色三角形
function checkGraph() {
    const hasTriangle = hasMonochromaticTriangle(edges);
    const resultDiv = document.getElementById('q7-result');
    
    if (hasTriangle) {
        resultDiv.innerHTML = '<p class="incorrect">❌ 你的圖形包含單色三角形！根據 R(3,3) = 6，在 K₆ 中不可能避免單色三角形。</p>';
    } else {
        resultDiv.innerHTML = '<p class="correct">✓ 你的圖形目前沒有單色三角形，但這只是暫時的狀態。實際上，R(3,3) = 6 告訴我們這是不可能持續避免的。</p>';
    }
}

// 檢查是否有單色三角形
function hasMonochromaticTriangle(edgeList) {
    // 建立鄰接矩陣
    const adjMatrix = Array(numVertices).fill(null).map(() => Array(numVertices).fill(null));
    
    edgeList.forEach(edge => {
        adjMatrix[edge.from][edge.to] = edge.color;
        adjMatrix[edge.to][edge.from] = edge.color;
    });
    
    // 檢查所有三個頂點的組合
    for (let i = 0; i < numVertices; i++) {
        for (let j = i + 1; j < numVertices; j++) {
            for (let k = j + 1; k < numVertices; k++) {
                const color1 = adjMatrix[i][j];
                const color2 = adjMatrix[j][k];
                const color3 = adjMatrix[i][k];
                
                if (color1 && color2 && color3 &&
                    color1 === color2 && color2 === color3) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// 測試程式碼
function testCode() {
    const code = document.getElementById('q10').value;
    const resultDiv = document.getElementById('q10-result');
    
    try {
        // 評估使用者的程式碼
        eval(code);
        
        // 測試案例
        const testCases = [
            {
                name: "測試 1: 包含紅色三角形",
                edges: [
                    {from: 0, to: 1, color: 'red'},
                    {from: 1, to: 2, color: 'red'},
                    {from: 0, to: 2, color: 'red'},
                    {from: 0, to: 3, color: 'blue'}
                ],
                expected: true
            },
            {
                name: "測試 2: 包含藍色三角形",
                edges: [
                    {from: 0, to: 1, color: 'blue'},
                    {from: 1, to: 2, color: 'blue'},
                    {from: 0, to: 2, color: 'blue'}
                ],
                expected: true
            },
            {
                name: "測試 3: 無單色三角形",
                edges: [
                    {from: 0, to: 1, color: 'red'},
                    {from: 1, to: 2, color: 'blue'},
                    {from: 0, to: 2, color: 'blue'}
                ],
                expected: false
            }
        ];
        
        let allPassed = true;
        let resultHTML = '<div class="test-results">';
        
        testCases.forEach((testCase, index) => {
            try {
                const result = checkMonochromaticTriangle(testCase.edges);
                const passed = result === testCase.expected;
                allPassed = allPassed && passed;
                
                resultHTML += `<div class="test-case ${passed ? 'passed' : 'failed'}">
                    <strong>${testCase.name}:</strong> 
                    ${passed ? '✓ 通過' : '✗ 失敗'} 
                    (預期: ${testCase.expected}, 得到: ${result})
                </div>`;
            } catch (e) {
                allPassed = false;
                resultHTML += `<div class="test-case failed">
                    <strong>${testCase.name}:</strong> ✗ 執行錯誤: ${e.message}
     專案
function submitHomework() {
    // 檢查學生資訊
    const studentId = document.getElementById('studentId').value.trim();
    const studentName = document.getElementById('studentName').value.trim();
    
    if (!studentId || !studentName) {
        alert('請先填寫學號和姓名！');
        return;
    }
    
    let totalScore = 0;
    let scoreBreakdown = [];
    
    // === 第一部分：基礎知識 (20分) ===
    
    // Q1: 選擇題 (10分)
    const q1Answer = document.querySelector('input[name="q1"]:checked');
    if (q1Answer && q1Answer.value === ANSWERS.q1) {
        totalScore += 10;
        scoreBreakdown.push({section: '基礎知識', item: '問題 1', score: 10, max: 10, correct: true});
    } else {
        scoreBreakdown.push({section: '基礎知識', item: '問題 1', score: 0, max: 10, correct: false});
    }
    
    // Q2: 填空題 (10分)
    const q2a = parseInt(document.getElementById('q2a').value);
    const q2b = parseInt(document.getElementById('q2b').value);
    const q2c = parseInt(document.getElementById('q2c').value);
    let q2Score = 0;
    if (q2a === ANSWERS.q2a) q2Score += 3;
    if (q2b === ANSWERS.q2b) q2Score += 3;
    if (q2c === ANSWERS.q2c) q2Score += 4;
    totalScore += q2Score;
    scoreBreakdown.push({section: '基礎知識', item: '問題 2', score: q2Score, max: 10, correct: q2Score >= 7});
    
    // === 第二部分：遊戲設計專案 (80分) ===
    
    // 1. 檔案上傳檢查 (30分)
    let fileScore = 0;
    if (uploadedFiles.html) {
        fileScore += 10;
        // 檢查 HTML 內容品質
        const htmlContent = uploadedFiles.html.content.toLowerCase();
        if (htmlContent.includes('ramsey')) fileScore += 2;
        if (htmlContent.includes('player') || htmlContent.includes('玩家')) fileScore += 2;
        if (htmlContent.includes('game') || htmlContent.includes('遊戲')) fileScore += 1;
    }
    if (uploadedFiles.css) {
        fileScore += 5;
        // 檢查 CSS 是否有實質內容
        if (uploadedFiles.css.content.length > 200) fileScore += 2;
    }
    if (uploadedFiles.js) {
        fileScore += 5;
        // 檢查 JS 是否有遊戲邏輯
        const jsContent = uploadedFiles.js.content.toLowerCase();
        if (jsContent.includes('function')) fileScore += 2;
        if (jsContent.includes('player') || jsContent.includes('玩家')) fileScore += 1;
    }
    totalScore += fileScore;
    scoreBreakdown.push({section: '技術實作', item: '檔案上傳與品質', score: fileScore, max: 30, correct: fileScore >= 20});
    
    // 2. 遊戲說明 (20分)
    let descScore = 0;
    const gameName = document.getElementById('gameName').value.trim();
    const gameRules = document.getElementById('gameRules').value.trim();
    const ramseyConnection = document.getElementById('ramseyConnection').value.trim();
    const strategy = document.getElementById('strategy').value.trim();
    
    if (gameName.length > 0) descScore += 2;
    if (gameRules.length > 50) {
        descScore += 8;
        if (gameRules.length > 200) descScore += 2;
    }
    if (ramseyConnection.length > 50) {
        descScore += 6;
        if (ramseyConnection.toLowerCase().includes('ramsey')) descScore += 2;
    }
    if (strategy.length > 30) descScore += 2;
    
    totalScore += descScore;
    scoreBreakdown.push({section: '理論說明', item: '遊戲說明文件', score: descScore, max: 20, correct: descScore >= 12});
    
    // 3. 檢核表完成度 (10分)
    let checklistScore = 0;
    for (let i = 1; i <= 6; i++) {
        const checkbox = document.getElementById(`check${i}`);
        if (checkbox && checkbox.checked) {
            checklistScore += 1.5;
        }
    }
    checklistScore = Math.min(10, Math.round(checklistScore));
    totalScore += checklistScore;
    scoreBreakdown.push({section: '專案完整性', item: '檢核表確認', score: checklistScore, max: 10, correct: checklistScore >= 6});
    
    // 4. 額外評分（基於內容品質）(20分)
    let bonusScore = 0;
    
    // 檢查是否有視覺化或創意元素
    if (uploadedFiles.html && uploadedFiles.html.content.toLowerCase().includes('canvas')) bonusScore += 3;
    if (uploadedFiles.css && uploadedFiles.css.content.includes('animation')) bonusScore += 2;
    
    // 檢查說明的詳細程度
    if (ramseyConnection.length > 300) bonusScore += 5;
    if (gameRules.length > 300) bonusScore += 3;
    
    // 鼓勵分數（基本參與）
    if (uploadedFiles.html || uploadedFiles.css || uploadedFiles.js) bonusScore += 7;
    
    bonusScore = Math.min(20, bonusScore);
    totalScore += bonusScore;
    scoreBreakdown.push({section: '遊戲品質', item: '創意與完整度', score: bonusScore, max: 20, correct: bonusScore >= 10
    } else if (q9Answer >= 23 && q9Answer <= 27) {
        totalScore += 5; // 部分分數
        scoreBreakdown.push({q: 9, score: 5, max: 10, correct: false, note: '答案接近'});
    } else {
        scoreBreakdown.push({q: 9, score: 0, max: 10, correct: false});
    }
    
    // Q10: 程式題 (10分) - 需要手動測試
    const q10Code = document.getElementById('q10').value;
    let q10Score = 0;
    if (q10Code.length > 50 && q10Code !== document.querySelector('#q10').defaultValue) {
        // 給予部分分數，完整測試需要執行 testCode()
        q10Score = 5;
        if (q10Code.includes('for') || q10Code.includes('forEach')) q10Score += 2;
        if (q10Code.includes('color')) q10Score += 2;
        if (hintsUsed[10]) q10Score = Math.max(0, q10Score - 3);
    }
    totalScore += q10Score;
    scoreBreakdown.push({q: 10, score: q10Score, max: 10, correct: q10Score >= 7, note: '請點擊「測試程式碼」確認'});
    
    // 顯示成績
    displayScore(totalScore, scoreBreakdown, studentId, studentName);
    
    // 滾動到成績區域
    document.getElementById('scoreDisplay').scrollIntoView({behavior: 'smooth'});
}

// 顯示成績
function displayScore(total, breakdown, studentId, studentName) {
    const scoreDisplay = document.getElementById('scoreDisplay');
    const totalScoreDiv = document.getElementById('totalScore');
    const breakdownDiv = document.getElementById('scoreBreakdown');
    
    // 判定等級
    let grade = 'F';
    let gradeClass = 'fail';
    let feedback = '';
    
    if (total >= 90) { 
        grade = 'A'; 
        gradeClass = 'excellent';
        feedback = '優秀！你的專案展現了對 Ramsey Theory 的深刻理解和優秀的實作能力。';
    } else if (total >= 80) { 
        grade = 'B'; 
        gradeClass = 'good';
        feedback = '很好！你的作品符合要求，繼續保持！';
    } else if (total >= 70) { 
        grade = 'C'; 
        gradeClass = 'pass';
        feedback = '及格。建議加強遊戲的完整性和理論說明。';
    } else if (total >= 60) { 
        grade = 'D'; 
        gradeClass = 'pass';
        feedback = '剛好及格。請補充更多內容以達到更好的成績。';
    } else {
        feedback = '需要更多努力。請確保所有必要部分都已完成。';
    }
    
    totalScoreDiv.innerHTML = `
        <div class="student-name">${studentName} (${studentId})</div>
        <div class="score-number ${gradeClass}">${total} / 100</div>
        <div class="grade ${gradeClass}">等級: ${grade}</div>
        <div class="feedback">${feedback}</div>
    `;
    
    // 詳細分數
    let breakdownHTML = '<table class="score-table"><thead><tr><th>評分項目</th><th>細項</th><th>得分</th><th>滿分</th><th>狀態</th></tr></thead><tbody>';
    
    breakdown.forEach(item => {
        const statusIcon = item.correct ? '✓' : '✗';
        const statusClass = item.correct ? 'correct' : 'incorrect';
        
        breakdownHTML += `
            <tr class="${statusClass}">
                <td>${item.section}</td>
                <td>${item.item}</td>
                <td>${item.score}</td>
                <td>${item.max}</td>
                <td>${statusIcon}</td>
            </tr>
        `;
    });
    
    breakdownHTML += '</tbody></table>';
    
    breakdownHTML += `
        <div class="important-note">
            <h4>⚠️ 重要提醒</h4>
            <p>這是系統自動評分，僅供參考。教師將會：</p>
            <ul>
                <li>實際測試你的遊戲是否可玩</li>
                <li>評估遊戲機制與 Ramsey Theory 的關聯度</li>
                <li>檢查程式碼品質和創意程度</li>
                <li>最終成績可能會有調整</li>
            </ul>
        </div>
    `;
    
    breakdownDiv.innerHTML = breakdownHTML;
    scoreDisplay.style.display = 'block';
}

// 重置作業
function resetHomework() {
    if (!confirm('確定要重新開始嗎？所有填寫的內容和上傳的檔案都將清除。')) {
        return;
    }
    
    // 清除所有輸入
    document.querySelectorAll('input[type="radio"]').forEach(input => input.checked = false);
    document.querySelectorAll('input[type="number"], input[type="text"], input[type="file"]').forEach(input => input.value = '');
    document.querySelectorAll('textarea').forEach(textarea => textarea.value = '');
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => checkbox.checked = false);
    
    // 重置檔案上傳
    uploadedFiles = { html: null, css: null, js: null };
    document.querySelectorAll('.upload-status').forEach(status => {
        status.textContent = '';
        status.className = 'upload-status';
    });
    
    // 清除成績顯示
    document.getElementById('scoreDisplay').style.display = 'none';
    
    // 滾動到頂部
    window.scrollTo({top: 0, behavior: 'smooth'});
}
