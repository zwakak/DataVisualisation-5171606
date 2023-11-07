const cities2 =  fetch('./data/assignment_1/cities.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
cities2.then(function (data){
    const citySelect = document.getElementById('citySelect2');
    data.forEach((city) => {

        const option = document.createElement('option');
        option.value = city;
        option.text = city;
        citySelect.appendChild(option);

    });
    drawHorizontalBar(data[0])
})

$("#citySelect2").on('change', function(){

    const selected_city = $(this).val();
    drawHorizontalBar(selected_city)
});
function drawHorizontalBar(selected_city="Adair"){
    d3.selectAll("#graph2").select("svg").remove();
    var margin = {top: 20, right: 20, bottom: 150, left: 200},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scaleLinear()
        .range([0, width])

    var y = d3.scaleBand()
        .range([ 0, height ])
        .padding(0.1);


    var svg = d3.select("#graph2")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("./data/assignment_1/city_tree_counts_top_10.csv",function(error, data) {
        data.forEach(function(d) {
            d.tree_count = parseInt(d.tree_count);
            d.avg_mean = parseFloat(d.avg_mean);
        });

        if(selected_city) {
            data = data.filter(function (obj) {

                return (obj.city === selected_city) && obj.scientific_name!== 'Other';
            });
        }

        y.domain(data.map(function(d) {

            return d.scientific_name;

        }));
        x.domain([0, d3.max(data, function(d) { return d.tree_count; })]);

        let color = d3.scaleSequential()
            .domain([0, d3.max(data, d => d.tree_count)])
            .interpolator(d3.interpolateBuPu);


        const tooltip = d3.select("#graph2")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden")




        svg.selectAll("mybar")
            .data(data)
            .enter().append("rect")
            .attr("x", x(0) )
            .attr("y", function(d) { return y(d.scientific_name); })
            .attr("width", function(d) { return x(d.tree_count); })
            .attr("height", y.bandwidth() )
            .attr("fill", function (d) {
                return color(d.tree_count);
            })
            .on("mousemove", function () {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseover", function (d){
                const count = d.tree_count;
                const name = d.scientific_name;
                const heightMean = d.avg_mean;
                tooltip
                    .html("Scientific Name: " + `<b>${name}</b>` + "<br>" + "Count: " + `<b>${count}</b>`+ "<br>" +"Height Mean: " + `<b>${heightMean}</b>`)
                    .style("visibility", "visible")
                d3.select(this).attr("fill", "#fc3565");
            })
            .on("mouseleave", function (){
                tooltip
                    .style("visibility", "hidden")
                d3.select(this).attr("fill", function(d){
                    return color(d.tree_count);
                });
            })



        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .attr("class", "axis")
            .selectAll("text")
            //.attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-family", "Fira Sans");

        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y)).selectAll("text")
            .style('fill', "white");


        svg.append("text")
            .attr("class", "axis")
            .attr("text-anchor", "end")
            .attr("x", width - 150)
            .attr("y", height + 50)
            .text("Tree Count (According to a certain city)")

        svg.append("text")
            .attr("class", "axis")
            .attr("text-anchor", "end")
            .attr("y", -10)
            .attr("x", -50)

            .attr("dy", "-10em")
            .attr("transform", "rotate(-90)")
            .text("Tree Scientific Name")


        svg.selectAll("rect")
            .attr("width", 0)
            .transition()
            .duration(800)
            .attr("y", function(d) { return y(d.scientific_name); })
            .attr("width", function(d) { return width - y(d.scientific_name); })
            .delay(function(d,i){ return(i*100)})

    });
}
