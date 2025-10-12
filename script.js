// ========== VARIÁVEIS DE ESTADO ==========
// Guardam informações sobre o estado atual do app
let isRunning = false;      // O exercício está rodando?
let isPaused = false;       // O exercício está pausado?
let currentPhase = 'prepare'; // Fase atual: 'prepare', 'inhale' ou 'exhale'
let timeRemaining = 300;    // Tempo restante em segundos (5 min = 300s)
let totalTime = 300;        // Tempo total da sessão
let intervalId = null;      // ID do timer principal (cronômetro)
let phaseIntervalId = null; // ID do timer das fases (inspirar/expirar)
const audio = new Audio('sounds/caboclo.mp3'); // ← MUDA pro nome do seu arquivo
audio.loop = true;           // Faz o áudio repetir
audio.volume = 0.5;          // Volume inicial (50%)
let soundEnabled = false;    // Som começa desligado

// ========== SELEÇÃO DE ELEMENTOS HTML ==========
// "Apelidos" para os elementos que vamos manipular
const circle = document.getElementById('breathingCircle');
const text = document.getElementById('breathingText');
const timerDisplay = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const progressFill = document.getElementById('progressFill');
const durationSelect = document.getElementById('duration');
const soundBtn = document.getElementById('soundBtn');
const volumeSlider = document.getElementById('volumeSlider');

// ========== FUNÇÃO: FORMATAR TEMPO ==========
// Converte segundos em formato MM:SS
// Exemplo: 125 segundos vira "2:05"
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60); // Divide por 60 e arredonda pra baixo
    const secs = seconds % 60;              // Pega o resto da divisão (segundos restantes)
    return `${mins}:${secs.toString().padStart(2, '0')}`; // Adiciona zero na frente se necessário
}

// ========== FUNÇÃO: ATUALIZAR BARRA DE PROGRESSO ==========
// Calcula quanto % da sessão já passou
function updateProgress() {
    const progress = ((totalTime - timeRemaining) / totalTime) * 100;
    progressFill.style.width = progress + '%'; // Muda a largura da barra
}

// ========== FUNÇÃO: TROCAR FASE (Inspirar ↔ Expirar) ==========
// Alterna entre as fases de inspirar e expirar
function switchPhase() {
    if (currentPhase === 'prepare') {
        // Se tá preparando, começa a inspirar
        currentPhase = 'inhale';
        text.textContent = 'Inspire';
        circle.classList.remove('exhale');
        circle.classList.add('inhale'); // Círculo cresce
    } else if (currentPhase === 'inhale') {
        // Se tá inspirando, passa pra expirar
        currentPhase = 'exhale';
        text.textContent = 'Expire';
        circle.classList.remove('inhale');
        circle.classList.add('exhale'); // Círculo diminui
    } else {
        // Se tá expirando, volta pra inspirar
        currentPhase = 'inhale';
        text.textContent = 'Inspire';
        circle.classList.remove('exhale');
        circle.classList.add('inhale');
    }
}

// ========== FUNÇÃO: INICIAR EXERCÍCIO ==========
// Chamada quando clica no botão "Iniciar"
function toggleSound() {
    soundEnabled = !soundEnabled; // Inverte o valor (true ↔ false)
    
    if (soundEnabled) {
        soundBtn.textContent = '🔊 Som: ON';
        // SE o exercício tiver rodando, toca o áudio
        if (isRunning && !isPaused) {
            audio.play();
        }
    } else {
        soundBtn.textContent = '🔇 Som: OFF';
        audio.pause(); // Para o áudio
    }
}
function updateVolume() {
    const volumeValue = volumeSlider.value; // Pega valor do slider (0-100)
    audio.volume = volumeValue / 100;       // Converte pra 0.0-1.0
}
function startExercise() {
    // Se já tá rodando e não tá pausado, não faz nada
    if (isRunning && !isPaused) return;

    // Se não tá rodando, configura o tempo inicial
    if (!isRunning) {
        totalTime = parseInt(durationSelect.value); // Pega duração escolhida
        timeRemaining = totalTime;
        updateProgress();
    }

    // Marca que tá rodando
    isRunning = true;
    isPaused = false;
    
    // Troca botões (esconde "Iniciar", mostra "Pausar")
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';

    currentPhase = 'prepare';
    if (soundEnabled) {
        audio.play();
    }
    
    // Espera 1 segundo, depois começa as fases
    setTimeout(() => {
        switchPhase(); // Primeira fase (Inspire)
        phaseIntervalId = setInterval(switchPhase, 5000); // Troca a cada 5 segundos
    }, 1000);

    // Timer do cronômetro (atualiza a cada 1 segundo)
    intervalId = setInterval(() => {
        timeRemaining--; // Diminui 1 segundo
        timerDisplay.textContent = formatTime(timeRemaining); // Atualiza display
        updateProgress(); // Atualiza barra de progresso

        // Se chegou a zero, termina
        if (timeRemaining <= 0) {
            completeExercise();
        }
    }, 1000);
}

// ========== FUNÇÃO: PAUSAR EXERCÍCIO ==========
// Chamada quando clica no botão "Pausar"
function pauseExercise() {
    if (!isRunning) return; // Se não tá rodando, não faz nada

    isPaused = true;
    clearInterval(intervalId);      // Para o cronômetro
    clearInterval(phaseIntervalId); // Para as fases
    
    // Troca botões
    startBtn.textContent = 'Continuar';
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    
    // Mostra texto "Pausado" e remove animação
    text.textContent = 'Pausado';
    circle.classList.remove('inhale', 'exhale');
    audio.pause();
}

// ========== FUNÇÃO: REINICIAR EXERCÍCIO ==========
// Chamada quando clica no botão "Reiniciar"
function resetExercise() {
    // Para tudo
    isRunning = false;
    isPaused = false;
    clearInterval(intervalId);
    clearInterval(phaseIntervalId);

    // Reseta valores
    totalTime = parseInt(durationSelect.value);
    timeRemaining = totalTime;
    currentPhase = 'prepare';

    // Atualiza interface
    timerDisplay.textContent = formatTime(timeRemaining);
    text.textContent = 'Prepare-se';
    circle.classList.remove('inhale', 'exhale');
    
    // Volta botões pro estado inicial
    startBtn.textContent = 'Iniciar';
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    
    progressFill.style.width = '0%';
    audio.pause();        // Para o áudio
    audio.currentTime = 0; // Volta pro início
}

// ========== FUNÇÃO: COMPLETAR EXERCÍCIO ==========
// Chamada quando o tempo acaba
function completeExercise() {
    clearInterval(intervalId);
    clearInterval(phaseIntervalId);
    
    // Mostra mensagem de conclusão
    text.textContent = '✨ Completo!';
    circle.classList.remove('inhale', 'exhale');
    
    // Volta botões
    startBtn.textContent = 'Iniciar';
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
    
    isRunning = false;
    isPaused = false;
    
    // Depois de 3 segundos, volta pro texto inicial
    setTimeout(() => {
        text.textContent = 'Prepare-se';
    }, 3000);
}

// ========== EVENT LISTENER: MUDANÇA DE DURAÇÃO ==========
// Quando muda a duração no dropdown
durationSelect.addEventListener('change', () => {
    // Só atualiza se não tiver exercício rodando
    if (!isRunning) {
        totalTime = parseInt(durationSelect.value);
        timeRemaining = totalTime;
        timerDisplay.textContent = formatTime(timeRemaining);
    }
});