"use strict";

/* =========================================================
   OK.SPIT
   PAINEL ADMINISTRATIVO
   ADMIN.JS
   ========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://wiwvpqjlwmtmlexusiyd.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_LzX0GpaYAK2KNSu2eetEuw_tr5PKqSi";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* =========================================================
   ESTADO
========================================================= */

let participantes = [];
let ganhadores = [];
let aniversariantes = [];

let sorteando = false;

let modoConsulta = "dia";

let dataInicioConsulta = new Date();
let dataFimConsulta = new Date();

let resultadosSorteio = [];

let toastTimer = null;


/* =========================================================
   UTILITÁRIOS
========================================================= */

function $(id) {
    return document.getElementById(id);
}


function normalizar(nome) {

    return String(nome || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");

}


function escapar(texto) {

    const div =
        document.createElement("div");

    div.textContent =
        String(texto ?? "");

    return div.innerHTML;

}


function nomeExibicao(nome) {

    const texto =
        String(nome || "")
            .trim()
            .replace(/\s+/g, " ");

    if (!texto) {
        return "Participante";
    }

    const partes =
        texto.split(" ");

    if (partes.length <= 2) {
        return texto;
    }

    return (
        partes[0] +
        " " +
        partes[partes.length - 1]
    );

}


/* =========================================================
   DATAS
========================================================= */

function clonarData(data) {

    return new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate()
    );

}


function inicioDia(data) {

    const resultado =
        clonarData(data);

    resultado.setHours(
        0,
        0,
        0,
        0
    );

    return resultado;

}


function fimDia(data) {

    const resultado =
        clonarData(data);

    resultado.setHours(
        23,
        59,
        59,
        999
    );

    return resultado;

}


function inicioSemanaDaData(data) {

    const resultado =
        clonarData(data);

    const dia =
        resultado.getDay();

    const diferenca =
        dia === 0
            ? 6
            : dia - 1;

    resultado.setDate(
        resultado.getDate() -
        diferenca
    );

    resultado.setHours(
        0,
        0,
        0,
        0
    );

    return resultado;

}


function fimSemanaDaData(data) {

    const resultado =
        inicioSemanaDaData(data);

    resultado.setDate(
        resultado.getDate() + 6
    );

    resultado.setHours(
        23,
        59,
        59,
        999
    );

    return resultado;

}


function dataParaInput(data) {

    if (!(data instanceof Date)) {
        data = new Date(data);
    }

    return [
        data.getFullYear(),
        String(data.getMonth() + 1).padStart(2, "0"),
        String(data.getDate()).padStart(2, "0")
    ].join("-");

}


function inputParaData(valor) {

    if (!valor) {
        return new Date();
    }

    const partes =
        String(valor).split("-");

    if (partes.length !== 3) {
        return new Date();
    }

    const ano =
        Number(partes[0]);

    const mes =
        Number(partes[1]);

    const dia =
        Number(partes[2]);

    return new Date(
        ano,
        mes - 1,
        dia
    );

}


function formatarData(valor) {

    if (!valor) {
        return "-";
    }

    /*
       Importante:
       YYYY-MM-DD é tratado manualmente
       para evitar deslocamento de fuso.
    */

    if (
        typeof valor === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {

        const data =
            inputParaData(valor);

        return data.toLocaleDateString(
            "pt-BR"
        );

    }

    const data =
        new Date(valor);

    if (
        Number.isNaN(
            data.getTime()
        )
    ) {
        return "-";
    }

    return data.toLocaleDateString(
        "pt-BR"
    );

}


function formatarDataLonga(data) {

    return data.toLocaleDateString(
        "pt-BR",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );

}


/* =========================================================
   PERÍODO
========================================================= */

function obterPeriodoConsulta() {

    let inicio;
    let fim;

    if (modoConsulta === "dia") {

        inicio =
            inicioDia(
                dataInicioConsulta
            );

        fim =
            fimDia(
                dataInicioConsulta
            );

    }

    else if (modoConsulta === "semana") {

        inicio =
            inicioSemanaDaData(
                dataInicioConsulta
            );

        fim =
            fimSemanaDaData(
                dataInicioConsulta
            );

    }

    else {

        inicio =
            inicioDia(
                dataInicioConsulta
            );

        fim =
            fimDia(
                dataFimConsulta
            );

    }

    return {
        inicio,
        fim
    };

}


function descricaoPeriodo() {

    const periodo =
        obterPeriodoConsulta();

    const inicio =
        formatarData(
            periodo.inicio
        );

    const fim =
        formatarData(
            periodo.fim
        );

    if (
        inicio === fim
    ) {
        return inicio;
    }

    return (
        inicio +
        " até " +
        fim
    );

}


/* =========================================================
   INTERFACE DO PERÍODO
========================================================= */

function atualizarInterfacePeriodo() {

    const periodo =
        obterPeriodoConsulta();

    const inicio =
        periodo.inicio;

    const fim =
        periodo.fim;


    if ($("dataInicioConsulta")) {

        $("dataInicioConsulta").value =
            dataParaInput(
                dataInicioConsulta
            );

    }


    if ($("dataFimConsulta")) {

        $("dataFimConsulta").value =
            dataParaInput(
                dataFimConsulta
            );

    }


    if (
        modoConsulta === "dia"
    ) {

        $("periodoSelecionado").textContent =
            "📅 " +
            formatarDataLonga(
                inicio
            );

        $("periodoParticipacoes").textContent =
            "📅 Participações de " +
            formatarData(inicio);

        $("periodoModo").textContent =
            "📅 VISUALIZANDO DIA";

        $("textoTotalParticipacoes").textContent =
            "Participações no dia";

    }


    else if (
        modoConsulta === "semana"
    ) {

        $("periodoSelecionado").textContent =
            "📆 Semana: " +
            formatarData(inicio) +
            " até " +
            formatarData(fim);

        $("periodoParticipacoes").textContent =
            "📆 Participações da semana de " +
            formatarData(inicio) +
            " até " +
            formatarData(fim);

        $("periodoModo").textContent =
            "📆 VISUALIZANDO SEMANA";

        $("textoTotalParticipacoes").textContent =
            "Participações na semana";

    }


    else {

        $("periodoSelecionado").textContent =
            "📅 Período: " +
            formatarData(inicio) +
            " até " +
            formatarData(fim);

        $("periodoParticipacoes").textContent =
            "📅 Participações de " +
            formatarData(inicio) +
            " até " +
            formatarData(fim);

        $("periodoModo").textContent =
            "📅 VISUALIZANDO PERÍODO";

        $("textoTotalParticipacoes").textContent =
            "Participações no período";

    }


    atualizarBotoesPeriodo();

}


function atualizarBotoesPeriodo() {

    $("btnVerDia")
        ?.classList.toggle(
            "ativo",
            modoConsulta === "dia"
        );

    $("btnVerSemana")
        ?.classList.toggle(
            "ativo",
            modoConsulta === "semana"
        );

    $("btnVerPeriodo")
        ?.classList.toggle(
            "ativo",
            modoConsulta === "periodo"
        );

}


/* =========================================================
   TOAST
========================================================= */

function mostrarMensagem(
    texto,
    tipo = ""
) {

    const toast =
        $("toast");

    if (!toast) {
        return;
    }

    toast.textContent =
        texto;

    toast.className =
        "toast show " + tipo;

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                toast.className =
                    "toast";

            },
            4000
        );

}


/* =========================================================
   LOGIN
========================================================= */

async function verificarSessao() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();

        if (error) {
            console.error(error);
            return;
        }

        if (
            data &&
            data.session
        ) {

            mostrarAdmin();

        }

    }

    catch (error) {

        console.error(
            "Erro ao verificar sessão:",
            error
        );

    }

}


async function login() {

    const email =
        $("email")
            .value
            .trim();

    const senha =
        $("senha")
            .value;


    $("loginError")
        .textContent = "";


    if (
        !email ||
        !senha
    ) {

        $("loginError")
            .textContent =
            "Digite seu e-mail e sua senha.";

        return;

    }


    $("btnLogin").disabled =
        true;

    $("btnLogin").textContent =
        "ENTRANDO...";


    try {

        const {
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({
                    email,
                    password: senha
                });


        if (error) {

            console.error(error);

            $("loginError")
                .textContent =
                "❌ E-mail ou senha inválidos.";

            $("btnLogin")
                .disabled = false;

            $("btnLogin")
                .textContent =
                "ENTRAR NO PAINEL";

            return;

        }


        mostrarAdmin();

    }

    catch (error) {

        console.error(error);

        $("loginError")
            .textContent =
            "❌ Não foi possível entrar.";

        $("btnLogin")
            .disabled = false;

        $("btnLogin")
            .textContent =
            "ENTRAR NO PAINEL";

    }

}


async function sair() {

    try {

        await supabaseClient
            .auth
            .signOut();

    }

    finally {

        location.reload();

    }

}


function mostrarAdmin() {

    $("loginScreen")
        .style
        .display = "none";

    $("admin")
        .style
        .display = "block";

    iniciarConsulta();

    carregarTudo();

}


/* =========================================================
   INICIALIZAR CONSULTA
========================================================= */

function iniciarConsulta() {

    const hoje =
        new Date();

    const dataHoje =
        inicioDia(
            hoje
        );

    dataInicioConsulta =
        clonarData(
            dataHoje
        );

    dataFimConsulta =
        clonarData(
            dataHoje
        );

    modoConsulta =
        "dia";

    atualizarInterfacePeriodo();

}


/* =========================================================
   CARREGAR TUDO
========================================================= */

async function carregarTudo() {

    try {

        await carregarGanhadores();

        await carregarAniversariantes();

        await carregarParticipantes();

        atualizarInterface();

    }

    catch (error) {

        console.error(
            "Erro geral:",
            error
        );

        mostrarMensagem(
            "❌ Erro ao carregar os dados.",
            "erro"
        );

    }

}


/* =========================================================
   GANHADORES DO MÊS
========================================================= */

async function carregarGanhadores() {

    const agora =
        new Date();

    const mes =
        agora.getMonth() + 1;

    const ano =
        agora.getFullYear();


    const {
        data,
        error
    } =
        await supabaseClient
            .from("ganhadores")
            .select("*")
            .eq("mes", mes)
            .eq("ano", ano)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {
        throw error;
    }


    ganhadores =
        data || [];

}


/* =========================================================
   PARTICIPAÇÕES
========================================================= */

async function carregarParticipantes() {

    const periodo =
        obterPeriodoConsulta();


    const inicio =
        inicioDia(
            periodo.inicio
        );

    const fim =
        fimDia(
            periodo.fim
        );


    const inicioISO =
        inicio.toISOString();


    /*
       Usamos < próximo dia
       em vez de <= 23:59:59.

       Assim qualquer horário do último
       dia é incluído.
    */

    const proximoDia =
        new Date(
            fim.getTime() + 1
        );

    const fimExclusivoISO =
        proximoDia.toISOString();


    const {
        data,
        error
    } =
        await supabaseClient
            .from("divulgacoes")
            .select(
                "id,nome,telefone,plataforma,data_participacao,criado_em"
            )
            .gte(
                "data_participacao",
                inicioISO
            )
            .lt(
                "data_participacao",
                fimExclusivoISO
            )
            .order(
                "data_participacao",
                {
                    ascending: false
                }
            )
            .limit(5000);


    if (error) {
        throw error;
    }


    participantes =
        data || [];


    atualizarInterfacePeriodo();

}


/* =========================================================
   ANIVERSARIANTES
========================================================= */

async function carregarAniversariantes() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("aniversariantes")
            .select("*");


    if (error) {

        console.warn(
            "Tabela aniversariantes:",
            error.message
        );

        aniversariantes =
            [];

        return;

    }


    aniversariantes =
        data || [];

}


/* =========================================================
   PARTICIPANTES ÚNICOS
========================================================= */

function participantesUnicos(lista) {

    const mapa =
        new Map();

    for (
        const pessoa
        of lista
    ) {

        const chave =
            normalizar(
                pessoa.nome
            );

        if (!chave) {
            continue;
        }

        if (
            !mapa.has(chave)
        ) {

            mapa.set(
                chave,
                pessoa
            );

        }

    }

    return [
        ...mapa.values()
    ];

}


/* =========================================================
   GANHADORES BLOQUEADOS
========================================================= */

function nomesBloqueados() {

    return new Set(
        ganhadores.map(
            g =>
                normalizar(
                    g.nome
                )
        )
    );

}


/* =========================================================
   DISPONÍVEIS PARA SORTEIO
========================================================= */

function disponiveis() {

    const bloqueados =
        nomesBloqueados();


    const unicos =
        participantesUnicos(
            participantes
        );


    return unicos.filter(
        pessoa => {

            const nome =
                normalizar(
                    pessoa.nome
                );

            return (
                nome &&
                !bloqueados.has(nome)
            );

        }
    );

}


/* =========================================================
   INTERFACE
========================================================= */

function atualizarInterface() {

    const disponiveisLista =
        disponiveis();


    $("totalMes").textContent =
        participantes.length;

    $("totalBloqueados").textContent =
        ganhadores.length;

    $("totalDisponiveis").textContent =
        disponiveisLista.length;


    renderizarGanhadores();

    renderizarParticipantes();


    if (
        !$("statusSorteio").textContent ||
        $("statusSorteio").textContent ===
        "PRONTO PARA SORTEAR"
    ) {

        atualizarStatusSorteio();

    }

}


/* =========================================================
   STATUS DO SORTEIO
========================================================= */

function atualizarStatusSorteio() {

    const lista =
        disponiveis();

    const periodo =
        descricaoPeriodo();


    $("statusSorteio").textContent =
        "🎲 " +
        lista.length +
        " PARTICIPANTE(S) DISPONÍVEL(IS) — " +
        periodo;

}


/* =========================================================
   RENDERIZAR GANHADORES
========================================================= */

function renderizarGanhadores() {

    const container =
        $("listaGanhadores");


    if (!container) {
        return;
    }


    if (!ganhadores.length) {

        container.innerHTML = `

            <div class="loading-card">
                🏆 Nenhum ganhador neste mês.
            </div>

        `;

        return;

    }


    container.innerHTML =
        ganhadores
            .map(
                g => `

                    <div class="ganhador-card">

                        <div class="ganhador-card-icon">
                            🏆
                        </div>

                        <div class="ganhador-card-info">

                            <strong>
                                ${escapar(
                                    nomeExibicao(
                                        g.nome
                                    )
                                )}
                            </strong>

                            <span>
                                Já ganhou este mês
                            </span>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   RENDERIZAR PARTICIPAÇÕES
========================================================= */

function renderizarParticipantes() {

    const tbody =
        $("listaParticipantes");

    if (!tbody) {
        return;
    }


    const busca =
        normalizar(
            $("buscar")?.value || ""
        );


    const lista =
        participantes.filter(
            pessoa => {

                const nome =
                    normalizar(
                        pessoa.nome
                    );

                const telefone =
                    normalizar(
                        pessoa.telefone
                    );

                return (
                    nome.includes(busca) ||
                    telefone.includes(busca)
                );

            }
        );


    if (!lista.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="4">

                    <div class="loading">

                        👥 Nenhuma participação
                        encontrada no período selecionado.

                    </div>

                </td>

            </tr>

        `;

        return;

    }


    tbody.innerHTML =
        lista
            .map(
                pessoa => `

                    <tr>

                        <td>

                            <strong>

                                ${escapar(
                                    nomeExibicao(
                                        pessoa.nome
                                    )
                                )}

                            </strong>

                        </td>


                        <td>

                            ${escapar(
                                pessoa.plataforma ||
                                "Participante"
                            )}

                        </td>


                        <td>

                            <span
                                class="data-participacao"
                            >

                                📅

                                ${formatarData(
                                    pessoa.data_participacao ||
                                    pessoa.criado_em
                                )}

                            </span>

                        </td>


                        <td>

                            <button
                                type="button"
                                class="btn-remover-participacao"
                                onclick="removerParticipacao('${escapar(String(pessoa.id))}')"
                                title="Remover participação"
                            >
                                ×
                            </button>

                        </td>

                    </tr>

                `
            )
            .join("");

}


/* =========================================================
   CONSULTA
========================================================= */

async function aplicarConsulta() {

    try {

        atualizarInterfacePeriodo();


        $("listaParticipantes").innerHTML = `

            <tr>

                <td colspan="4">

                    <div class="loading">
                        🔄 Carregando participações...
                    </div>

                </td>

            </tr>

        `;


        await carregarParticipantes();

        atualizarInterface();

        atualizarStatusSorteio();


        if (
            modoConsulta === "dia"
        ) {

            mostrarMensagem(
                "📅 Dia atualizado.",
                "sucesso"
            );

        }

        else if (
            modoConsulta === "semana"
        ) {

            mostrarMensagem(
                "📆 Semana atualizada.",
                "sucesso"
            );

        }

        else {

            mostrarMensagem(
                "📅 Período atualizado.",
                "sucesso"
            );

        }

    }

    catch (error) {

        console.error(
            "Erro na consulta:",
            error
        );

        mostrarMensagem(
            "❌ Erro ao consultar as participações.",
            "erro"
        );

    }

}


/* =========================================================
   VER PERÍODO
========================================================= */

async function verPeriodo() {

    const inicio =
        $("dataInicioConsulta").value;

    const fim =
        $("dataFimConsulta").value;


    if (
        !inicio ||
        !fim
    ) {

        mostrarMensagem(
            "Informe a data inicial e a data final.",
            "erro"
        );

        return;

    }


    const novaInicio =
        inputParaData(inicio);

    const novoFim =
        inputParaData(fim);


    if (
        novaInicio >
        novoFim
    ) {

        mostrarMensagem(
            "A data inicial não pode ser maior que a data final.",
            "erro"
        );

        return;

    }


    dataInicioConsulta =
        novaInicio;

    dataFimConsulta =
        novoFim;

    modoConsulta =
        "periodo";


    await aplicarConsulta();

}


/* =========================================================
   VER DIA
========================================================= */

async function verDia() {

    const valor =
        $("dataInicioConsulta").value ||
        $("dataFimConsulta").value;


    if (!valor) {

        mostrarMensagem(
            "Escolha uma data.",
            "erro"
        );

        return;

    }


    dataInicioConsulta =
        inputParaData(valor);

    dataFimConsulta =
        clonarData(
            dataInicioConsulta
        );

    modoConsulta =
        "dia";


    await aplicarConsulta();

}


/* =========================================================
   VER SEMANA
========================================================= */

async function verSemana() {

    const valor =
        $("dataInicioConsulta").value ||
        $("dataFimConsulta").value;


    if (!valor) {

        mostrarMensagem(
            "Escolha uma data.",
            "erro"
        );

        return;

    }


    const data =
        inputParaData(valor);


    dataInicioConsulta =
        inicioSemanaDaData(data);

    dataFimConsulta =
        fimSemanaDaData(data);

    modoConsulta =
        "semana";


    await aplicarConsulta();

}


/* =========================================================
   ANTERIOR
========================================================= */

async function diaAnterior() {

    if (
        modoConsulta === "dia"
    ) {

        dataInicioConsulta =
            clonarData(
                dataInicioConsulta
            );

        dataInicioConsulta.setDate(
            dataInicioConsulta.getDate() - 1
        );

        dataFimConsulta =
            clonarData(
                dataInicioConsulta
            );

    }


    else if (
        modoConsulta === "semana"
    ) {

        const novaData =
            clonarData(
                dataInicioConsulta
            );

        novaData.setDate(
            novaData.getDate() - 7
        );

        dataInicioConsulta =
            inicioSemanaDaData(
                novaData
            );

        dataFimConsulta =
            fimSemanaDaData(
                novaData
            );

    }


    else {

        const quantidadeDias =
            Math.max(
                1,
                Math.round(
                    (
                        dataFimConsulta -
                        dataInicioConsulta
                    ) /
                    86400000
                ) + 1
            );


        const novaInicio =
            clonarData(
                dataInicioConsulta
            );

        novaInicio.setDate(
            novaInicio.getDate() -
            quantidadeDias
        );


        const novoFim =
            clonarData(
                dataFimConsulta
            );

        novoFim.setDate(
            novoFim.getDate() -
            quantidadeDias
        );


        dataInicioConsulta =
            novaInicio;

        dataFimConsulta =
            novoFim;

    }


    await aplicarConsulta();

}


/* =========================================================
   PRÓXIMO
========================================================= */

async function diaProximo() {

    if (
        modoConsulta === "dia"
    ) {

        dataInicioConsulta =
            clonarData(
                dataInicioConsulta
            );

        dataInicioConsulta.setDate(
            dataInicioConsulta.getDate() + 1
        );

        dataFimConsulta =
            clonarData(
                dataInicioConsulta
            );

    }


    else if (
        modoConsulta === "semana"
    ) {

        const novaData =
            clonarData(
                dataInicioConsulta
            );

        novaData.setDate(
            novaData.getDate() + 7
        );

        dataInicioConsulta =
            inicioSemanaDaData(
                novaData
            );

        dataFimConsulta =
            fimSemanaDaData(
                novaData
            );

    }


    else {

        const quantidadeDias =
            Math.max(
                1,
                Math.round(
                    (
                        dataFimConsulta -
                        dataInicioConsulta
                    ) /
                    86400000
                ) + 1
            );


        const novaInicio =
            clonarData(
                dataInicioConsulta
            );

        novaInicio.setDate(
            novaInicio.getDate() +
            quantidadeDias
        );


        const novoFim =
            clonarData(
                dataFimConsulta
            );

        novoFim.setDate(
            novoFim.getDate() +
            quantidadeDias
        );


        dataInicioConsulta =
            novaInicio;

        dataFimConsulta =
            novoFim;

    }


    await aplicarConsulta();

}


/* =========================================================
   HOJE
========================================================= */

async function irParaHoje() {

    const hoje =
        inicioDia(
            new Date()
        );


    dataInicioConsulta =
        clonarData(hoje);

    dataFimConsulta =
        clonarData(hoje);

    modoConsulta =
        "dia";


    await aplicarConsulta();

}


/* =========================================================
   REMOVER PARTICIPAÇÃO
========================================================= */

async function removerParticipacao(id) {

    const pessoa =
        participantes.find(
            participante =>
                String(participante.id) ===
                String(id)
        );


    if (!pessoa) {
        return;
    }


    const confirmou =
        confirm(
            "Remover a participação de " +
            nomeExibicao(
                pessoa.nome
            ) +
            "?\n\n" +
            "Essa ação excluirá somente esta participação."
        );


    if (!confirmou) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("divulgacoes")
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {
            throw error;
        }


        participantes =
            participantes.filter(
                participante =>
                    String(participante.id) !==
                    String(id)
            );


        atualizarInterface();

        atualizarStatusSorteio();


        mostrarMensagem(
            "🗑️ Participação removida com sucesso.",
            "sucesso"
        );

    }

    catch (error) {

        console.error(error);

        mostrarMensagem(
            "❌ Não foi possível remover a participação.",
            "erro"
        );

    }

}


/* =========================================================
   SORTEIO
========================================================= */

async function realizarSorteio() {

    if (sorteando) {
        return;
    }


    const lista =
        disponiveis();


    if (!lista.length) {

        mostrarMensagem(
            "❌ Todos os participantes deste período já estão bloqueados ou não existem participantes.",
            "erro"
        );

        return;

    }


    let quantidade =
        parseInt(
            $("quantidade").value,
            10
        ) || 1;


    quantidade =
        Math.max(
            1,
            Math.min(
                quantidade,
                lista.length,
                50
            )
        );


    $("quantidade").value =
        quantidade;


    sorteando =
        true;


    $("btnSortear").disabled =
        true;

    $("btnSortear").textContent =
        "🎲 SORTEANDO...";

    $("statusSorteio").textContent =
        "🎲 SORTEANDO ENTRE " +
        lista.length +
        " PARTICIPANTE(S)";


    $("resultadoSorteio")
        .classList
        .remove("vencedor");


    $("resultadoSorteio")
        .classList
        .add("animando");


    $("resultadosSorteio")
        .innerHTML = "";


    /*
       Sorteio sem repetir participante
       dentro do mesmo sorteio.
    */

    const embaralhados =
        [...lista].sort(
            () =>
                Math.random() - 0.5
        );


    const escolhidos =
        embaralhados.slice(
            0,
            quantidade
        );


    let contador = 0;

    const duracao =
        quantidade === 1
            ? 35
            : 28;


    const intervalo =
        setInterval(
            () => {

                const pessoa =
                    lista[
                        Math.floor(
                            Math.random() *
                            lista.length
                        )
                    ];


                $("resultadoSorteio")
                    .textContent =
                    nomeExibicao(
                        pessoa.nome
                    );


                contador++;


                if (
                    contador >= duracao
                ) {

                    clearInterval(
                        intervalo
                    );

                    finalizarSorteio(
                        escolhidos
                    );

                }

            },
            90
        );

}


/* =========================================================
   FINALIZAR SORTEIO
========================================================= */

async function finalizarSorteio(
    escolhidos
) {

    const resultado =
        $("resultadoSorteio");


    resultado.classList.remove(
        "animando"
    );

    resultado.classList.add(
        "vencedor"
    );


    if (
        escolhidos.length === 1
    ) {

        resultado.textContent =
            nomeExibicao(
                escolhidos[0].nome
            );

    }

    else {

        resultado.textContent =
            escolhidos.length +
            " GANHADORES";

    }


    const agora =
        new Date();

    const mes =
        agora.getMonth() + 1;

    const ano =
        agora.getFullYear();


    const novos =
        [];


    try {

        for (
            const pessoa
            of escolhidos
        ) {

            const nome =
                String(
                    pessoa.nome || ""
                ).trim();


            const jaExiste =
                ganhadores.some(
                    g =>
                        normalizar(g.nome) ===
                        normalizar(nome)
                );


            if (jaExiste) {
                continue;
            }


            const {
                data,
                error
            } =
                await supabaseClient
                    .from("ganhadores")
                    .insert({
                        nome,
                        mes,
                        ano
                    })
                    .select()
                    .single();


            if (error) {

                console.error(
                    "Erro ao gravar ganhador:",
                    error
                );

                mostrarMensagem(
                    "❌ Erro ao registrar " +
                    nome +
                    ".",
                    "erro"
                );

                continue;

            }


            novos.push(data);

            ganhadores.unshift(data);


            $("resultadosSorteio")
                .insertAdjacentHTML(
                    "beforeend",
                    `

                        <span
                            class="resultado-premium"
                        >

                            🏆
                            ${escapar(
                                nomeExibicao(nome)
                            )}

                        </span>

                    `
                );

        }


        if (novos.length) {

            criarConfetes();

            mostrarMensagem(
                "🏆 Sorteio realizado com sucesso!",
                "sucesso"
            );

        }


        resultadosSorteio =
            novos;


        atualizarInterface();

        atualizarStatusSorteio();

    }

    finally {

        sorteando =
            false;

        $("btnSortear")
            .disabled = false;

        $("btnSortear")
            .textContent =
            "🎁 REALIZAR NOVO SORTEIO";

    }

}


/* =========================================================
   CONFETES
========================================================= */

function criarConfetes() {

    for (
        let i = 0;
        i < 80;
        i++
    ) {

        const confete =
            document.createElement(
                "div"
            );


        confete.className =
            "confete";


        confete.style.left =
            Math.random() *
            100 +
            "vw";


        confete.style.animationDelay =
            Math.random() *
            0.8 +
            "s";


        confete.style.background =
            Math.random() > 0.5
                ? "#ff6a00"
                : "#ffffff";


        document.body
            .appendChild(
                confete
            );


        setTimeout(
            () =>
                confete.remove(),
            3500
        );

    }

}


/* =========================================================
   ANIVERSARIANTES
========================================================= */

function obterMesNascimento(valor) {

    if (!valor) {
        return null;
    }


    if (
        typeof valor === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {

        return Number(
            valor.split("-")[1]
        );

    }


    const data =
        new Date(valor);


    if (
        Number.isNaN(
            data.getTime()
        )
    ) {

        return null;

    }


    return data.getMonth() + 1;

}


async function sortearAniversariantes() {

    const botao =
        $("btnSortearAniversariantes");


    const agora =
        new Date();

    const mesAtual =
        agora.getMonth() + 1;


    const lista =
        aniversariantes.filter(
            pessoa => {

                const nascimento =
                    pessoa.nascimento ||
                    pessoa.data_nascimento ||
                    pessoa.dataNascimento ||
                    pessoa.data_aniversario ||
                    pessoa.birthday;


                return (
                    obterMesNascimento(
                        nascimento
                    ) ===
                    mesAtual
                );

            }
        );


    if (!lista.length) {

        $("resultadoAniversariantes")
            .innerHTML = `

                <span>
                    🎂 Nenhum aniversariante
                    encontrado neste mês.
                </span>

            `;

        return;

    }


    let quantidade =
        parseInt(
            $("quantidadeAniversariantes").value,
            10
        ) || 1;


    quantidade =
        Math.max(
            1,
            Math.min(
                quantidade,
                lista.length,
                50
            )
        );


    $("quantidadeAniversariantes")
        .value =
        quantidade;


    botao.disabled =
        true;

    botao.textContent =
        "🎂 SORTEANDO...";


    const container =
        $("resultadoAniversariantes");


    let contador = 0;


    const intervalo =
        setInterval(
            () => {

                const pessoa =
                    lista[
                        Math.floor(
                            Math.random() *
                            lista.length
                        )
                    ];


                container.innerHTML = `

                    <span
                        class="aniversariante-vencedor"
                    >

                        🎂

                        ${escapar(
                            nomeExibicao(
                                pessoa.nome
                            )
                        )}

                    </span>

                `;


                contador++;


                if (
                    contador >= 25
                ) {

                    clearInterval(
                        intervalo
                    );


                    const escolhidos =
                        [...lista]
                            .sort(
                                () =>
                                    Math.random() - 0.5
                            )
                            .slice(
                                0,
                                quantidade
                            );


                    container.innerHTML =
                        escolhidos
                            .map(
                                pessoa => `

                                    <span
                                        class="aniversariante-vencedor"
                                    >

                                        🎂

                                        ${escapar(
                                            nomeExibicao(
                                                pessoa.nome
                                            )
                                        )}

                                    </span>

                                `
                            )
                            .join("");


                    criarConfetes();


                    botao.disabled =
                        false;

                    botao.textContent =
                        "🎂 SORTEAR NOVAMENTE";


                    mostrarMensagem(
                        "🎂 Aniversariante sorteado!",
                        "sucesso"
                    );

                }

            },
            90
        );

}


/* =========================================================
   MODAL
========================================================= */

function abrirModalParticipacao() {

    $("modalParticipacao")
        .classList
        .add("aberto");


    $("novoNome").value =
        "";

    $("novoTelefone").value =
        "";

    $("novaPlataforma").value =
        "";


    /*
       Se o modo for período, usamos
       a data inicial selecionada.
    */

    $("novaDataParticipacao").value =
        dataParaInput(
            dataInicioConsulta
        );


    setTimeout(
        () =>
            $("novoNome").focus(),
        100
    );

}


function fecharModalParticipacao() {

    $("modalParticipacao")
        .classList
        .remove("aberto");

}


/* =========================================================
   SALVAR PARTICIPAÇÃO
========================================================= */

async function salvarParticipacao() {

    const nome =
        $("novoNome")
            .value
            .trim();

    const telefone =
        $("novoTelefone")
            .value
            .trim();

    const plataforma =
        $("novaPlataforma")
            .value
            .trim();

    const data =
        $("novaDataParticipacao")
            .value;


    if (!nome) {

        mostrarMensagem(
            "Digite o nome do participante.",
            "erro"
        );

        $("novoNome").focus();

        return;

    }


    if (!data) {

        mostrarMensagem(
            "Informe a data da participação.",
            "erro"
        );

        return;

    }


    const botao =
        $("btnSalvarParticipacao");


    botao.disabled =
        true;

    botao.textContent =
        "SALVANDO...";


    try {

        const {
            data: novaParticipacao,
            error
        } =
            await supabaseClient
                .from("divulgacoes")
                .insert({
                    nome,
                    telefone:
                        telefone || null,
                    plataforma:
                        plataforma || "Manual",
                    data_participacao:
                        data
                })
                .select()
                .single();


        if (error) {
            throw error;
        }


        const dataNova =
            inputParaData(data);


        /*
           Depois de cadastrar, o período
           acompanha a data cadastrada quando
           estamos no modo DIA.

           Nos modos SEMANA e PERÍODO,
           mantemos a consulta atual.
        */

        if (
            modoConsulta === "dia"
        ) {

            dataInicioConsulta =
                clonarData(
                    dataNova
                );

            dataFimConsulta =
                clonarData(
                    dataNova
                );

        }


        else if (
            modoConsulta === "semana"
        ) {

            dataInicioConsulta =
                inicioSemanaDaData(
                    dataNova
                );

            dataFimConsulta =
                fimSemanaDaData(
                    dataNova
                );

        }


        fecharModalParticipacao();


        await carregarParticipantes();

        atualizarInterface();

        atualizarStatusSorteio();


        mostrarMensagem(
            "✅ Participação adicionada com sucesso!",
            "sucesso"
        );

    }

    catch (error) {

        console.error(
            "Erro ao salvar participação:",
            error
        );

        mostrarMensagem(
            "❌ Erro ao adicionar participação.",
            "erro"
        );

    }

    finally {

        botao.disabled =
            false;

        botao.textContent =
            "➕ SALVAR PARTICIPAÇÃO";

    }

}


/* =========================================================
   ZERAR GANHADORES
========================================================= */

async function zerarGanhadores() {

    const agora =
        new Date();

    const mes =
        agora.getMonth() + 1;

    const ano =
        agora.getFullYear();


    if (!ganhadores.length) {

        mostrarMensagem(
            "Não existem ganhadores neste mês."
        );

        return;

    }


    const confirmou =
        confirm(
            "Deseja realmente zerar TODOS os ganhadores deste mês?\n\n" +
            "As participações NÃO serão apagadas."
        );


    if (!confirmou) {
        return;
    }


    try {

        const {
            error
        } =
            await supabaseClient
                .from("ganhadores")
                .delete()
                .eq("mes", mes)
                .eq("ano", ano);


        if (error) {
            throw error;
        }


        ganhadores =
            [];


        atualizarInterface();

        atualizarStatusSorteio();


        mostrarMensagem(
            "🔄 Ganhadores do mês removidos.",
            "sucesso"
        );

    }

    catch (error) {

        console.error(error);

        mostrarMensagem(
            "❌ Erro ao zerar ganhadores.",
            "erro"
        );

    }

}


/* =========================================================
   EVENTOS
========================================================= */

$("btnLogin")
    ?.addEventListener(
        "click",
        login
    );


$("senha")
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                login();

            }

        }
    );


$("btnSair")
    ?.addEventListener(
        "click",
        sair
    );


$("btnSortear")
    ?.addEventListener(
        "click",
        realizarSorteio
    );


$("btnSortearAniversariantes")
    ?.addEventListener(
        "click",
        sortearAniversariantes
    );


$("buscar")
    ?.addEventListener(
        "input",
        renderizarParticipantes
    );


$("btnAtualizar")
    ?.addEventListener(
        "click",
        async () => {

            const botao =
                $("btnAtualizar");

            botao.disabled =
                true;

            try {

                await carregarTudo();

                atualizarStatusSorteio();

                mostrarMensagem(
                    "🔄 Painel atualizado.",
                    "sucesso"
                );

            }

            finally {

                botao.disabled =
                    false;

            }

        }
    );


$("btnZerar")
    ?.addEventListener(
        "click",
        zerarGanhadores
    );


$("btnAdicionarParticipacao")
    ?.addEventListener(
        "click",
        abrirModalParticipacao
    );


$("btnFecharModalParticipacao")
    ?.addEventListener(
        "click",
        fecharModalParticipacao
    );


$("btnSalvarParticipacao")
    ?.addEventListener(
        "click",
        salvarParticipacao
    );


/* =========================================================
   BOTÕES DE PERÍODO
========================================================= */

$("btnVerPeriodo")
    ?.addEventListener(
        "click",
        verPeriodo
    );


$("btnVerDia")
    ?.addEventListener(
        "click",
        verDia
    );


$("btnVerSemana")
    ?.addEventListener(
        "click",
        verSemana
    );


$("btnHoje")
    ?.addEventListener(
        "click",
        irParaHoje
    );


$("btnDiaAnterior")
    ?.addEventListener(
        "click",
        diaAnterior
    );


$("btnDiaProximo")
    ?.addEventListener(
        "click",
        diaProximo
    );


/* =========================================================
   DATA INICIAL
========================================================= */

$("dataInicioConsulta")
    ?.addEventListener(
        "change",
        () => {

            const valor =
                $("dataInicioConsulta").value;

            if (!valor) {
                return;
            }

            dataInicioConsulta =
                inputParaData(valor);

            atualizarInterfacePeriodo();

        }
    );


/* =========================================================
   DATA FINAL
========================================================= */

$("dataFimConsulta")
    ?.addEventListener(
        "change",
        () => {

            const valor =
                $("dataFimConsulta").value;

            if (!valor) {
                return;
            }

            dataFimConsulta =
                inputParaData(valor);

            atualizarInterfacePeriodo();

        }
    );


/* =========================================================
   ENTER NAS DATAS
========================================================= */

$("dataInicioConsulta")
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                verPeriodo();

            }

        }
    );


$("dataFimConsulta")
    ?.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                verPeriodo();

            }

        }
    );


/* =========================================================
   MODAL
========================================================= */

$("modalParticipacao")
    ?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("modalParticipacao")
            ) {

                fecharModalParticipacao();

            }

        }
    );


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            fecharModalParticipacao();

        }

    }
);


/* =========================================================
   EXPOR FUNÇÃO
========================================================= */

window.removerParticipacao =
    removerParticipacao;


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

verificarSessao();