"use strict";

/*
============================================================
OK.SPIT — SISTEMA DE PARTICIPAÇÃO
============================================================
*/

// ============================================================
// CONFIGURAÇÕES
// ============================================================

const WHATSAPP_GRUPO =
    "https://chat.whatsapp.com/KtkoIMQ2qJI4xCxVcbN8mN";


// ============================================================
// ELEMENTOS — PARTICIPAÇÃO
// ============================================================

const participacaoForm =
    document.getElementById("participacaoForm");

const nomeInput =
    document.getElementById("nome");

const telefoneInput =
    document.getElementById("telefone");

const plataformaInput =
    document.getElementById("plataforma");

const confirmacaoInput =
    document.getElementById("confirmacao");

const mensagem =
    document.getElementById("mensagem");

const contadorHoje =
    document.getElementById("contadorHoje");

const btnParticipar =
    document.getElementById("btnParticipar");


// ============================================================
// ELEMENTOS — ANIVERSÁRIO
// ============================================================

const birthdayForm =
    document.getElementById("birthdayForm");

const nomeAniversario =
    document.getElementById("nomeAniversario");

const telefoneAniversario =
    document.getElementById("telefoneAniversario");

const nascimento =
    document.getElementById("nascimento");

const consentimentoAniversario =
    document.getElementById("consentimentoAniversario");

const birthdayMessage =
    document.getElementById("birthdayMessage");


// ============================================================
// MENSAGEM PARTICIPAÇÃO
// ============================================================

function mostrarMensagem(texto, tipo = "info") {

    if (!mensagem) return;

    mensagem.textContent = texto;

    mensagem.className =
        "mensagem " + tipo;
}


// ============================================================
// MENSAGEM ANIVERSÁRIO
// ============================================================

function mostrarMensagemAniversario(
    texto,
    tipo = "info"
) {

    if (!birthdayMessage) return;

    birthdayMessage.textContent = texto;

    birthdayMessage.className =
        "mensagem " + tipo;
}


// ============================================================
// NORMALIZAR TELEFONE
// ============================================================

function normalizarTelefone(telefone) {

    return telefone
        .replace(/\D/g, "");
}


// ============================================================
// INÍCIO DO DIA
// ============================================================

function inicioDoDia() {

    const agora = new Date();

    agora.setHours(
        0,
        0,
        0,
        0
    );

    return agora.toISOString();
}


// ============================================================
// FIM DO DIA
// ============================================================

function fimDoDia() {

    const agora = new Date();

    agora.setHours(
        23,
        59,
        59,
        999
    );

    return agora.toISOString();
}


// ============================================================
// VERIFICAR SUPABASE
// ============================================================

function verificarSupabase() {

    if (!window.supabaseClient) {

        throw new Error(
            "Supabase não configurado."
        );
    }
}


// ============================================================
// CONTADOR DE PARTICIPAÇÕES
// ============================================================

async function atualizarContador() {

    if (!contadorHoje) return;

    try {

        verificarSupabase();

        const {
            count,
            error
        } =
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
                    inicioDoDia()
                )
                .lte(
                    "data_participacao",
                    fimDoDia()
                );

        if (error) {

            console.error(
                "Erro contador:",
                error
            );

            return;
        }

        contadorHoje.textContent =
            count || 0;

    } catch (erro) {

        console.error(
            "Erro ao atualizar contador:",
            erro
        );
    }
}


// ============================================================
// VERIFICAR SE JÁ PARTICIPOU HOJE
// ============================================================

async function verificarParticipacaoHoje(
    telefone
) {

    verificarSupabase();

    const numero =
        normalizarTelefone(telefone);

    const {
        data,
        error
    } =
        await window.supabaseClient
            .from("divulgacoes")
            .select("id")
            .eq(
                "telefone",
                numero
            )
            .gte(
                "data_participacao",
                inicioDoDia()
            )
            .lte(
                "data_participacao",
                fimDoDia()
            )
            .limit(1);

    if (error) {

        console.error(
            "Erro ao verificar participação:",
            error
        );

        throw error;
    }

    return (
        data &&
        data.length > 0
    );
}


// ============================================================
// REGISTRAR PARTICIPAÇÃO
// ============================================================

async function registrarParticipacao() {

    const nome =
        nomeInput.value.trim();

    const telefone =
        normalizarTelefone(
            telefoneInput.value
        );

    const plataforma =
        plataformaInput.value;


    // ========================================================
    // VERIFICAR PARTICIPAÇÃO DO DIA
    // ========================================================

    const jaParticipou =
        await verificarParticipacaoHoje(
            telefone
        );


    if (jaParticipou) {

        mostrarMensagem(
            "🔥 Você já participou hoje! Sua participação já está registrada. Volte amanhã para participar novamente.",
            "info"
        );

        return false;
    }


    // ========================================================
    // INSERIR PARTICIPAÇÃO
    // ========================================================

    const {
        data,
        error
    } =
        await window.supabaseClient
            .from("divulgacoes")
            .insert({

                nome:
                    nome,

                telefone:
                    telefone,

                plataforma:
                    plataforma

            })
            .select()
            .single();


    if (error) {

        console.error(
            "Erro ao registrar participação:",
            error
        );

        throw error;
    }


    console.log(
        "Participação registrada:",
        data
    );


    // ========================================================
    // SUCESSO
    // ========================================================

    mostrarMensagem(
        "🎉 Você está participando! Sua divulgação foi registrada com sucesso. Você será encaminhado para o grupo da OK.SPIT.",
        "sucesso"
    );


    // Atualiza contador
    atualizarContador();


    // Desabilita o botão
    if (btnParticipar) {

        btnParticipar.disabled = true;

        btnParticipar.innerHTML =
            "🎉 VOCÊ ESTÁ PARTICIPANDO...";
    }


    // ========================================================
    // ENCAMINHAR PARA WHATSAPP
    // ========================================================

    setTimeout(function () {

        window.location.href =
            WHATSAPP_GRUPO;

    }, 1800);


    return true;
}


// ============================================================
// SUBMIT — PARTICIPAÇÃO
// ============================================================

if (participacaoForm) {

    participacaoForm.addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();


            const nome =
                nomeInput.value.trim();

            const telefone =
                normalizarTelefone(
                    telefoneInput.value
                );

            const plataforma =
                plataformaInput.value;

            const confirmado =
                confirmacaoInput.checked;


            // =================================================
            // VALIDAÇÕES
            // =================================================

            if (!nome) {

                mostrarMensagem(
                    "Digite seu nome.",
                    "erro"
                );

                nomeInput.focus();

                return;
            }


            if (telefone.length < 10) {

                mostrarMensagem(
                    "Digite um WhatsApp válido.",
                    "erro"
                );

                telefoneInput.focus();

                return;
            }


            if (!plataforma) {

                mostrarMensagem(
                    "Selecione onde você compartilhou.",
                    "erro"
                );

                plataformaInput.focus();

                return;
            }


            if (!confirmado) {

                mostrarMensagem(
                    "Confirme que você compartilhou a publicação e marcou @OK.SPIT.",
                    "erro"
                );

                return;
            }


            // =================================================
            // BLOQUEAR BOTÃO
            // =================================================

            if (btnParticipar) {

                btnParticipar.disabled = true;

                btnParticipar.innerHTML =
                    "⏳ VERIFICANDO...";
            }


            mostrarMensagem(
                "⏳ Verificando sua participação...",
                "info"
            );


            try {

                const sucesso =
                    await registrarParticipacao();


                // Se já participou, libera o botão
                if (!sucesso) {

                    if (btnParticipar) {

                        btnParticipar.disabled =
                            false;

                        btnParticipar.innerHTML =
                            `
                            <span>🎁</span>
                            <span>PARTICIPAR DO SORTEIO</span>
                            <span>→</span>
                            `;
                    }
                }


            } catch (erro) {

                console.error(
                    "ERRO COMPLETO:",
                    erro
                );


                mostrarMensagem(
                    "❌ Não foi possível registrar sua participação. Tente novamente.",
                    "erro"
                );


                if (btnParticipar) {

                    btnParticipar.disabled =
                        false;

                    btnParticipar.innerHTML =
                        `
                        <span>🎁</span>
                        <span>PARTICIPAR DO SORTEIO</span>
                        <span>→</span>
                        `;
                }
            }

        }
    );
}


// ============================================================
// CADASTRO DE ANIVERSÁRIO
// ============================================================

if (birthdayForm) {

    birthdayForm.addEventListener(
        "submit",
        async function (evento) {

            evento.preventDefault();


            const nome =
                nomeAniversario.value.trim();

            const telefone =
                normalizarTelefone(
                    telefoneAniversario.value
                );

            const dataNascimento =
                nascimento.value;

            const consentimento =
                consentimentoAniversario.checked;


            // =================================================
            // VALIDAÇÕES
            // =================================================

            if (!nome) {

                mostrarMensagemAniversario(
                    "Digite seu nome.",
                    "erro"
                );

                nomeAniversario.focus();

                return;
            }


            if (telefone.length < 10) {

                mostrarMensagemAniversario(
                    "Digite um WhatsApp válido.",
                    "erro"
                );

                telefoneAniversario.focus();

                return;
            }


            if (!dataNascimento) {

                mostrarMensagemAniversario(
                    "Informe sua data de nascimento.",
                    "erro"
                );

                nascimento.focus();

                return;
            }


            if (!consentimento) {

                mostrarMensagemAniversario(
                    "Confirme o cadastro dos seus dados.",
                    "erro"
                );

                return;
            }


            mostrarMensagemAniversario(
                "⏳ Cadastrando...",
                "info"
            );


            try {

                verificarSupabase();


                const {
                    error
                } =
                    await window.supabaseClient
                        .from("aniversariantes")
                        .insert({

                            nome:
                                nome,

                            telefone:
                                telefone,

                            nascimento:
                                dataNascimento

                        });


                if (error) {

                    console.error(
                        "Erro aniversário:",
                        error
                    );

                    throw error;
                }


                mostrarMensagemAniversario(
                    "🎉 Cadastro realizado com sucesso! Você está cadastrado para as ações de aniversário da OK.SPIT.",
                    "sucesso"
                );


                birthdayForm.reset();


            } catch (erro) {

                console.error(
                    "Erro aniversário:",
                    erro
                );


                mostrarMensagemAniversario(
                    "❌ Não foi possível realizar o cadastro. Tente novamente.",
                    "erro"
                );
            }

        }
    );
}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        atualizarContador();

    }
);