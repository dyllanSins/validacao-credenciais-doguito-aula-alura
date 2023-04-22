// Área pra enviar os dados buscados pra um verificador 'app.js' pra permitir o uso de termos gerais de input pra não ter a necessidade de repetição de código pra cada input diferente

export function valida(input) {
    const tipoDeInput = input.dataset.tipo

    if(validadores[tipoDeInput]) {
        validadores[tipoDeInput](input)
    }

    if(input.validity.valid) { //buscando dentro do input a classe de validity pra ver se é verdadeira ou falsa
        input.parentElement.classList.remove('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = ''
    } else {
        input.parentElement.classList.add('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro (tipoDeInput, input)
    }
}

// Área de ERROS

const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
]

const mensagemDeErro = {
    nome: {
        valueMissing: "O campo nome não pode estar vazio."
    },
    email: {
        valueMissing: "O campo email não pode estar vazio.",
        typeMismatch: "O e-mail digitado não é valido."
    },
    senha: {
        valueMissing: "O campo de senha não pode estar vazio.",
        patternMismatch: "A senha deve conter entre 6-12 caracteres,</br> Deve conter pelo menos uma letra maiusculas e um número.</br>E não pode conter caracteres especiais."
    },
    dataNascimento: {
        valueMissing: "O campo de data de nascimento não pode estar vazio.",
        customError: "Você deve ser maior de idade pra se cadastrar."
    },
    cpf: {
        valueMissing: "O campo de CPF não pode estar vazio.",
        customError: "O CPF digitado não é valido."
    },
    cep: {
        valueMissing: "O campo de CEP não pode estar vazio.",
        patternMismatch: "O CEP digitado não é valido.",
        customError: 'Não foi possivel buscar o CEP.'
    },
    logradouro: {
        valueMissing: "O campo de logradouro não pode estar vazio."
    },
    cidade: {
        valueMissing: "O campo de cidade não pode estar vazio."
    },
    estado: {
        valueMissing: "O campo de estado não pode estar vazio."
    },
    preco: {
        valueMissing: "O campo de preço não pode estar vazio."
    }
}

const validadores = {
    dataNascimento:input => validaDataNasc(input),
    cpf:input => validaCPF(input),
    cep:input => recuperarCEP(input)
}

function mostraMensagemDeErro(tipoDeInput, input) {

    let mensagem = ''
    tiposDeErro.forEach(erro => {
        if(input.validity[erro]) {
            mensagem = mensagemDeErro[tipoDeInput][erro]
        }
    })

    return mensagem
}

// Área pra erro caso a pessoa seja menor de idade

function validaDataNasc(input) {
    const dataRecebida = new Date(input.value)
    let mensagem = ""

    if(!maiorQue18(dataRecebida)) { //se for falsa a "!" vai validar, troca o atributo de verdadeiro pra falso
        mensagem = "Você deve ser maior de idade pra se cadastrar"

    }

    input.setCustomValidity(mensagem)
}

// Área pra comparar a data ATUAL com a data colocada no site

function maiorQue18 (data) {
    const dataAtual = new Date()

    const dataMais18 = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate())

    return dataMais18 <= dataAtual
}

// Área pra não permitir o uso de caracteres que não sejam numeros no CPF

function validaCPF(input) {
    const cpfFormatado = input.value.replace(/\D/g, '')
    let mensagem =''

    if(!checaCPFRepetido(cpfFormatado || !checaEstruturaCPF(cpfFormatado))) {
        mensagem = 'O CPF digitado não é válido.'
    }

    input.setCustomValidity(mensagem)

}

//Área pra checar se o CPF não esta com numeros repetidos

function checaCPFRepetido(cpf) {
    const valoresRepetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ]
    let cpfValido = true

    valoresRepetidos.forEach(valor => {
        if(valor == cpf) {
            cpfValido = false
        }
    })

    return cpfValido
}

function checaEstruturaCPF(cpf) {
    const multiplicador = 10

    return checaDigitoVerificador(cpf, multiplicador)
}

// Área pra ver se o digito verificador é valido

function checaDigitoVerificador(cpf, multiplicador) {
    if(multiplicador >= 12) {
        return true
    }

    let multiplicadorInicial = multiplicador
    let soma = 0
    const cpfSemDigitos = cpf.substr(0,multiplicador - 1).split('')
    const digitoVerificador = cpf.charAt(multiplicador - 1)
    for(let contador = 0; multiplicadorInicial > 1; multiplicadorInicial--) {
        soma = soma + cpfSemDigitos[contador] * multiplicadorInicial
        contador++
    }

    if(digitoVerificador == confirmaDigito(soma)) {
        return checaDigitoVerificador(cpf, multiplicador + 1)
    }

    return false
}

function confirmaDigito(soma) {
    return 11 - (soma % 11)
}

// Área pra resgatar a API de CEP e fazer a verificação se o CEP é valido ou não

function recuperarCEP(input) {
    const cep = input.value.replace(/\D/g, '')
    const url = `https://viacep.com.br/ws/${cep}/json/`
    const options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'content-type': 'application/json;charset=utf-8'
        }
    }

    if(!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url, options).then(
            response => response.json()
        ).then(
            data => {
                if(data.error) {
                    input.setCustomValidity('Não foi possivel buscar o CEP')
                    return
                }
                input.setCustomValidity('')
                preencheCamposComCEP(data)
                return
            }
        )
    }
}

// Área pra completar os campos logradouro, cidade e estado

function preencheCamposComCEP(data) {
    const logradouro = document.querySelector('[data-tipo="logradouro"]')
    const cidade = document.querySelector('[data-tipo="cidade"]')
    const estado = document.querySelector('[data-tipo="estado"]')

    logradouro.value = data.logradouro
    cidade.value = data.localidade
    estado.value = data.uf

}