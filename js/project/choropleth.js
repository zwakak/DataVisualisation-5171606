

const years =  fetch('./data/project/years.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
years.then(function (data){
    const yearSelect = document.getElementById('yearSelect');
    data.forEach((year) => {

        const option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearSelect.appendChild(option);

    });
    drawColorpleth(data[0])
})

$("#yearSelect").on('change', function(){

    const selectedYear = $(this).val();
    const selectedParameter = $("#parameterSelect").val();

    drawColorpleth(selectedYear, selectedParameter)
});


$("#parameterSelect").on('change', function(){

    const selectedParameter = $(this).val();
    const selectedYear = $("#yearSelect").val();
    drawColorpleth(selectedYear, selectedParameter)
});


function drawColorpleth(selectedYear="2000", selectedParameter="life_expectancy"){
    d3.selectAll("#choropleth").select("svg").remove();

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = 900 - margin.left - margin.right,
        height = 680 - margin.top - margin.bottom;


    var svg = d3.select("#choropleth").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + (margin.top+30) + ")");

    var projection = d3.geoMercator()
        .scale((width) / (2 * Math.PI))
        .translate([width *.6, height *.7]);


    d3.csv("./data/project/data.csv", function(data) {


        if(selectedYear) {
            data = data.filter(function (obj) {
                return (obj.year === selectedYear);
            });
        }

/*        if(selectedParameter){
            data = data.filter(function (obj) {
                return (obj.year === selectedYear);
            });
        }*/

        /*const colorScale = d3.scaleSequential(d3.interpolateViridis)
            .domain([d3.min(data, d => +d.life_expectancy), d3.max(data, d => +d.life_expectancy)]);

        var quantiles = 5;*/

//Define quantile scale to sort data values into buckets of color
        var colorScale;
        if(selectedParameter === "adult_mortality") {
            colorScale = d3.scaleSequential(d3.interpolateOranges).domain(
                d3.extent(data, function (d) {

                    return d.adult_mortality;
                })
            );
        }else if (selectedParameter === "infant_deaths"){
            colorScale = d3.scaleSequential(d3.interpolateReds).domain(
                d3.extent(data, function (d) {

                    return d.infant_deaths;
                })
            );
        }else colorScale = d3.scaleSequential(d3.interpolateBlues).domain(
            d3.extent(data, function (d) {

                return d.life_expectancy;
            })
        );


        d3.json("./data/project/world.geojson", function(topo) {
            for (var i = 0; i < data.length; i++) {

                var dataCountryCode = data[i].country_code;


                for (var j = 0; j < topo.features.length; j++) {
                    var countryCode = topo.features[j].id;


                    if (dataCountryCode === countryCode) {
                        topo.features[j].properties.life_expectancy = parseFloat(data[i].life_expectancy);
                        topo.features[j].properties.adult_mortality = parseFloat(data[i].adult_mortality);
                        topo.features[j].properties.infant_deaths = parseInt(data[i].infant_deaths);
                        break;
                    }
                }
            }


          //  projection.fitSize([width, height], topo)

            const tooltip = d3.select("#choropleth")
                .append("div")
                .attr("class", "tooltip")
                .style("visibility", "hidden")

            let mouseOver = function(d) {
                var parameter = "";
                var value;
                switch (selectedParameter) {
                    case 'life_expectancy':

                        parameter = "Life Expectancy: " + `<b>${d.properties.life_expectancy??"Unknown"}</b> ${d.properties.life_expectancy?"Years":""}`
                        break;
                    case 'adult_mortality':
                        parameter = "Adult Mortality: " + `<b>${d.properties.adult_mortality??"Unknown"}</b>`
                        break;
                    case 'infant_deaths':
                        parameter = "Infant Deaths: " + `<b>${d.properties.infant_deaths??"Unknown"}</b>`
                        break;
                    default:
                        parameter = "Life Expectancy: " + `<b>${d.properties.life_expectancy??"Unknown"}</b> ${d.properties.life_expectancy?"Years":""} `

                }


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
                    .html("Country: " + `<b>${d.properties.name}</b>` + "<br>" + parameter + "<br>" +"Year: " + `<b>${selectedYear}</b>`
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
            svg.selectAll("path")
                .data(topo.features)
                .enter()
                .append("path")
                // draw each country
                .attr("d", d3.geoPath()
                    .projection(projection)
                ).attr("class", "Country").style("stroke", "black")
                .style("fill", function (d) {
                    var value = parseFloat(d.properties.life_expectancy);

                    if(selectedParameter === "adult_mortality")
                         value = parseFloat(d.properties.adult_mortality);
                    else if (selectedParameter === "infant_deaths")
                        value = parseInt(d.properties.infant_deaths);

                    return (value !== undefined && !isNaN(value)) ?colorScale(+value):"gray";
                })



                .on("mouseover", mouseOver )
                .on("mousemove", mousemove )
                .on("mouseleave", mouseLeave )



            var legendWidth = 500;
            var legendHeight = 20;

            var legend = svg.append("g")
                .attr("class", "legend")
                .attr("transform", "translate(" + ((width - legendWidth) /2) + "," + (-height*.01) + ")");

            var legendColors = colorScale.ticks(10);

            legend.selectAll("rect")
                .data(legendColors)
                .enter().append("rect")
                .attr("x", function (d, i) {
                    return i * (legendWidth / legendColors.length);
                })
                .attr("width", legendWidth / legendColors.length)
                .attr("height", legendHeight)
                .style("fill", function (d) {
                    return colorScale(d);
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
                    return d.toFixed(2); // Format the text as needed
                });

        })
    })


}
