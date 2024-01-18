Promise.all([
    fetch('state_crime.json').then((response) => response.json()),
    fetch('./unemployment.json').then((response) => response.json()),
]).then(([crimeData, unemploymentData]) => {
    const averageViolentCrimeRates = calculateAverageRates(crimeData);
    const unemploymentRates = calculateUnemploymentRates(unemploymentData);

    // Merge the two datasets
    const mergedData = mergeData(averageViolentCrimeRates, unemploymentRates);

    createChart(mergedData, 'line');

    // Appeler displayCorrelationCoefficient ici avec les données chargées
    displayCorrelationCoefficient(averageViolentCrimeRates, unemploymentRates);
});

function calculateAverageRates(data) {
    const yearlyData = {};

    data.forEach((stateData) => {
        const year = parseInt(stateData.Year); 
        if (year >= 1960 && year <= 2010) { 
            const violentRate = stateData.Data.Rates.Violent.All;

            if (!yearlyData[year]) {
                yearlyData[year] = { totalRate: 0, count: 0 };
            }

            yearlyData[year].totalRate += violentRate;
            yearlyData[year].count++;
        }
    });

  // Calculate average rate per year
  const averageRates = Object.keys(yearlyData).map(year => {
    return {
      year,
      averageRate: (yearlyData[year].totalRate * 1000) / yearlyData[year].count
    };
  });

  return averageRates;
}

function calculateUnemploymentRates(data) {
    return data.filter(entry => {
        const year = parseInt(entry.year);
        return year >= 1960 && year <= 2010;
    }).map(entry => ({
        year: entry.year.toString(),
        unemploymentRate: entry.unemployed_percent,
    }));
}


function mergeData(crimeData, unemploymentData) {
  return crimeData.map(crimeEntry => {
    const unemploymentEntry = unemploymentData.find(uEntry => uEntry.year === crimeEntry.year);
    return {
      year: crimeEntry.year,
      averageRate: crimeEntry.averageRate,
      unemploymentRate: unemploymentEntry ? unemploymentEntry.unemploymentRate : null
    };
  });
}

function createChart(data, type) {
  const ctx = document.getElementById('myChart');
  new Chart(ctx, {
    type: type,
    data: {
      labels: data.map(row => row.year),
      datasets: [
        {
          label: 'Nombre de crimes',
          data: data.map(row => row.averageRate),
          borderWidth: 1,
          borderColor: 'red',
          backgroundColor: 'red', // Red color for the crime rate line
          yAxisID: 'y1'
        },
        {
          label: 'Taux de chômage',
          data: data.map(row => row.unemploymentRate),
          borderWidth: 1,
          borderColor: 'yellow', // Yellow color for the unemployment rate line
          backgroundColor: 'rgba(255, 255, 0, 0.5)', // Semi-transparent yellow
          yAxisID: 'y2'
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Evolution du Nombre de crimes & et du Taux de chômage aux US'
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y1: {
          beginAtZero: true,
          position: 'left',
          title: {
            display: true,
            text: 'Nombre de crimes'
          }
        },
        y2: {
          beginAtZero: true,
          position: 'right',
          title: {
            display: true,
            text: 'Taux de chômahe (%)'
          },
          grid: {
            drawOnChartArea: false // only show the grid for y1
          }
        },
        x: {
          title: {
            display: true,
            text: 'Years'
          }
        }
      },
      maintainAspectRatio : false,
    }
  });
}


function calculateCorrelationCoefficient(crimeData, unemploymentData) {
  const n = crimeData.length;
  let sum_x = 0, sum_y = 0, sum_xy = 0, sum_x2 = 0, sum_y2 = 0;

  for (let i = 0; i < n; i++) {
    const x = crimeData[i];
    const y = unemploymentData[i];

    console.log(`x (${i}): ${x}, y (${i}): ${y}`); 

    sum_x += x;
    sum_y += y;
    sum_xy += (x * y);
    sum_x2 += (x * x);
    sum_y2 += (y * y);
  }

  console.log(`Sum_x: ${sum_x}, Sum_y: ${sum_y}, Sum_xy: ${sum_xy}, Sum_x2: ${sum_x2}, Sum_y2: ${sum_y2}`); // Imprime les sommes

  const numerator = (n * sum_xy - sum_x * sum_y);
  const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));

  console.log(`Numerator: ${numerator}, Denominator: ${denominator}`); // Imprime le numérateur et le dénominateur

  if (denominator === 0) {
    console.error('Erreur : Dénominateur zéro dans le calcul de corrélation');
    return NaN;
  }

  const correlationCoefficient = numerator / denominator;

  return correlationCoefficient;
}



function displayCorrelationCoefficient(crimeData, unemploymentData) {
    const filteredData = mergeData(crimeData, unemploymentData).filter(
        (entry) => entry.unemploymentRate !== null
    );

    console.log('Filtered Data:', filteredData);

    const crimeRates = filteredData.map((entry) => entry.averageRate);
    const unemploymentRates = filteredData.map(
        (entry) => entry.unemploymentRate
    );

    console.log('Crime Rates:', crimeRates);
    console.log('Unemployment Rates:', unemploymentRates);

    const correlationCoefficient = calculateCorrelationCoefficient(
        crimeRates,
        unemploymentRates
    );

    console.log('Correlation Coefficient:', correlationCoefficient);

    document.getElementById(
        'coeffCorrelation'
    ).innerText = `${correlationCoefficient.toFixed(2)}`;
}
