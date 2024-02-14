const years5 =  fetch('./data/project/years.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
years5.then(function (data){
    const yearSelectBox = document.getElementById('yearSelectBox');
    data.forEach((year) => {
        const option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearSelectBox.appendChild(option);
    });
})
$("#yearSelectBox").on('change', function(){
    const selectedYear = $(this).val();
    drawBoxPlot(selectedYear)
});

function drawBoxPlot(selectedYear ="2000"){
    d3.select("#box").selectAll("svg").remove();
    var margin = {top: 20, right: 20, bottom: 150, left: 150},
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var svg = d3.select("#box")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", 100+ height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + (margin.top+100) + ")");
    d3.csv("./data/project/data.csv", function(data){

        if(selectedYear){
            data = data.filter(function (e) {
                e.life_expectancy = parseFloat(e.life_expectancy)
                return e.year === selectedYear
            });
        }

        var sumstat = d3.nest()
            .key(function(d) { return d.status;})
            .rollup(function(d) {
                var q1 = d3.quantile(d.map(function(g) { return parseFloat(g.life_expectancy);}).sort(d3.ascending),.25)
                var median = d3.quantile(d.map(function(g) { return parseFloat(g.life_expectancy);}).sort(d3.ascending),.5)
                var q3 = d3.quantile(d.map(function(g) { return parseFloat(g.life_expectancy);}).sort(d3.ascending),.75)
                var interQuantileRange = q3 - q1
                var min = q1 - 1.5 * interQuantileRange
                var max = q3 + 1.5 * interQuantileRange

                return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
            })
            .entries(data)


        console.log(sumstat)


        var x = d3.scaleBand()
            .range([ 0, width ])

            .domain(sumstat.map(d => d.key))
            .paddingInner(1)
            .paddingOuter(.4);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))

            .attr("class", "axis")


        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) {
                return parseFloat(d.life_expectancy);
            })])
            .range([height, 0])
            .nice()

        svg.append("g").call(d3.axisLeft(y))

            .attr("class", "axis")


        var color = d3.scaleSequential()
            .interpolator(d3.interpolateBlues)
            .domain([0, d3.max(data, function (d) {
                return +d.life_expectancy;
            })])

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width / 2)
            .attr("y", height + 60)
            .text("Status")
            .style("fill", "white");

        svg
            .selectAll("vertLines")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.key))})
            .attr("x2", function(d){return(x(d.key))})
            .attr("y1", function(d) { return y(Math.max(d.value.min, d3.min(data, function(d) { return d.life_expectancy; }))); }) // Limit the lower end to the minimum life expectancy
            .attr("y2", function(d) { return y(Math.min(d.value.max, d3.max(data, function(d) { return d.life_expectancy; }))); }) // Limit the upper end to the maximum life expectancy

            .attr("stroke", "white")
            .style("width", 40)


        var boxWidth = 100
        svg
            .selectAll("boxes")
            .data(sumstat)
            .enter()
            .append("rect")
            .attr("x", function(d){return(x(d.key)-boxWidth/2)})
            .attr("y", function(d){return(y(d.value.q3))})
            .attr("height", function(d){

                var res = y(d.value.q1) - y(d.value.q3)
                return res <0?0:res
            })
            .attr("width", boxWidth )
            .attr("stroke", "white")
            .style("fill", "steelblue")
            .style("opacity", 0.7)

        // Show the median
        svg
            .selectAll("medianLines")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("x1", function(d){

                return(x(d.key)-boxWidth/2)
            })
            .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
            .attr("y1", function(d){

                return(y(d.value.median))})
            .attr("y2", function(d){

                return(y(d.value.median))})
            .attr("stroke", "white")

            .style("width", 80)

        var tooltip = d3.select("#box")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden")

        var mouseover = function(d) {

            tooltip
                .html("Country: " + `<b>${d.country}</b>` + "<br>" +
                    "Life Expectancy: " + `<b>${d.life_expectancy}</b> Years`+ "<br>"+
                    "Status: " + `<b>${d.status}</b>`
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
            d3.select(this).style("fill", color(d.life_expectancy));
        }

// Add individual points with jitter

       /* var outliers = data.filter(function(d) {
            return d.life_expectancy < q1 - 1.5 * interQuantileRange || d.life_expectancy > q3 + 1.5 * interQuantileRange;
        });*/
        var jitterWidth = 50
        svg
            .selectAll("indPoints")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function(d){return(x(d.status) - jitterWidth/2 + Math.random()*jitterWidth )})
            .attr("cy", function(d){return(y(d.life_expectancy))})
            .attr("r", 4)
            .style("fill", function(d){ return(color(+d.life_expectancy)) })
            .attr("stroke", "black")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        var legendWidth = 250;
        var legendHeight = 20;

        var legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", "translate(" + (legendWidth/2) + "," + (-95) + ")");
        svg.append("text")
            .attr("x",  legendWidth*.6)
            .attr("y", -105)
            .text("Life Expectancy (In Years)")
            .style("fill","white")
        var legendColors = color.ticks(10);

        legend.selectAll("rect")
            .data(legendColors)
            .enter().append("rect")
            .attr("x", function (d, i) {
                return i * (legendWidth / legendColors.length);
            })
            .attr("width", legendWidth / legendColors.length)
            .attr("height", legendHeight)
            .style("fill", function (d) {
                return color(d);
            });

        legend.selectAll("text")
            .data(legendColors)
            .enter().append("text")
            .attr("x", function (d, i) {
                return i * (legendWidth / legendColors.length) + (legendWidth / legendColors.length) / 2;
            })
            .attr("y", legendHeight + 20)
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .text(function (d) {
                return d; // Format the text as needed
            });




        svg.append("text")
            .attr("x",  -width/2)
            .attr("y", -80)
            .text("Life Expectancy (In Years)")
            .style("fill","white")
            .attr("transform", "rotate(-90)");

    })
}

drawBoxPlot()