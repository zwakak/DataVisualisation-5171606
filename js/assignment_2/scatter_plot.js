function drawScatterPlot(){
    var margin = {top: 20, right: 20, bottom: 90, left: 150},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

//Read the data
    d3.csv("./data/trees.csv", function(data) {
        data=data.filter(function( obj ) {
            obj.Height = parseFloat(obj.Height)
            return (obj.Name === "Celtis australis" || obj.Name==="Aesculus hippocastanum"
                || obj.Name==="Carpinus betulus" || obj.Name==="Tilia cordata"
                || obj.Name==="Platanus x hispanica" || obj.Name==="Tilia x europaea");
        });
        var uniqueNames = Array.from(new Set(data.map(e=>e.Name)))


        const color = d3.scaleOrdinal()
            .domain(uniqueNames)
            .range(d3.schemePaired);
        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, 50])
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("class", "axis")
            .selectAll("text").style('fill', "white");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 60])
            .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("class", "axis")
            .selectAll("text").style('fill', "white");



        var tooltip = d3.select("#scatter")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden")
        // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        const mouseover = function (d) {
            // Highlight the specie that is hovered

            highlight(d)

            tooltip
                .html("Tree Name: " + `<b>${d.Name}</b>` + "<br>" + "Height: " + `<b>${d.Height}</b>`+ "<br>" + "CO2 Absorption: " + `<b>${d.CO2}</b>`)
                .style("visibility", "visible")
        }
        const mousemove = function (d) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        }

        const mouseleave = function (d) {

            removeHighlight(d)

            tooltip.html(``).style("visibility", "hidden");
        }

        function highlight(d){
            selected_specie =typeof d === 'string'? d: d.Name

            d3.selectAll(".dot")
                .transition()
                .duration(200)
                .style("fill", "lightgrey")
                .attr("r", 3)

            d3.selectAll(".dot." + selected_specie.replace(/\s/g, "."))
                .transition()
                .duration(200)
                .style("fill", color(selected_specie))
                .attr("r", 7)
        }
        function removeHighlight(d){
            d3.selectAll(".dot")
                .transition()
                .duration(200)
                .style("fill", d => color(d.Name))
                .attr("r", 5)
        }
        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function (d) { return "dot " + d.Name })

            .attr("cx", function (d) { return x(d.Height); } )
            .attr("cy", function (d) { return y(d.CO2); } )
            .attr("r", 5)
            .style("fill", function (d) { return color(d.Name) })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)


        var size = 12
        var legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(' + (300) + ', -100)');

        legend.selectAll('rect')
            .data(uniqueNames)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr("y", function(d,i){ return 100 + i*(size+10)})
            .attr('width', size)
            .attr('height', size)
            .attr('fill', function(d, i){
                return color(d);
            })
            .on("mouseover", highlight)
          //  .on("mousemove", mousemove)
            .on("mouseleave", removeHighlight)

        legend.selectAll('text')
            .data(uniqueNames)
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
            .on("mouseover", highlight)
            //.on("mousemove", mousemove)
            .on("mouseleave", removeHighlight)


        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width  - 250)
            .attr("y", height + 60)
            .text("Height")
            .style("fill","white");

        svg.append("text")
            .attr("x", -250)
            .attr("y", -50)
            .text("CO2 Absorption")
            .style("fill","white")
            .attr("transform", "rotate(-90)");
    })

}

drawScatterPlot()