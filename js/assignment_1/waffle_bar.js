const states4 =  fetch('./data/assignment_1/states.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
states4.then(function (data){
    const stateSelect4 = document.getElementById('stateSelect4');
    data.forEach((state) => {

        const option = document.createElement('option');
        option.value = state;
        option.text = state;
        stateSelect4.appendChild(option);

    });
    drawWaffleBar(data[0])
})

$("#stateSelect4").on('change', function(){

    const selected_state = $(this).val();

    drawWaffleBar(selected_state)
});

function drawWaffleBar(selected_state) {
    d3.select("#graph6").selectAll("svg").remove();

    d3.csv("./data/assignment_1/tree_occurrences_with_city.csv",function (data) {
        /*data.forEach(function(d) {
           d.tree_count = parseInt(d.tree_count);
           d.avg_mean = parseFloat(d.avg_mean);
       });*/
        const filteredStateData = data.filter(d => d.state === selected_state);

        const cityNames = Array.from(new Set(filteredStateData.map(d => d.city)));
        const treeNames = Object.keys(filteredStateData[0]).filter(d => d != "state" && d!="city");


        var treeColor = d3.schemePaired
        var sm_margin = 15;
        var sm_width = 300;
        var sm_height = 250;
        var squareDimension = 20
        var squarePadding = .5

        var legend = d3.select("#graph6").append('svg')

            .attr('class', 'legend')
            .attr('height', 120)
            .attr('transform', 'translate(0, -50)');
        for (let state = 0; state < cityNames.length; state++) {
            var values = Object.values(filteredStateData[state]).splice(2);

            var total = values.reduce((a, b) => parseInt(a===''?0:a) + parseInt(b===''?0:b), 0)

            values = values.map(v => Math.round(v * 100 / total));
            values[values.length - 1] -= values.reduce((a, b) => a + b, 0) - 100;


            const svg = d3.select("#graph6")
                .append("svg")
                .attr("width", sm_width + sm_margin + 8)
                .attr("height", sm_height)
                .append("g")
                .attr("transform", `translate(${sm_margin},${50})`)


            svg.append("text")
                .attr("transform", "translate(" + (120) + " ," + -10 + ")")
                .style("text-anchor", "middle")
                .style("font-size", "15")
                .style("fill", "white")
                .text(cityNames[state])// + " " + values)

            var tooltip = d3.select("body")
                .append("div")
                .style('visibility', 'hidden')
                .attr("class", "tooltip")

            var x = 0
            var y = 0


            for (let i = 0; i < values.length; i++) {
                for (let n_tree = 0; n_tree < values[i]; n_tree++) {

                    let className = "STATE" + state + treeNames[i].replaceAll(" ", "_");

                    svg.append("rect")
                        .attr("width", squareDimension)
                        .attr("height", squareDimension)
                        .attr("x", x)
                        .attr("y", y)
                        .attr("transform", `translate(${15},0)`)
                        .attr("fill", treeColor[i])
                        .attr("class", className)
                        .on("mouseover", function (d, j) {
                            tooltip.html(treeNames[i])
                                .style("visibility", "visible");
                            d3.selectAll("." + className).style("fill", "#fc3565");
                        })
                        .on("mousemove", function () {
                            tooltip
                                .style("top", (event.pageY - 10) + "px")
                                .style("left", (event.pageX + 10) + "px");
                        })
                        .on("mouseout", function () {
                            tooltip.style("visibility", "hidden");
                            d3.selectAll("." + className).style("fill", treeColor[i]);
                        });

                    x += squareDimension + squarePadding
                    if (x != x % ((squareDimension + squarePadding) * 10))
                        y += squareDimension + squarePadding
                    x %= (squareDimension + squarePadding) * 10
                }
            }
        }

        var size = 12

        legend.selectAll('g')
            .data(treeNames)
            .enter()
            .append('rect')
            .attr('x', 50)
            .attr("y", function(d,i){ return i*(size+10)})
            .attr('width', size)
            .attr('height', size)
            .attr('fill', function(d, i){
                return treeColor[i];
            });

        legend.selectAll('text')
            .data(treeNames)
            .enter()

            .append('text')
            .attr("class", "tooltip")
            .attr("padding", "0px")
            .text(function(d){
                return d;
            })
            .attr("x", 80)
            .attr("y", function(d,i){ return  i*(size+10) + (size/2)})
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', function(d, i){
                return treeColor[i];
            }).attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

    });

}