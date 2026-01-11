// 1. Elementos do HTML
const spinButton = document.getElementById('spin-button');
const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
const balanceDisplay = document.getElementById('balance');
const messageDisplay = document.getElementById('message');
const spinSound = document.getElementById('spin-sound');
const winSound = document.getElementById('win-sound');

// 2. Configurações do Jogo
const symbols = [
    { name: 'tiger',  url: 'https://i.ibb.co/C7W8VvT/tiger.png', prize: 1000 },
    { name: 'diamond',url: 'https://i.ibb.co/N7d7pWf/diamond.png', prize: 300 },
    { name: 'bar',    url: 'https://i.ibb.co/hXJdK09/bar.png', prize: 150 },
    { name: 'bell',   url: 'https://i.ibb.co/gZ3y3F4/bell.png', prize: 80 },
    { name: 'clover', url: 'https://i.ibb.co/yQYfV2G/clover.png', prize: 60 },
    { name: 'orange', url: 'https://i.ibb.co/bX1sN35/orange.png', prize: 30 }
];
let balance = 100;
const costPerSpin = 10;

// Inicializa os rolos com um símbolo aleatório
reels.forEach(reel => {
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    reel.innerHTML = `<img src="${randomSymbol.url}" alt="${randomSymbol.name}">`;
});

// 3. Evento de clique
spinButton.addEventListener('click', handleSpin);

// 4. Função de Giro
function handleSpin() {
    if (balance < costPerSpin) {
        messageDisplay.textContent = "Saldo insuficiente!";
        return;
    }

    balance -= costPerSpin;
    balanceDisplay.textContent = balance;
    messageDisplay.textContent = "Girando...";
    spinButton.disabled = true;

    spinSound.currentTime = 0;
    spinSound.play();

    let spinIntervals = [];
    const finalResults = [];

    reels.forEach((reel, index) => {
        reel.classList.add('spinning');

        spinIntervals[index] = setInterval(() => {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            reel.innerHTML = `<img src="${randomSymbol.url}" alt="${randomSymbol.name}">`;
        }, 50);

        setTimeout(() => {
            clearInterval(spinIntervals[index]);
            reel.classList.remove('spinning');

            const finalSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            reel.innerHTML = `<img src="${finalSymbol.url}" alt="${finalSymbol.name}">`;
            finalResults[index] = finalSymbol;

            if (index === reels.length - 1) {
                checkWin(finalResults);
                spinButton.disabled = false;
            }
        }, 800 + (index * 300));
    });
}

// 5. Função de Verificação de Vitória (com chamada para a IA)
async function checkWin(results) {
    const r1 = results[0];
    const r2 = results[1];
    const r3 = results[2];

    let outcome = { result: 'lose', prize: 0, symbol: '' };

    if (r1.name === r2.name && r2.name === r3.name) {
        const prize = r1.prize;
        balance += prize;
        balanceDisplay.textContent = balance;
        outcome = { result: 'win', prize: prize, symbol: r1.name };
        winSound.currentTime = 0;
        winSound.play();
    }

    try {
        messageDisplay.textContent = "IA está pensando...";
        
        // IMPORTANTE: Quando você hospedar o back-end, terá que trocar 'http://localhost:3000' pelo endereço do seu servidor online.
        const response = await fetch('http://localhost:3000/get-creative-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(outcome),
        });

        const data = await response.json();
        messageDisplay.textContent = data.message;

    } catch (error) {
        console.error("Erro ao conectar com o servidor de IA:", error);
        messageDisplay.textContent = outcome.result === 'win' ? `Você ganhou ${outcome.prize} moedas!` : "Tente novamente!";
    }
}
