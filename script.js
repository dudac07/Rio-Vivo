// --- ESTADO GLOBAL ---
let s = { ph: 7, turbidity: 20, temperature: 24, level: 35 };
let hist = [92, 94, 93, 95, 92, 91, 92];
let port = null, reader = null, buf = "";

// Atalhos
const $ = x => document.getElementById(x);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

// --- CÁLCULO DO ÍNDICE DE SAÚDE (ISR) ---
function health() {
    let n = 100;
    if (s.ph < 6 || s.ph > 9) n -= 30;
    else if (s.ph < 6.5 || s.ph > 8.5) n -= 10;
    
    if (s.turbidity > 100) n -= 30;
    else if (s.turbidity > 50) n -= 15;
    
    if (s.temperature < 15 || s.temperature > 32) n -= 20;
    else if (s.temperature < 18 || s.temperature > 29) n -= 8;
    
    if (s.level > 85) n -= 25;
    else if (s.level > 65) n -= 10;
    
    return clamp(Math.round(n), 0, 100);
}

// --- ATUALIZAÇÃO DA INTERFACE ---
function update() {
    // Atualiza valores numéricos
    $("ph").textContent = s.ph.toFixed(1);
    $("tu").textContent = Math.round(s.turbidity);
    $("te").textContent = s.temperature.toFixed(1);
    $("lv").textContent = Math.round(s.level);
    
    // Atualiza status do pH
    const phStatus = s.ph >= 6.5 && s.ph <= 8.5 ? "Normal" : "Atenção";
    $("ps").textContent = phStatus;

    // Aplica classes de cor nos cards (Normal, Atenção, Crítico)
    // Nota: A função card() no seu código original aplicava classes ao article.
    // Aqui garantimos que a classe 'attention' ou 'danger' seja adicionada ao card correto.
    const setCardClass = (id, condition) => {
        const el = $(id);
        el.className = ""; // Limpa classes anteriores
        if (condition === 'danger') el.classList.add('danger');
        else if (condition === 'attention') el.classList.add('attention');
    };

    setCardClass("pc", s.ph < 6 || s.ph > 9 ? "danger" : phStatus === "Atenção" ? "attention" : "");
    setCardClass("tc", s.turbidity > 100 ? "danger" : s.turbidity > 50 ? "attention" : "");
    setCardClass("tempC", s.temperature < 15 || s.temperature > 32 ? "danger" : s.temperature < 18 || s.temperature > 29 ? "attention" : "");
    setCardClass("lc", s.level > 85 ? "danger" : s.level > 65 ? "attention" : "");

    // Atualiza Índice de Saúde
    let h = health();
    $("health").textContent = h;
    $("bar").style.width = h + "%";
    
    // Cores da barra (Verde, Amarelo, Vermelho)
    if (h >= 80) {
        $("bar").style.background = "#18a957"; // Verde
        $("hm").textContent = "Condições normais.";
    } else if (h >= 60) {
        $("bar").style.background = "#e1a900"; // Amarelo
        $("hm").textContent = "Atenção: alguns parâmetros precisam ser observados.";
    } else {
        $("bar").style.background = "#d43737"; // Vermelho
        $("hm").textContent = "Alerta: alterações importantes.";
    }

    // Análise IA
    let m = [];
    if (s.level > 85) m.push("nível elevado");
    else if (s.level > 65) m.push("nível em elevação");
    if (s.turbidity > 100) m.push("turbidez muito elevada");
    else if (s.turbidity > 50) m.push("turbidez aumentada");
    if (s.ph < 6 || s.ph > 9) m.push("pH fora da faixa");
    if (s.temperature < 15 || s.temperature > 32) m.push("temperatura fora da faixa");

    $("ai").innerHTML = "<b>Análise automática:</b> " + 
        (m.length ? m.join("; ") + "." : "parâmetros dentro das faixas configuradas.") + 
        "<br><small>Protótipo; não substitui análise laboratorial.</small>";

    // Alertas
    let a = [];
    if (s.level > 85) a.push("🚨 Nível elevado");
    if (s.turbidity > 100) a.push("🚨 Turbidez muito elevada");
    if (s.ph < 6 || s.ph > 9) a.push("🚨 pH fora da faixa");
    if (s.temperature < 15 || s.temperature > 32) a.push("⚠️ Temperatura fora da faixa");
    
    $("alerts").innerHTML = a.length 
        ? a.map(x => `<div class="alert-item danger">${x}</div>`).join("") 
        : '<div class="alert-item success">✅ Nenhum alerta crítico.</div>';

    // Atualiza Histórico
    hist.push(h);
    if (hist.length > 20) hist.shift();
    draw();
}

// --- SIMULAÇÃO (BOTÕES DE DEMONSTRAÇÃO) ---
function demo(x) {
    if (x === "normal") {
        s = { ph: 7, turbidity: 20, temperature: 24, level: 35 };
    } else if (x === "attention") {
        s = { ph: 8.7, turbidity: 65, temperature: 29.5, level: 70 };
    } else {
        s = { ph: 5.2, turbidity: 150, temperature: 34, level: 92 };
    }
    update();
}

// --- DESENHO DO GRÁFICO (CANVAS) ---
function draw() {
    let c = $("chart");
    let x = c.getContext("2d");
    let w = c.width;
    let h = c.height;
    
    x.clearRect(0, 0, w, h);
    
    // Linhas de grade
    x.strokeStyle = "rgba(255, 255, 255, 0.1)"; // Linhas claras para fundo escuro
    x.lineWidth = 1;
    for (let y = 0; y <= 100; y += 20) {
        let py = h - 20 - y / 100 * (h - 50);
        x.beginPath();
        x.moveTo(45, py);
        x.lineTo(w - 15, py);
        x.stroke();
    }

    // Linha do gráfico
    x.beginPath();
    hist.forEach((v, i) => {
        let px = 45 + i * (w - 65) / (hist.length - 1);
        let py = h - 20 - v / 100 * (h - 50);
        i ? x.lineTo(px, py) : x.moveTo(px, py);
    });
    
    x.strokeStyle = "#2E8B57"; // Verde RioVivo
    x.lineWidth = 4;
    x.stroke();
}

// --- CONEXÃO SERIAL (WEB SERIAL API) ---
async function serial() {
    if (!("serial" in navigator)) {
        alert("Use Chrome ou Edge no computador para Web Serial.");
        return;
    }
    try {
        port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });
        $("conn").textContent = "Boia conectada por USB";
        $("conn").style.color = "#2E8B57"; // Verde
        
        reader = port.readable.getReader();
        let d = new TextDecoder();
        
        while (true) {
            let r = await reader.read();
            if (r.done) break;
            buf += d.decode(r.value);
            let lines = buf.split("\n");
            buf = lines.pop();
            
            for (let line of lines) {
                try {
                    let q = JSON.parse(line.trim());
                    if (isFinite(q.ph)) s.ph = +q.ph;
                    if (isFinite(q.turbidity)) s.turbidity = +q.turbidity;
                    if (isFinite(q.temperature)) s.temperature = +q.temperature;
                    if (isFinite(q.level)) s.level = +q.level;
                    update();
                } catch (e) {
                    // Ignora linhas mal formatadas
                }
            }
        }
    } catch (e) {
        console.log("Erro na conexão serial:", e);
    }
}

// --- INICIALIZAÇÃO ---
$("connect").onclick = serial;
update();

// Simulação automática (roda a cada 8 segundos se não estiver conectado)
setInterval(() => {
    if (port) return; // Se estiver conectado, não simula
    s.temperature = clamp(s.temperature + (Math.random() - .5) * .3, 10, 40);
    s.turbidity = clamp(s.turbidity + (Math.random() - .5) * 3, 0, 200);
    s.ph = clamp(s.ph + (Math.random() - .5) * .05, 4, 10);
    s.level = clamp(s.level + (Math.random() - .5) * 1.5, 0, 100);
    update();
}, 8000);