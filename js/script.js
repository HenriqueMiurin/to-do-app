// Seleção dos elementos da interface
const campoDescricao = document.getElementById("descricaoTarefa");
const seletorPrioridade = document.getElementById("prioridadeTarefa");
const campoData = document.getElementById("dataTarefa");
const campoHora = document.getElementById("horaTarefa");
const botaoAdicionar = document.getElementById("btnAdicionar");
const listaTarefas = document.getElementById("listaTarefas");

const seletorItensPorPagina = document.getElementById("itensPorPagina");
const botaoAnterior = document.getElementById("btnAnterior");
const botaoProxima = document.getElementById("btnProxima");
const textoPaginaAtual = document.getElementById("paginaAtual");
const contadorTarefas = document.getElementById("contadorTarefas");
const btnSilenciarAlarme = document.getElementById("btnSilenciarAlarme");

// Array que armazena todas as tarefas
const tarefas = [];

// Variáveis da paginação
let paginaAtual = 1;
let itensPorPagina = 10;

// Variáveis do alarme contínuo
let contextoAudio = null;
let intervaloAlarme = null;
let alarmeAtivo = false;

// Função para formatar data e hora
function formatarDataHora(data, hora) {
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano} às ${hora}`;
}

// Função para criar objeto Date completo
function criarDataHoraCompleta(data, hora) {
    return new Date(`${data}T${hora}:00`);
}

// Toca um padrão eletrônico insistente, em ciclos
function tocarPadraoAlarme() {
    if (!contextoAudio) {
        contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
    }

    const agora = contextoAudio.currentTime;

    const frequencias = [880, 740, 880, 740];
    let deslocamento = 0;

    frequencias.forEach(function (frequencia) {
        const oscilador = contextoAudio.createOscillator();
        const ganho = contextoAudio.createGain();

        oscilador.type = "triangle";
        oscilador.frequency.setValueAtTime(frequencia, agora + deslocamento);

        ganho.gain.setValueAtTime(0.0001, agora + deslocamento);
        ganho.gain.exponentialRampToValueAtTime(0.18, agora + deslocamento + 0.02);
        ganho.gain.exponentialRampToValueAtTime(0.0001, agora + deslocamento + 0.28);

        oscilador.connect(ganho);
        ganho.connect(contextoAudio.destination);

        oscilador.start(agora + deslocamento);
        oscilador.stop(agora + deslocamento + 0.30);

        deslocamento += 0.32;
    });
}

// Inicia o alarme contínuo
function iniciarAlarmeContinuo() {
    if (alarmeAtivo) {
        return;
    }

    alarmeAtivo = true;
    btnSilenciarAlarme.classList.remove("oculto");

    tocarPadraoAlarme();

    intervaloAlarme = setInterval(function () {
        tocarPadraoAlarme();
    }, 1500);
}

// Para o alarme contínuo
function pararAlarmeContinuo() {
    if (intervaloAlarme) {
        clearInterval(intervaloAlarme);
        intervaloAlarme = null;
    }

    alarmeAtivo = false;
    btnSilenciarAlarme.classList.add("oculto");
}

// Atualiza contador
function atualizarContador() {
    const total = tarefas.length;
    contadorTarefas.textContent = total === 1 ? "1 tarefa" : `${total} tarefas`;
}

// Calcula total de páginas
function calcularTotalPaginas() {
    if (itensPorPagina === "todos") {
        return 1;
    }

    return Math.ceil(tarefas.length / itensPorPagina) || 1;
}

// Verifica prazos e decide se deve disparar o alarme
function verificarPrazos() {
    const agora = new Date();
    let existeAlertaAtivo = false;

    tarefas.forEach(function (tarefa) {
        const dataLimite = criarDataHoraCompleta(tarefa.data, tarefa.hora);

        if (tarefa.concluida) {
            tarefa.statusTempo = "concluida";
            return;
        }

        if (agora > dataLimite) {
            tarefa.statusTempo = "vencida";
            existeAlertaAtivo = true;
            return;
        }

        const diferencaEmMilissegundos = dataLimite - agora;
        const diferencaEmMinutos = diferencaEmMilissegundos / 1000 / 60;

        if (diferencaEmMinutos <= 1 && diferencaEmMinutos >= 0) {
            tarefa.statusTempo = "alerta";
            existeAlertaAtivo = true;
        } else {
            tarefa.statusTempo = "normal";
        }
    });

    // Se houver qualquer tarefa em alerta ou vencida, dispara o alarme
    if (existeAlertaAtivo) {
        iniciarAlarmeContinuo();
    }
}

// Renderiza as tarefas
function renderizarTarefas() {
    listaTarefas.innerHTML = "";

    verificarPrazos();
    atualizarContador();

    if (tarefas.length === 0) {
        listaTarefas.innerHTML = `<li class="mensagem-vazia">Nenhuma tarefa cadastrada.</li>`;
        textoPaginaAtual.textContent = "Página 1 de 1";
        botaoAnterior.disabled = true;
        botaoProxima.disabled = true;
        return;
    }

    let tarefasDaPagina = [];

    if (itensPorPagina === "todos") {
        tarefasDaPagina = tarefas;
    } else {
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        tarefasDaPagina = tarefas.slice(inicio, fim);
    }

    tarefasDaPagina.forEach(function (tarefaObj) {
        const itemLista = document.createElement("li");
        itemLista.classList.add("tarefa", tarefaObj.prioridade);

        if (tarefaObj.concluida) {
            itemLista.classList.add("concluida");
        }

        if (tarefaObj.statusTempo === "alerta") {
            itemLista.classList.add("em-alerta");
        }

        if (tarefaObj.statusTempo === "vencida") {
            itemLista.classList.add("vencida");
        }

        const infoTarefa = document.createElement("div");
        infoTarefa.classList.add("info-tarefa");

        const textoTarefa = document.createElement("span");
        textoTarefa.classList.add("texto-tarefa");
        textoTarefa.textContent = tarefaObj.descricao;

        const prioridadeLabel = document.createElement("span");
        prioridadeLabel.classList.add("prioridade-label");
        prioridadeLabel.textContent = `Prioridade: ${tarefaObj.prioridade.toUpperCase()}`;

        const dataHoraLabel = document.createElement("span");
        dataHoraLabel.classList.add("data-hora-label");
        dataHoraLabel.textContent = `Prazo: ${formatarDataHora(tarefaObj.data, tarefaObj.hora)}`;

        const statusAlerta = document.createElement("span");
        statusAlerta.classList.add("status-alerta");

        if (tarefaObj.concluida) {
            statusAlerta.textContent = "Status: concluída";
        } else if (tarefaObj.statusTempo === "alerta") {
            statusAlerta.textContent = "Status: atenção, tarefa no horário limite";
        } else if (tarefaObj.statusTempo === "vencida") {
            statusAlerta.textContent = "Status: tarefa vencida";
        } else {
            statusAlerta.textContent = "Status: dentro do prazo";
        }

        infoTarefa.appendChild(textoTarefa);
        infoTarefa.appendChild(prioridadeLabel);
        infoTarefa.appendChild(dataHoraLabel);
        infoTarefa.appendChild(statusAlerta);

        const acoesTarefa = document.createElement("div");
        acoesTarefa.classList.add("acoes-tarefa");

        const botaoConcluir = document.createElement("button");
        botaoConcluir.classList.add("btn-concluir");
        botaoConcluir.textContent = tarefaObj.concluida ? "Reabrir" : "Concluir";

        botaoConcluir.addEventListener("click", function () {
            tarefaObj.concluida = !tarefaObj.concluida;

            // Se todas as tarefas em alerta forem concluídas, some com o sino e para o alarme
            const aindaExisteAlerta = tarefas.some(function (tarefa) {
                return !tarefa.concluida && (tarefa.statusTempo === "alerta" || tarefa.statusTempo === "vencida");
            });

            if (!aindaExisteAlerta) {
                pararAlarmeContinuo();
            }

            renderizarTarefas();
        });

        const botaoRemover = document.createElement("button");
        botaoRemover.classList.add("btn-remover");
        botaoRemover.textContent = "Remover";

        botaoRemover.addEventListener("click", function () {
            const indiceReal = tarefas.indexOf(tarefaObj);

            if (indiceReal !== -1) {
                tarefas.splice(indiceReal, 1);
            }

            const totalPaginas = calcularTotalPaginas();

            if (paginaAtual > totalPaginas) {
                paginaAtual = totalPaginas;
            }

            const aindaExisteAlerta = tarefas.some(function (tarefa) {
                return !tarefa.concluida && (tarefa.statusTempo === "alerta" || tarefa.statusTempo === "vencida");
            });

            if (!aindaExisteAlerta) {
                pararAlarmeContinuo();
            }

            renderizarTarefas();
        });

        acoesTarefa.appendChild(botaoConcluir);
        acoesTarefa.appendChild(botaoRemover);

        itemLista.appendChild(infoTarefa);
        itemLista.appendChild(acoesTarefa);

        listaTarefas.appendChild(itemLista);
    });

    const totalPaginas = calcularTotalPaginas();
    textoPaginaAtual.textContent = `Página ${paginaAtual} de ${totalPaginas}`;

    botaoAnterior.disabled = paginaAtual === 1 || itensPorPagina === "todos";
    botaoProxima.disabled = paginaAtual === totalPaginas || itensPorPagina === "todos";
}

// Adiciona nova tarefa
function adicionarTarefa() {
    const descricao = campoDescricao.value.trim();
    const prioridade = seletorPrioridade.value;
    const data = campoData.value;
    const hora = campoHora.value;

    if (descricao === "") {
        alert("Por favor, digite a descrição da tarefa.");
        return;
    }

    if (data === "") {
        alert("Por favor, selecione a data da tarefa.");
        return;
    }

    if (hora === "") {
        alert("Por favor, selecione a hora da tarefa.");
        return;
    }

    const novaTarefa = {
        descricao: descricao,
        prioridade: prioridade,
        data: data,
        hora: hora,
        concluida: false,
        statusTempo: "normal"
    };

    tarefas.unshift(novaTarefa);

    paginaAtual = 1;

    campoDescricao.value = "";
    campoData.value = "";
    campoHora.value = "";
    campoDescricao.focus();

    renderizarTarefas();
}

// Eventos
botaoAdicionar.addEventListener("click", adicionarTarefa);

campoDescricao.addEventListener("keypress", function (evento) {
    if (evento.key === "Enter") {
        adicionarTarefa();
    }
});

seletorItensPorPagina.addEventListener("change", function () {
    const valorSelecionado = seletorItensPorPagina.value;

    if (valorSelecionado === "todos") {
        itensPorPagina = "todos";
    } else {
        itensPorPagina = Number(valorSelecionado);
    }

    paginaAtual = 1;
    renderizarTarefas();
});

botaoAnterior.addEventListener("click", function () {
    if (paginaAtual > 1) {
        paginaAtual--;
        renderizarTarefas();
    }
});

botaoProxima.addEventListener("click", function () {
    const totalPaginas = calcularTotalPaginas();

    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        renderizarTarefas();
    }
});

// Botão do sino para silenciar o alarme
btnSilenciarAlarme.addEventListener("click", function () {
    pararAlarmeContinuo();
});

// Verifica os prazos automaticamente
setInterval(function () {
    renderizarTarefas();
}, 30000);

// Renderização inicial
renderizarTarefas();