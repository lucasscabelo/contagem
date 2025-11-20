const categorias = ["Varões", "Senhoras", "Jovens", "CIAS"];

// -------------------------------
// CRIAR LINHAS
// -------------------------------

function criarLinha(cat, tipo) {
    return `
    <div class="row">
        <span class="label">${cat}</span>
        <div class="controls">
            <button class="btn" onclick="alterar('${tipo}_${cat}', -1)">-</button>
            <span id="${tipo}_${cat}" class="value">0</span>
            <button class="btn" onclick="alterar('${tipo}_${cat}', 1)">+</button>
        </div>
    </div>`;
}

// -------------------------------
// CAMPOS DE NOMES COM AUTO-RESIZE
// -------------------------------

function criarCampoNomes(cat) {
    return `
    <textarea id="nomes_${cat}" rows="1" 
        placeholder="Digite os nomes..."
        oninput="autoResize(this)"></textarea>
    `;
}

document.getElementById("membros-section").innerHTML =
    categorias.map(c => criarLinha(c, "m")).join("");

document.getElementById("visitantes-section").innerHTML =
    categorias.map(c => criarLinha(c, "v") + criarCampoNomes(c)).join("");

// -------------------------------
// AUTO-RESIZE DOS TEXTAREAS
// -------------------------------

function autoResize(el) {
    el.style.height = "auto";
    el.style.height = (el.scrollHeight) + "px";
}

// -------------------------------
// CONTADORES
// -------------------------------

function alterar(campo, valor) {
    let el = document.getElementById(campo);
    let num = parseInt(el.innerText) + valor;
    if (num < 0) num = 0;
    el.innerText = num;
    atualizarTotais();
}

function atualizarTotais() {
    let totalM = 0;
    let totalV = 0;

    categorias.forEach(c => {
        totalM += parseInt(document.getElementById("m_" + c).innerText);
        totalV += parseInt(document.getElementById("v_" + c).innerText);
    });

    document.getElementById("totalMembros").innerText = totalM;
    document.getElementById("totalVisitantes").innerText = totalV;

    let online = parseInt(document.getElementById("online").innerText);
    let totalGeral = totalM + totalV + online;

    document.getElementById("totalGeral").innerText = totalGeral;
}

// -------------------------------
// FUNÇÃO DE QUEBRA DE LINHA
// -------------------------------

function wrapText(context, text, x, y, maxWidth, lineHeight) {
    text = text.replace(/\r\n|\r/g, "\n");  // <<< CORREÇÃO OBRIGATÓRIA

    const lines = text.split("\n"); // respeita ENTER

    lines.forEach(line => {
        const words = line.split(" ");
        let current = "";

        words.forEach(word => {
            let testLine = current + word + " ";
            if (context.measureText(testLine).width > maxWidth) {
                context.fillText(current, x, y);
                current = word + " ";
                y += lineHeight;
            } else {
                current = testLine;
            }
        });

        context.fillText(current, x, y);
        y += lineHeight;
    });

    return y;
}

// -------------------------------
// GERAR IMAGEM
// -------------------------------

async function gerarImagem() {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 800;
    canvas.height = 1180;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await document.fonts.ready;

    const logo = new Image();
    logo.src = "logo.png";
    await new Promise(resolve => logo.onload = resolve);

    ctx.drawImage(logo, 300, 30, 200, 200);

    let y = 260;

    ctx.fillStyle = "#000";
    ctx.textAlign = "left";

    ctx.font = "bold 32px Poppins";
    ctx.fillText("Contagem - ICM Araçás III", 20, y);
    y += 50;

    ctx.font = "26px Poppins";
    ctx.fillText("Quem está preenchendo: " + document.getElementById("responsavel").value, 20, y);
    y += 40;

    ctx.fillText("Data: " + document.getElementById("data").value, 20, y);
    y += 50;

    // MEMBROS
    ctx.font = "bold 28px Poppins";
    ctx.fillText("MEMBROS: " + document.getElementById("totalMembros").innerText, 20, y);
    y += 45;

    categorias.forEach(c => {
        ctx.font = "24px Poppins";
        ctx.fillText(`${c}: ${document.getElementById("m_" + c).innerText}`, 40, y);
        y += 35;
    });

    y += 25;

    ctx.font = "bold 28px Poppins";
    ctx.fillText("VISITANTES: " + document.getElementById("totalVisitantes").innerText, 20, y);
    y += 45;

    // Visitantes + Nomes com QUEBRA AUTOMÁTICA
    categorias.forEach(c => {
        ctx.font = "24px Poppins";
        ctx.fillText(`${c}: ${document.getElementById("v_" + c).innerText}`, 40, y);
        y += 30;

        let nomes = document.getElementById("nomes_" + c).value.trim();
        nomes = nomes.replace(/\r\n|\r/g, "\n"); // <<< ESSENCIAL

        if (nomes !== "") {
            ctx.font = "20px Poppins";
            y = wrapText(ctx, "• " + nomes, 60, y, 650, 28);
            y += 10;
        }
    });

    y += 25;

    ctx.font = "bold 28px Poppins";
    ctx.fillText("ONLINE: " + document.getElementById("online").innerText, 20, y);
    y += 50;

    ctx.font = "bold 30px Poppins";
    ctx.fillText("TOTAL GERAL: " + document.getElementById("totalGeral").innerText, 20, y);

    const img = canvas.toDataURL("image/png");
    document.getElementById("resultado").innerHTML =
        `<img src="${img}" style="width:100%;margin-top:20px;border:1px solid #000">`;
}

// -------------------------------
// BOTÃO: COMPARTILHAR
// -------------------------------

async function compartilharWhatsApp() {
    const canvas = document.getElementById("canvas");

    canvas.toBlob(async function (blob) {
        if (!blob) {
            alert("Gere a imagem primeiro!");
            return;
        }

        const arquivo = new File([blob], "contagem_icm.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
            await navigator.share({
                files: [arquivo],
                title: "Contagem ICM",
                text: "Segue a contagem de hoje!"
            });
        } else {
            alert("Seu dispositivo não suporta compartilhamento pelo navegador.");
        }

    }, "image/png");
}

// -------------------------------
// BOTÃO: COPIAR TEXTO
// -------------------------------

function copiarTexto() {
    let texto = `Contagem - ICM Araçás III\n`;
    texto += `Quem está preenchendo: ${document.getElementById("responsavel").value}\n`;
    texto += `Data: ${document.getElementById("data").value}\n\n`;

    texto += `MEMBROS (Total: ${document.getElementById("totalMembros").innerText})\n`;
    categorias.forEach(c => {
        texto += `- ${c}: ${document.getElementById("m_" + c).innerText}\n`;
    });

    texto += `\nVISITANTES (Total: ${document.getElementById("totalVisitantes").innerText})\n`;
    categorias.forEach(c => {
        const qnt = document.getElementById("v_" + c).innerText;
        let nomes = document.getElementById("nomes_" + c).value.trim();
        nomes = nomes.replace(/\r\n|\r/g, "\n");

        texto += `- ${c}: ${qnt}\n`;

        if (nomes !== "") {
            texto += `  • ${nomes}\n`;
        }
    });

    texto += `\nOnline: ${document.getElementById("online").innerText}\n`;
    texto += `TOTAL GERAL: ${document.getElementById("totalGeral").innerText}\n`;

    navigator.clipboard.writeText(texto)
        .then(() => alert("Texto copiado!"))
        .catch(() => alert("Erro ao copiar texto."));
}

