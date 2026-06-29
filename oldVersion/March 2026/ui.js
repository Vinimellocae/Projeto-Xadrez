import { PGN } from "../engine/PGN.js"
import { ClockUI } from "./ClockUi.js"

export class UI {
    constructor(jogo, orientacaoDoTabuleiro) {
        this.jogo = jogo
        this.orientacaoDoTabuleiro = orientacaoDoTabuleiro
        this.casaSelecionada = null
        this.numeroLance = 0

        this.tabuleiro = document.querySelector('.tabuleiro')
        this.PopUpWrapper = document.querySelector('.popUp-wrapper')
        this.ContainerDePromocao = document.querySelector('.Promocao-Container')
        this.barraDoAdversario = document.querySelector('#barra-adversario')
        this.BotaoAntes = document.querySelector('#Antes')
        this.BotaoDepois = document.querySelector('#Depois')
        this.BotaoDesistir = document.querySelector('#Desistir')
        this.barraDoJogador = document.querySelector('#barra-jogador')
        this.arrayCapturadas = []
    }

    Iniciar() {
        this.RenderizarTabuleiro()
        this.RenderizarPecas(this.jogo.pecas)
        this.Estados = this.jogo.Estados
        this.tabuleiro.addEventListener('click', this.ManipuladorDeClicks.bind(this))
        this.BotaoDesistir.addEventListener('click', this.Desistir.bind(this))
        this.BotaoAntes.addEventListener('click', this.modoExibicaoVoltarLance.bind(this))
        this.BotaoDepois.addEventListener('click', this.modoExibicaoAvancarLance.bind(this))
        this.TratarBotoesDeControle()
        this.Clock = new ClockUI(this.orientacaoDoTabuleiro)
        this.Clock.iniciar()
    }

    RenderizarTabuleiro() {

        this.tabuleiro.innerHTML = ''

        const colunas = this.orientacaoDoTabuleiro === 'branco'
            ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
            : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']

        const linhas = this.orientacaoDoTabuleiro === 'branco'
            ? [8, 7, 6, 5, 4, 3, 2, 1]
            : [1, 2, 3, 4, 5, 6, 7, 8]

        linhas.forEach((linha, indexLinha) => {
            colunas.forEach((coluna, indexColuna) => {

                const casa = document.createElement('div')
                const nomeDaCasa = `${coluna}${linha}`

                const ehBranco = (indexLinha + indexColuna) % 2 === 0
                casa.classList.add(ehBranco ? 'casa-branca' : 'casa-preta')

                casa.dataset.casa = nomeDaCasa
                this.tabuleiro.appendChild(casa)

                if (indexColuna === 0) {
                    const numero = document.createElement('p')
                    numero.classList.add('numero')
                    numero.innerText = linha
                    numero.style.color = ehBranco ? "rgb(105, 92, 85)" : "rgb(224, 222, 185)"
                    casa.appendChild(numero)
                }

                if (indexLinha === 7) {
                    const letraFlutuante = document.createElement('p')
                    letraFlutuante.classList.add('letra')
                    letraFlutuante.innerText = coluna
                    letraFlutuante.style.color = ehBranco ? "rgb(105, 92, 85)" : "rgb(224, 222, 185)"
                    casa.appendChild(letraFlutuante)
                }

            })
        })
    }

    RenderizarPecas(pecas) {
        this.LimparPecasDoTabuleiro()

        pecas.forEach(peca => {
            const casa = document.querySelector(`[data-casa="${peca.posicao}"]`)

            if (!casa) return

            const elemento = document.createElement('img')
            elemento.classList.add('Pecas-de-Xadrez')

            elemento.src = `/imgs/${simbolos[peca.cor][peca.tipo]}`

            casa.appendChild(elemento)
        })
    }

    LimparPecasDoTabuleiro() {
        const Pecas = document.querySelectorAll('.Pecas-de-Xadrez')

        Pecas.forEach(p => p.remove())
    }

    SelecionarCasa(posicao) {
        this.limparSelecao()

        const peca = this.jogo.buscarPeca(posicao)

        if (peca && peca.cor === this.jogo.turno) {
            if (this.jogo.modo === 'bot' && this.orientacaoDoTabuleiro !== this.jogo.turno) {
                return
            }

            this.casaSelecionada = posicao

            const casaHTML = document.querySelector(`[data-casa="${posicao}"]`)
            casaHTML.classList.add('casa-selecionada')

            const MovimentosLegais = this.jogo.ObterMovimentosLegais(posicao)

            if (MovimentosLegais.length > 0) {
                this.MostrarMovimentos(MovimentosLegais)
            }
        }
    }

    MostrarMovimentos(lista) {
        lista.forEach(posicao => {
            const casa = document.querySelector(`[data-casa="${posicao}"]`)

            if (this.jogo.pecas.find(p => p.posicao === posicao)) {
                casa.classList.add('captura')
            } else {
                casa.classList.add('movimento-possivel')
            }
        })
    }

    limparSelecao() {
        document.querySelectorAll('.casa-selecionada').forEach(c => {
            c.classList.remove('casa-selecionada')
        })

        document.querySelectorAll('.movimento-possivel').forEach(P => {
            P.classList.remove('movimento-possivel')
        })

        document.querySelectorAll('.captura').forEach(P => {
            P.classList.remove('captura')
        })

        document.querySelectorAll('.casa-origem').forEach(P => {
            P.classList.remove('casa-origem')
        })

        document.querySelectorAll('.casa-destino').forEach(P => {
            P.classList.remove('casa-destino')
        })
    }

    atualizarHistorico(infoLance, cor) {
        const tbody = document.querySelector('tbody')
        const scroll = document.querySelector('.tabela-scroll')

        function isAtBottom() {
            return scroll.scrollTop + scroll.clientHeight >= scroll.scrollHeight - 5;
        }

        const shouldScroll = isAtBottom();

        if (cor === 'branco') {
            this.numeroLance++
            const tr = document.createElement('tr')
            tr.id = `Lance${this.numeroLance}`

            const numeroDoLance = document.createElement('td')
            numeroDoLance.innerText = this.numeroLance

            const td = document.createElement('td')
            td.innerText = infoLance

            tbody.append(tr)
            tr.append(numeroDoLance)
            tr.append(td)
        } else {
            const LinhaTabela = document.querySelector(`#Lance${this.numeroLance}`)
            const DataTabela = document.createElement('td')
            DataTabela.innerText = infoLance

            if (LinhaTabela) {
                LinhaTabela.append(DataTabela)
            }
        }

        if (shouldScroll) {
            scroll.scrollTo({
                top: scroll.scrollHeight,
                behavior: "smooth"
            });
        }
    }

    limparContainerDePromocao() {
        this.ContainerDePromocao.style.display = 'none'
        this.ContainerDePromocao.innerHTML = ''
    }

    ExibirTelaDeResultados(resultado) {
        const Content = document.createElement('div')
        Content.classList.add('popUp-content')

        const ConteudoJogo = document.querySelector('#jogo')

        const AnunciamentoVencedor = document.createElement('h1')
        const Derivado = document.createElement('p')

        const CopiarMovimentos = document.createElement('p')
        CopiarMovimentos.innerText = 'Copiar movimentos'
        CopiarMovimentos.id = 'copiar-movimentos'
        CopiarMovimentos.addEventListener('click', async () => {
            const pgn = new PGN(this.jogo.historico)
            const pgnTexto = pgn.GerarPGN(this.jogo.resultadoFinal, this.jogo.turno)

            try {
                await navigator.clipboard.writeText(pgnTexto)

                CopiarMovimentos.innerText = 'Movimentos copiados!'
                CopiarMovimentos.id = 'copiado'

                setTimeout(() => {
                    CopiarMovimentos.innerText = 'Copiar movimentos'
                    CopiarMovimentos.id = 'copiar-movimentos'
                }, 2000)

            } catch (e) {
                console.log('Falha ao copiar PGN: ', e)
            }
        })

        const voltarParaOMenu = document.createElement('a')
        voltarParaOMenu.innerText = "Voltar para o menu"
        voltarParaOMenu.href = './../index.html'

        this.PopUpWrapper.appendChild(Content)

        if (resultado === 'desistencia') {
            let vencedor = this.jogo.turno === 'branco' ? 'Pretas' : 'Brancas'
            AnunciamentoVencedor.innerText = `Vitória das ${vencedor}`
            Derivado.innerText = 'Por Desistência'
        }

        if (resultado === 'material insuficiente') {
            AnunciamentoVencedor.innerText = 'Empate'
            Derivado.innerText = 'Por Material Insuficiente'
        } else if (resultado === 'empate') {
            AnunciamentoVencedor.innerText = 'Empate'
            Derivado.innerText = 'Por Afogamento'
        }

        if (resultado === 'checkmate') {
            let vencedor = this.jogo.turno === 'branco' ? 'Brancas' : 'Pretas'
            AnunciamentoVencedor.innerText = `Vitória das ${vencedor}`
            Derivado.innerText = 'Por Checkmate'
        }

        ConteudoJogo.classList.add('efeito-escuro')
        Content.appendChild(AnunciamentoVencedor)
        Content.appendChild(Derivado)
        Content.appendChild(CopiarMovimentos)
        Content.appendChild(voltarParaOMenu)

        this.PopUpWrapper.style.display = 'block'
    }

    Desistir() {
        const ConteudoJogo = document.querySelector('#jogo')

        const Content = document.createElement('div')
        Content.classList.add('popUp-content')

        const Pergunta = document.createElement('h1')
        Pergunta.innerText = "Tem certeza que deseja desistir?"

        const Desistir = document.createElement('button')
        Desistir.innerText = "Desistir"
        Desistir.classList.add('botao-opcao')
        Desistir.addEventListener('click', () => {
            this.PopUpWrapper.innerHTML = ''
            this.jogo.fimDeJogo = true
            this.jogo.resultadoFinal = 'desistencia'
            this.ExibirTelaDeResultados('desistencia')
        })

        const NaoDesistir = document.createElement('button')
        NaoDesistir.innerText = "Cancelar"
        NaoDesistir.classList.add('botao-opcao')
        NaoDesistir.addEventListener('click', () => {
            this.PopUpWrapper.innerHTML = ''
            ConteudoJogo.classList.remove('efeito-escuro')
            this.PopUpWrapper.style.display = 'none'
        })

        this.PopUpWrapper.appendChild(Content)
        Content.appendChild(Pergunta)
        Content.appendChild(Desistir)
        Content.appendChild(NaoDesistir)

        this.PopUpWrapper.style.display = 'block'
        ConteudoJogo.classList.add('efeito-escuro')
    }

    ExibirPromocoes(peca, posicaoAntiga, houveCaptura, roque) {
        const cor = peca.cor
        const Conteudo = document.createElement('div')
        Conteudo.classList.add('Promocao-Content')

        const ConteudoJogo = document.querySelector('#jogo')
        ConteudoJogo.classList.add('efeito-escuro')

        const promocoes = ['knight', 'bishop', 'rook', 'queen']
        const sufixo = cor === 'branco' ? 'white' : 'black'

        for (let i = 0; i < promocoes.length; i++) {
            const botao = document.createElement('button')
            botao.value = i
            const imagem = document.createElement('img')
            imagem.src = `/imgs/${sufixo}-${promocoes[i]}.png`

            this.ContainerDePromocao.appendChild(Conteudo)
            botao.appendChild(imagem)
            Conteudo.appendChild(botao)

            botao.onclick = () => {
                const resultado = this.jogo.promocao(peca, i, posicaoAntiga, houveCaptura, roque)
                ConteudoJogo.classList.remove('efeito-escuro')

                this.limparContainerDePromocao()
                this.atualizarInterface(resultado)
            }
        }

        this.ContainerDePromocao.style.display = 'block'
    }

    ExibirPecasCapturada(peca) {
        this.arrayCapturadas.push(peca)
        const imagemDasPecas = document.querySelectorAll('#barra-adversario img, #barra-jogador img')
        const corDoJogador = this.orientacaoDoTabuleiro === 'branco' ? 'branco' : 'preto'
        const IdPontos = document.querySelector('#pontos')

        if (IdPontos != null) {
            IdPontos.remove()
        }

        let PontosDoDisplay = 0
        this.arrayCapturadas.forEach(p => {
            if (p.cor === corDoJogador) {
                PontosDoDisplay -= p.pontos
            } else {
                PontosDoDisplay += p.pontos
            }
        })

        imagemDasPecas.forEach(img => img.remove())
        const pontos = document.createElement('p')
        pontos.id = "pontos"

        this.arrayCapturadas.sort((a, b) => a.pontos - b.pontos)

        for (const pecaCapturada of this.arrayCapturadas) {
            const imagemPeca = document.createElement('img')
            imagemPeca.src = `/imgs/${simbolos[pecaCapturada.cor][pecaCapturada.tipo]}`

            if (pecaCapturada.cor === corDoJogador) {
                this.barraDoAdversario.appendChild(imagemPeca)
            } else {
                this.barraDoJogador.appendChild(imagemPeca)
            }
        }

        if (PontosDoDisplay > 0) {
            pontos.textContent = `+${PontosDoDisplay}`
            this.barraDoJogador.appendChild(pontos)
        } else if (PontosDoDisplay < 0) {
            pontos.textContent = `+${PontosDoDisplay * (-1)}`
            this.barraDoAdversario.appendChild(pontos)
        }
    }

    ManipuladorDeClicks(evento) {
        let casa

        if (!this.Estados.EstaNoModoExibicao() || this.jogo.fimDeJogo) {
            casa = evento.target.closest('[data-casa]')
        }

        if (!casa) return

        const posicao = casa.dataset.casa

        if (
            (casa.classList.contains('movimento-possivel') ||
                casa.classList.contains('captura')) &&
            this.casaSelecionada &&
            !this.Estados.EstaNoModoExibicao()
        ) {
            const origem = this.casaSelecionada
            const resultado = this.jogo.mover(this.casaSelecionada, posicao)

            if (!resultado) return

            this.casaSelecionada = null

            if (resultado.promocao) {
                const peca = this.jogo.buscarPeca(posicao)
                this.ExibirPromocoes(peca, origem, resultado.houveCaptura, resultado.roque)
            } else {
                this.atualizarInterface(resultado)
            }

            return
        }

        this.SelecionarCasa(posicao)
    }

    marcarCasasDoUltimoLance(origem, destino) {
        const casaOrigem = document.querySelector(`[data-casa="${origem}"]`)
        casaOrigem.classList.add('casa-origem')

        const casaDestino = document.querySelector(`[data-casa="${destino}"]`)
        casaDestino.classList.add('casa-destino')
    }

    atualizarInterface(info) {
        this.limparSelecao()
        this.RenderizarPecas(this.jogo.pecas)
        this.marcarCasasDoUltimoLance(info.origem, info.destino)

        if (info.status) {
            setTimeout(() => {
                this.ExibirTelaDeResultados(info.status)
            }, 500)
        }

        if (info.houveCaptura) {
            this.ExibirPecasCapturada(info.capturada)
        }

        console.log(info.notacao)
        this.atualizarHistorico(info.notacao, info.cor)

        this.Clock.trocarTurno()

        this.TratarBotoesDeControle()
    }

    modoExibicaoVoltarLance() {
        const Estado = this.Estados.LanceAnterior()

        if (Estado) {
            this.atualizarInterfaceModoExibicao(Estado)
        }
    }

    modoExibicaoAvancarLance() {
        const Estado = this.Estados.LancePosterior()

        if (Estado) {
            this.atualizarInterfaceModoExibicao(Estado)
        }
    }

    atualizarInterfaceModoExibicao(Estado) {
        this.limparSelecao()
        this.RenderizarPecas(Estado.pecas)

        if (Estado.info) {
            this.marcarCasasDoUltimoLance(Estado.info.origem, Estado.info.destino)
        }

        this.TratarBotoesDeControle(Estado)
    }

    TratarBotoesDeControle(Estado = null) {
        if (Estado) {
            if (Estado.indice === 0) {
                this.BotaoAntes.disabled = true
            } else {
                this.BotaoAntes.disabled = false
            }

            if (Estado.indice === this.Estados.numeroEstado) {
                this.BotaoDepois.disabled = true
            } else {
                this.BotaoDepois.disabled = false
            }
        } else {
            if (this.Estados.numeroEstado === 0) {
                this.BotaoAntes.disabled = true
                this.BotaoDepois.disabled = true
            } else {
                this.BotaoAntes.disabled = false
            }
        }
    }
}

const simbolos = {
    branco: {
        rei: "white-king.png",
        rainha: "white-queen.png",
        torre: "white-rook.png",
        bispo: "white-bishop.png",
        cavalo: "white-knight.png",
        peao: "white-pawn.png"
    },
    preto: {
        rei: "black-king.png",
        rainha: "black-queen.png",
        torre: "black-rook.png",
        bispo: "black-bishop.png",
        cavalo: "black-knight.png",
        peao: "black-pawn.png"
    }
}