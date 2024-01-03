function drawDotDensityMap1(){
    var margin = {top: 20, right: 20, bottom: 90, left: 20},
        width = 1000 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;


    var svg = d3.select("#dotdensity1").append("svg").attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2]) // translate to center of screen
        .scale([100]); // scale things down so see entire US

   d3.queue()
        .defer(d3.json, "./data/assignment_4/states.json")

        .await(ready);


    function ready(error, topo) {

        projection.fitSize([width, height], topo)

        const tooltip = d3.select("#dotdensity1")
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
                .html("State: " + `<b>${d.properties.name}</b>`
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
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            // set the color of each country
            .attr("fill", "white")
            .style("stroke", "black")

            .attr("class", function(d){
                return "Country" } )
            .on("mouseover", mouseOver )
            .on("mousemove", mousemove )
            .on("mouseleave", mouseLeave )

        d3.csv('./data/assignment_4/scientific_name_coordinates.csv', function (err, data){
            if(err)
                throw err;
            svg.append('g')
                .selectAll("dot")
                .data(data)
                .enter().append("circle")
                .attr("cx", function (d) {
                    // compute x on svg from latitude

                    var valProj = projection([d.longitude_coordinate,d.latitude_coordinate])
                    return valProj!=null? valProj[0]:null
                })
                .attr("cy", function (d) {
                    // compute y on svg from latitude
                    var valProj = projection([d.longitude_coordinate,d.latitude_coordinate])
                    return valProj!=null? valProj[1]:null
                   // return projection([d.longitude_coordinate,d.latitude_coordinate])[1]
                })
                .attr("r", 2.5)
                .style("fill", "green")
        })
    }
}

drawDotDensityMap1()