

function drawVerticalBar(){
    var margin = {top: 20, right: 20, bottom: 150, left: 150},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);


    var svg = d3.select("#graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("./data/top_10_trees.csv",function(error, data) {
        data.forEach(function(d) {
            d.num_of_occurrences = parseInt(d.num_of_occurrences);
            d.mean_canopy_cover = parseFloat(d.mean_canopy_cover);
        });

        x.domain(data.map(function(d) { return d.name; }));
        y.domain([0, d3.max(data, function(d) { return d.num_of_occurrences; })]);

        let color = d3.scaleSequential()
            .domain([0, d3.max(data, d => d.num_of_occurrences)])
            .interpolator(d3.interpolateBuPu);


        const tooltip = d3.select("#graph")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden")




        svg.selectAll("mybar")
            .data(data)
            .enter().append("rect")
            .attr("x", function(d) { return x(d.name); })
            .attr("width", x.bandwidth())
            .attr("y", function(d) { return y(0); })
            .attr("height", function(d) { return height - y(0); })
            .attr("fill", function (d) {
                return color(d.num_of_occurrences);
            })
            .on("mousemove", function () {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseover", function (d){
                const numOfOccurrences = d.num_of_occurrences;
                const name = d.name;
                const canopyMean = d.mean_canopy_cover;
                tooltip
                    .html("Tree Name: " + `<b>${name}</b>` + "<br>" + "Number of Occurness: " + `<b>${numOfOccurrences}</b>`+ "<br>" + "Canopy mean: " + `<b>${canopyMean}</b>`)
                    .style("visibility", "visible")
                d3.select(this).attr("fill", "#fc3565");
            })
            .on("mouseleave", function (){
                tooltip
                    .style("visibility", "hidden")
                d3.select(this).attr("fill", function(d){
                    return color(d.num_of_occurrences);
                });
            })



        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .attr("class", "axis")
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-family", "Fira Sans");

        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y)).selectAll("text").style('fill', "white");


        svg.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", function(d) { return y(d.num_of_occurrences); })
            .attr("height", function(d) { return height - y(d.num_of_occurrences); })
            .delay(function(d,i){ return(i*100)})

    });
}
drawVerticalBar()