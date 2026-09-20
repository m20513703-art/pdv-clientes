/* =========================================
   PDV DE PEDIDOS - PLANO 2
   ========================================= */

// Lista dos produtos do pedido atual
let pedidoAtual = [];

// Lista de pedidos finalizados
let pedidos = JSON.parse(localStorage.getItem("pedidosPDV")) || [];


// =========================================
// ELEMENTOS DA PÁGINA
// =========================================

const clienteInput = document.getElementById("cliente");
const produtoInput = document.getElementById("produto");
const quantidadeInput = document.getElementById("quantidade");
const precoInput = document.getElementById("preco");
const observacaoInput = document.getElementById("observacao");

const btnAdicionar = document.getElementById("btnAdicionar");
const btnFinalizar = document.getElementById("btnFinalizar");
const btnLimpar = document.getElementById("btnLimpar");
const btnSair = document.getElementById("btnSair");

const listaPedido = document.getElementById("listaPedido");
const totalPedido = document.getElementById("totalPedido");
const listaPedidos = document.getElementById("listaPedidos");


// =========================================
// FORMATAÇÃO DE DINHEIRO
// =========================================

function formatarMoeda(valor) {

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


// =========================================
// ADICIONAR PRODUTO
// =========================================

btnAdicionar.addEventListener("click", function () {

    const produto = produtoInput.value.trim();

    const quantidade = Number(quantidadeInput.value);

    const preco = Number(precoInput.value);

    const observacao = observacaoInput.value.trim();


    if (produto === "") {

        alert("Digite o nome do produto.");

        produtoInput.focus();

        return;
    }


    if (quantidade <= 0 || isNaN(quantidade)) {

        alert("Digite uma quantidade válida.");

        quantidadeInput.focus();

        return;
    }


    if (preco < 0 || isNaN(preco)) {

        alert("Digite um preço válido.");

        precoInput.focus();

        return;
    }


    const item = {

        id: Date.now(),

        produto: produto,

        quantidade: quantidade,

        preco: preco,

        observacao: observacao,

        subtotal: quantidade * preco

    };


    pedidoAtual.push(item);


    atualizarPedidoAtual();


    // Limpa os campos do produto

    produtoInput.value = "";

    quantidadeInput.value = 1;

    precoInput.value = "";

    observacaoInput.value = "";

    produtoInput.focus();

});


// =========================================
// ATUALIZAR PEDIDO ATUAL
// =========================================

function atualizarPedidoAtual() {

    listaPedido.innerHTML = "";


    if (pedidoAtual.length === 0) {

        listaPedido.innerHTML = `
            <p class="vazio">
                Nenhum produto adicionado.
            </p>
        `;

        totalPedido.textContent = "R$ 0,00";

        return;
    }


    let total = 0;


    pedidoAtual.forEach(function (item) {

        total += item.subtotal;


        const div = document.createElement("div");

        div.className = "item-pedido";


        div.innerHTML = `

            <div class="item-pedido-topo">

                <strong>
                    ${escaparHTML(item.produto)}
                </strong>

                <button
                    class="btn-remover"
                    onclick="removerProduto(${item.id})"
                >
                    Remover
                </button>

            </div>

            <p>
                ${item.quantidade} x ${formatarMoeda(item.preco)}
            </p>

            <p>
                Subtotal:
                <strong>
                    ${formatarMoeda(item.subtotal)}
                </strong>
            </p>

            ${
                item.observacao
                ? `
                    <p>
                        Observação:
                        ${escaparHTML(item.observacao)}
                    </p>
                `
                : ""
            }

        `;


        listaPedido.appendChild(div);

    });


    totalPedido.textContent = formatarMoeda(total);

}


// =========================================
// REMOVER PRODUTO
// =========================================

function removerProduto(id) {

    pedidoAtual = pedidoAtual.filter(function (item) {

        return item.id !== id;

    });


    atualizarPedidoAtual();

}


// =========================================
// FINALIZAR PEDIDO
// =========================================

btnFinalizar.addEventListener("click", function () {


    if (pedidoAtual.length === 0) {

        alert("Adicione pelo menos um produto ao pedido.");

        return;
    }


    const cliente = clienteInput.value.trim();


    if (cliente === "") {

        alert("Digite o nome do cliente.");

        clienteInput.focus();

        return;
    }


    const total = pedidoAtual.reduce(function (soma, item) {

        return soma + item.subtotal;

    }, 0);


    const novoPedido = {

        id: Date.now(),

        numero: pedidos.length + 1,

        cliente: cliente,

        produtos: [...pedidoAtual],

        total: total,

        status: "Pendente",

        data: new Date().toLocaleString("pt-BR")

    };


    pedidos.push(novoPedido);


    salvarPedidos();


    // Limpa o pedido atual

    pedidoAtual = [];

    clienteInput.value = "";


    atualizarPedidoAtual();

    mostrarPedidos();


    alert(
        `Pedido #${novoPedido.numero} criado com sucesso!`
    );

});


// =========================================
// SALVAR PEDIDOS
// =========================================

function salvarPedidos() {

    localStorage.setItem(
        "pedidosPDV",
        JSON.stringify(pedidos)
    );

}


// =========================================
// MOSTRAR PEDIDOS
// =========================================

function mostrarPedidos() {

    listaPedidos.innerHTML = "";


    if (pedidos.length === 0) {

        listaPedidos.innerHTML = `
            <p class="vazio">
                Nenhum pedido realizado.
            </p>
        `;

        return;
    }


    pedidos
        .slice()
        .reverse()
        .forEach(function (pedido) {


            const card = document.createElement("div");

            card.className = "pedido-card";


            let produtosHTML = "";


            pedido.produtos.forEach(function (produto) {

                produtosHTML += `

                    <div class="pedido-produto">

                        <span>
                            ${produto.quantidade}x
                            ${escaparHTML(produto.produto)}
                        </span>

                        <strong>
                            ${formatarMoeda(produto.subtotal)}
                        </strong>

                    </div>

                `;

            });


            const statusClasse =
                obterClasseStatus(pedido.status);


            card.innerHTML = `

                <div class="pedido-cabecalho">

                    <div>

                        <div class="pedido-numero">
                            Pedido #${pedido.numero}
                        </div>

                        <div class="pedido-cliente">
                            Cliente:
                            ${escaparHTML(pedido.cliente)}
                        </div>

                        <div class="pedido-data">
                            ${pedido.data}
                        </div>

                    </div>


                    <span class="status ${statusClasse}">
                        ${pedido.status}
                    </span>

                </div>


                <div class="pedido-produtos">

                    ${produtosHTML}

                </div>


                <div class="pedido-total">

                    Total:
                    ${formatarMoeda(pedido.total)}

                </div>


                <div class="acoes-pedido">

                    <button
                        class="btn-preparo"
                        onclick="alterarStatus(${pedido.id}, 'Em preparo')"
                    >
                        Em preparo
                    </button>


                    <button
                        class="btn-pronto"
                        onclick="alterarStatus(${pedido.id}, 'Pronto')"
                    >
                        Pronto
                    </button>


                    <button
                        class="btn-entregue"
                        onclick="alterarStatus(${pedido.id}, 'Entregue')"
                    >
                        Entregue
                    </button>


                    <button
                        class="btn-cancelar"
                        onclick="alterarStatus(${pedido.id}, 'Cancelado')"
                    >
                        Cancelar
                    </button>

                </div>

            `;


            listaPedidos.appendChild(card);

        });

}


// =========================================
// ALTERAR STATUS DO PEDIDO
// =========================================

function alterarStatus(id, novoStatus) {

    const pedido = pedidos.find(function (pedido) {

        return pedido.id === id;

    });


    if (!pedido) {

        return;
    }


    pedido.status = novoStatus;


    salvarPedidos();

    mostrarPedidos();

}


// =========================================
// CLASSE DO STATUS
// =========================================

function obterClasseStatus(status) {

    switch (status) {

        case "Pendente":
            return "status-pendente";

        case "Em preparo":
            return "status-preparo";

        case "Pronto":
            return "status-pronto";

        case "Entregue":
            return "status-entregue";

        case "Cancelado":
            return "status-cancelado";

        default:
            return "";

    }

}


// =========================================
// LIMPAR PEDIDOS
// =========================================

btnLimpar.addEventListener("click", function () {


    if (pedidos.length === 0) {

        alert("Não existem pedidos para limpar.");

        return;
    }


    const confirmar = confirm(
        "Tem certeza que deseja apagar todos os pedidos?"
    );


    if (!confirmar) {

        return;
    }


    pedidos = [];


    salvarPedidos();

    mostrarPedidos();

});


// =========================================
// BOTÃO SAIR
// =========================================

btnSair.addEventListener("click", function () {

    const confirmar = confirm(
        "Deseja sair do PDV?"
    );


    if (confirmar) {

        window.history.back();

    }

});


// =========================================
// SEGURANÇA BÁSICA
// Evita inserir HTML digitado pelo usuário
// =========================================

function escaparHTML(texto) {

    const div = document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;

}


// =========================================
// CARREGAR PEDIDOS AO ABRIR A PÁGINA
// =========================================

mostrarPedidos();

atualizarPedidoAtual();