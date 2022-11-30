function drawBoxPlot(){
    var margin = {top: 20, right: 20, bottom: 90, left: 150},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("./data/trees.csv", function(data) {
        data=data.filter(function( obj ) {
            obj.Height = parseFloat(obj.Height)
            return (obj.Name === "Celtis australis" || obj.Name==="Aesculus hippocastanum"
                || obj.Name==="Carpinus betulus" || obj.Name==="Tilia cordata"
                || obj.Name==="Platanus x hispanica" || obj.Name==="Tilia x europaea");
        });
        var sumstat = d3.nest()
            .key(function(d) { return d.Name;})
            .rollup(function(d) {
                q1 = d3.quantile(d.map(function(g) { return g.Height;}).sort(d3.ascending),.25)
                median = d3.quantile(d.map(function(g) { return g.Height;}).sort(d3.ascending),.5)
                q3 = d3.quantile(d.map(function(g) { return g.Height;}).sort(d3.ascending),.75)
                interQuantileRange = q3 - q1
                min = q1 - 0.4 * interQuantileRange
                max = q3 + 0.4 * interQuantileRange
                return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
            })
            .entries(data)

        var y = d3.scaleBand()
            .range([ height, 0 ])
            .domain(sumstat.map(d => d.key))
            .padding(.4 );
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(0))
            .attr("class", "axis")

        svg.select(".domain").remove()


        var x = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) {
                return +d.Height;
            })])
            .range([0, width])
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(5))

            .attr("class", "axis")
        svg.select(".domain").remove()


        var color = d3.scaleSequential()
            .interpolator(d3.interpolateBuPu)
            .domain([0, d3.max(data, function (d) {
                return +d.Height;
            })])

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width / 2 - 50)
            .attr("y", height + 60)
            .text("Height")
            .style("fill", "white");

        svg
            .selectAll("vertLines")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.value.min))})
            .attr("x2", function(d){return(x(d.value.max))})
            .attr("y1", function(d){return(y(d.key) + y.bandwidth()/2)})
            .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
            .attr("stroke", "white")
            .style("width", 80)

        svg
            .selectAll("boxes")
            .data(sumstat)
            .enter()
            .append("rect")
            .attr("x", function(d){return(x(d.value.q1))})
            .attr("width", function(d){
                var res =(x(d.value.q3)-x(d.value.q1))
                return res <0?0:res
            })
            .attr("y", function(d) { return y(d.key); })
            .attr("height", y.bandwidth() )
            .attr("stroke", "white")
            .style("fill", "#fc3565")
            .style("opacity", 0.7)

        svg
            .selectAll("medianLines")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("y1", function(d){return(y(d.key))})
            .attr("y2", function(d){return(y(d.key) + y.bandwidth()/2)})
            .attr("x1", function(d){return(x(d.value.median))})
            .attr("x2", function(d){return(x(d.value.median))})
            .attr("stroke", "black")

            .style("width", 80)

        svg.selectAll("g").selectAll("text").style('fill', "white")
        svg.selectAll("g").selectAll("boxes").style('fill', "white")

        var tooltip = d3.select("#boxplot")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden")

        var mouseover = function(d) {

            tooltip
                .html("Tree Name: " + `<b>${d.Name}</b>` + "<br>" + "Height: " + `<b>${d.Height}</b>`)
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
            d3.select(this).style("fill", color(d.Height));
        }

        // Add individual points with jitter
        var jitterWidth = 50
        svg
            .selectAll("indPoints")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d){ return(x(d.Height))})
            .attr("cy", function(d){
                return( y(d.Name) + (y.bandwidth()/2) - jitterWidth/2 + Math.random()*jitterWidth )
            })
            .attr("r", 4)
            .style("fill", function(d){ return(color(+d.Height)) })
            .attr("stroke", "black")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    })


}

drawBoxPlot()