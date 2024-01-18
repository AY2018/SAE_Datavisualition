function moveImg() {
        let main = document.getElementById('main');
        main.classList.add('move');
      }

      // HIGHLIGHT CORRESPONDING STATE
 function highlight(idStr) {
        var element = document.getElementById(idStr);
        if (element) {
          element.classList.add('hover-highlight');
        }
      }

      function unhighlight(idStr) {
        var element = document.getElementById(idStr);
        if (element) {
          element.classList.remove('hover-highlight');
        }
      }
      
console.log(d3);
console.log(topojson);

let stateURL = './topo.json';

let crimeURL = './crime-rate-by-state-2024.json';

let stateData;
let crimeData;

let canvas = d3.select('#canvas')
                
let tooltip = d3.select('#tooltip');


let drawMap = () => {
    canvas.selectAll('path')
        .data(stateData)
        .enter()
        .append('path')
        .attr('d', d3.geoPath())
        .attr('class', 'state')
        .attr('id', (stateDataItem) => stateDataItem.id)
        .attr('fill', (stateDataItem) => {
    let id = stateDataItem['id'];
    let state = crimeData.find((item) => item['id'] === id);

    // Check if the state is found in crimeData
    if (state) {
        let percentage = (state['CrimeRate'] * 100) / 100000;

        // Log state ID, found state object, and calculated percentage

        if(percentage <= 3){
            return 'red';
        } else if(percentage <= 4){
            return 'rgb(182, 1, 1)';
        } else if(percentage <= 5){
            return 'rgb(108, 2, 2)';
        } else {
            return 'rgb(43, 0, 0)';
        }
    } else {
        // Log if the state is not found
        console.error(`State with ID ${id} not found in crimeData`);
        return 'gray'; // Default color if the state is not found
    }
})


       

        // Tooltip
        .on('mouseover', (event, stateDataItem) => {
    tooltip.transition()
        .style('visibility', 'visible');

    let id = stateDataItem['id']; 
    let state = crimeData.find((item) => item['id'] === id);

    if (state) {
        // Calculate percentage within the scope of this function
        let percentage = (state['CrimeRate'] * 100) / 100000;
        
        tooltip.text(
            state['state'] + ' : ' + percentage.toFixed(2) + '%'
        );

        tooltip.attr('data-crime', percentage.toFixed(2));
    } else {
        console.error('No matching state found for id:', id);
        tooltip.text('No data'); // Display placeholder text or handle the error
    }
})




        .on('mouseout', (stateDataItem) => {
            tooltip.transition()
                .style('visibility', 'hidden');

            let id = stateDataItem['id']; 
            let state = crimeData.find((item) => {
                return item['fips'] === id;
            });

            if (state) {
                tooltip.text(state['fips']);
            } else {
                console.error('No matching state found for id:', id);
                tooltip.text('No data'); // Display placeholder text or handle the error
            }
})

}

d3.json(stateURL).then(
    (data, error) => {
        if(error){
            console.log(log);
        } else {
            stateData = topojson.feature(data, data.objects.states).features
            console.log(stateData);

            d3.json(crimeURL).then(
                (data, error)=>{
                    if(error) {
                        console.log(error);
                    }else{
                        crimeData = data;
                        console.log(crimeData);
                        drawMap();
                    }
                    
                }
            )
        }
    }
)
    