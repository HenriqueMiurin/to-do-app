// Seleção dos elementos do HTML
const campoDescricao = document.getElementById("descricaoTarefa");
const seletorPrioridade = document.getElementById("prioridadeTarefa");
const botaoAdicionar = document.getElementById("btnAdicionar");
const listaTarefas = document.getElementById("listaTarefas");

const seletorItensPorPagina = document.getElementById("itensPorPagina");
const botaoAnterior = document.getElementById("btnAnterior");
const botaoProxima = document.getElementById("btnProxima");
const textoPaginaAtual = document.getElementById("paginaAtual");
const contadorTarefas = document.getElementById("contadorTarefas");

// Array principal que armazenará todas as tarefas do sistema
const tarefas = [];

// Variáveis de controle da paginação
let paginaAtual = 1;
let itensPorPagina = 10;

// Função para atualizar o contador total de tarefas
function atualizarContador() {
    const total = tarefas.length;

    if (total === 1) {
        contadorTarefas.textContent = "1 tarefa";
    } else {
        contadorTarefas.textContent = `${total} tarefas`;
    }
}

// Função para calcular a quantidade total de páginas
function calcularTotalPaginas() {
    if (itensPorPagina === "todos") {
        return 1;
    }

    return Math.ceil(tarefas.length / itensPorPagina) || 1;
}

// Função principal que renderiza as tarefas na tela
function renderizarTarefas() {
    // Limpa a lista atual antes de redesenhar
    listaTarefas.innerHTML = "";

    // Atualiza contador
    atualizarContador();

    // Se não houver tarefas, mostra mensagem
    if (tarefas.length === 0) {
        listaTarefas.innerHTML = `<li class="mensagem-vazia">Nenhuma tarefa cadastrada.</li>`;
        textoPaginaAtual.textContent = "Página 1 de 1";
        botaoAnterior.disabled = true;
        botaoProxima.disabled = true;
        return;
    }

    let tarefasDaPagina = [];

    // Se o usuário escolher "todos", mostra tudo em uma única página
    if (itensPorPagina === "todos") {
        tarefasDaPagina = tarefas;
    } else {
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = inicio + itensPorPagina;
        tarefasDaPagina = tarefas.slice(inicio, fim);
    }

    // Percorre somente as tarefas da página atual
    tarefasDaPagina.forEach(function (tarefaObj) {
        // Cria o item da lista
        const itemLista = document.createElement("li");
        itemLista.classList.add("tarefa", tarefaObj.prioridade);

        if (tarefaObj.concluida) {
            itemLista.classList.add("concluida");
        }

        // Área das informações
        const infoTarefa = document.createElement("div");
        infoTarefa.classList.add("info-tarefa");

        // Texto da tarefa
        const textoTarefa = document.createElement("span");
        textoTarefa.classList.add("texto-tarefa");
        textoTarefa.textContent = tarefaObj.descricao;

        // Texto da prioridade
        const prioridadeLabel = document.createElement("span");
        prioridadeLabel.classList.add("prioridade-label");
        prioridadeLabel.textContent = `Prioridade: ${tarefaObj.prioridade.toUpperCase()}`;

        infoTarefa.appendChild(textoTarefa);
        infoTarefa.appendChild(prioridadeLabel);

        // Área dos botões
        const acoesTarefa = document.createElement("div");
        acoesTarefa.classList.add("acoes-tarefa");

        // Botão concluir
        const botaoConcluir = document.createElement("button");
        botaoConcluir.classList.add("btn-concluir");
        botaoConcluir.textContent = tarefaObj.concluida ? "Reabrir" : "Concluir";

        botaoConcluir.addEventListener("click", function () {
            tarefaObj.concluida = !tarefaObj.concluida;
            renderizarTarefas();
        });

        // Botão remover
        const botaoRemover = document.createElement("button");
        botaoRemover.classList.add("btn-remover");
        botaoRemover.textContent = "Remover";

        botaoRemover.addEventListener("click", function () {
            const indiceReal = tarefas.indexOf(tarefaObj);

            if (indiceReal !== -1) {
                tarefas.splice(indiceReal, 1);
            }

            // Ajusta a página atual caso fique maior que o total após remover
            const totalPaginas = calcularTotalPaginas();
            if (paginaAtual > totalPaginas) {
                paginaAtual = totalPaginas;
            }

            renderizarTarefas();
        });

        acoesTarefa.appendChild(botaoConcluir);
        acoesTarefa.appendChild(botaoRemover);

        itemLista.appendChild(infoTarefa);
        itemLista.appendChild(acoesTarefa);

        listaTarefas.appendChild(itemLista);
    });

    // Atualiza a área da paginação
    const totalPaginas = calcularTotalPaginas();
    textoPaginaAtual.textContent = `Página ${paginaAtual} de ${totalPaginas}`;

    // Controle de habilitação/desabilitação dos botões
    botaoAnterior.disabled = paginaAtual === 1 || itensPorPagina === "todos";
    botaoProxima.disabled = paginaAtual === totalPaginas || itensPorPagina === "todos";
}

// Função para adicionar nova tarefa
function adicionarTarefa() {
    const descricao = campoDescricao.value.trim();
    const prioridade = seletorPrioridade.value;

    // Impede cadastro vazio
    if (descricao === "") {
        alert("Por favor, digite uma tarefa.");
        return;
    }

    // Cria o objeto da tarefa
    const novaTarefa = {
        descricao: descricao,
        prioridade: prioridade,
        concluida: false
    };

    // Adiciona no array principal
    tarefas.unshift(novaTarefa);

    // Volta para a primeira página para mostrar a tarefa mais recente
    paginaAtual = 1;

    // Limpa o campo
    campoDescricao.value = "";
    campoDescricao.focus();

    // Atualiza a tela
    renderizarTarefas();
}

// Evento do botão adicionar
botaoAdicionar.addEventListener("click", adicionarTarefa);

// Permite adicionar pressionando Enter
campoDescricao.addEventListener("keypress", function (evento) {
    if (evento.key === "Enter") {
        adicionarTarefa();
    }
});

// Evento para mudar a quantidade de itens por página
seletorItensPorPagina.addEventListener("change", function () {
    const valorSelecionado = seletorItensPorPagina.value;

    if (valorSelecionado === "todos") {
        itensPorPagina = "todos";
    } else {
        itensPorPagina = Number(valorSelecionado);
    }

    // Sempre volta para a primeira página ao mudar o seletor
    paginaAtual = 1;
    renderizarTarefas();
});

// Evento para ir para a página anterior
botaoAnterior.addEventListener("click", function () {
    if (paginaAtual > 1) {
        paginaAtual--;
        renderizarTarefas();
    }
});

// Evento para ir para a próxima página
botaoProxima.addEventListener("click", function () {
    const totalPaginas = calcularTotalPaginas();

    if (paginaAtual < totalPaginas) {
        paginaAtual++;
        renderizarTarefas();
    }
});

// Renderização inicial
renderizarTarefas();