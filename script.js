// regras de mapeamento para criptografia
const regrasCripto = {
    e: "enter",
    i: "imes",
    a: "ai",
    o: "ober",
    u: "ufat"
};

// cria o inverso das regras para descriptografar 
const regrasDescripto = Object.fromEntries(
    Object.entries(regrasCripto).map(([k, v]) => [v, k])
);

function criarRegex(obj) {
    return new RegExp(Object.keys(obj).join('|'), 'g');
}

const regexCripto = criarRegex(regrasCripto);
const regexDescripto = criarRegex(regrasDescripto);

function criptografar(texto) {
    return texto.toLowerCase().replace(/[eiaou]/g, char => regrasCripto[char] || char);
}

function descriptografar(cripto) {
    return cripto.toLowerCase().replace(regexDescripto, seq => regrasDescripto[seq] || seq);
}

// evitar multiplas consultas 
let elementosCache = {};

function obterElementos() {
    if (!elementosCache.textoElem) {
        elementosCache = {
            textoElem: document.querySelector("#texto"),
            mensagemResultadoElem: document.querySelector("#mensagemResultado"),
            btnCopy: document.querySelector("#btn-copy"),
            digiteMensagem: document.querySelector("#digiteMensagem"),
        };
    }
    return elementosCache;
}

function verificarConteudo() {
    const { textoElem } = obterElementos();
    if (textoElem.innerText.trim() === '') {
        textoElem.querySelector('.placeholder').style.display = 'block';
    } else {
        textoElem.querySelector('.placeholder').style.display = 'none';
    }
}

function processar(tipoOperacao) {
    const { textoElem, mensagemResultadoElem, btnCopy, digiteMensagem } = obterElementos();

    // verifica se os elementos necessarios foram encontrados
    if (!textoElem || !mensagemResultadoElem || !btnCopy || !digiteMensagem) {
        console.error("Elementos necessários não encontrados no DOM.");
        return;
    }

    const texto = textoElem.innerText.trim();

    // se não houver texto, atualiza a interface
    if (!texto) {
        mensagemResultadoElem.textContent = "";
        digiteMensagem.style.display = "block";
        btnCopy.classList.remove("visible");
        return;
    }

    const operacoes = {
        criptografar: () => criptografar(texto),
        descriptografar: () => descriptografar(texto)
    };

    // verifica se a operaçao é valida
    if (!operacoes[tipoOperacao]) {
        console.error("Operação inválida");
        return;
    }

    // atualiza com o resultado
    mensagemResultadoElem.textContent = operacoes[tipoOperacao]();
    digiteMensagem.style.display = "none";
    btnCopy.classList.add("visible");
}

// mensagem de feedback para o usuário
function mostrarFeedback(mensagem, tipo = '') {
    const feedbackElem = document.createElement('div');
    feedbackElem.textContent = mensagem;
    feedbackElem.className = `feedback ${tipo}`;
    document.body.appendChild(feedbackElem);
    // remove após 2 segundos
    setTimeout(() => feedbackElem.remove(), 2000);
}

function copiarTexto() {
    const resultadoElem = document.querySelector("#mensagemResultado");
    const resultado = resultadoElem.textContent;

    if (resultado) {
        navigator.clipboard.writeText(resultado)
            .then(() => mostrarFeedback("Texto copiado para a área de transferência!"))
            .catch(err => {
                console.error('Erro ao copiar texto: ', err);
                mostrarFeedback("Erro ao copiar texto!", 'error');
            });
    } else {
        mostrarFeedback("Nenhum texto para copiar.", 'warning');
    }
}

function inicializarEventos() {
    document.querySelector("#btn-descript").addEventListener("click", () => processar("descriptografar"));
    document.querySelector("#btn-cript").addEventListener("click", () => processar("criptografar"));
    document.querySelector("#btn-copy").addEventListener("click", copiarTexto);
}

document.addEventListener("DOMContentLoaded", inicializarEventos);
