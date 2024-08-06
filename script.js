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

/**
 * Cria uma expressão regular para busca e substituição de texto
 * @param {Object} regras - Regras de substituição
 * @returns {RegExp} - Expressão regular para substituição
 */
function criarExpressaoRegular(regras) {
    const chavesOrdenadas = Object.keys(regras).sort((a, b) => b.length - a.length);
    return new RegExp(chavesOrdenadas.join('|'), 'g');
}

const regexCripto = criarExpressaoRegular(regrasSubstituicaoCripto);
const regexDescripto = criarExpressaoRegular(regrasSubstituicaoDescripto);

/**
 * Criptografa um texto substituindo caracteres conforme as regras
 * @param {string} texto - Texto a ser criptografado
 * @returns {string} - Texto criptografado
 */
function criptografarTexto(texto) {
    return texto.toLowerCase().replace(/[eiaou]/g, char => regrasSubstituicaoCripto[char] || char);
}

/**
 * Descriptografa um texto substituindo sequências conforme as regras
 * @param {string} textoCripto - Texto criptografado
 * @returns {string} - Texto descriptografado
 */
function descriptografarTexto(textoCripto) {
    return textoCripto.toLowerCase().replace(regexDescripto, seq => regrasSubstituicaoDescripto[seq] || seq);
}


let cacheElementosDOM = {};

/**
 * Obtém os elementos do DOM e utiliza cache para evitar múltiplas consultas.
 * @returns {Object} - Elementos do DOM
 */
function obterElementosDOM() {
    if (!cacheElementosDOM.textoElemento) {
        cacheElementosDOM = {
            textoElemento: document.querySelector("#texto"),
            mensagemResultadoElemento: document.querySelector("#mensagemResultado"),
            botaoCopiar: document.querySelector("#btn-copy"),
            mensagemInput: document.querySelector("#digiteMensagem"),
        };
    }
    return cacheElementosDOM;
}

/**
 * Valida e ajusta o texto, removendo caracteres inválidos e truncando conforme necessário
 * @param {string} texto - Texto a ser validado
 * @returns {string} - Texto validado e truncado
 */
function validarETruncarTexto(texto) {
    return texto.toLowerCase().replace(/[^a-z]/g, '');
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

/**
 * Processa a criptografia ou descriptografia com base no tipo de operação
 * @param {string} tipoOperacao - Tipo de operação ("criptografar" ou "descriptografar")
 */
function processarOperacao(tipoOperacao) {
    const { textoElemento, mensagemResultadoElemento, botaoCopiar, mensagemInput } = obterElementosDOM();
    if (!textoElemento || !mensagemResultadoElemento || !botaoCopiar || !mensagemInput) {
        console.error("Elementos necessários não encontrados no DOM.");
        return;
    }

    const texto = validarETruncarTexto(textoElemento.value.trim());
    if (!texto) {
        mensagemResultadoElemento.textContent = "";
        mensagemInput.style.display = "block";
        botaoCopiar.classList.remove("visible");
        return;
    }

    const operacoes = {
        criptografar: () => criptografarTexto(texto),
        descriptografar: () => descriptografarTexto(texto)
    };

    if (!operacoes[tipoOperacao]) {
        console.error("Operação inválida");
        return;
    }

    mensagemResultadoElemento.textContent = operacoes[tipoOperacao]();
    mensagemInput.style.display = "none";
    botaoCopiar.classList.add("visible");
}

let timeoutFeedback;

/**
 * Exibe uma mensagem de feedback para o usuário
 * @param {string} mensagem - Mensagem a ser exibida
 * @param {string} tipo - Tipo de feedback ('', 'warning' ou 'error')
 */
function mostrarMensagemFeedback(mensagem, tipo = '') {
    if (timeoutFeedback) {
        clearTimeout(timeoutFeedback);
        const elementoFeedbackAntigo = document.querySelector(".feedback");
        if (elementoFeedbackAntigo) elementoFeedbackAntigo.remove();
    }
    
    const elementoFeedback = document.createElement('div');
    elementoFeedback.textContent = mensagem;
    elementoFeedback.className = `feedback ${tipo}`;
    document.body.appendChild(elementoFeedback);
    
    timeoutFeedback = setTimeout(() => elementoFeedback.remove(), 2000);
}

function copiarTextoParaAreaTransferencia() {
    const resultadoElemento = document.querySelector("#mensagemResultado");
    const resultado = resultadoElemento?.textContent;

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
    
    document.querySelector("#btn-descript").addEventListener("click", () => processarOperacao("descriptografar"));
    document.querySelector("#btn-cript").addEventListener("click", () => processarOperacao("criptografar"));
    document.querySelector("#btn-copy").addEventListener("click", copiarTextoParaAreaTransferencia);
    document.querySelector("#texto").addEventListener("input", verificarTamanhoTexto);
}

document.addEventListener("DOMContentLoaded", configurarEventos);
