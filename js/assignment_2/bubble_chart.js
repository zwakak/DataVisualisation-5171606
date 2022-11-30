function drawBubbleChart(){
    var margin = {top: 20, right: 20, bottom: 90, left: 150},
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var svg = d3.select("#bubble")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    d3.csv("./data/trees.csv", function(data) {
        data=data.filter(function( e ) {
            e.CanopyCover = parseFloat(e.CanopyCover)
            e.Height = parseFloat(e.Height)
            return (e.Name === "Celtis australis" || e.Name==="Aesculus hippocastanum"
                || e.Name==="Carpinus betulus" || e.Name==="Tilia cordata"
                || e.Name==="Platanus x hispanica" || e.Name==="Tilia x europaea");
        });

        var uniqueNames = Array.from(new Set(data.map(e=>e.Name)))

        var x = d3.scaleLinear()
            .domain([0, Math.max(...data.map(e=>e.Height))]).nice()
            .range([ 0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("class", "axis");

        var y = d3.scaleLinear()
            .domain([0, Math.max(...data.map(e=>e.CO2))]).nice()
            .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("class", "axis");

        var z = d3.scaleLinear()
            .domain([0, Math.max(...data.map(e=>e.CanopyCover))]).nice()
            .range([ 4, 40]);

        var color = d3.scaleOrdinal()
            .domain(Array.from(uniqueNames))
            .range(d3.schemePaired);

        var tooltip = d3.select("#bubble")
            .append("div")

            .attr("class", "tooltip")
            .style("visibility", "hidden")

        var mouseover = function(d) {

            tooltip
                .html("Tree Name: " + `<b>${d.Name}</b>` + "<br>" + "Height: " + `<b>${d.Height}</b>`
                    + "<br>" + "CanopyCover: " + `<b>${d.CanopyCover}</b>`
                    + "<br>" + "CO2 Absorption: " + `<b>${d.CO2}</b>`
                )
                .style("visibility", "visible")
            d3.select(this).style("fill", "#fc3565");
        }
        var mousemove = function(d) {
            tooltip
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        }
        var mouseleave = function(d) {
            tooltip
                .style("visibility", "hidden")
            d3.select(this).style("fill", function (d) { return color(d.Name); } )

        }

        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "bubbles")
            .attr("cx", function (d) { return x(d.Height); } )
            .attr("cy", function (d) { return y(d.CO2); } )
            .attr("r", function (d) { return z(d.CanopyCover); } )
            .style("fill", function (d) { return color(d.Name); } )
            .attr("stroke", "white")

            .on("mouseover", mouseover )
            .on("mousemove", mousemove )
            .on("mouseleave", mouseleave )


        var size = 12
        var legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(' + (500) + ', -100)');

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



        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width  - 350)
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

drawBubbleChart()