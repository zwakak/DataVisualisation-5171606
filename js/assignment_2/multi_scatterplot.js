function drawMultiScatterPlot() {
    const margin = { top: 10, right: 30, bottom: 40, left: 30 },
        width = 250,
        height = 250;

    d3.csv("./data/trees.csv", function (error, data) {
        if (error) throw error;
        data = data.filter(function (e) {
            e.Height = parseFloat(e.Height)
            return (e.Name === "Celtis australis" || e.Name === "Aesculus hippocastanum"
                || e.Name === "Carpinus betulus" || e.Name === "Tilia cordata"
                || e.Name === "Platanus x hispanica" || e.Name === "Tilia x europaea");
        });

        var uniqueNames = Array.from(new Set(data.map(e=>e.Name)))

        var heights = data.map(e => parseFloat(e.Height))
        var CO2s = data.map(e => parseFloat(e.CO2))

        var x = d3.scaleLinear()
            .domain([0, Math.max(...heights)])
            .range([0, width]);

        var y = d3.scaleLinear()
            .domain([0, Math.max(...CO2s)])
            .range([height, 0]);

        const color = d3.scaleOrdinal()
            .domain(uniqueNames)
            .range(d3.schemePaired);

        var tooltip = d3.select("#multi_scatterplot")
            .append("div")

            .attr("class", "tooltip")
            .style("visibility", "hidden")

        // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        var mouseover = function(d) {

            tooltip
                .html("Tree Name: " + `<b>${d.Name}</b>` + "<br>" + "Height: " + `<b>${d.Height}</b>`+ "<br>" + "CO2 Absorption: " + `<b>${d.CO2}</b>`)
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


        uniqueNames.forEach(e => {
            var filtered = data.filter(e1 => e1.Name == e)
            const svg = d3.select("#multi_scatterplot")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top * 2 + margin.bottom * 2)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left * 2 + "," + margin.top * 3 + ")")
                .style("margin-bottom", "50px");

            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .attr("class", "axis")
            svg.append("g")
                .call(d3.axisLeft(y))
                .attr("class", "axis");


            svg.append("text")
                .attr("transform", "translate(" + (width / 2) + " ," + (-margin.top) + ")")
                .style("text-anchor", "middle")
                .text(e)
                .style("fill", color(e))

            svg.append('g')
                .selectAll("dot")
                .data(filtered)
                .enter()
                .append("circle")
                .attr("cx", function (d) {
                    return x(d.Height);
                })
                .attr("cy", function (d) {
                    return y(d.CO2);
                })
                .attr("r", 3)
                .style("fill", function (d) {
                    return color(d.Name)
                }).on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)

            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", (width / 2) + 30)
                .attr("y", height + 35)
                .text("Height")
                .style("fill", "white");

            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", (width / 2) - 230)
                .attr("y", height - 280)
                .text("CO2 Absorption")
                .style("fill", "white")
                .attr("transform", "rotate(-90)");

            var yval = data.filter(d => d.Name === e).map(function (d) {
                return parseFloat(d.CO2);
            });
            var xval = data.filter(d => d.Name === e).map(function (d) {
                return parseFloat(d.Height);
            });

            var lr = linearRegression(yval, xval);

            var max = d3.max(data, function (d) {
                return parseFloat(d.Height);
            });

            svg.append("line")
                .attr("x1", x(0))
                .attr("y1", y(lr.intercept))
                .attr("x2", x(max))
                .attr("y2", y((max * lr.slope) + lr.intercept))
                .style("stroke", "white")
                .attr("opacity", .3)
        });

        function linearRegression(y, x) {

            var lr = {};
            var n = y.length;
            var sum_x = 0;
            var sum_y = 0;
            var sum_xy = 0;
            var sum_xx = 0;
            var sum_yy = 0;

            for (var i = 0; i < y.length; i++) {

                sum_x += x[i];
                sum_y += y[i];
                sum_xy += (x[i] * y[i]);
                sum_xx += (x[i] * x[i]);
                sum_yy += (y[i] * y[i]);
            }

            lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
            lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
            lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

            return lr;

        }
    })
}
drawMultiScatterPlot()