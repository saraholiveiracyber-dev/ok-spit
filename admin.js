"use strict";

// ============================================================
// OK.SPIT — PAINEL ADMINISTRATIVO
// ============================================================

// ============================================================
// ELEMENTOS
// ============================================================

const totalHoje =
    document.getElementById("totalHoje");

const totalMes =
    document.getElementById("totalMes");

const totalAniversariantes =
    document.getElementById("totalAniversariantes");

const tabelaDivulgacoes =
    document.getElementById("tabelaDivulgacoes");

const tabelaAniversariantes =
    document.getElementById("tabelaAniversariantes");

const busca =
    document.getElementById("busca");

const atualizar =
    document.getElementById("atualizar");

let divulgacoes = [];

let aniversariantes = [];


// ============================================================
// SUPABASE
// ============================================================

function verificarSupabase() {

    if (!window.supabaseClient) {

        throw new Error(
            "Supabase não configurado."
        );

    }

}


// ============================================================
// DATAS
// ============================================================

function inicioHoje() {

    const data = new Date();

    data.setHours(
        0,
        0,
        0,
        0
    );

    return data.toISOString();

}


function inicioMes() {

    const data = new Date();

    data.setDate(1);

    data.setHours(
        0,
        0,
        0,
        0
    );

    return data.toISOString();

}


function fimMes() {

    const data = new Date();

    data.setMonth(
        data.getMonth() + 1,
        0
    );

    data.setHours(
        23,
        59,
        59,
        999
    );

    return data.toISOString();

}


// ============================================================
// DATA DE HOJE
// ============================================================

function dataAtual() {

    const hoje = new Date();

    return {

        dia: hoje.getDate(),

        mes: hoje.getMonth() + 1,

        ano: hoje.getFullYear()

    };

}


// ============================================================
// FORMATAR DATA
// ============================================================

function formatarData(data) {

    if (!data)
        return "-";

    const dataObj =
        new Date(data);

    if (isNaN(dataObj))
        return "-";

    return dataObj.toLocaleString(
        "pt-BR"
    );

}


// ============================================================
// FORMATAR NASCIMENTO
// ============================================================

function formatarNascimento(data) {

    if (!data)
        return "-";

    const partes =
        String(data).split("-");

    if (partes.length !== 3)
        return data;

    return (
        partes[2] +
        "/" +
        partes[1] +
        "/" +
        partes[0]
    );

}


// ============================================================
// PEGAR DIA DO NASCIMENTO
// ============================================================

function pegarDiaNascimento(data) {

    if (!data)
        return null;

    const partes =
        String(data).split("-");

    if (partes.length !== 3)
        return null;

    return Number(partes[2]);

}


// ============================================================
// PEGAR MÊS DO NASCIMENTO
// ============================================================

function pegarMesNascimento(data) {

    if (!data)
        return null;

    const partes =
        String(data).split("-");

    if (partes.length !== 3)
        return null;

    return Number(partes[1]);

}


// ============================================================
// VERIFICAR SE É ANIVERSÁRIO HOJE
// ============================================================

function aniversarioHoje(data) {

    const atual =
        dataAtual();

    const dia =
        pegarDiaNascimento(data);

    const mes =
        pegarMesNascimento(data);

    return (
        dia === atual.dia &&
        mes === atual.mes
    );

}


// ============================================================
// VERIFICAR SE É DO MÊS ATUAL
// ============================================================

function aniversarioEsteMes(data) {

    const atual =
        dataAtual();

    const mes =
        pegarMesNascimento(data);

    return mes === atual.mes;

}


// ============================================================
// CARREGAR ESTATÍSTICAS
// ============================================================

async function carregarEstatisticas() {

    verificarSupabase();

    // --------------------------------------------------------
    // PARTICIPAÇÕES HOJE
    // --------------------------------------------------------

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


    // --------------------------------------------------------
    // PARTICIPAÇÕES DO MÊS
    // --------------------------------------------------------

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


    if (hoje.error)
        throw hoje.error;

    if (mes.error)
        throw mes.error;


    totalHoje.textContent =
        hoje.count || 0;

    totalMes.textContent =
        mes.count || 0;


    // --------------------------------------------------------
    // ANIVERSARIANTES
    // --------------------------------------------------------

    const {
        data,
        error
    } =
        await window.supabaseClient
            .from("aniversariantes")
            .select(
                "id,nome,telefone,nascimento,criado_em"
            );


    if (error)
        throw error;


    const aniversariantesMes =
        (data || []).filter(
            item =>
                aniversarioEsteMes(
                    item.nascimento
                )
        );


    totalAniversariantes.textContent =
        aniversariantesMes.length;

}


// ============================================================
// CARREGAR DIVULGAÇÕES
// ============================================================

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


    if (error)
        throw error;


    divulgacoes =
        data || [];


    renderizarDivulgacoes();

}


// ============================================================
// RENDERIZAR DIVULGAÇÕES
// ============================================================

function renderizarDivulgacoes() {

    if (!tabelaDivulgacoes)
        return;


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
                    ).toLowerCase();


                const telefone =
                    String(
                        item.telefone || ""
                    ).toLowerCase();


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
                        padding:30px;
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


            tr.innerHTML = `

                <td>
                    ${escapar(item.nome)}
                </td>

                <td>
                    ${escapar(item.telefone)}
                </td>

                <td>
                    ${escapar(item.plataforma)}
                </td>

                <td>
                    ${formatarData(
                        item.data_participacao
                    )}
                </td>

            `;


            tabelaDivulgacoes.appendChild(
                tr
            );

        }
    );

}


// ============================================================
// CARREGAR ANIVERSARIANTES
// ============================================================

async function carregarAniversariantes() {

    verificarSupabase();


    const {
        data,
        error
    } =
        await window.supabaseClient
            .from("aniversariantes")
            .select("*");


    if (error)
        throw error;


    aniversariantes =
        data || [];


    renderizarAniversariantes();

}


// ============================================================
// RENDERIZAR ANIVERSARIANTES
// ============================================================

function renderizarAniversariantes() {

    if (!tabelaAniversariantes)
        return;


    const atual =
        dataAtual();


    // --------------------------------------------------------
    // SOMENTE ANIVERSARIANTES DO MÊS ATUAL
    // --------------------------------------------------------

    const lista =
        aniversariantes
            .filter(
                item =>
                    aniversarioEsteMes(
                        item.nascimento
                    )
            )
            .sort(
                (a, b) =>
                    pegarDiaNascimento(
                        a.nascimento
                    ) -
                    pegarDiaNascimento(
                        b.nascimento
                    )
            );


    tabelaAniversariantes.innerHTML =
        "";


    // --------------------------------------------------------
    // NENHUM ANIVERSARIANTE
    // --------------------------------------------------------

    if (!lista.length) {

        tabelaAniversariantes.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="
                        text-align:center;
                        padding:35px;
                    "
                >
                    🎂 Nenhum aniversariante
                    neste mês.

                </td>

            </tr>

        `;

        return;

    }


    // --------------------------------------------------------
    // RENDERIZAR
    // --------------------------------------------------------

    lista.forEach(
        item => {

            const hoje =
                aniversarioHoje(
                    item.nascimento
                );


            const tr =
                document.createElement(
                    "tr"
                );


            // Destaque visual para aniversário de hoje

            if (hoje) {

                tr.classList.add(
                    "aniversario-hoje"
                );

            }


            tr.innerHTML = `

                <td>

                    <strong>

                        ${escapar(
                            item.nome
                        )}

                    </strong>

                    ${
                        hoje
                            ? `
                                <span
                                    class="badge-hoje"
                                >
                                    🎉 HOJE
                                </span>
                              `
                            : ""
                    }

                </td>


                <td>

                    ${escapar(
                        item.telefone
                    )}

                </td>


                <td>

                    <strong>

                        ${formatarNascimento(
                            item.nascimento
                        )}

                    </strong>

                </td>


                <td>

                    ${formatarData(
                        item.criado_em
                    )}

                </td>

            `;


            tabelaAniversariantes.appendChild(
                tr
            );

        }
    );

}


// ============================================================
// ESCAPAR HTML
// ============================================================

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


// ============================================================
// CARREGAR TUDO
// ============================================================

async function carregarTudo() {

    try {

        await Promise.all([

            carregarEstatisticas(),

            carregarDivulgacoes(),

            carregarAniversariantes()

        ]);


    } catch (erro) {

        console.error(
            "Erro painel:",
            erro
        );


        alert(
            "Não foi possível carregar o painel. Verifique o Supabase."
        );

    }

}


// ============================================================
// BUSCA
// ============================================================

if (busca) {

    busca.addEventListener(
        "input",
        renderizarDivulgacoes
    );

}


// ============================================================
// ATUALIZAR
// ============================================================

if (atualizar) {

    atualizar.addEventListener(
        "click",
        carregarTudo
    );

}


// ============================================================
// INICIAR
// ============================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        carregarTudo
    );

} else {

    carregarTudo();

}