const categorias = ["Varões", "Senhoras", "Jovens", "Cias"];

function criarLinha(cat, tipo) {
    return `
        <div class="row">
            <span class="label">${cat}</span>

            <div class="controls">
                <button class="btn" onclick="alterar('${tipo}_${cat}', -1)">-</button>
                <span id="${tipo}_${cat}" class="value">0</span>
                <button class="btn" onclick="alterar('${tipo}_${cat}', 1)">+</button>
            </div>
        </div>
    `;
}

document.getElementById("membros-section").innerHTML =
    categorias.map(c => criarLinha(c, "m")).join("");

document.getElementById("visitantes-section").innerHTML =
    categorias.map(c => criarLinha(c, "v")).join("");

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

async function gerarImagem() {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    // DEFINIR TAMANHO ANTES DE DESENHAR
    canvas.width = 800;
    canvas.height = 1000;

    // AGORA SIM — FUNDO BRANCO
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await document.fonts.ready;

    ctx.fillStyle = "#000";
    ctx.font = "28px Poppins";

    let y = 60;

    ctx.fillText("CONTAGEM ICM Araçás III", 20, y); y += 40;
    ctx.fillText("Quem está preenchendo: " + document.getElementById("responsavel").value, 20, y); y += 30;
    ctx.fillText("Data: " + document.getElementById("data").value, 20, y); y += 40;

    ctx.fillText("MEMBROS: " + document.getElementById("totalMembros").innerText, 20, y); y += 40;

    categorias.forEach(c => {
        ctx.font = "24px Poppins";
        ctx.fillText(`${c}: ${document.getElementById("m_" + c).innerText}`, 40, y);
        y += 30;
    });

    y += 20;
    ctx.font = "28px Poppins";
    ctx.fillText("VISITANTES: " + document.getElementById("totalVisitantes").innerText, 20, y); y += 40;

    categorias.forEach(c => {
        ctx.font = "24px Poppins";
        ctx.fillText(`${c}: ${document.getElementById("v_" + c).innerText}`, 40, y);
        y += 30;
    });

    y += 20;
    ctx.font = "28px Poppins";
    ctx.fillText("ONLINE: " + document.getElementById("online").innerText, 20, y); y += 40;

    ctx.fillText("TOTAL GERAL: " + document.getElementById("totalGeral").innerText, 20, y);

    const img = canvas.toDataURL("image/png");

    document.getElementById("resultado").innerHTML =
        `<img src="${img}" style="width:100%;margin-top:20px;border:1px solid #000">`;
}

async function compartilharWhatsApp() {

    const canvas = document.getElementById("canvas");

    canvas.toBlob(async function (blob) {

        if (!blob) {
            alert("Gere a imagem primeiro!");
            return;
        }

        const arquivo = new File([blob], "contagem_icm.png", { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
            try {
                await navigator.share({
                    files: [arquivo],
                    title: "Contagem ICM",
                    text: "Segue a contagem de hoje!"
                });

            } catch (err) {
                console.error("Erro ao compartilhar:", err);
            }
        } else {
            alert("Seu dispositivo não suporta compartilhamento de imagens pelo navegador.");
        }

    }, "image/png");
}
