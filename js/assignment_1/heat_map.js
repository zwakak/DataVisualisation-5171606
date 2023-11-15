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

        const filteredStateData = data.filter(d => d.state === selected_state && d.scientific_name!=="Other");

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
            .domain([
                d3.min(filteredStateData, (d) => + d.tree_count),
                d3.median(filteredStateData, (d) => + d.tree_count),
                d3.max(filteredStateData, (d) => + d.tree_count),
            ])
           //.domain([0, d3.max(filteredStateData, d => d.tree_count)])
            .interpolator(d3.interpolateBuPu);


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

        var minLegend = d3.min(filteredStateData, (d) =>  + d.tree_count);
        var maxLegend = d3.max(filteredStateData, (d) =>  + d.tree_count);
        var sumMinMaxLegend =
            d3.max(filteredStateData, (d) =>  + d.tree_count) +
            d3.min(filteredStateData, (d) =>  + d.tree_count);

        var legendWidth = width * 0.8,
            legendHeight = 8;
        var legendsvg = svg
            .append("g")
            .attr("id", "legend")
            .attr(
                "transform",
                "translate(" + (legendWidth *.6) + "," + (height + 100) + ")"
            );
        var linearGradient = svg
            .append("linearGradient")
            .attr("id", "linear-gradient");
        //Horizontal gradient
        linearGradient
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");
        //Append multiple color stops by using D3's data/enter step
        linearGradient
            .selectAll("stop")
            .data([
                { offset: "0%", color: "white" },
                { offset: "50%", color: "#AAC3DE" },
                { offset: "100%", color: "#4D005F" },
            ])
            .enter()
            .append("stop")
            .attr("offset", function (d) {
                return d.offset;
            })
            .attr("stop-color", function (d) {
                return d.color;
            });
        //Draw the Rectangle
        legendsvg

            .append("rect")
            .attr("class", "legendRect")
            .attr("x", -legendWidth / 2 + 0.5)
            .attr("y", 10)
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#linear-gradient)")
            .style("stroke", "black")
            .style("stroke-width", "1px");

        //Set scale for x-axis
        var xScale2 = d3
            .scaleLinear()
            .range([0, legendWidth])
            .domain([
                d3.min(filteredStateData, (d) =>  + d.tree_count),
                d3.max(filteredStateData, (d) =>  + d.tree_count),
            ]);
        legendsvg
            .append("g")
            .call(
                d3
                    .axisBottom(xScale2)
                    .tickValues([
                        minLegend,
                        (sumMinMaxLegend / 2 + minLegend) / 2,
                        sumMinMaxLegend / 2,
                        (sumMinMaxLegend / 2 + maxLegend) / 2,
                        maxLegend,
                    ])
                    .tickFormat((x) => x.toFixed(2))
            )
            .attr("class", "axis")
            .attr("id", "legendAxis")
            .attr(
                "transform",
                "translate(" + -legendWidth / 2 + "," + (10 + legendHeight) + ")"
            );




    })
}