function drawSankey() {


// set the dimensions and margins of the graph
    var margin = {top: 10, right: 50, bottom: 10, left: 50},
        width = 700 - margin.left - margin.right,
        height = 1100 - margin.top - margin.bottom;


    var color = d3.scaleOrdinal(d3.schemeCategory20);

// append the svg object to the body of the page
    var svg = d3.select("#graph").append("svg")
        .attr("width", 900)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" +  margin.right + "," + margin.top + ")");

    const tooltip = d3.select("#graph")
        .append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden")
// Set the sankey diagram properties
    var sankey = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .size([width, height]);


// load the data
    d3.csv("./data/assignment_2/sankey_data.csv", function (error, data) {

       // data = data.filter(d=>d.count > 12000)
        var cityTotalCounts = d3.nest()
            .key(function(d) { return d.city; })
            .rollup(function(v) { return d3.sum(v, function(d) { return +d.count; }); })
            .entries(data);


        // Filter cities with a total count below 40000
        var filteredCities = cityTotalCounts.filter(function(d) {
            return d.value >= 40000;
        });


        // Filter the original data to include only the selected cities
        data = data.filter(d => filteredCities.map(function(d) {
            return d.key;
        }).includes(d.city));


        var graph = {"nodes": [], "links": []};

        data.forEach(function (d) {
            graph.nodes.push({name: d.state, type: "state"});
            graph.nodes.push({name: d.city, type: "city"});
            graph.nodes.push({name: d.scientific_name, type: "scientific_name"});
        });

        ``
        // return only the distinct / unique nodes
        graph.nodes = graph.nodes.filter(function (node, index, self) {
            return self.findIndex(n => n.name === node.name) === index;
        });

        data.forEach(function (d) {
          /*  if (graph.nodes.findIndex(function (n) {

                return n.name === d.city && n.type === "city"
            }) === -1) {
                console.log(d)
            }

            if (graph.nodes.findIndex(function (n) {

                return n.name === d.state && n.type === "state"
            }) === -1) {
                console.log("-----------")
                console.log(d)
            }

            if (graph.nodes.findIndex(function (n) {

                return n.name === d.scientific_name && n.type === "scientific_name"
            }) === -1) {

                console.log("########")
                console.log(d)
            }*/


            var stateIndex = graph.nodes.findIndex(function (n) {
                return n.name === d.state && n.type === "state";
            });

            var cityIndex = graph.nodes.findIndex(function (n) {
                return n.name === d.city && n.type === "city";
            });

            var scientificNameIndex = graph.nodes.findIndex(function (n) {
                return n.name === d.scientific_name && n.type === "scientific_name";
            });

            // Check if a link with the same source and target already exists
            var existingLink = graph.links.find(function (link) {
                return link.source === stateIndex && link.target === cityIndex;
            });

            // If the link already exists, update its value
            if (existingLink) {
                existingLink.value += parseInt(d.count);
            } else {
                // If the link doesn't exist, add a new one
                graph.links.push({
                    source: stateIndex,
                    target: cityIndex,
                    value: parseInt(d.count)
                });
            }

            // Add the link between city and scientific_name
            graph.links.push({
                source: cityIndex,
                target: scientificNameIndex,
                value: parseInt(d.count)
            });

        });

        graph = sankey(graph);


        svg.append("g")
            .selectAll(".link")
            .data(graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function (d) {
                return d.width;
            })
            .style("fill", "none")
            .on("mouseover", function (d, i) {
                tooltip.html(`Count : ${d.value}`)
                    .style("visibility", "visible");
                d3.select(this).attr("fill", "red");
            })
            .on("mousemove", function () {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function (index) {
                tooltip.html(``).style("visibility", "hidden");
                d3.select(this).attr("fill", function () {
                    return "" + color[index] + "";
                })
            })



        svg.append("g")
            .selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + d.x0 + "," + d.y0 + ")";
            })
            .append("rect")
            .attr("height", function (d) {
                return d.y1 - d.y0;
            })
            .attr("width", sankey.nodeWidth())
            .style("fill", function (d, i) {
                return color(i);
            })

        svg.append("g")
            .selectAll(".node-text")
            .data(graph.nodes)
            .enter().append("text")
            .attr("class", "node-label")
            .attr("x", function (d) {
                return d.x1 +6;
            })
            .attr("y", function (d) {
                return (d.y0 + d.y1) / 2;
            })
            .attr("text-anchor", "start")
            .text(function (d) {
                return d.name;
            })
            .style("fill",function (d, i) {
                return color(i);
            })




    });

}

drawSankey()