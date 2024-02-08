const years3 =  fetch('./data/project/years.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
years3.then(function (data){
    const yearSelectBubble = document.getElementById('yearSelectBubble');
    data.forEach((year) => {

        const option = document.createElement('option');
        option.value = year;
        option.text = year;

        yearSelectBubble.appendChild(option);

    });

})
$("#yearSelectBubble").on('change', function(){

    const selectedYear = $(this).val();
    const selectedParameter = $("#parameterSelectBubble").val();
    drawBubbleChart(selectedYear, selectedParameter)
});

$("#parameterSelectBubble").on('change', function(){

    const selectedParameter = $(this).val();
    const selectedYear = $("#yearSelectBubble").val();
    drawBubbleChart(selectedYear, selectedParameter)
});

function drawBubbleChart(selectedYear="2000", selectedParameter="GDP"){
    var margin = {top: 20, right: 150, bottom: 100, left: 150},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    d3.selectAll("#bubble").select("svg").remove();
    var svg = d3.select("#bubble")
        .append("svg")
        .attr("width", 1000 +width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    d3.csv("./data/project/data.csv", function(data) {

        if (selectedYear) {
            data = data.filter(function (e) {

                return e.year === selectedYear
            });
        }

        var uniqueNames = Array.from(new Set(data.map(e=>e.country)))
        var uniqueRegions = Array.from(new Set(data.map(e=>e.region)))

        var x = d3.scaleLinear()
            .domain([Math.min(...data.map(e=>e.life_expectancy)), Math.max(...data.map(e=>e.life_expectancy))]).nice()
            .range([ 0, width]).nice();
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("class", "axis");

        var domain;
        if(selectedParameter==="schooling"){
            domain = [Math.min(...data.map(e=>e.schooling)), Math.max(...data.map(e=>e.schooling))]
        }else if (selectedParameter==="GDP"){
            domain = [Math.min(...data.map(e=>e.GDP)), 10000]
        }else domain = [ Math.min(...data.map(e=>e.income_composition_of_resources)), Math.max(...data.map(e=>e.income_composition_of_resources))]
        var y = d3.scaleLinear()
            .domain(domain)
            .range([ height, 0]).nice();

        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("class", "axis");

        var z = d3.scaleLinear()
            .domain([0, Math.max(...data.map(e=>e.population))]).nice()
            .range([ 4, 50]).nice();

        var color = d3.scaleOrdinal()
            .domain(Array.from(uniqueRegions))
            .range(d3.schemePaired);

        var tooltip = d3.select("#bubble")
            .append("div")

            .attr("class", "tooltip")
            .style("visibility", "hidden")

        var mouseover = function(d) {

            var parameter = "";
            switch (selectedParameter) {
                case 'schooling':
                    parameter = "Schooling: " + `<b>${d.schooling}</b>`
                    break;
                case 'GDP':
                    parameter = "GDP: " + `<b>${d.GDP}</b>`
                    break;
                case 'income_composition_of_resources':
                    parameter = "Income Composition of Resources: " + `<b>${d.income_composition_of_resources}</b>`
                    break;
                default:
                    parameter = "GDP: " + `<b>${d.GDP}</b>`
            }


            tooltip
                .html("Country: " + `<b>${d.country}</b>` + "<br>" + "Life Expextancy: " + `<b>${d.life_expectancy}</b>`
                    + "<br>" + "Population: " + `<b>${d.population}</b>`
                    + "<br>" + "Year: " + `<b>${d.year}</b>`
                    +"<br>" + parameter
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
            d3.select(this).style("fill", function (d) { return color(d.region); } )

        }

        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "bubbles")
            .attr("cx", function (d) { return x(d.life_expectancy); } )
            .attr("cy", function (d) {
                if (selectedParameter === "schooling")
                    return y(d.schooling);
                else if (selectedParameter === "income_composition_of_resources")
                    return y(d.income_composition_of_resources)
                return y(d.GDP)
            } )
            .attr("r", function (d) { return z(d.population); } )
            .style("fill", function (d) { return color(d.region); } )
            .attr("stroke", "white")

            .on("mouseover", mouseover )
            .on("mousemove", mousemove )
            .on("mouseleave", mouseleave )


        var size = 12
        var legendWidth = 500;


        var legend = svg.append('g')
            .attr('class', 'legend')
            .attr("transform", "translate(" + (width) + "," + (-100) + ")");

        legend.selectAll('rect')
            .data(uniqueRegions)
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
            .data(uniqueRegions)
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
            .attr("x", width  - 150)
            .attr("y", height + 60)
            .text("Life Expectancy")
            .style("fill","white");

        svg.append("text")
            .attr("x", selectedParameter ==="income_composition_of_resources"? -250:-150)
            .attr("y", -80)
            .text(selectedParameter ==="schooling"?"Schooling": selectedParameter ==="income_composition_of_resources"?
                "Income Composition of Resources" : "GDP/capita")
            .style("fill","white")
            .attr("transform", "rotate(-90)");
    })


}

drawBubbleChart()