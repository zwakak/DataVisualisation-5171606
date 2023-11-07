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
    d3.csv("./data/assignment_1/city_tree_counts_top_5.csv", function(data) {
        data.forEach(function(d){
            d.tree_count = parseInt(d.tree_count);
        });
        var svg = d3.select("#graph5")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        const filteredStateData = data.filter(d => d.state === selected_state);

        const cityNames = Array.from(new Set(filteredStateData.map(d => d.city)));
        const treeNames = Array.from(new Set(filteredStateData.map(d => d.scientific_name)));
        //const treeNames = Object.keys(filteredStateData[0]).filter(d => d != "state" && d!="city");


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
            .attr("transform", "translate(-10,20)rotate(-45)")

// Build X scales and axis:
        var y = d3.scaleBand()
            .range([ height, 0 ])
            .domain(treeNames)
            .padding(0.01);

        svg.append("g")
            .attr("class", "axis")

            .call(d3.axisLeft(y));


// Build color scale
        const color = d3.scaleSequential()
            .domain([0, d3.max(filteredStateData, d => d.tree_count)])
            .interpolator(d3.interpolateBuPu);


        console.log(d3.max(d3.map(d=>d.tree_count)))
        const tooltip = d3.select("#graph5")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden")

        svg.selectAll()
            .data(filteredStateData, function(d, i) {

                return d.city+':'+d.scientific_name;})
            .enter()
            .append("rect")
            .attr('id', (d, i)=> 'rect'+i)
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("x", function(d, i) {
                return x(d.city)
            })

            .attr("y", function(d, i) { return y(d.scientific_name) })
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .attr("fill", function(d, i) {
                return color(d.tree_count)} )
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mousemove", function () {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseover", function (d, i){
                const numOfOccurrences = d.tree_count;
                const name = d.scientific_name;
                tooltip
                    .html("Tree Name: " + `<b>${name}</b>` + "<br>" + "Number of Occurness: " + `<b>${numOfOccurrences}</b>`)
                    .style("visibility", "visible")
                d3.select(this).attr("fill", "#fc3565");
            })
            .on("mouseleave", function (){
                tooltip
                    .style("visibility", "hidden")
                d3.select(this).attr("fill", function(d){
                    return color(d.tree_count);
                });
            })



    })
}