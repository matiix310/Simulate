const CHART_COLORS = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

const matieres = getMatieres();
var selectedMatiereIndex = 0;

const polarData = {
    labels: getNotes(0, false).map(_ => { return _.value+"/"+_.sur+" ("+_.coef+")" }),
    datasets: [{
        label: 'Note',
        data: getNotes(0, false).map(_ => { 
            let value = parseFloat(_.value.replace(',', '.'));
            let sur = parseFloat(_.sur.replace(',', '.'));

            if (sur == 20) return value;
            
            // mettre la note sur 20;
            return (Math.round((value/sur)*2000)/100);
        }),
        backgroundColor: Object.values(CHART_COLORS),
    }],
};

const polarConfig = {
    type: 'bar',
    data: polarData,
    options: {
        scales: {
            y: {
                beginAtZero: true,
                max: 20
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
    }
};

const gradeChart = new Chart(
    document.getElementById('gradeChart'),
    polarConfig
);

// donut graph

const donutData = {
    labels: matieres.map(_ => { return _.name; }),
    datasets: [{
      label: 'My First Dataset',
      data: matieres.map(_ => { return parseFloat(_.coef); }),
      backgroundColor: Object.values(CHART_COLORS),
      hoverOffset: 4
    }]
  };

const donutConfig = {
    type: 'doughnut',
    data: donutData,
    options: {
        plugins: {
            legend: {
                display: false
            }
        },
        borderWidth: 3,
        onClick(e) {
          const activePoints = coefsChart.getElementsAtEventForMode(e, 'nearest', {
            intersect: true
          }, false)
          if (activePoints.length == 0) return;
          const [{
            index
          }] = activePoints;

          $('.gradeChart h1').text(matieres[index].name)
          editGraphMatiere(index);
        }
    }
};

const coefsChart = new Chart(
    document.getElementById('coefsChart'),
    donutConfig
);

// resize graph

window.onresize = () => {
    setgraphSize();
}

function setgraphSize() {
    let width = window.innerWidth;
    let height = window.innerHeight;

    if (width/3 < (80/100)*(70/100)*height) $('.chartContainer').css('width', width/3 + "px");
    else $('.chartContainer').css('width', (90/100)*(80/100)*(70/100)*height + "px");
}

setgraphSize();

// init le nom de la matiere
$('.gradeChart h1').text(matieres[0].name);


function editGraphMatiere(index) {
    polarData.datasets[0].data = getNotes(index, false).map(_ => { 
        let value = parseFloat(_.value.replace(',', '.'));
        let sur = parseFloat(_.sur.replace(',', '.'));

        if (sur == 20) return value;
        
        // mettre la note sur 20;
        return (Math.round((value/sur)*2000)/100);
    })

    polarData.labels = getNotes(index, false).map(_ => { return _.value+"/"+_.sur+" ("+_.coef+")" }),

    gradeChart.update();
}