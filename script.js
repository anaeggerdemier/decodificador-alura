const regrasSubstituicaoCripto = {
    e: "enter",
    i: "imes",
    a: "ai",
    o: "ober",
    u: "ufat"
};

const regrasSubstituicaoDescripto = Object.fromEntries(
    Object.entries(regrasSubstituicaoCripto).map(([chave, valor]) => [valor, chave])
);

const regexDescripto = criarExpressaoRegular(regrasSubstituicaoDescripto);

function criarExpressaoRegular(regras) {
    return new RegExp(Object.keys(regras).join('|'), 'g');
}

function substituirTexto(texto, regras, regex) {
    return texto.replace(regex, seq => regras[seq] || seq);
}

function criptografarTexto(texto) {
    return substituirTexto(texto.toLowerCase(), regrasSubstituicaoCripto, /[eiaou]/g);
}

function descriptografarTexto(textoCripto) {
    return substituirTexto(textoCripto.toLowerCase(), regrasSubstituicaoDescripto, regexDescripto);
}

let cacheElementosDOM = {};

function obterElementosDOM() {
    if (!cacheElementosDOM.textoElemento || !document.body.contains(cacheElementosDOM.textoElemento)) {
        cacheElementosDOM = {
            textoElemento: document.querySelector("#texto"),
            mensagemResultadoElemento: document.querySelector("#mensagemResultado"),
            botaoCopiar: document.querySelector("#btn-copy"),
            mensagemInput: document.querySelector("#digiteMensagem"),
            imagemElemento: document.querySelector("#imagem1"),
        };
    }
    return cacheElementosDOM;
}

function validarETruncarTexto(texto) {
    return texto.toLowerCase().replace(/[^a-z\s]/g, '');
}

function verificarTamanhoTexto() {
    const { textoElemento } = obterElementosDOM();
    const limite = parseInt(textoElemento.getAttribute('data-limit'), 10);
    let texto = validarETruncarTexto(textoElemento.value);

    if (texto.length > limite) {
        texto = texto.substring(0, limite);
        mostrarMensagemFeedback(`O limite de ${limite} caracteres foi atingido.`, 'warning');
    }

    textoElemento.value = texto;
}

function limparFormulario() {
    const { textoElemento, mensagemResultadoElemento, mensagemInput, botaoCopiar, imagemElemento } = obterElementosDOM();

    if (textoElemento) textoElemento.value = '';
    if (mensagemResultadoElemento) mensagemResultadoElemento.textContent = '';
    if (mensagemInput) mensagemInput.style.display = 'block';
    if (botaoCopiar) botaoCopiar.classList.remove('visible');
    if (imagemElemento) {
        imagemElemento.classList.remove('hidden');
        imagemElemento.classList.add('visible');
    }
}

function processarOperacao(tipoOperacao) {
    const { textoElemento, mensagemResultadoElemento, botaoCopiar, mensagemInput, imagemElemento } = obterElementosDOM();

    if (!textoElemento || !mensagemResultadoElemento || !botaoCopiar || !mensagemInput || !imagemElemento) {
        console.error("Elementos necessários não encontrados no DOM.");
        return;
    }

    const texto = validarETruncarTexto(textoElemento.value.trim());

    if (!texto) {
        limparFormulario(); 
        return;
    }

    const botaoCript = document.querySelector("#btn-cript");
    const botaoDescript = document.querySelector("#btn-descript");
    botaoCript.disabled = botaoDescript.disabled = true;
    botaoCript.textContent = botaoDescript.textContent = "Processando...";

    const resultado = tipoOperacao === "criptografar" ? criptografarTexto(texto) : descriptografarTexto(texto);

    mensagemResultadoElemento.textContent = resultado;

    botaoCript.disabled = botaoDescript.disabled = false;
    botaoCript.textContent = "Criptografar";
    botaoDescript.textContent = "Descriptografar";

    if (resultado) {
        mensagemInput.style.display = "none";
        botaoCopiar.classList.add("visible");
        imagemElemento.classList.remove("visible");
        imagemElemento.classList.add("hidden");
    } else {
        limparFormulario();
    }
}

let timeoutFeedback;

function mostrarMensagemFeedback(mensagem, tipo = '') {
    if (timeoutFeedback) {
        clearTimeout(timeoutFeedback);
    }

    const elementoFeedbackAntigo = document.querySelector(".feedback");
    if (elementoFeedbackAntigo) elementoFeedbackAntigo.remove();

    const elementoFeedback = document.createElement('div');
    elementoFeedback.textContent = mensagem;
    elementoFeedback.className = `feedback ${tipo}`;
    document.body.appendChild(elementoFeedback);

    timeoutFeedback = setTimeout(() => elementoFeedback.remove(), 3000);
}

function copiarTextoParaAreaTransferencia() {
    const { mensagemResultadoElemento } = obterElementosDOM();
    const resultado = mensagemResultadoElemento?.textContent;

    if (!resultado) {
        return mostrarMensagemFeedback("Nenhum texto para copiar.", 'warning');
    }

    navigator.clipboard.writeText(resultado)
        .then(() => mostrarMensagemFeedback("Texto copiado para a área de transferência!"))
        .catch(err => {
            console.error('Erro ao copiar texto: ', err);
            mostrarMensagemFeedback("Erro ao copiar texto!", 'error');
        });
}

let eventosConfigurados = false;

function configurarEventos() {
    if (eventosConfigurados) return;
    eventosConfigurados = true;

    const { textoElemento, botaoCopiar } = obterElementosDOM();

    textoElemento.addEventListener("input", function() {
        autoResizeTextEdit(textoElemento);
    });

    document.querySelector("#btn-descript").addEventListener("click", () => processarOperacao("descriptografar"));
    document.querySelector("#btn-cript").addEventListener("click", () => processarOperacao("criptografar"));
    botaoCopiar.addEventListener("click", copiarTextoParaAreaTransferencia);
    textoElemento.addEventListener("input", verificarTamanhoTexto);
}

function autoResizeTextEdit(textarea) {
    textarea.style.height = 'auto'; 
    textarea.style.height = (textarea.scrollHeight + 96) + 'px'; 
}

document.addEventListener("DOMContentLoaded", configurarEventos);