"use strict";

/* =========================================================
   OK.SPIT | SORTEADOR PÚBLICO
   SOMENTE VISUALIZAÇÃO
========================================================= */


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://wiwvpqjlwmtmlexusiyd.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_LzX0GpaYAK2KNSu2eetEuw_tr5PKqSi";


const TABELA_PARTICIPANTES =
    "divulgacoes";

const TABELA_GANHADORES =
    "ganhadores";

const TABELA_ANIVERSARIANTES =
    "aniversariantes";


let supabaseClient = null;

let participantes = [];

let participantesDisponiveis = [];

let ganhadores = [];

let aniversariantes = [];


/* =========================================================
   DATA
========================================================= */

const agora = new Date();

const ANO_ATUAL =
    agora.getFullYear();

const MES_ATUAL_NUMERO =
    agora.getMonth();

const MES_ATUAL =
    `${ANO_ATUAL}-${String(
        MES_ATUAL_NUMERO + 1
    ).padStart(2, "0")}`;


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciar
);


async function iniciar() {

    console.log(
        "👥 OK.SPIT | Sorteador público iniciado"
    );


    inicializarSupabase();

    atualizarMes();

    await carregarTudo();

    atualizarInterface();

}


/* =========================================================
   INICIALIZAR SUPABASE
========================================================= */

function inicializarSupabase() {

    if (
        typeof window.supabase ===
        "undefined"
    ) {

        console.error(
            "Supabase não carregado."
        );

        return;

    }


    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );


    console.log(
        "✅ Supabase conectado"
    );

}


/* =========================================================
   CARREGAR TUDO
========================================================= */

async function carregarTudo() {

    if (!supabaseClient) {

        mostrarErro(
            "Não foi possível conectar ao Supabase."
        );

        return;

    }


    await Promise.all([

        carregarParticipantes(),

        carregarGanhadores(),

        carregarAniversariantes()

    ]);


    calcularParticipantesDisponiveis();

}


/* =========================================================
   PARTICIPANTES
========================================================= */

async function carregarParticipantes() {

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from(
                TABELA_PARTICIPANTES
            )

            .select(
                "id,nome,telefone,plataforma,data_participacao,criado_em"
            );


        if (error) {

            console.error(
                "Erro ao carregar participantes:",
                error
            );

            participantes = [];

            return;

        }


        participantes =
            Array.isArray(data)
                ? data
                : [];


        participantes =
            participantes.filter(
                pessoa =>
                    pertenceAoMesAtual(
                        pessoa
                    )
            );


        participantes.sort(
            (a, b) => {

                const dataA =
                    obterDataParticipacao(
                        a
                    );

                const dataB =
                    obterDataParticipacao(
                        b
                    );


                if (!dataA) return 1;

                if (!dataB) return -1;


                return (
                    dataB.getTime() -
                    dataA.getTime()
                );

            }
        );


        console.log(
            "Participações:",
            participantes.length
        );


    } catch (erro) {

        console.error(
            erro
        );

        participantes = [];

    }

}


/* =========================================================
   GANHADORES
========================================================= */

async function carregarGanhadores() {

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from(
                TABELA_GANHADORES
            )

            .select("*")

            .eq(
                "mes",
                MES_ATUAL_NUMERO + 1
            )

            .eq(
                "ano",
                ANO_ATUAL
            )

            .order(
                "created_at",
                {
                    ascending: true
                }
            );


        if (error) {

            console.error(
                "Erro ao carregar ganhadores:",
                error
            );

            ganhadores = [];

            return;

        }


        ganhadores =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "Ganhadores:",
            ganhadores.length
        );


    } catch (erro) {

        console.error(
            erro
        );

        ganhadores = [];

    }

}


/* =========================================================
   ANIVERSARIANTES
========================================================= */

async function carregarAniversariantes() {

    try {

        const {
            data,
            error
        } = await supabaseClient

            .from(
                TABELA_ANIVERSARIANTES
            )

            .select("*");


        if (error) {

            console.error(
                "Erro ao carregar aniversariantes:",
                error
            );

            aniversariantes = [];

            return;

        }


        aniversariantes =
            Array.isArray(data)
                ? data
                : [];


    } catch (erro) {

        console.error(
            erro
        );

        aniversariantes = [];

    }

}


/* =========================================================
   PARTICIPANTES DISPONÍVEIS
========================================================= */

function calcularParticipantesDisponiveis() {

    const bloqueados =
        ganhadores.map(
            ganhador =>
                normalizar(
                    ganhador.nome
                )
        );


    participantesDisponiveis =
        participantes.filter(
            pessoa => {

                const nome =
                    normalizar(
                        pessoa.nome
                    );


                if (!nome) {

                    return false;

                }


                return !bloqueados.includes(
                    nome
                );

            }
        );

}


/* =========================================================
   INTERFACE
========================================================= */

function atualizarInterface() {

    atualizarEstatisticas();

    renderizarParticipantes();

    renderizarGanhadores();

    renderizarAniversariantes();

}


/* =========================================================
   ESTATÍSTICAS
========================================================= */

function atualizarEstatisticas() {

    const participantesEl =
        document.getElementById(
            "totalParticipantes"
        );


    const bloqueadosEl =
        document.getElementById(
            "totalBloqueados"
        );


    const aniversariantesEl =
        document.getElementById(
            "totalAniversariantes"
        );


    if (participantesEl) {

        participantesEl.textContent =
            participantesDisponiveis.length;

    }


    if (bloqueadosEl) {

        bloqueadosEl.textContent =
            ganhadores.length;

    }


    if (aniversariantesEl) {

        const total =
            aniversariantes.filter(
                pessoa => {

                    const data =
                        obterDataNascimento(
                            pessoa
                        );


                    return (
                        data &&
                        data.getMonth() ===
                        MES_ATUAL_NUMERO
                    );

                }
            ).length;


        aniversariantesEl.textContent =
            total;

    }

}


/* =========================================================
   PARTICIPANTES
========================================================= */

function renderizarParticipantes() {

    const container =
        document.getElementById(
            "listaParticipantes"
        );


    if (!container) {

        return;

    }


    if (
        !participantesDisponiveis.length
    ) {

        container.innerHTML = `

            <div class="lista-vazia">

                👥

                <strong>
                    Nenhum participante disponível.
                </strong>

                <br>

                Todos já ganharam neste mês
                ou ainda não existem participações.

            </div>

        `;

        return;

    }


    container.innerHTML =
        participantesDisponiveis

            .map(
                pessoa => {

                    const nome =
                        escapeHtml(
                            pessoa.nome ||
                            "Sem nome"
                        );


                    const plataforma =
                        escapeHtml(
                            pessoa.plataforma ||
                            "Participação registrada"
                        );


                    const data =
                        obterDataParticipacao(
                            pessoa
                        );


                    return `

                        <article
                            class="participante-card"
                        >

                            <div
                                class="participante-icon"
                            >
                                👤
                            </div>


                            <div
                                class="participante-info"
                            >

                                <strong>
                                    ${nome}
                                </strong>


                                <span>
                                    📢 ${plataforma}
                                </span>


                                ${
                                    data
                                        ? `
                                            <small>
                                                Participou em
                                                ${formatarData(data)}
                                            </small>
                                        `
                                        : ""
                                }

                            </div>

                        </article>

                    `;

                }
            )

            .join("");

}


/* =========================================================
   GANHADORES
========================================================= */

function renderizarGanhadores() {

    const container =
        document.getElementById(
            "listaGanhadores"
        );


    if (!container) {

        return;

    }


    if (!ganhadores.length) {

        container.innerHTML = `

            <div class="lista-vazia">

                🏆

                Nenhum ganhador registrado
                neste mês.

            </div>

        `;

        return;

    }


    container.innerHTML =
        ganhadores

            .map(
                ganhador => {

                    const nome =
                        escapeHtml(
                            ganhador.nome ||
                            "Sem nome"
                        );


                    const data =
                        converterData(
                            ganhador.created_at
                        );


                    return `

                        <article
                            class="ganhador-item"
                        >

                            <div
                                class="ganhador-icon"
                            >
                                🏆
                            </div>


                            <div>

                                <strong>
                                    ${nome}
                                </strong>


                                ${
                                    data
                                        ? `
                                            <small>
                                                Registrado em
                                                ${formatarData(data)}
                                            </small>
                                        `
                                        : ""
                                }

                            </div>

                        </article>

                    `;

                }
            )

            .join("");

}


/* =========================================================
   ANIVERSARIANTES
========================================================= */

function renderizarAniversariantes() {

    const container =
        document.getElementById(
            "listaAniversariantes"
        );


    if (!container) {

        return;

    }


    const lista =
        aniversariantes.filter(
            pessoa => {

                const data =
                    obterDataNascimento(
                        pessoa
                    );


                return (
                    data &&
                    data.getMonth() ===
                    MES_ATUAL_NUMERO
                );

            }
        );


    lista.sort(
        (a, b) => {

            const dataA =
                obterDataNascimento(a);

            const dataB =
                obterDataNascimento(b);


            return (
                dataA.getDate() -
                dataB.getDate()
            );

        }
    );


    if (!lista.length) {

        container.innerHTML = `

            <div class="lista-vazia">

                🎂

                Nenhum aniversariante
                cadastrado neste mês.

            </div>

        `;

        return;

    }


    container.innerHTML =
        lista

            .map(
                pessoa => {

                    const nome =
                        escapeHtml(
                            pessoa.nome ||
                            "Sem nome"
                        );


                    const data =
                        obterDataNascimento(
                            pessoa
                        );


                    return `

                        <article
                            class="aniversariante-item"
                        >

                            <div
                                class="aniversariante-icon"
                            >
                                🎂
                            </div>


                            <div>

                                <strong>
                                    ${nome}
                                </strong>


                                <span>
                                    ${formatarAniversario(data)}
                                </span>

                            </div>

                        </article>

                    `;

                }
            )

            .join("");

}


/* =========================================================
   MÊS
========================================================= */

function atualizarMes() {

    const nome =
        new Intl.DateTimeFormat(
            "pt-BR",
            {
                month: "long"
            }
        )
            .format(agora)
            .replace(
                /^./,
                letra =>
                    letra.toUpperCase()
            );


    const ids = [

        "mesAtual",

        "tituloGanhadores",

        "tituloParticipantes",

        "tituloAniversariantes"

    ];


    ids.forEach(
        id => {

            const elemento =
                document.getElementById(
                    id
                );


            if (elemento) {

                elemento.textContent =
                    nome;

            }

        }
    );

}


/* =========================================================
   DATA PARTICIPAÇÃO
========================================================= */

function obterDataParticipacao(
    pessoa
) {

    return converterData(
        pessoa.data_participacao ||
        pessoa.criado_em
    );

}


/* =========================================================
   DATA NASCIMENTO
========================================================= */

function obterDataNascimento(
    pessoa
) {

    return converterData(

        pessoa.nascimento ||

        pessoa.data_nascimento ||

        pessoa.dataNascimento ||

        pessoa.data_aniversario ||

        pessoa.birthday

    );

}


/* =========================================================
   CONVERTER DATA
========================================================= */

function converterData(valor) {

    if (!valor) {

        return null;

    }


    if (
        typeof valor === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ) {

        const partes =
            valor.split("-")
                .map(Number);


        return new Date(
            partes[0],
            partes[1] - 1,
            partes[2]
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


    return data;

}


/* =========================================================
   MÊS ATUAL
========================================================= */

function pertenceAoMesAtual(
    pessoa
) {

    const data =
        obterDataParticipacao(
            pessoa
        );


    if (!data) {

        return false;

    }


    return (

        data.getFullYear() ===
        ANO_ATUAL &&

        data.getMonth() ===
        MES_ATUAL_NUMERO

    );

}


/* =========================================================
   FORMATAÇÃO
========================================================= */

function formatarData(data) {

    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


function formatarAniversario(data) {

    return data.toLocaleDateString(
        "pt-BR",
        {
            day: "2-digit",
            month: "long"
        }
    );

}


/* =========================================================
   NORMALIZAR
========================================================= */

function normalizar(texto) {

    return String(texto || "")

        .trim()

        .toLowerCase()

        .normalize("NFD")

        .replace(
            /[\u0300-\u036f]/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        );

}


/* =========================================================
   SEGURANÇA HTML
========================================================= */

function escapeHtml(texto) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            texto || ""
        );


    return div.innerHTML;

}


/* =========================================================
   ERRO
========================================================= */

function mostrarErro(
    mensagem
) {

    const participantes =
        document.getElementById(
            "listaParticipantes"
        );


    const ganhadores =
        document.getElementById(
            "listaGanhadores"
        );


    if (participantes) {

        participantes.innerHTML = `

            <div class="lista-vazia">

                ❌

                ${escapeHtml(mensagem)}

            </div>

        `;

    }


    if (ganhadores) {

        ganhadores.innerHTML = `

            <div class="lista-vazia">

                ❌

                Não foi possível carregar os ganhadores.

            </div>

        `;

    }

}


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA
========================================================= */

setInterval(
    async () => {

        if (!supabaseClient) {

            return;

        }


        await carregarTudo();

        atualizarInterface();

    },
    30000
);


/* =========================================================
   FIM
========================================================= */

console.log(
    "👥 OK.SPIT | Sorteador público carregado"
);