/* =========================
   ① ゲームの状態を管理する変数
========================= */

// 盤面の状態（9マス）
let board = ["", "", "", "", "", "", "", "", ""];

// 勝敗が決まったか
let gameOver = false;

// CPUが思考かどうか
let cpuThinking = false;

// 人の記号（○ or ×）
let humanPlayer = "○";
// CPUの記号
let cpuPlayer = "×";
// CPUの強さ
let cpuLevel = "easy"; 
// "easy" | "normal" | "hard" | "hardPlus"

/* =========================
   ② 画面要素の取得
========================= */

// マス（盤面）
const cells = document.querySelectorAll(".cell");
// リセットボタン
const resetButton = document.getElementById("resetButton");
// 手番表示
const turnText = document.getElementById("turn");
// 先手後手変更ボタン
const playOButton = document.getElementById("playOButton");
const playXButton = document.getElementById("playXButton");
// 難易度変更ボタン
const levelEasyButton = document.getElementById("levelEasy");
const levelNormalButton = document.getElementById("levelNormal");
const levelHardPlusButton = document.getElementById("levelHardPlus");
const levelHardButton = document.getElementById("levelHard");


/* =========================
   ③ 初期表示
========================= */

turnText.textContent = `あなた（${humanPlayer}）の番です`;
playOButton.addEventListener("click", () => {
    humanPlayer = "○";
    cpuPlayer = "×";
    setActiveButton(playOButton);
    resetGame();
});

playXButton.addEventListener("click", () => {
    humanPlayer = "×";
    cpuPlayer = "○";
    setActiveButton(playXButton);
    resetGame();
});

setActiveButton(playOButton); // 初期は先手（○）

// 難易度ボタン
levelEasyButton.addEventListener("click", () => {
    cpuLevel = "easy";
    setActiveLevelButton(levelEasyButton);
});

levelNormalButton.addEventListener("click", () => {
    cpuLevel = "normal";
    setActiveLevelButton(levelNormalButton);
});

levelHardPlusButton.addEventListener("click", () => {
    cpuLevel = "hardPlus";
    setActiveLevelButton(levelHardPlusButton);
});

levelHardButton.addEventListener("click", () => {
    cpuLevel = "hard";
    setActiveLevelButton(levelHardButton);
});

// 初期は簡単
setActiveLevelButton(levelEasyButton);


/* =========================
   ④ イベント設定
========================= */

// 各マスがクリックされたとき
cells.forEach((cell, index) => {
    cell.addEventListener("click", () => handleCellClick(cell, index));
});

// リセットボタン
resetButton.addEventListener("click", resetGame);


/* =========================
   ⑤ 関数定義
========================= */

// マスがクリックされたときの処理
function handleCellClick(cell, index) {

    // ゲーム終了後 or CPU思考中は操作不可
    if (gameOver || cpuThinking) return;

    // すでに埋まっているマスは不可
    if (cell.textContent !== "") return;

    // 人の手
    cell.textContent = humanPlayer;
    board[index] = humanPlayer;

    if (humanPlayer === "○") {
        cell.classList.add("o");
    } else {
        cell.classList.add("x");
    }


    // 勝敗判定
    const result = checkWinner();
    if (result) {
        turnText.textContent =
            result.winner === humanPlayer
                ? "あなたの勝ちです！"
                : "CPUの勝ちです";


        //勝ったラインを強調表示
        result.line.forEach(index => {
            if (result.winner === "○") {
                cells[index].classList.add("win-o");
            } else {
                cells[index].classList.add("win-x");
            }
        });

        gameOver = true;
        return;
    }

    // 引き分け判定
    if (checkDraw()) {
        turnText.textContent = "引き分けです";
        gameOver = true;
        return;
    }

    // CPUの番（少し待ってから）
    cpuThinking = true;
    turnText.textContent = "CPUが考え中…";

    setTimeout(() => {
        cpuMove();

        // CPUの勝敗判定
        const cpuResult = checkWinner();
        if (cpuResult) {
            turnText.textContent =
                cpuResult.winner === humanPlayer
                    ? "あなたの勝ちです！"
                    : "CPUの勝ちです";

            cpuResult.line.forEach(index => {
                if (cpuResult.winner === "○") {
                    cells[index].classList.add("win-o");
                } else {
                    cells[index].classList.add("win-x");
                }
            });

            gameOver = true;
            return;
        }

        // CPU後の引き分け判定
        if (checkDraw()) {
            turnText.textContent = "引き分けです";
            gameOver = true;
            cpuThinking = false;
            return;
        }

        // 次は人の番
        cpuThinking = false;
        turnText.textContent = `あなた（${humanPlayer}）の番です`;

    }, 800); // ← 800ms（0.8秒）


}


// ゲームをリセットする処理
function resetGame() {
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove("o", "x", "win-o", "win-x");
    });

    board = ["", "", "", "", "", "", "", "", ""];
    gameOver = false;

    cpuThinking = false;

    // 表示を現在の人の記号に合わせる
    turnText.textContent = `あなた（${humanPlayer}）の番です`;

    // 人が後手なら、CPUが最初に打つ
    if (humanPlayer === "×") {
        cpuThinking = true;
        turnText.textContent = "CPUが考え中…";

        setTimeout(() => {
            cpuMove();
            cpuThinking = false;
            turnText.textContent = `あなた（${humanPlayer}）の番です`;
        }, 800);
    }

}



// 勝敗をチェックする関数
function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // 縦
        [0, 4, 8], [2, 4, 6]           // 斜め
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;

        if (
            board[a] !== "" &&
            board[a] === board[b] &&
            board[a] === board[c]
        ) {
            return {
                winner: board[a],
                line: pattern
            };
        }
    }

    return null;
}

// 引き分けかどうかを判定する関数※ 勝敗判定後に呼ぶ前提
function checkDraw() {
    return !board.includes("");
}

// CPUの関数
function cpuMove() {
    if (cpuLevel === "easy") {
        cpuMoveRandom();
    } else if (cpuLevel === "normal") {
        cpuMoveNormal();
    } else if (cpuLevel === "hardPlus") {
        cpuMoveHardPlus();
    } else {
        cpuMoveHard();
    }
}


// CPU-簡単
function cpuMoveRandom() {
    const emptyIndexes = [];

    board.forEach((value, index) => {
        if (value === "") {
            emptyIndexes.push(index);
        }
    });

    if (emptyIndexes.length === 0) return;

    const randomIndex =
        emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];

    placeCpuMove(randomIndex);
}

// CPUが置く処理
function placeCpuMove(index) {
    const cell = cells[index];
    cell.textContent = cpuPlayer;
    board[index] = cpuPlayer;

    if (cpuPlayer === "○") {
        cell.classList.add("o");
    } else {
        cell.classList.add("x");
    }
}

// CPU-普通
function cpuMoveNormal() {
    // ① 勝てるなら勝つ
    const winIndex = findWinningMove(cpuPlayer);
    if (winIndex !== null) {
        placeCpuMove(winIndex);
        return;
    }

    // ② 負けそうなら防ぐ
    const blockIndex = findWinningMove(humanPlayer);
    if (blockIndex !== null) {
        placeCpuMove(blockIndex);
        return;
    }

    // ③ それ以外はランダム
    cpuMoveRandom();
}

// 勝てる手を探す関数
function findWinningMove(player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        const values = [board[a], board[b], board[c]];

        if (
            values.filter(v => v === player).length === 2 &&
            values.includes("")
        ) {
            return pattern[values.indexOf("")];
        }
    }

    return null;
}

// CPU-難しい（確率でミス）
function cpuMoveHardPlus() {
    const missRate = 0.6;

    if (Math.random() < missRate) {
        // さらに分岐
        if (Math.random() < 0.5) {
            cpuMoveNormal();   // まあまあ考える
        } else {
            cpuMoveRandom();  // 完全な凡ミス
        }
    } else {
        cpuMoveHard();        // 本気
    }
}


// CPU-難しい
function cpuMoveHard() {
    // ① 勝てるなら勝つ
    const winIndex = findWinningMove(cpuPlayer);
    if (winIndex !== null) {
        placeCpuMove(winIndex);
        return;
    }

    // ② 負けそうなら防ぐ
    const blockIndex = findWinningMove(humanPlayer);
    if (blockIndex !== null) {
        placeCpuMove(blockIndex);
        return;
    }

    // ③ 中央を取る
    if (board[4] === "") {
        placeCpuMove(4);
        return;
    }

    // ④ 角を取る
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(i => board[i] === "");
    if (emptyCorners.length > 0) {
        placeCpuMove(
            emptyCorners[Math.floor(Math.random() * emptyCorners.length)]
        );
        return;
    }

    // ⑤ それ以外（辺）
    cpuMoveRandom();
}


// 先手後手の関数
function setActiveButton(activeButton) {
    playOButton.classList.remove("active");
    playXButton.classList.remove("active");

    activeButton.classList.add("active");
}

// 難易度の関数
function setActiveLevelButton(activeButton) {
    levelEasyButton.classList.remove("active");
    levelNormalButton.classList.remove("active");
    levelHardPlusButton.classList.remove("active");
    levelHardButton.classList.remove("active");

    activeButton.classList.add("active");
}
