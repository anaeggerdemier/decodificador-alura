// Regras de mapeamento para criptografia
const regrasCripto = {
    e: "enter",
    i: "imes",
    a: "ai",
    o: "ober",
    u: "ufat"
};

// Cria o inverso das regras para descriptografar
const regrasDescripto = Object.fromEntries(
    Object.entries(regrasCripto).map(([k, v]) => [v, k])
);

/**
 * Cria uma expressão regular a partir de um objeto de regras
 * @param {Object} obj - Objeto contendo regras de substituição
 * @returns {RegExp} - Expressão regular gerada
 */
function criarRegex(obj) {
    const sortedKeys = Object.keys(obj).sort((a, b) => b.length - a.length); 
    return new RegExp(sortedKeys.join('|'), 'g');
}

const regexCripto = criarRegex(regrasCripto);
const regexDescripto = criarRegex(regrasDescripto);

/**
 * Criptografa um texto substituindo caracteres de acordo com as regras definidas
 * @param {string} texto - texto a ser criptografado
 * @returns {string} - texto criptografado
 */
function criptografar(texto) {
    return texto.toLowerCase().replace(/[eiaou]/g, char => regrasCripto[char] || char);
}

/**
 * Descriptografa um texto substituindo sequências de acordo com as regras definidas
 * @param {string} cripto - texto criptografado
 * @returns {string} - texto descriptografado
 */
function descriptografar(cripto) {
    return cripto.toLowerCase().replace(regexDescripto, seq => regrasDescripto[seq] || seq);
}

// Evitar múltiplas consultas ao DOM
let elementosCache = {};

/**
 * Obtém os elementos do DOM, utilizando cache para evitar múltiplas consultas.
 * @returns {Object} - objeto contendo os elementos do DOM
 */
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

/**
 * Valida e ajusta o texto removendo caracteres não permitidos e truncando se necessário
 * @param {string} texto - texto a ser validado
 * @returns {string} - Texto validado e truncado
 */
function validarTexto(texto) {
    return texto.toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Garante que o texto não exceda o limite
 */
function verificarConteudo() {
    const { textoElem } = obterElementos();
    const limite = parseInt(textoElem.getAttribute('data-limit'), 10);
    let texto = validarTexto(textoElem.value); 

    if (texto.length > limite) {
        texto = texto.substring(0, limite); // Trunca o texto
        mostrarFeedback(`O limite de ${limite} caracteres foi atingido.`, 'warning');
    }

    textoElem.value = texto;
}

/**
 * Processa a operação de criptografia ou descriptografia 
 * @param {string} tipoOperacao - tipo de operação ("criptografar" ou "descriptografar")
 */
function processar(tipoOperacao) {
    const { textoElem, mensagemResultadoElem, btnCopy, digiteMensagem } = obterElementos();
    if (!textoElem || !mensagemResultadoElem || !btnCopy || !digiteMensagem) {
        console.error("Elementos necessários não encontrados no DOM.");
        return;
    }

    const texto = validarTexto(textoElem.value.trim()); 
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

    if (!operacoes[tipoOperacao]) {
        console.error("Operação inválida");
        return;
    }

    mensagemResultadoElem.textContent = operacoes[tipoOperacao]();
    digiteMensagem.style.display = "none";
    btnCopy.classList.add("visible");
}

let feedbackTimeout;

/**
 * Exibe uma mensagem de feedback para o usuário.
 * @param {string} mensagem - mensagem a ser exibida.
 * @param {string} tipo - tipo de feedback ('', 'warning' ou 'error').
 */
function mostrarFeedback(mensagem, tipo = '') {
    if (feedbackTimeout) {
        clearTimeout(feedbackTimeout);
        const oldFeedbackElem = document.querySelector(".feedback");
        if (oldFeedbackElem) oldFeedbackElem.remove();
    }
    
    const feedbackElem = document.createElement('div');
    feedbackElem.textContent = mensagem;
    feedbackElem.className = `feedback ${tipo}`;
    document.body.appendChild(feedbackElem);
    
    feedbackTimeout = setTimeout(() => feedbackElem.remove(), 2000);
}

/**
 * Copia o texto do resultado para a área de transferência.
 */
function copiarTexto() {
    const resultadoElem = document.querySelector("#mensagemResultado");
    const resultado = resultadoElem?.textContent;

    if (!resultado) {
        return mostrarFeedback("Nenhum texto para copiar.", 'warning');
    }

    navigator.clipboard.writeText(resultado)
        .then(() => mostrarFeedback("Texto copiado para a área de transferência!"))
        .catch(err => {
            console.error('Erro ao copiar texto: ', err);
            mostrarFeedback("Erro ao copiar texto!", 'error');
        });
}

let eventosInicializados = false;

/**
 * Inicializa os eventos dos botões.
 */
function inicializarEventos() {
    if (eventosInicializados) return;
    eventosInicializados = true;
    
    document.querySelector("#btn-descript").addEventListener("click", () => processar("descriptografar"));
    document.querySelector("#btn-cript").addEventListener("click", () => processar("criptografar"));
    document.querySelector("#btn-copy").addEventListener("click", copiarTexto);
    document.querySelector("#texto").addEventListener("input", verificarConteudo);
}

document.addEventListener("DOMContentLoaded", inicializarEventos);
