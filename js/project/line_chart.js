

function drawLineChart(){
    d3.select("#linechart").selectAll("svg").remove();
    var margin = {top: 20, right: 20, bottom: 150, left: 150},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    const svg = d3.select('#linechart')
        .append('svg')
        .attr('width',300+width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    d3.csv("./data/project/data.csv", function(data){


        data.forEach(d => {
            d.life_expectancy = parseFloat(d.life_expectancy)
            d.year = d.year.toString()
        })



        const nestedData = d3.nest()
            .key(d => d.region)
            .key(d => d.year)
            .rollup(function (d){
                return d3.mean(d, v => v.life_expectancy)
            })
            .entries(data);



        const globalAverageData = d3.nest()
            .key(d => d.year)
            .rollup(function (d) {
                return d3.mean(d, v => v.life_expectancy);
            })
            .entries(data).sort((a, b) => d3.ascending(a.key, b.key));

        nestedData.push({
            key: "World",
            values: globalAverageData
        });

        const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(data.map(d => d.region));

        const xScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
            .range([0, width])
            .nice();

        const yScale = d3.scaleLinear()
            .domain([
                d3.min(nestedData, region => d3.min(region.values, year => year.value)),
                d3.max(nestedData, region => d3.max(region.values, year => year.value))
            ])
            .range([height, 0])
                .nice();


        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis.tickFormat(d3.format('.0f'))).attr("class", "axis");

        svg.append("g")
            .call(yAxis).attr("class", "axis");


        var lineOpacity = "1";
        var lineOpacityHover = "0.85";
        var otherLinesOpacityHover = "0.1";
        var lineStroke = "2px";
        var lineStrokeHover = "3px";


        function mouseOverLine(d) {

            d3.selectAll('.line')
                .style('opacity', otherLinesOpacityHover);
            d3.selectAll('.legend')
                .style('opacity', otherLinesOpacityHover);


            d3.selectAll("._"+d.replaceAll(" ", ""))
                .style('opacity', lineOpacityHover)
                .style("stroke-width", lineStrokeHover)
                .style("cursor", "pointer");
        }

        function mouseOutLine(d) {
            svg.select(".title-text").remove();

            d3.selectAll(".line")
                .style('opacity', lineOpacity);

            d3.selectAll(".legend")
                .style('opacity', lineOpacity);

            d3.selectAll("._" + d.replaceAll(" ", ""))
                .style("stroke-width", lineStroke)
                .style("cursor", "none");
        }

        // Draw lines for each region
        nestedData.forEach(group => {
            const region = group.key;

            const line = d3.line()
                .x(d => xScale(d.key))
                .y(d => yScale(d.value));

            svg
                .append("path")
                .datum(group.values)
                .attr("class", function(d){
                    return "line _"+region.replaceAll(" ", "")
                })
                .attr("fill", "none")
                .attr("stroke", colorScale(region)) // Color based on region
                .attr("stroke-width", 2)
                .attr("d", line)
                .on("mouseover", d=>mouseOverLine(region))
                .on("mouseout", d=>mouseOutLine(region));
        }
        )
        var size = 12

        var legend = svg.append('g')
            .attr("transform", "translate(" + (width) + "," + (-100) + ")");

        const regionKeys = nestedData.map(entry => entry.key);


        legend.selectAll('rect')

            .data(regionKeys)
            .enter()
            .append('rect')

            .attr('x', 0)
            .attr("y", function(d,i){ return 100 + i*(size+10)})
            .attr('width', size)
            .attr('height', size)
            .attr('class', function (d){
                return "tooltip legend _"+d.replaceAll(" ", "")
            })
            .attr('fill', function(d, i){

                return colorScale(d);
            })
            .on("mouseover", d=>mouseOverLine(d))
            .on("mouseout", d=>mouseOutLine(d))


        legend.selectAll('text')

            .data(regionKeys)
            .enter()

            .append('text')

            .attr("padding", "0px")
            .text(function(d){
                return d;
            })
            .attr("x", size*1.8)
            .attr("y", function(d,i){ return 100 + i*(size+10) + (size/2)})
            .attr('width', 12)
            .attr('height', 12)
            .attr('class', function (d){
                return "tooltip legend _"+d.replaceAll(" ", "")
            })
            .attr('fill', function(d, i){
                return colorScale(d);
            })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", d=>mouseOverLine(d))
            .on("mouseout", d=>mouseOutLine(d))



        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width/2)
            .attr("y", height + 60)
            .text("Year")
            .style("fill","white");

        svg.append("text")
            .attr("x",  -width/2.5)
            .attr("y", -80)
            .text("Life Expectancy")
            .style("fill","white")
            .attr("transform", "rotate(-90)");
    })






}

drawLineChart()