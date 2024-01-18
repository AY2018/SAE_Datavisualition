Promise.all([
  fetch('state_crime.json').then(response => response.json()),
  fetch('./unemployment.json').then(response => response.json())
]).then(([crimeData, unemploymentData]) => {
  const averageViolentCrimeRates = calculateAverageRates(crimeData);
  const unemploymentRates = calculateUnemploymentRates(unemploymentData);

  // Merge the two datasets
  const mergedData = mergeData(averageViolentCrimeRates, unemploymentRates);

  createChart(mergedData, 'scatter');
});

function calculateAverageRates(data) {
  const yearlyData = {};

  // Aggregate data by year
  data.forEach(stateData => {
    const year = stateData.Year;
    const violentRate = stateData.Data.Rates.Violent.All;

    if (!yearlyData[year]) {
      yearlyData[year] = { totalRate: 0, count: 0 };
    }

    yearlyData[year].totalRate += violentRate;
    yearlyData[year].count++;
  });

  // Calculate average rate per year
  const averageRates = Object.keys(yearlyData).map(year => {
    return {
      year,
      averageRate: yearlyData[year].totalRate / yearlyData[year].count
    };
  });

  return averageRates;
}

function calculateUnemploymentRates(data) {
  return data.map(entry => ({
    year: entry.year.toString(), // Convert the year to string if necessary
    unemploymentRate: entry.unemployed_percent // Extract the unemployment percent
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
          label: 'Average Violent Crime Rate',
          data: data.map(row => row.averageRate),
          borderWidth: 1,
          borderColor: 'red',
          backgroundColor: 'red', // Red color for the crime rate line
          yAxisID: 'y1'
        },
        {
          label: 'Unemployment Rate',
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
          text: 'Evolution of Crime Rate and Unemployment Rate Over the Years'
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
            text: 'Number of crimes'
          }
        },
        y2: {
          beginAtZero: true,
          position: 'right',
          title: {
            display: true,
            text: 'Unemployment Rate (%)'
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
