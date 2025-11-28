const boardElement = document.getElementById('game-board');
const startGameBtn = document.getElementById('start-game-btn');
const resetGameBtn = document.getElementById('reset-game-btn');
const selectedCellsCountElement = document.getElementById('selected-cells-count');
const currentBetElement = document.getElementById('current-bet');
const balanceElement = document.getElementById('balance');
const resultsElement = document.getElementById('game-results');

const BOARD_SIZE = 3;
const TOTAL_MINES = 3;
const MAX_SELECT_CELLS = 3;
const INITIAL_BET = 300;
const INITIAL_BALANCE = 1000;

let board = []; // Массив для хранения состояния ячеек (0: пусто, 1: мина)
let mines = []; // Координаты мин
let selectedCells = []; // Координаты выбранных ячеек
let isGameInProgress = false;
let currentBet = INITIAL_BET;
let balance = INITIAL_BALANCE;

// --- Функции для игры ---

// Создание игрового поля
function createBoard() {
    boardElement.innerHTML = '';
    board = [];
    mines = [];
    selectedCells = [];
    isGameInProgress = false;
    resultsElement.textContent = '';
    resultsElement.className = 'results'; // Сброс классов стилей

    selectedCellsCountElement.textContent = '0';
    startGameBtn.textContent = 'Начать игру / Сделать ставку';
    startGameBtn.disabled = false;
    resetGameBtn.disabled = true;

    for (let r = 0; r < BOARD_SIZE; r++) {
        board[r] = [];
        for (let c = 0; c < BOARD_SIZE; c++) {
            board[r][c] = 0; // 0 - пустая ячейка
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            boardElement.appendChild(cell);
        }
    }
    attachCellListeners();
}

// Расстановка мин (имитация)
function placeMines() {
    mines = [];
    // Очищаем предыдущие мины, если они были
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            board[r][c] = 0; // Сброс всех ячеек
            const cellElement = boardElement.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            cellElement.classList.remove('mined', 'safe', 'opened'); // Сброс визуальных эффектов
            cellElement.textContent = ''; // Скрываем контент
        }
    }

    let minesPlaced = 0;
    while (minesPlaced < TOTAL_MINES) {
        const randomRow = Math.floor(Math.random() * BOARD_SIZE);
        const randomCol = Math.floor(Math.random() * BOARD_SIZE);

        if (board[randomRow][randomCol] === 0 && !isCellInSelected(randomRow, randomCol)) {
            board[randomRow][randomCol] = 1; // 1 - мина
            mines.push({ row: randomRow, col: randomCol });
            minesPlaced++;
        }
    }
    console.log("Мины расставлены:", mines);
}

// Обработчик клика по ячейке
function handleCellClick(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (isGameInProgress) {
        // Если игра идет, открываем ячейку
        if (cell.classList.contains('opened') || cell.classList.contains('selected')) {
            return; // Нельзя открыть уже открытую или выбранную ячейку
        }

        if (board[row][col] === 1) {
            // Игрок нашел мину
            endGame(false); // Проигрыш
        } else {
            cell.classList.add('opened', 'safe');
            cell.textContent = '✅'; // Можно отобразить количество безопасных соседей, но это усложнит код
            // Проверяем, открыты ли все безопасные ячейки
            if (checkWinCondition()) {
                endGame(true); // Выигрыш
            }
        }
    } else {
        // Если игра не идет, выбираем ячейки для ставки
        if (selectedCells.length < MAX_SELECT_CELLS && !cell.classList.contains('selected')) {
            cell.classList.add('selected');
            selectedCells.push({ row, col });
            selectedCellsCountElement.textContent = selectedCells.length;
        } else if (cell.classList.contains('selected')) {
            cell.classList.remove('selected');
            selectedCells = selectedCells.filter(c => !(c.row === row && c.col === col));
            selectedCellsCountElement.textContent = selectedCells.length;
        }
    }
}

// Функция для проверки, находится ли ячейка в выбранных
function isCellInSelected(row, col) {
    return selectedCells.some(c => c.row === row && c.col === col);
}

// Обработчик кнопки "Начать игру / Сделать ставку"
function startGame() {
    if (!isGameInProgress) {
        if (selectedCells.length !== MAX_SELECT_CELLS) {
            alert(`Пожалуйста, выберите ровно ${MAX_SELECT_CELLS} ячейки для ставки.`);
            return;
        }

        if (balance < currentBet) {
            alert("Недостаточно баланса для ставки!");
            return;
        }

        balance -= currentBet;
        balanceElement.textContent = balance;
        isGameInProgress = true;
        startGameBtn.textContent = 'Открыть ячейку';
        startGameBtn.disabled = true; // Кнопка "Начать игру" становится неактивной во время игры
        resetGameBtn.disabled = false;

        // "Умная механика": Анализируем популярность ячеек (имитация)
        // Здесь вместо реального анализа, мы просто избегаем ставить мины в выбранные игроком ячейки,
        // чтобы дать ему шанс. В реальной системе это был бы сложный алгоритм.

        placeMines(); // Расставляем мины, избегая выбранных ячеек

        // Визуализация выбора ячеек
        selectedCells.forEach(c => {
            const cellElement = boardElement.querySelector(`.cell[data-row="${c.row}"][data-col="${c.col}"]`);
            cellElement.classList.add('selected');
        });

    } else {
        // Если игра уже идет, кнопка "Начать игру" должна была быть переименована
        // в "Открыть ячейку", но в данном сценарии мы открываем ячейку кликом.
        // Эта ветка кода осталась для полноты, но ее логика реализуется в handleCellClick.
    }
}

// Проверка условия победы
function checkWinCondition() {
    let allSafeCellsOpened = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === 0) { // Если это не мина
                const cellElement = boardElement.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                if (!cellElement.classList.contains('opened')) {
                    allSafeCellsOpened = false;
                    break;
                }
            }
        }
        if (!allSafeCellsOpened) break;
    }
    return allSafeCellsOpened;
}

// Завершение игры
function endGame(isWin) {
    isGameInProgress = false;
    startGameBtn.textContent = 'Начать игру / Сделать ставку';
    startGameBtn.disabled = true;
    resetGameBtn.disabled = false;

    let payout = 0;
    let message = '';

    if (isWin) {
        // Имитация выигрыша (в реальной игре это было бы сложнее)
        // Предположим, что выигрыш - это возврат ставки + часть банка
        const casinoCut = 0.6; // 60% казино
        const playerPrizePool = currentBet * (1 - casinoCut); // 40% для игроков
        // В нашей упрощенной модели, если игрок выигрывает (нашел 0 мин),
        // он получает свою ставку обратно, плюс некоторую часть общего призового фонда.
        // Для простоты, давайте удвоим ставку, если игрок выиграл.
        payout = currentBet * 2; // Упрощенный выигрыш
        balance += payout;
        message = `Поздравляем! Вы выиграли ${payout - currentBet} ₽!`;
        resultsElement.classList.add('win');
    } else {
        // Проигрыш: игрок теряет ставку, но только за ячейки с минами.
        // В нашем упрощенном случае, если найдена мина, игрок теряет всю ставку.
        const lostAmount = currentBet;
        // balance -= lostAmount; // Баланс уже уменьшился при начале игры
        message = `Увы, вы проиграли ${lostAmount} ₽.`;
        resultsElement.classList.add('lose');
    }

    // Открываем все ячейки и показываем мины
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const cellElement = boardElement.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
            if (board[r][c] === 1) {
                cellElement.classList.add('mined');
                cellElement.textContent = '💣';
            } else if (!cellElement.classList.contains('opened')) {
                cellElement.classList.add('opened', 'safe');
                cellElement.textContent = '✅';
            }
        }
    }

    balanceElement.textContent = balance;
    resultsElement.textContent = message;
}

// Обработчик кнопки "Новая игра"
function resetGame() {
    // В реальной игре, сброс мог бы означать новый раунд с тем же балансом.
    // Здесь мы просто сбрасываем игру и оставляем баланс.
    createBoard();
}

// Прикрепление слушателей событий к ячейкам
function attachCellListeners() {
    const cells = boardElement.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
}

// --- Инициализация ---
startGameBtn.addEventListener('click', startGame);
resetGameBtn.addEventListener('click', resetGame);

createBoard(); // Создаем поле при загрузке страницы


// Открываем все ячейки и показываем мины
for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
        const cellElement = boardElement.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
        if (board[r][c] === 1) { // Если ячейка содержит мину
            cellElement.classList.add('mined'); // Добавляем класс 'mined'
            cellElement.textContent = '💣';   // Ставим эмодзи мины
        } else if (!cellElement.classList.contains('opened')) { // Если это безопасная ячейка, которая еще не была открыта
            cellElement.classList.add('opened', 'safe'); // Добавляем классы 'opened' и 'safe'
            cellElement.textContent = '✅';          // Ставим эмодзи для безопасной ячейки
        }
    }
}