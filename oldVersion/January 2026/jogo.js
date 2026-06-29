const tabuleiro = document.querySelector('.tabuleiro')
const ContainerDePromocao = document.querySelector('.Promocao-Container')
const TelaDeResultados = document.querySelector('.popUp-wrapper')
let corDoJogador = 'branco'
let pecas = []
let pecaSelecionada = null
let peaoSujeitoAEnPassant
let turnoAtual

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

function IniciarJogo() {
    RenderizarTabuleiro()
    PosicaoInicial()
    RenderizarPecas()
    turnoAtual = 'branco'
}

function RenderizarTabuleiro() {

    tabuleiro.innerHTML = ''

    const colunas = corDoJogador === 'branco'
        ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a']

    const linhas = corDoJogador === 'branco'
        ? [8, 7, 6, 5, 4, 3, 2, 1]
        : [1, 2, 3, 4, 5, 6, 7, 8]

    linhas.forEach((linha, indexLinha) => {
        colunas.forEach((coluna, indexColuna) => {

            const casa = document.createElement('div')
            const nomeDaCasa = `${coluna}${linha}`

            const ehBranco = (indexLinha + indexColuna) % 2 === 0
            casa.classList.add(ehBranco ? 'casa-branca' : 'casa-preta')

            casa.dataset.casa = nomeDaCasa
            tabuleiro.appendChild(casa)

            if (indexColuna === 0) {
                const numero = document.createElement('p')
                numero.classList.add('numero')
                numero.innerText = linha
                numero.style.color = ehBranco ? "rgb(11, 87, 40)" : "rgb(224, 222, 185)"
                casa.appendChild(numero)
            }

            if (indexLinha === 7) {
                const letraFlutuante = document.createElement('p')
                letraFlutuante.classList.add('letra')
                letraFlutuante.innerText = coluna
                letraFlutuante.style.color = ehBranco ? "rgb(29, 131, 68)" : "rgb(224, 222, 185)"
                casa.appendChild(letraFlutuante)
            }

        })
    })
}

function RenderizarPecas() {
    tabuleiro.innerHTML = ''

    RenderizarTabuleiro()

    pecas.forEach(peca => {
        const casa = document.querySelector(`[data-casa="${peca.posicao}"]`)

        if (!casa) return

        const elemento = document.createElement('img')
        elemento.classList.add('Pecas-de-Xadrez')

        elemento.src = `/imgs/${simbolos[peca.cor][peca.tipo]}`

        casa.appendChild(elemento)
    })
}

class Peca {
    constructor(tipo, cor, posicao, notacao) {
        this.tipo = tipo
        this.cor = cor
        this.posicao = posicao
        this.movida = false
        this.notacao = notacao
    }
}

function gerarNotacao(peca, novaPosicao, posicaoAntiga, Captura, check, roque, status) {
    let checkmate = false
    let empate = false

    if (status) {
        switch (status) {
            case 'checkmate':
                checkmate = true
                break
            case 'empate':
                empate = true
                break
        }
    }

    if (roque && checkmate) {
        return `${roque}#`
    } else if (roque && check) {
        return `${roque}+`
    } else if (roque) {
        return roque
    }

    const pecasIguais = pecas.filter(p => p.tipo === peca.tipo && p.cor === peca.cor)
    const movimentos = []

    if (pecasIguais.length > 1) {
        pecasIguais.forEach(p => {
            movimentos.push(...CalcularMovimentos(p))
        })
    }

    const PosicoesDuplicadas = movimentos.filter(m => m === novaPosicao).length

    if (PosicoesDuplicadas) {
        if (checkmate) return `${peca.notacao}${posicaoAntiga}#${novaPosicao}`
        if (check && Captura) return `${peca.notacao}${posicaoAntiga}x${novaPosicao}+`
        if (check) return `${peca.notacao}${posicaoAntiga}+${novaPosicao}`
        if (Captura) return `${peca.notacao}${posicaoAntiga}x${novaPosicao}`

        return `${peca.notacao}${posicaoAntiga}${novaPosicao}`
    }

    if (checkmate) return `${peca.notacao}#${novaPosicao}`
    if (check && Captura) return `${peca.notacao}x${novaPosicao}+`
    if (check) return `${peca.notacao}+${novaPosicao}`
    if (Captura) return `${peca.notacao}x${novaPosicao}`

    return `${peca.notacao}${novaPosicao}`
}

function PosicaoInicial() {
    pecas = []

    const ordem = ['torre', 'cavalo', 'bispo', 'rainha', 'rei', 'bispo', 'cavalo', 'torre']
    const notacao = ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']

    for (let i = 0; i < 8; i++) {
        let coluna = String.fromCharCode(97 + i)

        pecas.push(new Peca(ordem[i], 'branco', coluna + '1', notacao[i]))
        pecas.push(new Peca(ordem[i], 'preto', coluna + '8', notacao[i]))

        pecas.push(new Peca('peao', 'branco', coluna + '2', ''))
        pecas.push(new Peca('peao', 'preto', coluna + '7', ''))
    }
}

function BuscarPeca(posicao) {
    return pecas.find(p => p.posicao === posicao)
}

// Seleção das Casas

tabuleiro.addEventListener('click', (evento) => {
    const casa = evento.target.closest('[data-casa]')
    if (!casa) return

    const posicao = casa.dataset.casa

    if (casa.classList.contains('movimento-possivel') && pecaSelecionada) {
        MoverPecaPara(posicao)
        return
    }

    SelecionarCasa(posicao)
})


function SelecionarCasa(posicao) {

    limparSelecao()

    const peca = BuscarPeca(posicao)

    if (peca && peca.cor === turnoAtual) {
        pecaSelecionada = peca

        const casaHTML = document.querySelector(`[data-casa="${posicao}"]`)
        casaHTML.classList.add('casa-selecionada')

        const MovimentosPossiveis = CalcularMovimentos(pecaSelecionada)
        const MovimentosLegais = []

        MovimentosPossiveis.forEach(movimento => {
            if (validarMovimento(peca, movimento)) {
                MovimentosLegais.push(movimento)
            }
        })

        if (MovimentosLegais.length > 0) {
            MostrarMovimentos(MovimentosLegais)
        }
    }
}

function limparSelecao() {
    document.querySelectorAll('.casa-selecionada').forEach(c => {
        c.classList.remove('casa-selecionada')
    })

    document.querySelectorAll('.movimento-possivel').forEach(P => {
        P.classList.remove('movimento-possivel')
    })
}

function Captura(posicao) {
    pecas = pecas.filter(p => p.posicao !== posicao)
}

function MoverPecaPara(novaPosicao) {

    const pecaDestino = BuscarPeca(novaPosicao)
    const podeCapturar = pecaDestino && pecaDestino.cor !== pecaSelecionada.cor
    let houveCaptura = false
    let roque = null
    let houvePromocao = false

    if (podeCapturar) {
        Captura(novaPosicao)
        houveCaptura = true
    }

    // Roque
    if (pecaSelecionada.tipo === 'rei') {
        const tipoDoRoque = identificarRoque(pecaSelecionada.posicao, novaPosicao)

        if (tipoDoRoque) {
            const { linha, coluna } = PosicaoParaIndice(pecaSelecionada.posicao)

            switch (tipoDoRoque) {
                case 'roque curto':
                    const torreCurta = BuscarPeca(IndiceParaPosicao(linha, 7))
                    if (torreCurta) {
                        torreCurta.posicao = IndiceParaPosicao(linha, coluna + 1)
                        torreCurta.movida = true
                        roque = '0.0'
                    }

                    break;

                case 'roque longo':
                    const torreLonga = BuscarPeca(IndiceParaPosicao(linha, 0))
                    if (torreLonga) {
                        torreLonga.posicao = IndiceParaPosicao(linha, coluna - 1)
                        torreLonga.movida = true
                        roque = '0.0.0'
                    }

                    break;
            }
        }
    }

    // EnPassant
    if (pecaSelecionada.tipo === 'peao' && peaoSujeitoAEnPassant && novaPosicao !== peaoSujeitoAEnPassant.posicao) {
        const { linha, coluna } = PosicaoParaIndice(peaoSujeitoAEnPassant.posicao)

        const EnPassant = pecaSelecionada.cor === 'branco'
            ? novaPosicao === IndiceParaPosicao(linha - 1, coluna)
            : novaPosicao === IndiceParaPosicao(linha + 1, coluna)

        if (EnPassant) {
            Captura(peaoSujeitoAEnPassant.posicao)
            houveCaptura = true
        }
    }

    const posicaoAntiga = pecaSelecionada.posicao
    pecaSelecionada.posicao = novaPosicao
    pecaSelecionada.movida = true

    // Promocao
    if (pecaSelecionada.tipo === 'peao') {
        const casaDePromocao = pecaSelecionada.cor === 'branco' ? '8' : '1'

        if (novaPosicao[1] === casaDePromocao) {
            ExibirPromocoes(pecaSelecionada, posicaoAntiga, houveCaptura, roque)
            return
        }
    }

    const status = statusDoJogo(pecaSelecionada)

    const notacaoDoMovimento = gerarNotacao(pecaSelecionada, novaPosicao, posicaoAntiga, houveCaptura, ReiEstaEmCheck(pecaSelecionada.cor === 'branco' ? 'preto' : 'branco'), roque, status, houvePromocao)
    console.log(notacaoDoMovimento)
    VerificarSeEAlvoDeEnPassant(pecaSelecionada, posicaoAntiga)

    pecaSelecionada = null

    limparSelecao()
    RenderizarPecas()

    if(status !== null) {
        ExibirTelaDeResultados(status)
    }

    turnoAtual = turnoAtual === 'branco' ? 'preto' : 'branco'
}

function MostrarMovimentos(lista) {
    lista.forEach(posicao => {
        const casa = document.querySelector(`[data-casa="${posicao}"]`)
        casa.classList.add('movimento-possivel')
    })
}

function CalcularMovimentos(peca) {
    switch (peca.tipo) {
        case "peao":
            return MovimentoPeao(peca)
        case "cavalo":
            return MovimentoCavalo(peca)
        case "bispo":
            return MovimentoBispo(peca)
        case "torre":
            return MovimentoTorre(peca)
        case "rainha":
            return MovimentoRainha(peca)
        case "rei":
            return MovimentoRei(peca)

        default:
            return []
    }
}

function PosicaoParaIndice(posicao) {
    const coluna = posicao.charCodeAt(0) - 97
    const linha = 8 - parseInt(posicao[1])
    return { linha, coluna }
}

function IndiceParaPosicao(linha, coluna) {
    const letra = String.fromCharCode(97 + coluna)
    const numero = 8 - linha
    return letra + numero
}

function MovimentoPeao(peca, somenteAtaque = false) {
    const movimentos = []
    const { linha, coluna } = PosicaoParaIndice(peca.posicao)
    let direcoes = []

    if (!somenteAtaque) {

        const PrimeiraCasaBloqueada = peca.cor === 'branco'
            ? BuscarPeca(IndiceParaPosicao(linha - 1, coluna))
            : BuscarPeca(IndiceParaPosicao(linha + 1, coluna))

        // Primeiro movimento
        if (peca.cor === 'branco' && !PrimeiraCasaBloqueada) direcoes.push(-1)
        if (peca.cor === 'preto' && !PrimeiraCasaBloqueada) direcoes.push(1)

        const PossuiDirecao = direcoes.length === 1

        // Segundo movimento
        if (PossuiDirecao && !peca.movida) {
            const SegundaCasaBloqueada = BuscarPeca(IndiceParaPosicao(linha + direcoes[0] * 2, coluna))

            if (!SegundaCasaBloqueada) {
                direcoes.push(direcoes[0] * 2)
            }
        }
    }

    // En Passant
    if (peaoSujeitoAEnPassant) {
        const capturaPossivel =
            peaoSujeitoAEnPassant.posicao === IndiceParaPosicao(linha, coluna + 1) ||
            peaoSujeitoAEnPassant.posicao === IndiceParaPosicao(linha, coluna - 1)

        if (capturaPossivel) {

            const { coluna: colunaPeao } = PosicaoParaIndice(peaoSujeitoAEnPassant.posicao)

            const capturaEnPassant = peca.cor === 'branco'
                ? IndiceParaPosicao(linha - 1, colunaPeao)
                : IndiceParaPosicao(linha + 1, colunaPeao)


            movimentos.push(capturaEnPassant)
        }
    }

    // Captura nas diagonais
    const CapturaNaDiagonal = peca.cor === 'branco'
        ? [-1, 1, -1]
        : [1, -1, 1]

    const Captura1 = IndiceParaPosicao(linha + CapturaNaDiagonal[0], coluna + CapturaNaDiagonal[1])
    const Captura2 = IndiceParaPosicao(linha + CapturaNaDiagonal[0], coluna + CapturaNaDiagonal[2])

    const alvo1 = BuscarPeca(Captura1)
    const alvo2 = BuscarPeca(Captura2)

    if (alvo1 && alvo1.cor != peca.cor) movimentos.push(Captura1)
    if (alvo2 && alvo2.cor != peca.cor) movimentos.push(Captura2)

    direcoes.forEach(direcao => {
        const novaLinha = linha + direcao

        if (novaLinha >= 0 && novaLinha < 8) {
            const novaPosicao = IndiceParaPosicao(novaLinha, coluna)

            if (!BuscarPeca(novaPosicao)) {
                movimentos.push(novaPosicao)
            }
        }
    })

    return movimentos
}

function MovimentoCavalo(peca) {
    const movimentos = []
    const { linha, coluna } = PosicaoParaIndice(peca.posicao)

    const movimentoCavaloEmLinha = [2, 2, -2, -2, 1, -1, 1, -1]
    const movimentoCavaloEmColuna = [-1, 1, 1, -1, 2, 2, -2, -2]

    for (let i = 0; i < movimentoCavaloEmColuna.length; i++) {

        const novaLinha = movimentoCavaloEmLinha[i] + linha
        const novaColuna = movimentoCavaloEmColuna[i] + coluna

        if (novaLinha < 0 || novaLinha > 7 || novaColuna < 0 || novaColuna > 7) {
            continue
        }

        const novaPosicao = IndiceParaPosicao(novaLinha, novaColuna)
        const pecaNaCasa = BuscarPeca(novaPosicao)

        if (!BuscarPeca(novaPosicao)) {
            movimentos.push(novaPosicao)
        }
        else if (pecaNaCasa.cor != peca.cor) {
            movimentos.push(novaPosicao)
        }
    }

    return movimentos
}

function MovimentoBispo(peca) {
    const movimentos = []
    const { linha, coluna } = PosicaoParaIndice(peca.posicao)

    const direcoes = [
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
    ]

    direcoes.forEach(([dLinha, dColuna]) => {
        let novaLinha = linha + dLinha
        let novaColuna = coluna + dColuna

        while (novaLinha >= 0 && novaLinha <= 7 && novaColuna >= 0 && novaColuna <= 7) {
            const novaPosicao = IndiceParaPosicao(novaLinha, novaColuna)
            const PecaNoCaminho = BuscarPeca(novaPosicao)

            if (!PecaNoCaminho) {
                movimentos.push(novaPosicao)
            }
            else if (PecaNoCaminho.cor !== peca.cor) {
                movimentos.push(novaPosicao)
                break
            }
            else {
                break
            }

            novaLinha += dLinha
            novaColuna += dColuna
        }
    })

    return movimentos
}

function MovimentoTorre(peca) {
    const movimentos = []
    const { linha, coluna } = PosicaoParaIndice(peca.posicao)

    const direcoes = [
        [-1, 0],
        [1, 0],
        [0, 1],
        [0, -1],
    ]

    direcoes.forEach(([dLinha, dColuna]) => {
        let novaLinha = linha + dLinha
        let novaColuna = coluna + dColuna

        while (novaLinha >= 0 && novaLinha <= 7 && novaColuna >= 0 && novaColuna <= 7) {
            const novaPosicao = IndiceParaPosicao(novaLinha, novaColuna)
            const PecaNoCaminho = BuscarPeca(novaPosicao)

            if (!PecaNoCaminho) {
                movimentos.push(novaPosicao)
            } else if (PecaNoCaminho.cor !== peca.cor) {
                movimentos.push(novaPosicao)
                break
            } else {
                break
            }

            novaLinha += dLinha
            novaColuna += dColuna
        }
    })

    return movimentos
}

function MovimentoRainha(peca) {
    const movimentos = []
    const { linha, coluna } = PosicaoParaIndice(peca.posicao)

    const direcoes = [
        [-1, 0],
        [1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
    ]

    direcoes.forEach(([dLinha, dColuna]) => {
        let novaLinha = linha + dLinha
        let novaColuna = coluna + dColuna

        while (novaLinha >= 0 && novaLinha <= 7 && novaColuna >= 0 && novaColuna <= 7) {
            const novaPosicao = IndiceParaPosicao(novaLinha, novaColuna)

            const PecaNoCaminho = BuscarPeca(novaPosicao)

            if (!PecaNoCaminho) {
                movimentos.push(novaPosicao)
            } else if (PecaNoCaminho.cor !== peca.cor) {
                movimentos.push(novaPosicao)
                break
            } else {
                break
            }

            novaLinha += dLinha
            novaColuna += dColuna
        }
    })

    return movimentos
}

function MovimentoRei(peca, semRoque = false) {
    const movimentos = []
    const { linha, coluna } = PosicaoParaIndice(peca.posicao)

    const direcoes = [
        [-1, 0],
        [1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, -1],
        [-1, 1],
    ]

    direcoes.forEach(([dLinha, dColuna]) => {
        let novaLinha = linha + dLinha
        let novaColuna = coluna + dColuna

        if (novaLinha >= 0 && novaLinha <= 7 && novaColuna >= 0 && novaColuna <= 7) {
            const novaPosicao = IndiceParaPosicao(novaLinha, novaColuna)
            const PecaNoCaminho = BuscarPeca(novaPosicao)

            if (!PecaNoCaminho) {
                movimentos.push(novaPosicao)
            }
            else if (PecaNoCaminho.cor !== peca.cor) {
                movimentos.push(novaPosicao)
            }
            else {
            }
        }
    })

    if (!semRoque) {
        movimentos.push(...Roque(peca))
    }

    return movimentos
}

function Roque(peca) {

    let movimentos = []

    if (!peca.movida && !ReiEstaEmCheck(peca.cor) && peca.cor === turnoAtual) {

        const { caminhoCurtoLivre, caminhoLongoLivre } = caminhoLivreParaRoque(peca)
        const { linha, coluna } = PosicaoParaIndice(peca.posicao)

        const torreCurta = BuscarPeca(IndiceParaPosicao(linha, 7))

        const PodeRocarCurto =
            caminhoCurtoLivre &&
            torreCurta &&
            torreCurta.tipo === 'torre' &&
            !torreCurta.movida

        if (PodeRocarCurto) {
            movimentos.push(IndiceParaPosicao(linha, coluna + 2))
        }

        const torreLonga = BuscarPeca(IndiceParaPosicao(linha, 0))

        const PodeRocarLongo =
            caminhoLongoLivre &&
            torreLonga &&
            torreLonga.tipo === 'torre' &&
            !torreLonga.movida

        if (PodeRocarLongo) {
            movimentos.push(IndiceParaPosicao(linha, coluna - 2))
        }
    }

    return movimentos
}

function caminhoLivreParaRoque(rei) {
    const { linha, coluna } = PosicaoParaIndice(rei.posicao)
    const CasasRoqueCurto = [
        IndiceParaPosicao(linha, coluna + 1),
        IndiceParaPosicao(linha, coluna + 2)
    ]

    const CasasRoqueLongo = [
        IndiceParaPosicao(linha, coluna - 1),
        IndiceParaPosicao(linha, coluna - 2),
        IndiceParaPosicao(linha, coluna - 3),
    ]

    const AtaqueInimigo = []
    const Inimigos = pecas.filter(p => p.cor != rei.cor)

    Inimigos.forEach(inimigo => {
        const movimentosDoInimigo = CalcularMovimentosSemRoque(inimigo)
        AtaqueInimigo.push(...movimentosDoInimigo)
    })

    const CasasCurtasEstaoSendoAtacadas = CasasRoqueCurto.some(c => AtaqueInimigo.includes(c))
    const CasasLongasEstaoSendoAtacadas = CasasRoqueLongo.some(c => AtaqueInimigo.includes(c))

    const caminhoCurtoLivre =
        !BuscarPeca(CasasRoqueCurto[0]) &&
        !BuscarPeca(CasasRoqueCurto[1]) &&
        !CasasCurtasEstaoSendoAtacadas

    const caminhoLongoLivre =
        !BuscarPeca(CasasRoqueLongo[0]) &&
        !BuscarPeca(CasasRoqueLongo[1]) &&
        !BuscarPeca(CasasRoqueLongo[2]) &&
        !CasasLongasEstaoSendoAtacadas

    return { caminhoCurtoLivre, caminhoLongoLivre }
}

function CalcularMovimentosSemRoque(peca) {
    if (peca.tipo === 'rei') {
        return MovimentoRei(peca, true)
    }
    if (peca.tipo === 'peao') {
        return MovimentoPeao(peca, true)
    }
    return CalcularMovimentos(peca)
}

function ReiEstaEmCheck(cor) {
    const rei = pecas.find(p => p.tipo === 'rei' && p.cor === cor)
    const inimigos = pecas.filter(p => p.cor !== cor)

    for (let i = 0; i < inimigos.length; i++) {
        const movimentos = CalcularMovimentosSemRoque(inimigos[i])

        if (movimentos.includes(rei.posicao)) {
            return true
        }
    }

    return false
}

function validarMovimento(peca, novaPosicao) {
    const PosicaoOriginal = peca.posicao

    const pecaCapturada = pecas.find(p => p.posicao === novaPosicao)

    peca.posicao = novaPosicao

    if (pecaCapturada) {
        pecas = pecas.filter(p => p !== pecaCapturada)
    }

    const emCheck = ReiEstaEmCheck(peca.cor)

    peca.posicao = PosicaoOriginal
    if (pecaCapturada) {
        pecas.push(pecaCapturada)
    }

    return !emCheck
}

function identificarRoque(posicaoAntiga, posicaoNova) {

    const { linha, coluna } = PosicaoParaIndice(posicaoAntiga)

    if (IndiceParaPosicao(linha, coluna - 2) === posicaoNova) {
        return 'roque longo'
    } else if (IndiceParaPosicao(linha, coluna + 2) === posicaoNova) {
        return 'roque curto'
    }

    return null
}

function VerificarSeEAlvoDeEnPassant(peca, posicaoAntiga) {
    if (peca.tipo !== 'peao') {
        peaoSujeitoAEnPassant = null
        return
    }

    const { linha, coluna } = PosicaoParaIndice(posicaoAntiga)

    if (IndiceParaPosicao(linha + 2, coluna) === peca.posicao) {
        peaoSujeitoAEnPassant = peca
        return
    }

    if (IndiceParaPosicao(linha - 2, coluna) === peca.posicao) {
        peaoSujeitoAEnPassant = peca
        return
    }

    peaoSujeitoAEnPassant = null
    return
}

function statusDoJogo(peca) {
    const inimigos = pecas.filter(p => p.cor !== peca.cor)
    let existeMovimentoLegal = false

    for (let i = 0; i < inimigos.length; i++) {
        const movimentos = CalcularMovimentos(inimigos[i])

        for (let j = 0; j < movimentos.length; j++) {
            if (validarMovimento(inimigos[i], movimentos[j])) {
                existeMovimentoLegal = true
                break
            }
        }
    }

    const corDoAdversario = peca.cor === 'branco' ? 'preto' : 'branco'

    if (!existeMovimentoLegal && ReiEstaEmCheck(corDoAdversario)) {
        return 'checkmate'
    }

    if (!existeMovimentoLegal && !ReiEstaEmCheck(corDoAdversario)) {
        return 'empate'
    }

    if(VerificarEmpatePorMaterialInsuficiente()) {
        return 'material insuficiente'
    }

    return null
}

function ExibirPromocoes(peca, posicaoAntiga, houveCaptura, roque) {
    const cor = peca.cor
    const Conteudo = document.createElement('div')
    Conteudo.classList.add('Promocao-Content')

    const promocoes = ['knight', 'bishop', 'rook', 'queen']
    const sufixo = cor === 'branco' ? 'white' : 'black'

    for (let i = 0; i < promocoes.length; i++) {
        const botao = document.createElement('button')
        botao.value = i
        const imagem = document.createElement('img')
        imagem.src = `/imgs/${sufixo}-${promocoes[i]}.png`

        ContainerDePromocao.appendChild(Conteudo)
        botao.appendChild(imagem)
        Conteudo.appendChild(botao)

        botao.onclick = () => promocao(peca, i, posicaoAntiga, houveCaptura, roque)
    }

    ContainerDePromocao.style.display = 'block'
}

function promocao(peca, valor, posicaoAntiga, houveCaptura, roque) {

    switch(valor) {
        case 0:
            peca.tipo = 'cavalo'
            peca.notacao = 'N'
            break
        case 1:
            peca.tipo = 'bispo'
            peca.notacao = 'B'
            break
        case 2:
            peca.tipo = 'torre'
            peca.notacao = 'R'
            break
        case 3:
            peca.tipo = 'rainha'
            peca.notacao = 'Q'
            break
    }

    const status = statusDoJogo(peca)

    const notacaoDoMovimento = gerarNotacao(
        peca, peca.posicao, posicaoAntiga,
        houveCaptura, ReiEstaEmCheck(peca.cor === 'branco' ? 'preto' : 'branco'),
        roque, status, true
    )

    console.log(notacaoDoMovimento)

    limparContainerDePromocao()
    RenderizarPecas()
    turnoAtual = turnoAtual === 'branco' ? 'preto' : 'branco'
    pecaSelecionada = null
}

function limparContainerDePromocao() {
    ContainerDePromocao.style.display = 'none'
    ContainerDePromocao.innerHTML = ''
}

function ExibirTelaDeResultados(resultado) {
    const Content = document.createElement('div')
    Content.classList.add('popUp-content')

    const AnunciamentoVencedor = document.createElement('h1')
    const Derivado = document.createElement('p')

    const CopiarMovimentos = document.createElement('p')
    CopiarMovimentos.innerText = 'Copiar movimentos'
    CopiarMovimentos.id = 'copiar-movimentos'

    const voltarParaOMenu = document.createElement('a')
    voltarParaOMenu.innerText = "Voltar para o menu"

    TelaDeResultados.appendChild(Content)

    if(resultado === 'empate') {
        AnunciamentoVencedor.innerText = 'Empate'
        Derivado.innerText = 'Por Afogamento'
        console.log('1/2 1/2')
    }

    if(resultado === 'checkmate') {
        let vencedor = turnoAtual === 'branco' ? 'brancas' : 'pretas'
        AnunciamentoVencedor.innerText = `Vitória das ${vencedor}`
        Derivado.innerText = 'Por Checkmate'
    }

    if(resultado === 'material insuficiente') {
        AnunciamentoVencedor.innerText = 'Empate'
        Derivado.innerText = 'Por Material Insuficiente'
        console.log('1/2 1/2')
    }

    Content.appendChild(AnunciamentoVencedor)
    Content.appendChild(Derivado)
    Content.appendChild(CopiarMovimentos)
    Content.appendChild(voltarParaOMenu)

    TelaDeResultados.style.display = 'block'
}

function VerificarEmpatePorMaterialInsuficiente() {
    const pecasSemRei = pecas.filter(p => p.tipo !== 'rei')

    if (pecasSemRei.length === 0) return true

    if (pecasSemRei.length === 1) {
        const tipo = pecasSemRei[0].tipo
        return tipo === 'bispo' || tipo === 'cavalo'
    }

    if (pecasSemRei.length === 2) {
        const [p1, p2] = pecasSemRei

        if (p1.tipo === 'bispo' && p2.tipo === 'bispo') {

            const corCasa = (pos) => {
                const { linha, coluna } = PosicaoParaIndice(pos)
                return (linha + coluna) % 2
            }

            return corCasa(p1.posicao) === corCasa(p2.posicao)
        }
    }

    return false
}