const states =  fetch('./data/assignment_1/states.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
states.then(function (data){
    const stateSelect = document.getElementById('stateSelect');
    data.forEach((state) => {

        const option = document.createElement('option');
        option.value = state;
        option.text = state;
        stateSelect.appendChild(option);

    });
    drawStackedBar(data[0])
})

$("#stateSelect").on('change', function(){

    const selected_state = $(this).val();
    drawStackedBar(selected_state)
});


function drawStackedBar(selected_state){
    d3.select("#graph3").select("svg").remove();

    var margin = {top: 20, right: 20, bottom: 90, left: 150},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    const svg2 = d3.select('#graph3')
        .append('svg')
        .attr('width', 1200)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    d3.csv("./data/assignment_1/tree_occurrences_with_city.csv", function(data){
        /*data.forEach(function(d) {
            d.tree_count = parseInt(d.tree_count);
            d.avg_mean = parseFloat(d.avg_mean);
        });*/
        const filteredStateData = data.filter(d => d.state === selected_state);

        const cityNames = Array.from(new Set(filteredStateData.map(d => d.city)));
        const treeNames = Object.keys(filteredStateData[0]).filter(d => d != "state" && d!="city");



        const stackedData = d3.stack()
            .keys(treeNames)(filteredStateData);

        const x2 = d3.scaleLinear()
            .domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])]).nice()
            .range([0, width]);

        const y2 = d3.scaleBand()
            .domain(cityNames)
            .range([0, height])
            .padding(0.1);

        const color = d3.scaleOrdinal()
            .domain(treeNames)
            .range(d3.schemePaired);


        const xAxis = d3.axisBottom(x2);
        const yAxis = d3.axisLeft(y2);

        svg2.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .attr("class", "axis")
            .selectAll("text")
            .attr("transform", "translate(-10,10)rotate(-45)")
            .style('fill', "white")
            .call(g => g.select('.domain').remove());

        svg2.append("g")
            .call(yAxis)
            .attr("class", "axis")
            .selectAll("text")
            .attr("transform", "translate(-10,0)")
            .style("text-anchor", "end")
            .style("font-family", "Fira Sans")
            .call(g => g.select('.domain').remove());


        var tooltip = d3.select("body")
            .append("div")
            .style('visibility', 'hidden')
            .attr("class", "tooltip")


        var size = 12
        var legend = svg2.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(' + (600) + ', -100)');

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



        const layers = svg2.append('g')
            .selectAll('g')
            .data(stackedData)
            .enter().append('g')
            .attr('fill', d => color(d.key))


        const duration = 500;
        const t = d3.transition()
            .duration(duration)
            .ease(d3.easeLinear);

        layers.each(function(_, i) {
            d3.select(this)

                .selectAll('rect')

                .data(d => d)
                .enter().append('rect')
                .attr("id", "stackedRect")
                .on("mousemove", function () {
                    tooltip
                        .style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseover", function (d){
                    var name = d3.select(this.parentNode).datum().key;
                    var numOfOccurrences = d.data[name];

                    tooltip
                        .html("Tree Name: " + `<b>${name}</b>` + "<br>" + "Number of Occurness: " + `<b>${numOfOccurrences}</b>`)
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
                .attr('y', d => y2(d.data.city))
                .attr('x', d => x2(d[0]))
                .attr('height', y2.bandwidth())
                .transition(t)
                .delay(i * duration)
                .attr('width', d => x2(d[1]) - x2(d[0]))


        });
    })
}