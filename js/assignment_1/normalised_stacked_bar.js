const states2 =  fetch('./data/assignment_1/states.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
states2.then(function (data){
    const stateSelect2 = document.getElementById('stateSelect2');
    data.forEach((state) => {

        const option = document.createElement('option');
        option.value = state;
        option.text = state;
        stateSelect2.appendChild(option);

    });
    drawNormalizedStackedBar(data[0])
})

$("#stateSelect2").on('change', function(){

    const selected_state = $(this).val();

    drawNormalizedStackedBar(selected_state)
});

function drawNormalizedStackedBar(selected_state) {
    d3.select("#graph4").select("svg").remove();

    var margin = {top: 20, right: 20, bottom: 90, left: 150},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    const svg3 = d3.select('#graph4')
        .append('svg')
        .attr('width', 1200)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    d3.csv("./data/assignment_1/tree_occurrences_with_city.csv", function(data){
        const filteredStateData = data.filter(d => d.state === selected_state);

        const cityNames = Array.from(new Set(filteredStateData.map(d => d.city)));
        const treeNames = Object.keys(filteredStateData[0]).filter(d => d != "state" && d!="city");



        const x3 = d3.scaleLinear()
            .domain([0, 100]).nice()
            .range([0, width]);

        const y3 = d3.scaleBand()
            .domain(cityNames)
            .range([0, height])
            .padding(0.1);

        const color = d3.scaleOrdinal()
            .domain(treeNames)
            .range(d3.schemePaired);


        const xAxis = d3.axisBottom(x3);
        const yAxis = d3.axisLeft(y3);

        data.forEach(function (d) {
            var tot = 0
            for (i in treeNames) {
                var name = treeNames[i];
                tot += +d[name]
            }
            for (i in treeNames) {
                var name = treeNames[i];
                d[name] = d[name] / tot * 100
            }

        })
        const stackedData = d3.stack()
            .keys(treeNames)(filteredStateData);
        svg3.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .attr("class", "axis")
            .selectAll("text").style('fill', "white")
            //.call(g => g.select('.domain').remove());

        svg3.append("g")
            .call(yAxis)
            .attr("class", "axis")
            .selectAll("text")
            .attr("transform", "translate(-10,0)")
            .style("text-anchor", "end")
            .style("font-family", "Fira Sans")
            //.call(g => g.select('.domain').remove());


        var tooltip = d3.select("body")
            .append("div")
            .style('visibility', 'hidden')
            .attr("class", "tooltip")


        var size = 12
        var legend = svg3.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(' + (600) + ', 30)');

        legend.selectAll('rect')
            .data(treeNames)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr("y", function(d,i){ return 100 + i*(size+10)})
            .attr('width', size)
            .attr('height', size)
            .attr('fill', function(d, i){
                return color(d);
            });

        legend.selectAll('text')
            .data(treeNames)
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

        const layers = svg3.append('g')
            .selectAll('g')
            .data(stackedData)
            .enter().append('g')
            .attr('fill', d => color(d.key))


        const duration = 800;
        const t = d3.transition()
            .duration(duration)
            .ease(d3.easeLinear);
        layers.each(function(_, i) {
            d3.select(this)

                .selectAll('rect')

                .data(d => d)
                .enter().append('rect')
                .on("mousemove", function () {
                    tooltip
                        .style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseover", function (d){
                    var name = d3.select(this.parentNode).datum().key;
                    var numOfOccurrences = d.data[name];

                    tooltip
                        .html("Tree Name: " + `<b>${name}</b>` + "<br>" + "Percentage of Occurness: " + `<b>${numOfOccurrences}%</b>`)
                        .style("visibility", "visible")
                    d3.select(this).attr("fill", "#fc3565");
                })
                .on("mouseleave", function (){
                    tooltip
                        .style("visibility", "hidden")
                    d3.select(this).attr("fill", function(d){
                        return color(treeNames[i]);
                    });
                })
                .attr('x', function (d){
                    return x3(d[0])
                })

                .attr('y', d => y3(d.data.city))
                .attr('x', d => x3(d[0]))
                .attr('height', y3.bandwidth())
                .transition(t)
                .delay(i * duration)
                .attr('width', d => x3(d[1]) - x3(d[0]))

        });
    })
}