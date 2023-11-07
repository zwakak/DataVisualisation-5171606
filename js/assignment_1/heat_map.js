const states3 =  fetch('./data/assignment_1/states.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
states3.then(function (data){
    const stateSelect3 = document.getElementById('stateSelect3');

    data.forEach((state) => {

        const option = document.createElement('option');
        option.value = state;
        option.text = state;
        stateSelect3.appendChild(option);

    });
    drawHeatMap(data[0])
})

$("#stateSelect3").on('change', function(){

    const selected_state = $(this).val();

    drawHeatMap(selected_state)
});

function drawHeatMap(selected_state){
    d3.select("#graph5").select("svg").remove();

    var margin = {top: 20, right: 20, bottom: 150, left: 150},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;




//Read the data
    d3.csv("./data/assignment_1/tree_occurrences_with_city.csv", function(data) {
        var svg = d3.select("#graph5")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        const filteredStateData = data.filter(d => d.state === selected_state);

        const cityNames = Array.from(new Set(filteredStateData.map(d => d.city)));
        const treeNames = Object.keys(filteredStateData[0]).filter(d => d != "state" && d!="city");


// Build X scales and axis:
        var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(cityNames)
            .padding(0.01);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(0,20)rotate(-90)")

// Build X scales and axis:
        var y = d3.scaleBand()
            .range([ height, 0 ])
            .domain(treeNames)
            .padding(0.01);

        svg.append("g")
            .attr("class", "axis")

            .call(d3.axisLeft(y))
           ;


// Build color scale
        const myColor = d3.scaleSequential()
            .interpolator(d3.interpolateInferno)
            .domain([0, d3.max(filteredStateData, function(d, i) {
                //console.log(filteredStateData[i][treeNames])
                return Object.keys(filteredStateData[0]).filter(d => d != "state" && d!="city")
            })])

        svg.selectAll()
            .data(filteredStateData, function(d, i) {
                return cityNames[i]+':'+treeNames[i];})
            .enter()
            .append("rect")
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("x", function(d, i) {
                return x(cityNames[i]) })
            .attr("y", function(d, i) { return y(treeNames[i]) })
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d, i) {

                console.log((d[treeNames[i]]))

                return myColor(d[treeNames[i]])} )
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)

    })
}