// ===== NAVEGAÇÃO =====
function mostrarAba(idAba, botaoClicado) {
    document.querySelectorAll('.conteudo-aba').forEach(a => a.classList.remove('ativa'));
    document.getElementById(idAba).classList.add('ativa');
    document.querySelectorAll('.btn-tab').forEach(b => b.classList.remove('ativo'));
    botaoClicado.classList.add('ativo');

    if (idAba === 'mapa' && window.mapaRioVivo) {
        setTimeout(() => window.mapaRioVivo.invalidateSize(), 200);
    }
}

// ===== BOTÃO CONECTAR =====
const btnConectar = document.getElementById('btnConectar');
btnConectar.addEventListener('click', () => {
    if (btnConectar.textContent.includes('Conectado')) {
        btnConectar.textContent = '🔗 Conectar à boia';
        btnConectar.style.backgroundColor = 'transparent';
        btnConectar.style.color = '#22c55e';
    } else {
        btnConectar.textContent = '✅ Conectado';
        btnConectar.style.backgroundColor = '#22c55e';
        btnConectar.style.color = '#0f172a';
    }
});

// ===== BUZZER =====
let ctxAudio = null, oscAtivo = null;
function tocarBuzzer(freq = 2000, dur = 300) {
    try {
        if (!ctxAudio) ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
        if (ctxAudio.state === 'suspended') ctxAudio.resume();
        const o = ctxAudio.createOscillator(), g = ctxAudio.createGain();
        o.type = 'square'; o.frequency.value = freq;
        g.gain.setValueAtTime(0.2, ctxAudio.currentTime);
        o.connect(g); g.connect(ctxAudio.destination);
        o.start(); o.stop(ctxAudio.currentTime + dur / 1000);
    } catch (e) { console.error(e); }
}
function iniciarBuzzerContinuo() {
    if (!ctxAudio) ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
    if (ctxAudio.state === 'suspended') ctxAudio.resume();
    if (oscAtivo) return;
    oscAtivo = ctxAudio.createOscillator();
    const g = ctxAudio.createGain();
    oscAtivo.type = 'square'; oscAtivo.frequency.value = 2000;
    g.gain.value = 0.12;
    oscAtivo.connect(g); g.connect(ctxAudio.destination);
    oscAtivo.start();
}
function pararBuzzer() {
    if (oscAtivo) { try { oscAtivo.stop(); } catch(e){} oscAtivo = null; }
}
document.getElementById('btnTestarBuzzer').addEventListener('click', () => {
    tocarBuzzer(2000, 200);
    setTimeout(() => tocarBuzzer(2000, 200), 350);
    setTimeout(() => tocarBuzzer(2000, 200), 700);
});
document.getElementById('btnPararBuzzer').addEventListener('click', pararBuzzer);

// ===== HISTÓRICO =====
const alertas = [];
function registrarAlerta(msg) {
    const hora = new Date().toLocaleTimeString('pt-BR');
    alertas.unshift(`${hora} — ${msg}`);
    if (alertas.length > 10) alertas.pop();
    const lista = document.getElementById('lista-alertas');
    lista.innerHTML = alertas.length ? alertas.map(a => `<li>${a}</li>`).join('') : '<li>Nenhum alerta.</li>';
}
document.getElementById('btnLimparAlertas').addEventListener('click', () => {
    alertas.length = 0;
    document.getElementById('lista-alertas').innerHTML = '<li>Nenhum alerta.</li>';
});

// ===== ALERTA =====
let ultimoEstado = false;
function verificarAlerta(ph) {
    const fora = ph < 6.0 || ph > 8.5;
    const st = document.getElementById('status-alerta');
    const msg = document.getElementById('msg-alerta');
    const stPh = document.getElementById('status-ph');

    if (fora) {
        if (!ultimoEstado) { registrarAlerta(`pH fora: ${ph}`); iniciarBuzzerContinuo(); }
        st.textContent = `🚨 Alerta! pH: ${ph}`; st.style.color = '#ef4444';
        msg.textContent = 'pH fora da faixa segura (6.0 a 8.5).';
        stPh.textContent = 'Fora do normal'; stPh.style.color = '#ef4444';
    } else {
        if (ultimoEstado) pararBuzzer();
        st.textContent = '✅ Nenhum alerta no momento.'; st.style.color = '#22c55e';
        msg.textContent = 'O rio está dentro dos parâmetros normais.';
        stPh.textContent = 'Normal'; stPh.style.color = '#64748b';
    }
    ultimoEstado = fora;
}

// ===== GRÁFICOS =====
let gPh = null, gTemp = null;
function iniciarGraficos() {
    const opt = {
        type: 'line',
        options: {
            responsive: true, maintainAspectRatio: false, animation: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#334155' } },
                y: { 
    min: 6.5, 
    max: 7.5, 
    ticks: { color: '#64748b', font: { size: 10 } }, 
    grid: { color: '#334155' } 
}
            }
        }
    };
    gPh = new Chart(document.getElementById('grafico-ph'), {
        ...opt,
        data: { labels: [], datasets: [{ data: [], borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.15)', tension: 0.3, fill: true, pointRadius: 2 }] }
    });
    gTemp = new Chart(document.getElementById('grafico-temp'), {
        ...opt,
        data: { labels: [], datasets: [{ data: [], borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.15)', tension: 0.3, fill: true, pointRadius: 2 }] }
    });
}
function atualizarGraficos(ph, temp) {
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (gPh) {
        gPh.data.labels.push(hora); gPh.data.datasets[0].data.push(ph);
        if (gPh.data.labels.length > 15) { gPh.data.labels.shift(); gPh.data.datasets[0].data.shift(); }
        gPh.update('none');
    }
    if (gTemp) {
        gTemp.data.labels.push(hora); gTemp.data.datasets[0].data.push(parseFloat(temp));
        if (gTemp.data.labels.length > 15) { gTemp.data.labels.shift(); gTemp.data.datasets[0].data.shift(); }
        gTemp.update('none');
    }
}

// ===== SENSORES =====
function atualizarSensores() {
    const ph = parseFloat((6.0 + Math.random() * 2.0).toFixed(1));
    const turb = Math.floor(18 + Math.random() * 8);
    const temp = (22.5 + Math.random() * 3).toFixed(1);
    const niv = Math.floor(30 + Math.random() * 10);

    document.getElementById('valor-ph').textContent = ph;
    document.getElementById('valor-turbidez').textContent = turb;
    document.getElementById('valor-temperatura').textContent = temp;
    document.getElementById('valor-nivel').textContent = niv;

    verificarAlerta(ph);
    atualizarGraficos(ph, temp);
}

// ===== MAPA =====
window.addEventListener('load', () => {
    const el = document.getElementById('mapa-real');
    if (!el || typeof L === 'undefined') return;
    const lat = -22.7833, lng = -51.2333;
    const mapa = L.map('mapa-real').setView([lat, lng], 14);
    window.mapaRioVivo = mapa;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB', maxZoom: 19
    }).addTo(mapa);
    L.marker([lat, lng]).addTo(mapa)
        .bindPopup('<strong>🌊 Boia RioVivo</strong><br>Lago dos Patos<br>pH: 7.0')
        .openPopup();
    L.circle([lat, lng], { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.15, radius: 500 }).addTo(mapa);
    iniciarGraficos();
    setTimeout(atualizarSensores, 500);
    setInterval(atualizarSensores, 4000);
});