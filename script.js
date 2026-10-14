// ========================================
// 1. NAVEGAÇÃO ENTRE ABAS
// ========================================
function mostrarAba(idAba, botaoClicado) {
    const todasAsAbas = document.querySelectorAll('.conteudo-aba');
    todasAsAbas.forEach(aba => aba.classList.remove('ativa'));

    const abaSelecionada = document.getElementById(idAba);
    if (abaSelecionada) {
        abaSelecionada.classList.add('ativa');
    }

    const todosOsBotoes = document.querySelectorAll('.btn-tab');
    todosOsBotoes.forEach(botao => botao.classList.remove('ativo'));

    if (botaoClicado) {
        botaoClicado.classList.add('ativo');
    }
}

// ========================================
// 2. BOTÃO CONECTAR À BOIA
// ========================================
const btnConectar = document.querySelector('.btn-conectar');

btnConectar.addEventListener('click', () => {
    if (btnConectar.textContent.includes('Conectado')) {
        // Se já está conectado, desconecta
        btnConectar.textContent = '🔗 Conectar à boia';
        btnConectar.style.backgroundColor = 'transparent';
        btnConectar.style.color = '#22c55e';
    } else {
        // Se não está conectado, conecta
        btnConectar.textContent = '✅ Conectado';
        btnConectar.style.backgroundColor = '#22c55e';
        btnConectar.style.color = '#0f172a';
    }
});

// ========================================
// 3. SIMULAÇÃO DE SENSORES EM TEMPO REAL
// ========================================
function atualizarSensores() {
    const ph = (6.8 + Math.random() * 0.6).toFixed(1);
    const turbidez = Math.floor(18 + Math.random() * 8);
    const temperatura = (22.5 + Math.random() * 3).toFixed(1);
    const nivel = Math.floor(30 + Math.random() * 10);

    document.getElementById('valor-ph').textContent = ph;
    document.getElementById('valor-turbidez').textContent = turbidez;
    document.getElementById('valor-temperatura').textContent = temperatura;
    document.getElementById('valor-nivel').textContent = nivel;
}

// Atualiza a cada 4 segundos
setInterval(atualizarSensores, 4000);