const states5 =  fetch('./data/assignment_1/states.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
states5.then(function (data){
    const stateSelect5 = document.getElementById('stateSelect5');
    data.forEach((state) => {

        const option = document.createElement('option');
        option.value = state;
        option.text = state;
        stateSelect5.appendChild(option);

    });
    drawStackedBarWithSmallMultiples(data[0])
})

$("#stateSelect5").on('change', function(){

    const selected_state = $(this).val();

    drawStackedBarWithSmallMultiples(selected_state)
});

function drawStackedBarWithSmallMultiples(selected_state) {

    d3.select("#graph7").selectAll("svg").remove();

    var margin = {top: 20, right: 20, bottom: 90, left: 150},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;



    d3.csv("./data/assignment_1/city_tree_counts_top_5.csv", function(data){
        data.forEach(function(d) {
            d.tree_count = parseInt(d.tree_count);
        });
        const filteredStateData = data.filter(d => d.state === selected_state);

        const cityNames = Array.from(new Set(filteredStateData.map(d => d.city)));
        const treeNames = Array.from(new Set(filteredStateData.map(d => d.scientific_name)));
        //const treeNames = Object.keys(filteredStateData[0]).filter(d => d != "state" && d!="city");



      /*  var other = filteredStateData.pop()
        var lng = filteredStateData.length - 5;
        for (let j = 0; j < lng; j++) {
            filteredStateData.pop();
        }
        filteredStateData.push(other);*/



        const tooltip = d3.select("#graph7")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden")


        const zip = (a, b) => a.map((k, i) => [k, b[i]]);

        const y = d3.scaleBand()
            .domain(cityNames)
            .range([height, 0])
            .padding(.1);

        // build small multiples, 1 for each tree name
        for (let index = 0; index < treeNames.length; index++) {
            var sm_margin = 60;
            var sm_width = 400;
            var sm_height = 500;

            const svg3 = d3.select("#graph7")
                .append("svg")
                .attr("width", sm_width + sm_margin + 8)
                .attr("height", sm_height)
                .append("g")
                .attr("transform", `translate(${sm_margin  + 20},${margin.top + 50})`);

            // title of each small multiple, tree name
            svg3.append("text")
                .attr("transform", "translate(" + (sm_width / 2) + " ," + (-margin.top -20) + ")")
                .attr("class", "axis")
                .style("text-anchor", "middle")
                .text(treeNames[index])

            const filteredStateData = data.filter(d => d.state === selected_state);

            var filtered = filteredStateData.filter(d=>d.scientific_name === treeNames[index])

            const x = d3.scaleLinear()
                .domain([0, Math.max(...filtered.map(d=>d.tree_count))]).nice()
                .range([0, sm_width]);


            svg3.append("g")
                .call(d3.axisTop(x).ticks(5,)).attr("class", "axis");
            svg3.append("g").call(d3.axisLeft(y)).attr("class", "axis");

            var plantColor = d3.schemeTableau10[index]




            svg3.selectAll("svg")
                .data(filtered)
                .enter().append("rect")


                //.attr("x", d => x(parseInt(d.tree_count)))
                .attr("y", d => y(d.city))

                .attr("width", function (d) {

                    return x(parseInt(d.tree_count))
                })
                .attr("height", y.bandwidth())
                .attr("fill", plantColor)
                .on("mouseover", function (d, i) {
                    //console.log(i)
                    tooltip.html(`Count : ${d.tree_count}`)
                        .style("visibility", "visible");
                    d3.select(this).attr("fill", "red");
                })
                .on("mousemove", function () {
                    tooltip
                        .style("top", (event.pageY - 10) + "px")
                        .style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function () {
                    tooltip.html(``).style("visibility", "hidden");
                    d3.select(this).attr("fill", function () {
                        return "" + d3.schemeTableau10[index] + "";
                    })
                })
        }
    })
}