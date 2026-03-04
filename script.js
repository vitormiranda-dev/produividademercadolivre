Chart.register(ChartDataLabels);

let banco = JSON.parse(localStorage.getItem("bancoProducoes")) || {};

let mesSelecionadoInput = document.getElementById("mesSelecionado");
let mesAtual = new Date().toISOString().slice(0,7);
mesSelecionadoInput.value = mesAtual;

let producoes = banco[mesAtual] || {};

let meta = localStorage.getItem("meta") || 0;
document.getElementById("metaAtual").innerText = "Meta atual: " + meta;

function salvarMeta() {
    meta = document.getElementById("meta").value;
    localStorage.setItem("meta", meta);
    document.getElementById("metaAtual").innerText = "Meta atual: " + meta;
    atualizarResumo();
}

function trocarMes(){
    mesAtual = document.getElementById("mesSelecionado").value;
    producoes = banco[mesAtual] || {};
    atualizarGrafico();
    atualizarResumo();
}

function adicionarProducao() {
    let data = document.getElementById("data").value;
    let valor = document.getElementById("producao").value;

    if (data && valor) {

        let partes = data.split("-");
        let ano = partes[0];
        let mes = partes[1];
        let dia = partes[2];

        let mesData = ano + "-" + mes;

        if(mesData !== mesAtual){
            alert("Selecione o mês correto antes de adicionar.");
            return;
        }

        let dataFormatada = dia + "/" + mes + "/" + ano;

        producoes[dataFormatada] = parseInt(valor);

        banco[mesAtual] = producoes;
        localStorage.setItem("bancoProducoes", JSON.stringify(banco));

        atualizarGrafico();
        atualizarResumo();

        document.getElementById("producao").value = "";
    }
}

function excluirDia(){

    let data = document.getElementById("dataExcluir").value;

    if(!data){
        alert("Selecione uma data.");
        return;
    }

    let partes = data.split("-");
    let ano = partes[0];
    let mes = partes[1];
    let dia = partes[2];

    let mesData = ano + "-" + mes;

    if(mesData !== mesAtual){
        alert("Essa data não pertence ao mês selecionado.");
        return;
    }

    let dataFormatada = dia + "/" + mes + "/" + ano;

    if(producoes[dataFormatada] !== undefined){

        if(confirm("Deseja excluir " + dataFormatada + "?")){

            delete producoes[dataFormatada];

            banco[mesAtual] = producoes;
            localStorage.setItem("bancoProducoes", JSON.stringify(banco));

            atualizarGrafico();
            atualizarResumo();

            document.getElementById("dataExcluir").value = "";
        }

    } else {
        alert("Não existe produção nessa data.");
    }
}

function limparGrafico(){
    if(confirm("Deseja apagar toda produção do mês atual?")){
        producoes = {};
        banco[mesAtual] = {};
        localStorage.setItem("bancoProducoes", JSON.stringify(banco));
        atualizarGrafico();
        atualizarResumo();
    }
}

function calcularTotal() {
    let total = 0;
    for (let dia in producoes) {
        total += producoes[dia];
    }
    return total;
}

function atualizarResumo() {
    let total = calcularTotal();
    let totalSpan = document.getElementById("totalMes");
    totalSpan.innerText = total;

    totalSpan.style.color = total < 719 ? "red" : "green";

    if (meta > 0) {
        let perc = ((total / meta) * 100).toFixed(1);
        document.getElementById("percentual").innerText = perc + "%";
    }
}

function gerarCores() {
    return Object.values(producoes).map(valor => {
        return valor < 719 ? "red" : "blue";
    });
}

let ctx = document.getElementById('grafico').getContext('2d');

let grafico = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: 'Produção por Dia',
            data: [],
            backgroundColor: '#3f51b5',
            borderRadius: 4,
            barThickness: 28
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,

        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    autoSkip: false,
                    font: {
                        size: 12,
                        weight: 'bold'
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: '#e0e0e0'
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            }
        },

       plugins: {
    legend: {
        labels: {
            font: {
                size: 14,
                weight: 'bold'
            }
        }
    },

    datalabels: {
        anchor: 'end',
        align: 'top',
        offset: 4,
        color: '#000',
        font: {
            weight: 'bold',
            size: 12
        }
    },

    zoom: {
        pan: {
            enabled: true,
            mode: 'x'
        },
        zoom: {
            wheel: {
                enabled: true
            },
            pinch: {
                enabled: true
            },
            mode: 'x'
        }
    }
}
    }
    
});
function atualizarGrafico() {

    let labelsOriginais = Object.keys(producoes);
    let labelsSomenteDia = labelsOriginais.map(data => data.split("/")[0]);

    grafico.data.labels = labelsSomenteDia;
    grafico.data.datasets[0].data = Object.values(producoes);
    grafico.data.datasets[0].backgroundColor = gerarCores();

    grafico.update();
}

atualizarGrafico();
atualizarResumo();
