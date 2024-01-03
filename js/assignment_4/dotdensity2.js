function drawDotDensityMap2(){
    var margin = {top: 20, right: 20, bottom: 90, left: 20},
        width = 1000 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    var svg = d3.select("#dotdensity2").append("svg").attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    var projection = d3.geoAlbersUsa()
        .translate([width / 4, height / 2]) // translate to center of screen
        .scale([90]); // scale things down so see entire US

    d3.queue()
        .defer(d3.json, "./data/assignment_4/states.json")

        .await(ready);


    function ready(error, topo) {

        projection.fitSize([width*.9, height], topo)

        const tooltip = d3.select("#dotdensity2")
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

            .attr("class", function(d){ return "Country" } )
            .on("mouseover", mouseOver )
            .on("mousemove", mousemove )
            .on("mouseleave", mouseLeave )

        d3.csv('./data/assignment_4/scientific_name_coordinates.csv', function (err, data){
            if(err)
                throw err;

            var names = Array.from(new Set(data.map(function (e){
                if(e.scientific_name === "Acer saccharinum" || e.scientific_name==="Fraxinus pennsylvanica"
                    || e.scientific_name==="Acer platanoides" || e.scientific_name==="Picea pungens"
                    || e.scientific_name==="Acer saccharum" || e.scientific_name==="Malus" || e.scientific_name==="Juglans nigra"
                || e.scientific_name==="Acer" || e.scientific_name==="Syringa"||e.scientific_name==="Tilia americana"){
                    return e.scientific_name
                }

            }))).sort()

            names = names.filter(d => d!==undefined);


            names.push("Other")
            console.log(names)
            var color = d3.scaleOrdinal()
                .domain(names)
                .range(d3.schemePaired);

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
                .style("fill", function(d){
                    return color(d.scientific_name)
                })

            var size = 12
            var legend = svg.append('g')
                .attr('class', 'legend')
                .attr('transform', 'translate(' + (800) + ', 200)');

            legend.selectAll('rect')
                .data(names)
                .enter()
                .append('rect')
                .attr('x', 0)
                .attr("y", function(d,i){ return 100 + i*(size+10)})
                .attr('width', size)
                .attr('height', size)
                .attr('fill', function(d, i){

                    return color(d);
                })


            legend.selectAll('text')
                .data(names)
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
                    return color(d);
                })
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")


        })
    }
}

drawDotDensityMap2()