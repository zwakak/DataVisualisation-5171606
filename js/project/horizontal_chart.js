const years4 =  fetch('./data/project/years.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
years4.then(function (data){
    const yearSelectHorizontal = document.getElementById('yearSelectHorizontal');
    data.forEach((year) => {
        const option = document.createElement('option');
        option.value = year;
        option.text = year;
        yearSelectHorizontal.appendChild(option);
    });
})
$("#yearSelectHorizontal").on('change', function(){
    const selectedYear = $(this).val();
    drawHorizontalChart(selectedYear)
});

function drawHorizontalChart(selectedYear ="2000"){
    d3.select("#horizontal").selectAll("svg").remove();
    var margin = { top: 20, right: 110, bottom: 30, left: 160 },
        width = 550 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    d3.csv("./data/project/data_top_5_with_others.csv", function(data){

        if(selectedYear){
            data = data.filter(function (e) {
                e.life_expectancy = parseFloat(e.life_expectancy)
                return e.year === selectedYear
            });
        }

        data.sort(function(x, y){
            return d3.ascending(x.index, y.index);
        })
        const nestedData = d3.nest()
            .key(function (d) {
                return d.region;
            })
            .entries(data);




        let color = d3.scaleSequential()
            .domain([0, d3.max(data, d => d.life_expectancy)])
            .interpolator(d3.interpolateBlues);


        var xScale = d3.scaleLinear().range([0, width]);
        var yScale = d3.scaleBand().range([0, height]).padding(0.1);
        const tooltip = d3.select("#horizontal")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden")

        nestedData.forEach(function (region, index) {
            var svg = d3
                .select("#horizontal")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            xScale.domain([0, d3.max(region.values, function (d) { return d.life_expectancy; })]);
            yScale.domain(
                region.values.map(function (d) {
                    return d.country;
                })
            );


            svg.append("g").attr("class", "axis").call(d3.axisLeft(yScale))
            svg.append("g")
                .attr("transform", `translate(0, ${height})`)
                .call(d3.axisBottom(xScale))
                .attr("class", "axis")


            svg
                .selectAll(".bar")
                .data(region.values)
                .enter()
                .append("rect")
                .attr("class", "bar"+index)
                .attr("x", 0)
                .attr("y", function (d) {
                    return yScale(d.country);
                })
                .attr("width", function (d) {
                    return xScale(d.life_expectancy);
                })
                .attr("height", 25)
                .attr("fill", function (d){
                    return color(d.life_expectancy)
                }) .on("mousemove", function () {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
                .on("mouseover", function (d){

                    tooltip
                        .html("Country: " + `<b>${d.country}</b>` +
                            "<br>" + "Life Expectancy: " + `<b>${d.life_expectancy} Years</b>`+
                            "<br>" +"Year: " + `<b>${selectedYear}</b>`)
                        .style("visibility", "visible")
                    d3.select(this).attr("fill", "#fc3565");
                })
                .on("mouseleave", function (){
                    tooltip
                        .style("visibility", "hidden")
                    d3.select(this).attr("fill", function(d){
                        return color(d.life_expectancy);
                    });
                });

            // Add title for each chart
            svg
                .append("text")
                .attr("x", width / 2)
                .attr("y", -margin.top / 2)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .text(region.key).attr("class", "axis");
        });
    })
}

drawHorizontalChart()