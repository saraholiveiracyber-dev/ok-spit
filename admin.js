"use strict";

// ============================================================
// OK.SPIT — PAINEL ADMINISTRATIVO
// ============================================================

const totalHoje =
    document.getElementById("totalHoje");

const totalMes =
    document.getElementById("totalMes");

const totalAniversariantes =
    document.getElementById(
        "totalAniversariantes"
    );

const tabelaDivulgacoes =
    document.getElementById(
        "tabelaDivulgacoes"
    );

const tabelaAniversariantes =
    document.getElementById(
        "tabelaAniversariantes"
    );

const busca =
    document.getElementById("busca");

const atualizar =
    document.getElementById("atualizar");

let divulgacoes = [];


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


// ============================================================
// FORMATAR DATA
// ============================================================

function formatarData(
    data
) {

    if (!data) return "-";


    return new Date(
        data
    ).toLocaleString(
        "pt-BR"
    );

}


// ============================================================
// CARREGAR ESTATÍSTICAS
// ============================================================

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


    if (hoje.error)
        throw hoje.error;


    if (mes.error)
        throw mes.error;


    if (aniversariantes.error)
        throw aniversariantes.error;


    totalHoje.textContent =
        hoje.count || 0;


    totalMes.textContent =
        mes.count || 0;


    totalAniversariantes.textContent =
        aniversariantes.count || 0;

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
            .select(
                "*"
            )
            .order(
                "data_participacao",
                {
                    ascending:
                        false
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
                    (
                        item.nome ||
                        ""
                    ).toLowerCase();


                const telefone =
                    (
                        item.telefone ||
                        ""
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
                    style="text-align:center;padding:30px"
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
// ANIVERSARIANTES
// ============================================================

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
                    ascending:
                        true
                }
            );


    if (error)
        throw error;


    tabelaAniversariantes.innerHTML =
        "";


    if (!data?.length) {

        tabelaAniversariantes.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    style="text-align:center;padding:30px"
                >
                    Nenhum aniversariante cadastrado.
                </td>

            </tr>

        `;

        return;

    }


    data.forEach(
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
                    ${formatarNascimento(
                        item.nascimento
                    )}
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
// FORMATAR NASCIMENTO
// ============================================================

function formatarNascimento(
    data
) {

    if (!data)
        return "-";


    const partes =
        data.split("-");


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
// ESCAPAR HTML
// ============================================================

function escapar(
    texto
) {

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

document.addEventListener(
    "DOMContentLoaded",
    carregarTudo
);