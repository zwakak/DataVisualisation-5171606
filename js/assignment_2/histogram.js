function drawHistogram(){

    var margin = {top: 20, right: 20, bottom: 90, left: 150},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#histogram1")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("data/trees.csv", function(data) {

        var x = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.Height})]).nice()
            .range([0, width])
        var y = d3.scaleLinear()
            .range([height, 0])
        var yAxis = svg.append("g")


        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axis")
            .call(d3.axisBottom(x)).selectAll("text").style('fill', "white")
        svg.append("text")
            .attr("x", width / 2 - 20)
            .attr("y", height + 60)
            .text("Height")
            .style('fill', "white")



        function update(nBin) {

            var histogram = d3.histogram()
                .value(function(d) { return d.Height; })
                .domain(x.domain())
                .thresholds(x.ticks(nBin));

            var bins = histogram(data);
            y.domain([0, d3.max(bins, function(d) { return d.length; })]);
            yAxis
                .call(d3.axisLeft(y))
                .attr("class", "axis")
                .attr("text", "Height")
                .selectAll("text").style('fill', "white");

            var u = svg.selectAll("rect")
                .data(bins)

            u.enter()
                .append("rect")
                .merge(u)

                .attr("x", 1)
                .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                .attr("width", function(d) {
                    var res = (x(d.x1) - x(d.x0) -1)
                    return res < 0 ? 0 : res;

                })
                .attr("height", function(d) { return height - y(d.length); })
                .style("fill", "#fc3565")
        }


        update(document.getElementById("binSize").value)


        document.getElementById('minus').onclick = function() {
            document.getElementById("minus").parentNode.querySelector('input[type=number]').stepDown()
            var value = document.getElementById("binSize").value;
            update(+value)
        }

        document.getElementById('plus').onclick = function() {
            document.getElementById("plus").parentNode.querySelector('input[type=number]').stepUp()
            var value = document.getElementById("binSize").value;
            update(+value)

        }
    });
}

drawHistogram()