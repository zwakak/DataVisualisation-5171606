function drawColorpleth1(){
    var margin = {top: 20, right: 20, bottom: 90, left: 20},
        width = 1000 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;


    var svg = d3.select("#colorpleth").append("svg").attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2]) // translate to center of screen
        .scale([100]); // scale things down so see entire US


    d3.csv("./data/assignment_4/state_total_tree_counts.csv", function(data) {
        data.forEach(function(d) {
            d.total_tree_count = parseInt(d.total_tree_count);
        });



        var colorScale = d3.scaleThreshold()
            .domain([200, 1000,5000, 50000, 100000, 700000])
            .range(d3.schemeGreens[7]);

        d3.json("./data/assignment_4/states.json", function(topo) {
            for (var i = 0; i < data.length; i++) {


                // Grab State Name
                var dataState = data[i].state;
                // Grab data value
                var stateTreeCount = data[i].total_tree_count;
                var stateArea = data[i].area;


                // Find the corresponding state inside the GeoJSON
                for (var j = 0; j < topo.features.length; j++) {
                    var jsonState = topo.features[j].properties.name;


                    if (dataState === jsonState) {
                        // Copy the data value into the JSON
                        topo.features[j].properties.total_tree_count = stateTreeCount;
                        topo.features[j].properties.area = stateArea;

                        // Stop looking through the JSON
                        break;
                    }
                }
            }


            projection.fitSize([width*.9, height*.9], topo)

            const tooltip = d3.select("#colorpleth")
                .append("div")
                .attr("class", "tooltip")
                .style("visibility", "hidden")

            let mouseOver = function(d) {

                d3.selectAll(".Country")
                    .transition()
                    .duration(200)
                    .style("opacity", .5)
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                    .style("stroke", "black")
                tooltip
                    .html("State: " + `<b>${d.properties.name}</b>` + "<br>" + "Total Number of Trees: " +
                        `<b>${d.properties.total_tree_count!==undefined?d.properties.total_tree_count:0}</b>` +
                        "<br>" + "Area: " + `<b>${d.properties.area} Km<sup>2</b>`
                    )
                    .style("visibility", "visible")
            }

            let mouseLeave = function(d) {
                tooltip
                    .style("visibility", "hidden")
                d3.selectAll(".Country")
                    .transition()
                    .duration(200)
                    .style("opacity", 1)
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("stroke", "black")
            }
            let mousemove = function(d) {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            }

            // Draw the map
            svg.selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                // draw each country
                .attr("d", d3.geoPath()
                    .projection(projection)
                ).attr("class", "Country").style("stroke", "black")
                // set the color of each country
                .style("fill", function (d) {
                    var value = d.properties.total_tree_count;
                    return value !== undefined ?colorScale(  value):"white";
                })



                .on("mouseover", mouseOver )
                .on("mousemove", mousemove )
                .on("mouseleave", mouseLeave )


            var legend = svg.selectAll('g.legendEntry')
                .data(colorScale.range().reverse())
                .enter()
                .append('g').attr("class", "legendEntry").attr("transform",
                "translate(-50,330)");

            legend
                .append('rect')
                .attr("x", width - 120)
                .attr("y", function(d, i) {
                    return i * 20;
                })
                .attr("width", 10)
                .attr("height", 10)
                .style("stroke", "black")
                .style("stroke-width", 1)
                .style("fill", function(d){return d;});


            legend
                .append('text')
                .attr("x", width - 100) //leave 5 pixel space after the <rect>
                .attr("y", function(d, i) {
                    return i * 20;
                })
                .attr("dy", "0.8em")
                .text(function(d,i) {
                    var extent = colorScale.invertExtent(d);
                    if(extent[0]===undefined)
                        return "0" +" - " +(+extent[1]);
                    if(extent[1]===undefined)
                        return +extent[0] + "+";
                    return (+extent[0]) + " - " + (+extent[1]);
                }).attr("fill", "white");

        })
    })


}
drawColorpleth1()