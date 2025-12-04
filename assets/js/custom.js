const form = document.getElementById('contact-form');
const submitBtn = document.getElementById('submitBtn');
const output = document.getElementById('form-results');
const successMsg = document.getElementById('success-msg');

const fields = {
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    address: document.getElementById('address'),
    q1: document.getElementById('q1'),
    q2: document.getElementById('q2'),
    q3: document.getElementById('q3')
};

function formatPhone(value) {
    value = value.replace(/\D/g, '');
    if (value.startsWith('370')) value = value.slice(3);
    value = value.substring(0, 8);
    return `+370 6${value.substring(0, 2)} ${value.substring(2, 5)} ${value.substring(5, 8)}`.trim();
}

function validateField(f) {
    let v = f.value.trim(), valid = true, err = '';
    switch (f.id) {
        case 'firstName':
        case 'lastName':
            if (!/^[A-Za-zĄ-ž]+$/.test(v)) { valid = false; err = 'Tik raidės'; }
            break;
        case 'email':
            if (!/^\S+@\S+\.\S+$/.test(v)) { valid = false; err = 'Neteisingas el. paštas'; }
            break;
        case 'phone':
            if (!/^\+370 6\d{2} \d{3} \d{2,3}$/.test(formatPhone(v))) { valid = false; err = 'Neteisingas numeris'; }
            break;
        case 'address':
            if (v === '') { valid = false; err = 'Negali būti tuščias'; }
            break;
        case 'q1':
        case 'q2':
            if (v === '') { valid = false; err = 'Negali būti tuščias'; }
            break;
        case 'q3':
            if (v === '' || v < 0 || v > 10) { valid = false; err = '0-10'; }
            break;
    }
    f.style.borderColor = valid ? 'green' : 'red';
    if (!valid) {
        if (!f.nextElementSibling || !f.nextElementSibling.classList.contains('error-text')) {
            const s = document.createElement('span');
            s.className = 'error-text';
            s.style.color = 'red';
            s.textContent = err;
            f.after(s);
        } else { f.nextElementSibling.textContent = err; }
    } else {
        if (f.nextElementSibling && f.nextElementSibling.classList.contains('error-text'))
            f.nextElementSibling.remove();
    }
    return valid;
}


function checkForm() {
    submitBtn.disabled = !Object.values(fields).every(f => validateField(f));
}

Object.values(fields).forEach(f => {
    f.addEventListener('input', () => {
        if (f.id === 'phone') f.value = formatPhone(f.value);
        checkForm();
    });
});

form.addEventListener('submit', e => {
    e.preventDefault();
    let data = {};
    Object.keys(fields).forEach(k => data[k] = fields[k].value.trim());
    console.log(data);
    const avg = ((+data.q1 + +data.q2 + +data.q3) / 3).toFixed(1);
    output.innerHTML = `
        <p>Vardas: ${data.firstName}</p>
        <p>Pavardė: ${data.lastName}</p>
        <p>El. paštas: ${data.email}</p>
        <p>Telefonas: ${data.phone}</p>
        <p>Adresas: ${data.address}</p>
        <p>${data.firstName} ${data.lastName}: vidurkis ${avg}</p>
    `;
    successMsg.style.display = 'block';
    setTimeout(() => { successMsg.style.display = 'none'; }, 4000);
    form.reset();
    checkForm();
});




const icons = ["🍎", "🍌", "🍒", "🍇", "🍉", "🥝", "🥑", "🍍", "🥥", "🍋", "🍓", "🥭"];

let board = document.getElementById("board");
let movesEl = document.getElementById("moves");
let matchesEl = document.getElementById("matches");
let timerEl = document.getElementById("timer");
let winMessage = document.getElementById("win-message");
let difficulty = document.getElementById("difficulty");
let flipped = [];
let moves = 0;
let matches = 0;
let timer = 0;
let timerInterval = null;
let gameStarted = false;

function loadBestScores() {
    document.getElementById("best-easy").textContent = localStorage.getItem("best_easy") || "-";
    document.getElementById("best-hard").textContent = localStorage.getItem("best_hard") || "-";
}
loadBestScores();

function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        timerEl.textContent = timer;
    }, 1000);
}
function stopTimer() {
    clearInterval(timerInterval);
}
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}
function createBoard() {
    board.innerHTML = "";
    winMessage.textContent = "";
    let size = difficulty.value === "easy" ? 12 : 24;
    board.style.gridTemplateColumns = difficulty.value === "easy" ? "repeat(4, 80px)" : "repeat(6, 80px)";
    let selected = icons.slice(0, size / 2);
    let cards = shuffle([...selected, ...selected]);
    cards.forEach(icon => {
        let div = document.createElement("div");
        div.className = "card";
        div.dataset.icon = icon;
        div.textContent = "";
        div.addEventListener("click", () => flipCard(div));
        board.appendChild(div);
    });
}
function flipCard(card) {
    if (card.classList.contains("flipped") || card.classList.contains("matched")) return;
    if (flipped.length === 2) return;
    card.classList.add("flipped");
    card.textContent = card.dataset.icon;
    flipped.push(card);
    if (!gameStarted) { gameStarted = true; startTimer(); }
    if (flipped.length === 2) {
        moves++;
        movesEl.textContent = moves;
        if (flipped[0].dataset.icon === flipped[1].dataset.icon) {
            flipped.forEach(c => c.classList.add("matched"));
            matches++;
            matchesEl.textContent = matches;
            flipped = [];
            checkWin();
        } else {
            setTimeout(() => {
                flipped.forEach(c => { c.classList.remove("flipped"); c.textContent = ""; });
                flipped = [];
            }, 1000);
        }
    }
}
function checkWin() {
    let totalPairs = difficulty.value === "easy" ? 6 : 12;
    if (matches === totalPairs) {
        stopTimer();
        winMessage.textContent = "Laimėjote!";
        let bestKey = difficulty.value === "easy" ? "best_easy" : "best_hard";
        let best = localStorage.getItem(bestKey);
        if (!best || moves < best) {
            localStorage.setItem(bestKey, moves);
            loadBestScores();
        }
    }
}
function resetGame() {
    flipped = [];
    moves = 0;
    matches = 0;
    timer = 0;
    gameStarted = false;
    stopTimer();
    movesEl.textContent = "0";
    matchesEl.textContent = "0";
    timerEl.textContent = "0";
    createBoard();
}

document.getElementById("start").addEventListener("click", () => {
    flipped = [];
    moves = 0;
    matches = 0;
    timer = 0;
    gameStarted = false;
    stopTimer();
    movesEl.textContent = "0";
    matchesEl.textContent = "0";
    timerEl.textContent = "0";
    board.innerHTML = "";
    createBoard();
});

difficulty.addEventListener("change", () => {
    flipped = [];
    moves = 0;
    matches = 0;
    timer = 0;
    gameStarted = false;
    stopTimer();
    movesEl.textContent = "0";
    matchesEl.textContent = "0";
    timerEl.textContent = "0";
    board.innerHTML = "";
    winMessage.textContent = "";
});