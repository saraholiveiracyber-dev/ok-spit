"use strict";

/* ============================================================
   OK.SPIT — PAINEL ADMINISTRATIVO
   Controle de participações e ganhadores por mês
============================================================ */


/* ============================================================
   ELEMENTOS
============================================================ */

const totalMes =
    document.getElementById("totalMes");

const totalBloqueados =
    document.getElementById("totalBloqueados");

const totalAniversariantes =
    document.getElementById("totalAniversariantes");

const tabelaDivulgacoes =
    document.getElementById("tabelaDivulgacoes");

const busca =
    document.getElementById("busca");

const atualizar =
    document.getElementById("atualizar");

const listaGanhadores =
    document.getElementById("listaGanhadores");

const numeroGanhadores =
    document.getElementById("numeroGanhadores");

const nomeMesGanhadores =
    document.getElementById("nomeMesGanhadores");

const nomeMes =
    document.getElementById("nomeMes");

const zerarMes =
    document.getElementById("zerarMes");

const mensagemSorteio =
    document.getElementById("mensagemSorteio");

const ganhadorSelecionado =
    document.getElementById("ganhadorSelecionado");

const registrarGanhador =
    document.getElementById("registrarGanhador");

const limparSelecionado =
    document.getElementById("limparSelecionado");


/* ============================================================
   ESTADO
============================================================ */

let divulgacoes = [];

let ganhadores = [];

let participanteSelecionado = null;


/* ============================================================
   CONFIGURAÇÃO SUPABASE
============================================================

   O sistema primeiro procura window.supabaseClient.

   Caso você já tenha um supabase.js criando:

   window.supabaseClient

   ele será utilizado automaticamente.

============================================================ */

function verificarSupabase() {

    if (!window.supabaseClient) {

        throw new Error(
            "Supabase não configurado. Verifique se o supabaseClient foi criado antes do admin.js."
        );

    }

}


/* ============================================================
   DATA ATUAL
============================================================ */

function obterMesAtual() {

    return new Date().getMonth() + 1;

}


function obterAnoAtual() {

    return new Date().getFullYear();

}


function inicioMes() {

    const data =
        new Date();

    data.setDate(1);

    data.setHours(
        0,
        0,
        0,
        0
    );

    return data.toISOString();

}


function inicioHoje() {

    const data =
        new Date();

    data.setHours(
        0,
        0,
        0,
        0
    );

    return data.toISOString();

}


/* ============================================================
   NOME DO MÊS
============================================================ */

function nomeDoMes(mes) {

    const meses = [

        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"

    ];

    return meses[mes - 1];

}


/* ============================================================
   ATUALIZAR NOME DO MÊS
============================================================ */

function atualizarNomeMes() {

    const mes =
        nomeDoMes(
            obterMesAtual()
        );

    if (nomeMes) {

        nomeMes.textContent =
            mes;

    }

    if (nomeMesGanhadores) {

        nomeMesGanhadores.textContent =
            mes;

    }

}


/* ============================================================
   NORMALIZAR NOME
============================================================ */

function normalizarNome(nome) {

    return String(nome || "")
        .trim()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .toLowerCase();

}


/* ============================================================
   ESCAPAR HTML
============================================================ */

function escapar(texto) {

    return String(
        texto ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   FORMATAR DATA
============================================================ */

function formatarData(data) {

    if (!data) {

        return "-";

    }

    return new Date(
        data
    ).toLocaleString(
        "pt-BR"
    );

}


/* ============================================================
   FORMATAR NASCIMENTO
============================================================ */

function formatarNascimento(data) {

    if (!data) {

        return "-";

    }

    const partes =
        String(data).split("-");

    if (
        partes.length !== 3
    ) {

        return data;

    }

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


/* ============================================================
   VERIFICAR SE NOME JÁ GANHOU
============================================================ */

function jaGanhouEsteMes(nome) {

    const nomeNormalizado =
        normalizarNome(nome);

    return ganhadores.some(
        ganhador =>
            normalizarNome(
                ganhador.nome
            ) === nomeNormalizado
    );

}


/* ============================================================
   CARREGAR GANHADORES
============================================================ */

async function carregarGanhadores() {

    verificarSupabase();

    const mes =
        obterMesAtual();

    const ano =
        obterAnoAtual();


    const {
        data,
        error
    } =
        await window.supabaseClient

            .from("ganhadores")

            .select("*")

            .eq(
                "mes",
                mes
            )

            .eq(
                "ano",
                ano
            )

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Erro ao carregar ganhadores:",
            error
        );

        throw error;

    }


    ganhadores =
        data || [];


    renderizarGanhadores();

    renderizarDivulgacoes();

    atualizarContadorBloqueados();

}


/* ============================================================
   RENDERIZAR GANHADORES
============================================================ */

function renderizarGanhadores() {

    if (!listaGanhadores) {

        return;

    }


    numeroGanhadores.textContent =
        ganhadores.length;


    listaGanhadores.innerHTML =
        "";


    if (!ganhadores.length) {

        listaGanhadores.innerHTML = `

            <div class="loading-card">

                Nenhum ganhador registrado
                neste mês.

            </div>

        `;

        return;

    }


    ganhadores.forEach(
        ganhador => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "ganhador-card";


            card.innerHTML = `

                <div class="ganhador-icon">
                    🏆
                </div>

                <div class="ganhador-info">

                    <span>
                        GANHADOR
                    </span>

                    <strong>
                        ${escapar(
                            ganhador.nome
                        )}
                    </strong>

                </div>

                <button
                    type="button"
                    class="ganhador-remover"
                    data-nome="${escapar(
                        ganhador.nome
                    )}"
                >
                    ↩ Remover bloqueio
                </button>

            `;


            const botao =
                card.querySelector(
                    ".ganhador-remover"
                );


            botao.addEventListener(
                "click",
                () => {

                    removerGanhador(
                        ganhador
                    );

                }
            );


            listaGanhadores.appendChild(
                card
            );

        }
    );

}


/* ============================================================
   CONTADOR DE BLOQUEADOS
============================================================ */

function atualizarContadorBloqueados() {

    if (!totalBloqueados) {

        return;

    }

    totalBloqueados.textContent =
        ganhadores.length;

}


/* ============================================================
   CARREGAR DIVULGAÇÕES
============================================================ */

async function carregarDivulgacoes() {

    verificarSupabase();


    const {
        data,
        error
    } =
        await window.supabaseClient

            .from("divulgacoes")

            .select("*")

            .order(
                "data_participacao",
                {
                    ascending: false
                }
            )

            .limit(500);


    if (error) {

        throw error;

    }


    divulgacoes =
        data || [];


    renderizarDivulgacoes();

}


/* ============================================================
   RENDERIZAR DIVULGAÇÕES
============================================================ */

function renderizarDivulgacoes() {

    if (!tabelaDivulgacoes) {

        return;

    }


    const termo =
        busca
            ? busca.value
                .toLowerCase()
                .trim()
            : "";


    const lista =
        divulgacoes.filter(
            item => {

                const nome =
                    String(
                        item.nome || ""
                    )
                        .toLowerCase();


                const telefone =
                    String(
                        item.telefone || ""
                    )
                        .toLowerCase();


                return (
                    nome.includes(termo) ||
                    telefone.includes(termo)
                );

            }
        );


    tabelaDivulgacoes.innerHTML =
        "";


    if (!lista.length) {

        tabelaDivulgacoes.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="
                        text-align:center;
                        padding:30px
                    "
                >
                    Nenhuma participação encontrada.

                </td>

            </tr>

        `;

        return;

    }


    lista.forEach(
        item => {

            const tr =
                document.createElement(
                    "tr"
                );


            const nome =
                item.nome || "";


            const ganhou =
                jaGanhouEsteMes(
                    nome
                );


            tr.innerHTML = `

                <td>

                    <strong>
                        ${escapar(nome)}
                    </strong>

                </td>


                <td>
                    ${escapar(
                        item.plataforma ||
                        item.telefone ||
                        "-"
                    )}
                </td>


                <td>
                    ${formatarData(
                        item.data_participacao
                    )}
                </td>


                <td>

                    <div
                        class="status-ganhador"
                    >

                        ${
                            ganhou

                            ?

                            `
                            <span
                                class="badge-ganhador"
                            >
                                🏆 Já ganhou
                            </span>
                            `

                            :

                            `
                            <label
                                class="checkbox-ganhador"
                            >

                                <input
                                    type="checkbox"
                                    class="marcar-ganhador"
                                    data-nome="${escapar(
                                        nome
                                    )}"
                                >

                                <span>
                                    Já ganhou este mês
                                </span>

                            </label>
                            `
                        }

                    </div>

                </td>

            `;


            const checkbox =
                tr.querySelector(
                    ".marcar-ganhador"
                );


            if (checkbox) {

                checkbox.addEventListener(
                    "change",
                    async event => {

                        if (
                            event.target.checked
                        ) {

                            await marcarGanhador(
                                nome
                            );

                        }

                    }
                );

            }


            tabelaDivulgacoes.appendChild(
                tr
            );

        }
    );

}


/* ============================================================
   MARCAR GANHADOR
============================================================ */

async function marcarGanhador(nome) {

    if (!nome || !nome.trim()) {

        return;

    }


    verificarSupabase();


    const mes =
        obterMesAtual();

    const ano =
        obterAnoAtual();


    const jaExiste =
        jaGanhouEsteMes(
            nome
        );


    if (jaExiste) {

        return;

    }


    const {
        data,
        error
    } =
        await window.supabaseClient

            .from("ganhadores")

            .insert({

                nome:
                    nome.trim(),

                mes:
                    mes,

                ano:
                    ano

            })

            .select()
            
            .single();


    if (error) {

        console.error(
            "Erro ao registrar ganhador:",
            error
        );


        alert(
            "Não foi possível registrar o ganhador.\n\n" +
            error.message
        );


        renderizarDivulgacoes();

        return;

    }


    ganhadores.unshift(
        data
    );


    atualizarContadorBloqueados();

    renderizarGanhadores();

    renderizarDivulgacoes();


    mostrarMensagem(
        "🏆 Ganhador registrado com sucesso!",
        "sucesso"
    );

}


/* ============================================================
   REMOVER GANHADOR
============================================================ */

async function removerGanhador(
    ganhador
) {

    if (!ganhador) {

        return;

    }


    const confirmar =
        confirm(
            `Deseja remover "${ganhador.nome}" dos ganhadores deste mês?`
        );


    if (!confirmar) {

        return;

    }


    verificarSupabase();


    const {
        error
    } =
        await window.supabaseClient

            .from("ganhadores")

            .delete()

            .eq(
                "id",
                ganhador.id
            );


    if (error) {

        console.error(
            "Erro ao remover ganhador:",
            error
        );


        alert(
            "Não foi possível remover o bloqueio.\n\n" +
            error.message
        );

        return;

    }


    ganhadores =
        ganhadores.filter(
            item =>
                item.id !==
                ganhador.id
        );


    atualizarContadorBloqueados();

    renderizarGanhadores();

    renderizarDivulgacoes();


    mostrarMensagem(
        "↩ Bloqueio removido. O participante pode concorrer novamente.",
        "sucesso"
    );

}


/* ============================================================
   ZERAR MÊS
============================================================ */

async function executarZerarMes() {

    verificarSupabase();


    const mes =
        obterMesAtual();

    const ano =
        obterAnoAtual();


    if (!ganhadores.length) {

        alert(
            `Não existem ganhadores registrados em ${nomeDoMes(mes)} de ${ano}.`
        );

        return;

    }


    const confirmar =
        confirm(

            `⚠️ ZERAR MÊS\n\n` +

            `Isso irá remover ${ganhadores.length} ` +
            `ganhador(es) de ${nomeDoMes(mes)} de ${ano}.\n\n` +

            `As PARTICIPAÇÕES serão mantidas.\n\n` +

            `Somente os bloqueios de ganhadores serão removidos.\n\n` +

            `Deseja continuar?`

        );


    if (!confirmar) {

        return;

    }


    zerarMes.disabled =
        true;

    zerarMes.textContent =
        "⏳ Zerando...";


    const {
        error
    } =
        await window.supabaseClient

            .from("ganhadores")

            .delete()

            .eq(
                "mes",
                mes
            )

            .eq(
                "ano",
                ano
            );


    if (error) {

        console.error(
            "Erro ao zerar mês:",
            error
        );


        alert(
            "Não foi possível zerar o mês.\n\n" +
            error.message
        );


        zerarMes.disabled =
            false;

        zerarMes.textContent =
            "🔄 Zerar mês";

        return;

    }


    ganhadores =
        [];


    participanteSelecionado =
        null;


    atualizarSelecionado();

    atualizarContadorBloqueados();

    renderizarGanhadores();

    renderizarDivulgacoes();


    mostrarMensagem(
        `🔄 ${nomeDoMes(mes)} zerado com sucesso! Todos os participantes estão disponíveis novamente.`,
        "sucesso"
    );


    zerarMes.disabled =
        false;

    zerarMes.textContent =
        "🔄 Zerar mês";

}


/* ============================================================
   MENSAGEM
============================================================ */

function mostrarMensagem(
    texto,
    tipo = ""
) {

    if (!mensagemSorteio) {

        return;

    }


    mensagemSorteio.textContent =
        texto;


    mensagemSorteio.className =
        "mensagem " +
        tipo;


    setTimeout(
        () => {

            mensagemSorteio.textContent =
                "";

            mensagemSorteio.className =
                "mensagem";

        },
        5000
    );

}


/* ============================================================
   SELEÇÃO DE GANHADOR
============================================================ */

function selecionarParticipante(nome) {

    participanteSelecionado =
        nome;


    atualizarSelecionado();

}


function atualizarSelecionado() {

    if (!ganhadorSelecionado) {

        return;

    }


    if (!participanteSelecionado) {

        ganhadorSelecionado.textContent =
            "Nenhum ganhador selecionado";


        registrarGanhador.disabled =
            true;


        return;

    }


    ganhadorSelecionado.textContent =
        participanteSelecionado;


    registrarGanhador.disabled =
        false;

}


/* ============================================================
   REGISTRAR PELO GANHADOR SELECIONADO
============================================================ */

async function registrarGanhadorSelecionado() {

    if (!participanteSelecionado) {

        return;

    }


    await marcarGanhador(
        participanteSelecionado
    );


    participanteSelecionado =
        null;


    atualizarSelecionado();

}


/* ============================================================
   ESTATÍSTICAS
============================================================ */

async function carregarEstatisticas() {

    verificarSupabase();


    const hoje =
        await window.supabaseClient

            .from("divulgacoes")

            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )

            .gte(
                "data_participacao",
                inicioHoje()
            );


    const mes =
        await window.supabaseClient

            .from("divulgacoes")

            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )

            .gte(
                "data_participacao",
                inicioMes()
            );


    const aniversariantes =
        await window.supabaseClient

            .from("aniversariantes")

            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            );


    if (hoje.error) {

        throw hoje.error;

    }


    if (mes.error) {

        throw mes.error;

    }


    if (aniversariantes.error) {

        throw aniversariantes.error;

    }


    totalMes.textContent =
        mes.count || 0;


    totalAniversariantes.textContent =
        aniversariantes.count || 0;


    atualizarContadorBloqueados();

}


/* ============================================================
   ANIVERSARIANTES
============================================================ */

async function carregarAniversariantes() {

    verificarSupabase();


    const {
        data,
        error
    } =
        await window.supabaseClient

            .from(
                "aniversariantes"
            )

            .select("*")

            .order(
                "nascimento",
                {
                    ascending: true
                }
            );


    if (error) {

        throw error;

    }


    renderizarAniversariantes(
        data || []
    );

}


/* ============================================================
   RENDERIZAR ANIVERSARIANTES
============================================================ */

function renderizarAniversariantes(
    dados
) {

    const hojeContainer =
        document.getElementById(
            "aniversariantesHoje"
        );

    const mesContainer =
        document.getElementById(
            "aniversariantesMes"
        );

    const numero =
        document.getElementById(
            "numeroAniversariantes"
        );


    if (!mesContainer) {

        return;

    }


    const mesAtual =
        obterMesAtual();


    const aniversariantesMes =
        dados.filter(
            item => {

                if (!item.nascimento) {

                    return false;

                }

                const partes =
                    String(
                        item.nascimento
                    ).split("-");

                return (
                    Number(
                        partes[1]
                    ) === mesAtual
                );

            }
        );


    if (numero) {

        numero.textContent =
            aniversariantesMes.length;

    }


    if (mesContainer) {

        mesContainer.innerHTML =
            "";

        if (
            !aniversariantesMes.length
        ) {

            mesContainer.innerHTML = `

                <div class="loading-card">
                    Nenhum aniversariante neste mês.
                </div>

            `;

        } else {

            aniversariantesMes.forEach(
                item => {

                    mesContainer.innerHTML += `

                        <div class="birthday-card">

                            <strong>
                                ${escapar(
                                    item.nome
                                )}
                            </strong>

                            <span>
                                🎂 ${formatarNascimento(
                                    item.nascimento
                                )}
                            </span>

                        </div>

                    `;

                }
            );

        }

    }


    if (hojeContainer) {

        const hoje =
            new Date();


        const diaAtual =
            hoje.getDate();


        const aniversariantesHoje =
            aniversariantesMes.filter(
                item => {

                    const partes =
                        String(
                            item.nascimento
                        ).split("-");

                    return (
                        Number(
                            partes[2]
                        ) === diaAtual
                    );

                }
            );


        hojeContainer.innerHTML =
            "";


        if (
            !aniversariantesHoje.length
        ) {

            hojeContainer.innerHTML = `

                <div class="loading-card">
                    Nenhum aniversariante hoje.
                </div>

            `;

        } else {

            aniversariantesHoje.forEach(
                item => {

                    hojeContainer.innerHTML += `

                        <div class="birthday-card">

                            <strong>
                                ${escapar(
                                    item.nome
                                )}
                            </strong>

                            <span>
                                🎂 Feliz aniversário!
                            </span>

                        </div>

                    `;

                }
            );

        }

    }

}


/* ============================================================
   CARREGAR TUDO
============================================================ */

async function carregarTudo() {

    try {

        atualizarNomeMes();


        await Promise.all([

            carregarEstatisticas(),

            carregarDivulgacoes(),

            carregarGanhadores(),

            carregarAniversariantes()

        ]);


    } catch (erro) {

        console.error(
            "Erro no painel:",
            erro
        );


        alert(
            "❌ Erro ao carregar os dados.\n\n" +
            "Verifique as tabelas e as permissões do Supabase.\n\n" +
            erro.message
        );

    }

}


/* ============================================================
   BUSCA
============================================================ */

if (busca) {

    busca.addEventListener(
        "input",
        renderizarDivulgacoes
    );

}


/* ============================================================
   ATUALIZAR
============================================================ */

if (atualizar) {

    atualizar.addEventListener(
        "click",
        async () => {

            atualizar.disabled =
                true;

            atualizar.textContent =
                "⏳ Atualizando...";


            await carregarTudo();


            atualizar.disabled =
                false;

            atualizar.textContent =
                "🔄 Atualizar";

        }
    );

}


/* ============================================================
   ZERAR MÊS
============================================================ */

if (zerarMes) {

    zerarMes.addEventListener(
        "click",
        executarZerarMes
    );

}


/* ============================================================
   REGISTRAR GANHADOR
============================================================ */

if (registrarGanhador) {

    registrarGanhador.addEventListener(
        "click",
        registrarGanhadorSelecionado
    );

}


/* ============================================================
   LIMPAR SELEÇÃO
============================================================ */

if (limparSelecionado) {

    limparSelecionado.addEventListener(
        "click",
        () => {

            participanteSelecionado =
                null;

            atualizarSelecionado();

        }
    );

}


/* ============================================================
   INICIAR
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        carregarTudo();

    }
);