// 遊戲狀態
let currentTopic = null;
let currentQuestionIndex = 0;
let currentScore = 0;
let totalScore = parseInt(localStorage.getItem('totalScore')) || 0;

// 題目資料庫
const topics = {
    sets: {
        title: '集合論',
        explanation: {
            title: '集合基本概念',
            content: '集合是數學中的基本概念，表示一組明確定義的對象。常用運算包括：聯集(∪)、交集(∩)、差集(-)和補集(c)。'
        },
        questions: [
            {
                question: '設 A = {1, 2, 3, 4} 且 B = {3, 4, 5, 6}，則 A ∪ B = ?',
                options: [
                    '{1, 2, 3, 4, 5, 6}',
                    '{3, 4}',
                    '{1, 2, 5, 6}',
                    '{1, 2, 3, 4}'
                ],
                correct: 0,
                explanation: '聯集(∪)包含所有在 A 或 B 中的元素，因此 A ∪ B = {1, 2, 3, 4, 5, 6}。'
            },
            {
                question: '設 A = {1, 2, 3, 4} 且 B = {3, 4, 5, 6}，則 A ∩ B = ?',
                options: [
                    '{1, 2, 3, 4, 5, 6}',
                    '{3, 4}',
                    '{1, 2}',
                    '{5, 6}'
                ],
                correct: 1,
                explanation: '交集(∩)包含同時在 A 和 B 中的元素，因此 A ∩ B = {3, 4}。'
            },
            {
                question: '設 A = {1, 2, 3, 4} 且 B = {3, 4, 5, 6}，則 A - B = ?',
                options: [
                    '{1, 2}',
                    '{3, 4}',
                    '{5, 6}',
                    '{1, 2, 3, 4}'
                ],
                correct: 0,
                explanation: '差集(A - B)包含在 A 中但不在 B 中的元素，因此 A - B = {1, 2}。'
            },
            {
                question: '若集合 A 有 3 個元素，則 A 的冪集合有多少個元素？',
                options: [
                    '3',
                    '6',
                    '8',
                    '9'
                ],
                correct: 2,
                explanation: '冪集合包含所有可能的子集。若 |A| = n，則冪集合有 2^n 個元素。因此 2^3 = 8。'
            },
            {
                question: '空集合 ∅ 是任何集合的什麼？',
                options: [
                    '子集',
                    '真子集',
                    '超集',
                    '以上皆非'
                ],
                correct: 0,
                explanation: '空集合 ∅ 是任何集合的子集，這是集合論的基本性質。'
            }
        ]
    },
    logic: {
        title: '邏輯',
        explanation: {
            title: '命題邏輯基礎',
            content: '命題邏輯研究命題之間的邏輯關係。基本邏輯運算符包括：否定(¬)、合取(∧)、析取(∨)、條件(→)和雙條件(↔)。'
        },
        questions: [
            {
                question: '若 P 為真，Q 為假，則 P ∧ Q 的真值為何？',
                options: [
                    '真',
                    '假',
                    '無法判定',
                    '需要更多資訊'
                ],
                correct: 1,
                explanation: '合取(∧)只有當兩個命題都為真時才為真。因為 Q 為假，所以 P ∧ Q 為假。'
            },
            {
                question: '若 P 為真，Q 為假，則 P ∨ Q 的真值為何？',
                options: [
                    '真',
                    '假',
                    '無法判定',
                    '需要更多資訊'
                ],
                correct: 0,
                explanation: '析取(∨)只要有一個命題為真就為真。因為 P 為真，所以 P ∨ Q 為真。'
            },
            {
                question: '¬(P ∧ Q) 等價於哪個命題？',
                options: [
                    '¬P ∧ ¬Q',
                    '¬P ∨ ¬Q',
                    'P ∨ Q',
                    'P ∧ ¬Q'
                ],
                correct: 1,
                explanation: '這是德摩根定律：¬(P ∧ Q) ≡ ¬P ∨ ¬Q。'
            },
            {
                question: '若 P → Q 為真且 P 為真，則 Q 為？',
                options: [
                    '真',
                    '假',
                    '無法判定',
                    '可能為真或假'
                ],
                correct: 0,
                explanation: '這是分離規則(Modus Ponens)：如果 P → Q 為真且 P 為真，則 Q 必為真。'
            },
            {
                question: '恆真式(Tautology)是指？',
                options: [
                    '永遠為真的命題',
                    '永遠為假的命題',
                    '有時為真有時為假的命題',
                    '無法判定真假的命題'
                ],
                correct: 0,
                explanation: '恆真式是在所有可能的真值指派下都為真的命題，例如 P ∨ ¬P。'
            }
        ]
    },
    graph: {
        title: '圖論',
        explanation: {
            title: '圖的基本概念',
            content: '圖由頂點(vertices)和邊(edges)組成。圖可以是有向或無向的，並有許多重要性質如度數、路徑、連通性等。'
        },
        questions: [
            {
                question: '在一個有 n 個頂點的完全圖中，有多少條邊？',
                options: [
                    'n',
                    'n(n-1)',
                    'n(n-1)/2',
                    '2n'
                ],
                correct: 2,
                explanation: '完全圖中每兩個頂點之間都有一條邊，因此邊數為 C(n,2) = n(n-1)/2。'
            },
            {
                question: '什麼是歐拉路徑？',
                options: [
                    '經過每個頂點恰好一次的路徑',
                    '經過每條邊恰好一次的路徑',
                    '最短路徑',
                    '最長路徑'
                ],
                correct: 1,
                explanation: '歐拉路徑是經過圖中每條邊恰好一次的路徑。'
            },
            {
                question: '樹是一種什麼樣的圖？',
                options: [
                    '有環的連通圖',
                    '無環的連通圖',
                    '有向圖',
                    '完全圖'
                ],
                correct: 1,
                explanation: '樹是一個無環的連通圖，是圖論中的重要結構。'
            },
            {
                question: '若一個圖中所有頂點的度數都是偶數，則該圖？',
                options: [
                    '一定有歐拉回路',
                    '可能有歐拉回路',
                    '一定沒有歐拉回路',
                    '與歐拉回路無關'
                ],
                correct: 1,
                explanation: '所有頂點度數為偶數是存在歐拉回路的必要條件，但還需要圖是連通的。'
            },
            {
                question: '一個有 n 個頂點的樹有多少條邊？',
                options: [
                    'n',
                    'n-1',
                    'n+1',
                    'n(n-1)/2'
                ],
                correct: 1,
                explanation: '樹的基本性質：有 n 個頂點的樹恰好有 n-1 條邊。'
            }
        ]
    },
    combinatorics: {
        title: '組合學',
        explanation: {
            title: '計數原理',
            content: '組合學研究計數問題。基本原理包括：加法原理、乘法原理、排列(P)和組合(C)。排列考慮順序，組合不考慮順序。'
        },
        questions: [
            {
                question: 'P(5, 3) = ?',
                options: [
                    '10',
                    '15',
                    '60',
                    '120'
                ],
                correct: 2,
                explanation: 'P(5,3) = 5!/(5-3)! = 5×4×3 = 60。排列考慮順序。'
            },
            {
                question: 'C(5, 3) = ?',
                options: [
                    '10',
                    '15',
                    '60',
                    '120'
                ],
                correct: 0,
                explanation: 'C(5,3) = 5!/(3!×2!) = (5×4)/(2×1) = 10。組合不考慮順序。'
            },
            {
                question: '從 10 個人中選 2 個人當代表，有幾種選法？',
                options: [
                    'C(10, 2) = 45',
                    'P(10, 2) = 90',
                    'C(10, 2) = 90',
                    'P(10, 2) = 45'
                ],
                correct: 0,
                explanation: '選代表不考慮順序，用組合：C(10,2) = 10×9/2 = 45。'
            },
            {
                question: '5 個不同的球放入 3 個不同的盒子，每個盒子至少一個球，有幾種方法？',
                options: [
                    '150',
                    '243',
                    '125',
                    '60'
                ],
                correct: 0,
                explanation: '使用第二類斯特林數和排列：S(5,3)×3! = 25×6 = 150。'
            },
            {
                question: 'C(n, k) = C(n, n-k) 這個性質稱為？',
                options: [
                    '對稱性',
                    '遞迴性',
                    '帕斯卡性質',
                    '二項式定理'
                ],
                correct: 0,
                explanation: '這是組合數的對稱性質：從 n 個中選 k 個等於選出 n-k 個不選的。'
            }
        ]
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    updateTotalScore();
});

function updateTotalScore() {
    document.getElementById('totalScore').textContent = totalScore;
}

function startTopic(topicKey) {
    // Validate topicKey
    if (!topics[topicKey]) {
        console.error('Invalid topic key:', topicKey);
        return;
    }
    
    currentTopic = topicKey;
    currentQuestionIndex = 0;
    currentScore = 0;
    
    const topic = topics[topicKey];
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    document.getElementById('topicTitle').textContent = topic.title;
    document.getElementById('currentScore').textContent = currentScore;
    
    showExplanation(topic.explanation);
    showQuestion();
}

function showExplanation(explanation) {
    const explanationDiv = document.getElementById('explanation');
    explanationDiv.innerHTML = `
        <h3>${explanation.title}</h3>
        <p>${explanation.content}</p>
    `;
}

function showQuestion() {
    const topic = topics[currentTopic];
    const question = topic.questions[currentQuestionIndex];
    
    document.getElementById('question').textContent = question.question;
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('nextBtn').classList.add('hidden');
    
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option;
        button.setAttribute('aria-label', `選項 ${index + 1}: ${option}`);
        button.onclick = () => checkAnswer(index);
        optionsDiv.appendChild(button);
    });
}

function checkAnswer(selectedIndex) {
    const topic = topics[currentTopic];
    const question = topic.questions[currentQuestionIndex];
    const options = document.querySelectorAll('.option-btn');
    
    // 禁用所有選項
    options.forEach(btn => btn.disabled = true);
    
    const feedback = document.getElementById('feedback');
    
    if (selectedIndex === question.correct) {
        options[selectedIndex].classList.add('correct');
        feedback.textContent = '✓ 答對了！' + question.explanation;
        feedback.className = 'feedback correct';
        currentScore += 10;
        totalScore += 10;
        localStorage.setItem('totalScore', totalScore);
        document.getElementById('currentScore').textContent = currentScore;
        updateTotalScore();
    } else {
        options[selectedIndex].classList.add('incorrect');
        options[question.correct].classList.add('correct');
        feedback.textContent = '✗ 答錯了。正確答案已標示。' + question.explanation;
        feedback.className = 'feedback incorrect';
    }
    
    document.getElementById('nextBtn').classList.remove('hidden');
}

function nextQuestion() {
    currentQuestionIndex++;
    const topic = topics[currentTopic];
    
    if (currentQuestionIndex < topic.questions.length) {
        showQuestion();
    } else {
        showCompletionMessage();
    }
}

function showCompletionMessage() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="explanation">
            <h3>🎉 恭喜完成 ${topics[currentTopic].title} 練習！</h3>
            <p style="font-size: 1.3em; margin: 20px 0;">本次得分：${currentScore} 分</p>
            <p>總累積分數：${totalScore} 分</p>
            <button class="next-btn" onclick="backToMenu()">返回主選單</button>
        </div>
    `;
}

function backToMenu() {
    document.getElementById('menu').classList.remove('hidden');
    document.getElementById('game').classList.add('hidden');
    currentTopic = null;
}
