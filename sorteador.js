/* =========================================================
   OK.SPIT - SORTEADOR
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURAÇÃO
   ========================================================= */

const agora = new Date();

const mesAtual = agora.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric"
});

/*
 * IMPORTANTE:
 * A tabela que aparece no seu Supabase é "divulgacoes".
 * Por isso usamos divulgacoes aqui.
 */

const TABELA_PARTICIPANTES = "divulgacoes";
const TABELA_GANHADORES = "sorteio_ganhadores";

/* =========================================================
   VARIÁVEIS
   ========================================================= */

let participantes = [];
let bloqueados = [];
let sorteioEmAndamento = false;

/* =========================================================
   ELEMENTOS
   ========================================================= */

const totalParticipantes =
    document.getElementById("totalParticipantes");

const totalBloqueados =
    document.getElementById("totalBloqueados");

const totalElegiveis =
    document.getElementById("totalElegiveis");

const resultado =
    document.getElementById("resultado");

const mensagem =
    document.getElementById("mensagem");

const btnSortear =
    document.getElementById("sortear");

const listaBloqueados =
    document.getElementById("listaBloqueados");

const formBloqueado =
    document.getElementById("formBloqueado");

const nomeBloqueado =
    document.getElementById("nomeBloqueado");

const telefoneBloqueado =
    document.getElementById("telefoneBloqueado");

const atualizar =
    document.getElementById("atualizar");

/* =========================================================
   SUPABASE
   ========================================================= */

function obterSupabase() {

    if (
        typeof window.supabaseClient !== "undefined" &&
        window.supabaseClient
    ) {
        return window.supabaseClient;
    }

    return null;
}

/* =========================================================
   MENSAGEM
   ========================================================= */

function mostrarMensagem(texto, tipo = "normal") {

    if (!mensagem) {
        return;
    }

    mensagem.textContent = texto;

    mensagem.classList.remove(
        "sucesso",
        "erro",
        "normal"
    );

    mensagem.classList.add(tipo);
}

/* =========================================================
   NORMALIZAR NOME
   ========================================================= */

function normalizarNome(nome) {

    return String(nome || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
}

/* =========================================================
   ESCAPAR HTML
   ========================================================= */

function escapeHtml(texto) {

    const div = document.createElement("div");

    div.textContent = String(texto || "");

    return div.innerHTML;
}

/* =========================================================
   CARREGAR DADOS
   ========================================================= */

async function carregarDados() {

    const cliente = obterSupabase();

    if (!cliente) {

        mostrarMensagem(
            "Supabase não foi inicializado. Verifique o supabase.js.",
            "erro"
        );

        return;
    }

    if (btnSortear) {
        btnSortear.disabled = true;
    }

    mostrarMensagem(
        "Carregando participantes..."
    );

    try {

        /* =====================================================
           PARTICIPANTES
           ===================================================== */

        const {
            data: dadosParticipacoes,
            error: erroParticipacoes
        } = await cliente
            .from(TABELA_PARTICIPANTES)
            .select("nome, telefone");

        if (erroParticipacoes) {
            console.error(
                "Erro na tabela divulgacoes:",
                erroParticipacoes
            );

            throw erroParticipacoes;
        }

        participantes =
            Array.isArray(dadosParticipacoes)
                ? dadosParticipacoes
                : [];

        /* =====================================================
           GANHADORES DO MÊS
           ===================================================== */

        const {
            data: dadosGanhadores,
            error: erroGanhadores
        } = await cliente
            .from(TABELA_GANHADORES)
            .select("id, nome, telefone, mes_referencia")
            .eq("mes_referencia", mesAtual);

        if (erroGanhadores) {

            console.error(
                "Erro na tabela sorteio_ganhadores:",
                erroGanhadores
            );

            throw erroGanhadores;
        }

        bloqueados =
            Array.isArray(dadosGanhadores)
                ? dadosGanhadores
                : [];

        atualizarInterface();

        mostrarMensagem("");

        console.log(
            "Participantes carregados:",
            participantes.length
        );

        console.log(
            "Ganhadores bloqueados:",
            bloqueados.length
        );

    } catch (erro) {

        console.error(
            "ERRO COMPLETO DO SUPABASE:",
            erro
        );

        mostrarMensagem(
            "Não foi possível carregar os participantes. Verifique o Supabase.",
            "erro"
        );

    }
}

/* =========================================================
   PARTICIPANTES ELEGÍVEIS
   ========================================================= */

function obterElegiveis() {

    const nomesBloqueados =
        new Set(
            bloqueados
                .map(pessoa =>
                    normalizarNome(pessoa.nome)
                )
                .filter(Boolean)
        );

    const nomesAdicionados =
        new Set();

    return participantes.filter(pessoa => {

        const nome =
            normalizarNome(pessoa.nome);

        if (!nome) {
            return false;
        }

        if (nomesBloqueados.has(nome)) {
            return false;
        }

        /*
         * Evita que a mesma pessoa apareça
         * várias vezes no sorteio.
         */

        if (nomesAdicionados.has(nome)) {
            return false;
        }

        nomesAdicionados.add(nome);

        return true;
    });
}

/* =========================================================
   ATUALIZAR INTERFACE
   ========================================================= */

function atualizarInterface() {

    const elegiveis =
        obterElegiveis();

    if (totalParticipantes) {
        totalParticipantes.textContent =
            participantes.length;
    }

    if (totalBloqueados) {
        totalBloqueados.textContent =
            bloqueados.length;
    }

    if (totalElegiveis) {
        totalElegiveis.textContent =
            elegiveis.length;
    }

    renderizarBloqueados();

    if (btnSortear) {

        btnSortear.disabled =
            elegiveis.length === 0 ||
            sorteioEmAndamento;
    }
}

/* =========================================================
   RENDERIZAR BLOQUEADOS
   ========================================================= */

function renderizarBloqueados() {

    if (!listaBloqueados) {
        return;
    }

    if (!bloqueados.length) {

        listaBloqueados.innerHTML = `
            <div class="lista-vazia">
                Nenhum ganhador bloqueado neste mês.
            </div>
        `;

        return;
    }

    listaBloqueados.innerHTML =
        bloqueados
            .map(pessoa => {

                const id =
                    escapeHtml(pessoa.id);

                const nome =
                    escapeHtml(pessoa.nome);

                const telefone =
                    pessoa.telefone
                        ? escapeHtml(pessoa.telefone)
                        : "WhatsApp não informado";

                return `
                    <div class="bloqueado">

                        <div class="bloqueado-info">

                            <strong>
                                ${nome}
                            </strong>

                            <span>
                                ${telefone}
                            </span>

                        </div>

                        <button
                            type="button"
                            class="btn-remover"
                            data-id="${id}"
                        >
                            Remover
                        </button>

                    </div>
                `;
            })
            .join("");

    document
        .querySelectorAll(".btn-remover")
        .forEach(botao => {

            botao.addEventListener(
                "click",
                () => {
                    removerBloqueado(
                        botao.dataset.id
                    );
                }
            );

        });
}

/* =========================================================
   ADICIONAR BLOQUEADO
   ========================================================= */

async function adicionarBloqueado(event) {

    event.preventDefault();

    const cliente =
        obterSupabase();

    if (!cliente) {

        mostrarMensagem(
            "Supabase não está disponível.",
            "erro"
        );

        return;
    }

    if (sorteioEmAndamento) {

        mostrarMensagem(
            "Aguarde o sorteio terminar.",
            "erro"
        );

        return;
    }

    const nome =
        nomeBloqueado.value.trim();

    const telefone =
        telefoneBloqueado.value.trim();

    if (!nome) {

        mostrarMensagem(
            "Digite o nome do ganhador.",
            "erro"
        );

        nomeBloqueado.focus();

        return;
    }

    const nomeNormalizado =
        normalizarNome(nome);

    const jaExiste =
        bloqueados.some(
            pessoa =>
                normalizarNome(pessoa.nome) ===
                nomeNormalizado
        );

    if (jaExiste) {

        mostrarMensagem(
            "Essa pessoa já está bloqueada neste mês.",
            "erro"
        );

        return;
    }

    try {

        const {
            data,
            error
        } = await cliente
            .from(TABELA_GANHADORES)
            .insert({
                nome: nome,
                telefone: telefone || null,
                mes_referencia: mesAtual
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        if (data) {
            bloqueados.push(data);
        }

        nomeBloqueado.value = "";
        telefoneBloqueado.value = "";

        atualizarInterface();

        mostrarMensagem(
            `${nome} foi bloqueado para os próximos sorteios deste mês.`,
            "sucesso"
        );

    } catch (erro) {

        console.error(
            "Erro ao adicionar ganhador:",
            erro
        );

        mostrarMensagem(
            "Não foi possível adicionar o ganhador. Verifique as permissões do Supabase.",
            "erro"
        );
    }
}

/* =========================================================
   REMOVER BLOQUEADO
   ========================================================= */

async function removerBloqueado(id) {

    const cliente =
        obterSupabase();

    if (!cliente) {

        mostrarMensagem(
            "Supabase não está disponível.",
            "erro"
        );

        return;
    }

    if (!id) {

        mostrarMensagem(
            "ID do ganhador não encontrado.",
            "erro"
        );

        return;
    }

    const pessoa =
        bloqueados.find(
            item =>
                String(item.id) === String(id)
        );

    const nome =
        pessoa
            ? pessoa.nome
            : "esta pessoa";

    const confirmar =
        confirm(
            `Remover ${nome} da lista de ganhadores deste mês?`
        );

    if (!confirmar) {
        return;
    }

    try {

        const {
            error
        } = await cliente
            .from(TABELA_GANHADORES)
            .delete()
            .eq("id", id);

        if (error) {
            throw error;
        }

        bloqueados =
            bloqueados.filter(
                item =>
                    String(item.id) !== String(id)
            );

        atualizarInterface();

        mostrarMensagem(
            `${nome} foi removido da lista.`,
            "sucesso"
        );

    } catch (erro) {

        console.error(
            "Erro ao remover ganhador:",
            erro
        );

        mostrarMensagem(
            "Não foi possível remover o nome. Verifique as permissões do Supabase.",
            "erro"
        );
    }
}

/* =========================================================
   REALIZAR SORTEIO
   ========================================================= */

function realizarSorteio() {

    if (sorteioEmAndamento) {
        return;
    }

    const elegiveis =
        obterElegiveis();

    if (!elegiveis.length) {

        mostrarMensagem(
            "Não existem participantes elegíveis.",
            "erro"
        );

        return;
    }

    sorteioEmAndamento = true;

    btnSortear.disabled = true;

    resultado.classList.remove("ganhador");

    mostrarMensagem(
        "Sorteando..."
    );

    let contador = 0;

    const quantidadeAnimacoes = 30;
    const velocidade = 90;

    const intervalo =
        setInterval(() => {

            const temporario =
                elegiveis[
                    Math.floor(
                        Math.random() *
                        elegiveis.length
                    )
                ];

            resultado.innerHTML = `

                <div class="resultado-icon">
                    🎲
                </div>

                <span>
                    SORTEANDO...
                </span>

                <strong>
                    ${escapeHtml(
                        temporario.nome
                    )}
                </strong>

            `;

            contador++;

            if (
                contador >=
                quantidadeAnimacoes
            ) {

                clearInterval(intervalo);

                revelarGanhador(
                    elegiveis
                );
            }

        }, velocidade);
}

/* =========================================================
   REVELAR GANHADOR
   ========================================================= */

function revelarGanhador(elegiveis) {

    if (!elegiveis.length) {

        sorteioEmAndamento = false;

        atualizarInterface();

        return;
    }

    const indice =
        Math.floor(
            Math.random() *
            elegiveis.length
        );

    const ganhador =
        elegiveis[indice];

    resultado.classList.add(
        "ganhador"
    );

    resultado.innerHTML = `

        <div class="resultado-icon">
            🏆
        </div>

        <span>
            🎉 GANHADOR DO SORTEIO 🎉
        </span>

        <strong>
            ${escapeHtml(
                ganhador.nome
            )}
        </strong>

    `;

    mostrarMensagem(
        "Ganhador selecionado! Adicione-o à lista abaixo para que ele não participe novamente neste mês.",
        "sucesso"
    );

    sorteioEmAndamento = false;

    /*
     * O ganhador NÃO é salvo automaticamente.
     * O administrador confirma clicando em
     * "+ Adicionar".
     */

    atualizarInterface();
}

/* =========================================================
   EVENTOS
   ========================================================= */

if (formBloqueado) {

    formBloqueado.addEventListener(
        "submit",
        adicionarBloqueado
    );
}

if (btnSortear) {

    btnSortear.addEventListener(
        "click",
        realizarSorteio
    );
}

if (atualizar) {

    atualizar.addEventListener(
        "click",
        async () => {

            if (sorteioEmAndamento) {

                mostrarMensagem(
                    "Aguarde o sorteio terminar.",
                    "erro"
                );

                return;
            }

            await carregarDados();
        }
    );
}

/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

carregarDados();
