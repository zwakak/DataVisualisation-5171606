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
    var margin = { top: 20, right: 110, bottom: 30, left: 160 },
        width = 550 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
    var svg = d3.select("#box")
        .append("svg")
        .attr("width",width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    d3.csv("./data/project/data.csv", function(data){

        if(selectedYear){
            data = data.filter(function (e) {
                e.life_expectancy = parseFloat(e.life_expectancy)
                return e.year === selectedYear
            });
        }

        var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
            .key(function(d) { return d.status;})
            .rollup(function(d) {
                q1 = d3.quantile(d.map(function(g) { return g.life_expectancy;}).sort(d3.ascending),.25)
                median = d3.quantile(d.map(function(g) { return g.life_expectancy;}).sort(d3.ascending),.5)
                q3 = d3.quantile(d.map(function(g) { return g.life_expectancy;}).sort(d3.ascending),.75)
                interQuantileRange = q3 - q1
                min = q1 - 1.5 * interQuantileRange
                max = q3 + 1.5 * interQuantileRange
                return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
            })
            .entries(data)


        console.log(sumstat)


        var x = d3.scaleBand()
            .range([ 0, width ])

            .domain(sumstat.map(d => d.key))
            .paddingInner(1)
            .paddingOuter(.5);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axis")


        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) {
                return d.life_expectancy;
            })])
            .range([height, 0])

        svg.append("g").call(d3.axisLeft(y))

            .attr("class", "axis")


        var color = d3.scaleSequential()
            .interpolator(d3.interpolateBuPu)
            .domain([0, d3.max(data, function (d) {
                return +d.life_expectancy;
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
            .attr("x1", function(d){return(x(d.key))})
            .attr("x2", function(d){return(x(d.key))})
            .attr("y1", function(d){return(y(d.value.min))})
            .attr("y2", function(d){return(y(d.value.max))})
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
            .style("fill", "#fc3565")
            .style("opacity", 0.7)

        // Show the median
        svg
            .selectAll("medianLines")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
            .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
            .attr("y1", function(d){

                return(y(d.value.median))})
            .attr("y2", function(d){return(y(d.value.median))})
            .attr("stroke", "white")

            .style("width", 80)

        var tooltip = d3.select("#box")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden")

        var mouseover = function(d) {

            tooltip
                .html("Country: " + `<b>${d.country}</b>` + "<br>" + "Life Expectancy: " + `<b>${d.life_expectancy}</b>`)
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

    })
}

drawBoxPlot()