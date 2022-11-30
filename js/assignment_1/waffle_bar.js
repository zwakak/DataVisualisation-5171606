function drawWaffleBar() {
    d3.csv("./data/tree_to_neighborhood.csv",function (data) {
        const treesNames = Object.keys(data[0]).filter(d => d != "circoscrizione");
        const statesNames = data.map(d => d.circoscrizione);
        var treeColor = d3.schemePaired
        var sm_margin = 15;
        var sm_width = 150;
        var sm_height = 170;
        var squareDimension = 20
        var squarePadding = .5

        for (let state = 0; state < statesNames.length; state++) {
            var values = Object.values(data[state]).splice(1);
            var total = values.reduce((a, b) => parseInt(a) + parseInt(b), 0)
            values = values.map(v => Math.round(v * 100 / total));
            values[values.length - 1] -= values.reduce((a, b) => a + b, 0) - 100;


            const svg = d3.select("#graph4")
                .append("svg")
                .attr("width", sm_width + sm_margin + 8)
                .attr("height", sm_height)
                .append("g")
                .attr("transform", `translate(${sm_margin},${50})`)


            svg.append("text")
                .attr("transform", "translate(" + (sm_width / 2) + " ," + -10 + ")")
                .style("text-anchor", "middle")
                .style("font-size", "15")
                .style("fill", "white")
                .text(statesNames[state])// + " " + values)

            var tooltip = d3.select("body")
                .append("div")
                .style('visibility', 'hidden')
                .attr("class", "tooltip")

            var x = 0
            var y = 0
            for (let i = 0; i < values.length; i++) {
                for (let n_tree = 0; n_tree < values[i]; n_tree++) {

                    let className = "STATE" + state + treesNames[i].replaceAll(" ", "_");

                    svg.append("rect")
                        .attr("width", squareDimension)
                        .attr("height", squareDimension)
                        .attr("x", x)
                        .attr("y", y)
                        .attr("transform", `translate(${15},0)`)
                        .attr("fill", treeColor[i])
                        .attr("class", className)
                        .on("mouseover", function (d, j) {
                            tooltip.html(treesNames[i])
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
        var legend = d3.select("#graph4").append('svg')

            .attr('class', 'legend')
            .attr('height', 220)
            .attr('transform', 'translate(' + (600) + ', -220)');
        legend.selectAll('g')
            .data(treesNames)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr("y", function(d,i){ return 100 + i*(size+10)})
            .attr('width', size)
            .attr('height', size)
            .attr('fill', function(d, i){
                return treeColor[i];
            });

        legend.selectAll('text')
            .data(treesNames)
            .enter()

            .append('text')
            .attr("class", "tooltip")
            .attr("padding", "0px")
            .text(function(d){
                return d;
            })
            .attr("x", size*1.8)
            .attr("y", function(d,i){ return 100 + i*(size+10) + (size/2)})
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', function(d, i){
                return treeColor[i];
            }).attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

    });

}


drawWaffleBar()
