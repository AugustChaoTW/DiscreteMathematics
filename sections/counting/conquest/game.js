// Game Configuration
const ROWS = 9; // 0 to 8
const PLAYERS = {
    A: { id: 'A', name: 'Player A', class: 'owned-a', color: '#3b82f6' },
    B: { id: 'B', name: 'Player B', class: 'owned-b', color: '#ef4444' }
};

// Game State
let state = {
    grid: [], // 2D array storing { value, owner }
    turn: 'A', // 'A' or 'B'
    scores: { A: 0, B: 0 },
    gameOver: false,
    selectedCell: null // { r, c }
};

// DOM Elements
const gridEl = document.getElementById('hex-grid');
const panelA = document.getElementById('panel-a');
const panelB = document.getElementById('panel-b');
const scoreAEl = document.getElementById('score-a');
const scoreBEl = document.getElementById('score-b');
const statusAEl = document.getElementById('status-a');
const statusBEl = document.getElementById('status-b');
const inputModal = document.getElementById('input-modal');
const rulesModal = document.getElementById('rules-modal');
const winnerModal = document.getElementById('winner-modal');
const answerInput = document.getElementById('answer-input');
const modalN = document.getElementById('modal-n');
const modalK = document.getElementById('modal-k');
const errorMsg = document.getElementById('error-msg');

// Initialization
function initGame() {
    state.grid = [];
    state.turn = 'A';
    state.scores = { A: 0, B: 0 };
    state.gameOver = false;
    state.selectedCell = null;

    // Generate Pascal's Triangle
    for (let r = 0; r < ROWS; r++) {
        let row = [];
        for (let c = 0; c <= r; c++) {
            row.push({
                value: binomial(r, c),
                owner: null,
                r: r,
                c: c
            });
        }
        state.grid.push(row);
    }

    renderGrid();
    updateUI();
}

// Math Helper
function binomial(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;

    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
    }
    return Math.round(res);
}

// Rendering
function renderGrid() {
    gridEl.innerHTML = '';

    state.grid.forEach((row, rIndex) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'hex-row';

        row.forEach((cell, cIndex) => {
            const cellEl = document.createElement('div');
            cellEl.className = 'hex-cell';
            cellEl.dataset.r = rIndex;
            cellEl.dataset.c = cIndex;

            if (cell.owner) {
                cellEl.classList.add(PLAYERS[cell.owner].class);
                cellEl.classList.add('owned');
                cellEl.textContent = cell.value; // Reveal value when owned
            } else {
                cellEl.textContent = `(${rIndex},${cIndex})`;
                cellEl.onclick = () => handleCellClick(rIndex, cIndex);
            }

            rowEl.appendChild(cellEl);
        });

        gridEl.appendChild(rowEl);
    });
}

function updateUI() {
    scoreAEl.textContent = state.scores.A;
    scoreBEl.textContent = state.scores.B;

    if (state.turn === 'A') {
        panelA.classList.add('active');
        panelB.classList.remove('active');
        statusAEl.textContent = 'YOUR TURN';
        statusBEl.textContent = 'WAITING';
    } else {
        panelB.classList.add('active');
        panelA.classList.remove('active');
        statusBEl.textContent = 'YOUR TURN';
        statusAEl.textContent = 'WAITING';
    }
}

// Interaction
function handleCellClick(r, c) {
    if (state.gameOver) return;

    const cell = state.grid[r][c];
    if (cell.owner) return; // Already owned

    state.selectedCell = { r, c };
    openInputModal(r, c);
}

function openInputModal(r, c) {
    modalN.textContent = r;
    modalK.textContent = c;
    answerInput.value = '';
    errorMsg.classList.add('hidden');
    inputModal.classList.remove('hidden');
    answerInput.focus();
}

function closeInputModal() {
    inputModal.classList.add('hidden');
    state.selectedCell = null;
}

function submitAnswer() {
    if (!state.selectedCell) return;

    const { r, c } = state.selectedCell;
    const inputVal = parseInt(answerInput.value);
    const correctVal = state.grid[r][c].value;

    if (inputVal === correctVal) {
        captureCell(r, c, state.turn);
        closeInputModal();

        // Check win conditions
        if (checkWinCondition()) {
            endGame();
        } else {
            switchTurn();
        }
    } else {
        // Wrong answer
        errorMsg.classList.remove('hidden');
        setTimeout(() => {
            closeInputModal();
            switchTurn(); // Penalty: lose turn
        }, 1500);
    }
}

function captureCell(r, c, player) {
    const cell = state.grid[r][c];
    if (cell.owner) return; // Already owned

    cell.owner = player;
    state.scores[player] += cell.value;

    // Visual update for this cell
    const cellEl = document.querySelector(`.hex-cell[data-r="${r}"][data-c="${c}"]`);
    if (cellEl) {
        cellEl.classList.add(PLAYERS[player].class);
        cellEl.classList.add('owned');
        cellEl.textContent = cell.value;

        // Animation
        cellEl.classList.add('chain-reaction');
        setTimeout(() => cellEl.classList.remove('chain-reaction'), 600);
    }

    checkChainReaction(r, c, player);
    updateUI(); // Update scores immediately
}

function checkChainReaction(r, c, player) {
    // Check children: (r+1, c) and (r+1, c+1)
    if (r + 1 >= ROWS) return;

    const checkChild = (childR, childC) => {
        if (state.grid[childR][childC].owner) return; // Already owned

        // Parents of (childR, childC) are (childR-1, childC-1) and (childR-1, childC)
        // Note: childC-1 might be out of bounds if childC is 0
        // But in Pascal triangle logic:
        // (r+1, c) parents are (r, c-1) and (r, c)
        // (r+1, c+1) parents are (r, c) and (r, c+1)

        // Let's look at the specific child (r+1, c)
        // Its parents are (r, c-1) and (r, c)
        // We just captured (r, c). We need to check if (r, c-1) is also owned by player.

        // Let's look at the specific child (r+1, c+1)
        // Its parents are (r, c) and (r, c+1)
        // We just captured (r, c). We need to check if (r, c+1) is also owned by player.

        const parents = [];
        if (childC > 0) parents.push(state.grid[childR - 1][childC - 1]);
        if (childC < childR) parents.push(state.grid[childR - 1][childC]);

        // Pascal's Identity: C(n, k) = C(n-1, k-1) + C(n-1, k)
        // Only applies if BOTH parents exist (i.e., not on the edge of the triangle)
        // Wait, the rule says: "If player occupies (n-1, k-1) and (n-1, k)... they can automatically free occupy (n, k)"
        // This implies edges (where only one parent exists in the grid logic) might not trigger this?
        // Actually, C(n, 0) = 1 and C(n, n) = 1 are usually base cases.
        // But in this game, if I capture (0,0), do I capture (1,0) and (1,1)?
        // (1,0) parents: (0,-1) [doesn't exist] and (0,0).
        // If we strictly follow "occupies (n-1, k-1) AND (n-1, k)", then edges can't be captured this way.
        // Let's stick to the strict rule: Must own BOTH parents.

        if (parents.length === 2) {
            if (parents.every(p => p.owner === player)) {
                // Chain reaction!
                setTimeout(() => {
                    captureCell(childR, childC, player);
                }, 300); // Small delay for visual effect
            }
        }
    };

    // Check left child (r+1, c)
    checkChild(r + 1, c);

    // Check right child (r+1, c+1)
    checkChild(r + 1, c + 1);
}

function switchTurn() {
    state.turn = state.turn === 'A' ? 'B' : 'A';
    updateUI();
}

function checkWinCondition() {
    // 1. Path Victory
    if (checkPathVictory(state.turn)) {
        endGame('Path Victory');
        return true;
    }

    // 2. Board Full
    let allFilled = true;
    for (let row of state.grid) {
        for (let cell of row) {
            if (!cell.owner) {
                allFilled = false;
                break;
            }
        }
    }

    if (allFilled) {
        endGame('Score Victory');
        return true;
    }

    return false;
}

function checkPathVictory(player) {
    // BFS/DFS to find path from row 0 to row ROWS-1
    // Nodes are cells owned by player

    // Start nodes: any cell in row 0 owned by player
    let queue = [];
    let visited = new Set();

    // Row 0 has only (0,0)
    if (state.grid[0][0].owner === player) {
        queue.push({ r: 0, c: 0 });
        visited.add('0,0');
    } else {
        return false;
    }

    while (queue.length > 0) {
        const { r, c } = queue.shift();

        if (r === ROWS - 1) return true; // Reached bottom

        // Neighbors: 
        // In hex grid (Pascal triangle layout):
        // (r-1, c-1), (r-1, c) [Parents]
        // (r, c-1), (r, c+1) [Siblings] - Optional, usually hex grid allows lateral moves?
        // (r+1, c), (r+1, c+1) [Children]

        // Let's assume standard connectivity (6 neighbors)
        const neighbors = [
            { r: r - 1, c: c - 1 }, { r: r - 1, c: c },
            { r: r, c: c - 1 }, { r: r, c: c + 1 },
            { r: r + 1, c: c }, { r: r + 1, c: c + 1 }
        ];

        for (let n of neighbors) {
            if (n.r >= 0 && n.r < ROWS && n.c >= 0 && n.c <= n.r) {
                if (state.grid[n.r][n.c].owner === player && !visited.has(`${n.r},${n.c}`)) {
                    visited.add(`${n.r},${n.c}`);
                    queue.push(n);
                }
            }
        }
    }

    return false;
}

function endGame(reason) {
    state.gameOver = true;
    const winnerTitle = document.getElementById('winner-title');
    const winnerReason = document.getElementById('winner-reason');
    const finalScoreA = document.getElementById('final-score-a');
    const finalScoreB = document.getElementById('final-score-b');

    let winner = '';
    if (reason === 'Path Victory') {
        winner = state.turn === 'A' ? 'Player A' : 'Player B';
    } else {
        if (state.scores.A > state.scores.B) winner = 'Player A';
        else if (state.scores.B > state.scores.A) winner = 'Player B';
        else winner = 'Draw';
    }

    winnerTitle.textContent = winner === 'Draw' ? 'It\'s a Draw!' : `${winner} Wins!`;
    winnerReason.textContent = reason || 'Game Over';
    finalScoreA.textContent = state.scores.A;
    finalScoreB.textContent = state.scores.B;

    winnerModal.classList.remove('hidden');
}

// Event Listeners
document.getElementById('btn-submit').addEventListener('click', submitAnswer);
document.getElementById('answer-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submitAnswer();
});

document.getElementById('btn-rules').addEventListener('click', () => {
    rulesModal.classList.remove('hidden');
});

document.querySelector('.close-modal').addEventListener('click', () => {
    rulesModal.classList.add('hidden');
});

document.getElementById('btn-restart').addEventListener('click', () => {
    if (confirm('Are you sure you want to restart?')) {
        initGame();
        winnerModal.classList.add('hidden');
    }
});

document.getElementById('btn-play-again').addEventListener('click', () => {
    initGame();
    winnerModal.classList.add('hidden');
});

// Start
initGame();
