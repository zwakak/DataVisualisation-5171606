const cities =  fetch('./data/assignment_1/cities.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
cities.then(function (data){
    const citySelect = document.getElementById('citySelect');
    data.forEach((city) => {

        const option = document.createElement('option');
        option.value = city;
        option.text = city;
        citySelect.appendChild(option);

    });
    drawVerticalBar(data[0])
})

$("#citySelect").on('change', function(){

    const selected_city = $(this).val();
    drawVerticalBar(selected_city)
});
function drawVerticalBar(selected_city="Adair"){
    d3.select("#graph").select("svg").remove();

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

    d3.csv("./data/assignment_1/city_tree_counts.csv",function(error, data) {
        data.forEach(function(d) {
            d.tree_count = parseInt(d.tree_count);
            d.avg_mean = parseFloat(d.avg_mean);
        });

        if(selected_city) {
            data = data.filter(function (obj) {

                return (obj.city === selected_city) && obj.scientific_name!== 'Other';
            });
        }

        x.domain(data.map(function(d) {

            return d.scientific_name;

        }));
        y.domain([0, d3.max(data, function(d) { return d.tree_count; })]);

        let color = d3.scaleSequential()
            .domain([0, d3.max(data, d => d.tree_count)])
            .interpolator(d3.interpolateBuPu);


        const tooltip = d3.select("#graph")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden")




        svg.selectAll("mybar")
            .data(data)
            .enter().append("rect")
            .attr("x", function(d) { return x(d.scientific_name); })
            .attr("width", x.bandwidth())
            .attr("y", function(d) { return y(0); })
            .attr("height", function(d) { return height - y(0); })
            .attr("fill", function (d) {
                return color(d.tree_count);
            })
            .on("mousemove", function () {
                tooltip
                    .style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseover", function (d){
                const numOfOccurrences = d.tree_count;
                const name = d.scientific_name;
                const heightMean = d.avg_mean;
                tooltip
                    .html("Tree Name: " + `<b>${name}</b>` + "<br>" + "Number of Occurness: " + `<b>${numOfOccurrences}</b>`+ "<br>" +"Height Mean: " + `<b>${heightMean}</b>`)
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
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end")
            .style("font-family", "Fira Sans");

        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));


        svg.append("text")
            .attr("class", "axis")
            .attr("text-anchor", "end")
            .attr("x", width - 200)
            .attr("y", height + 130)
            .text("Tree Scientific Name")

        svg.append("text")
            .attr("class", "axis")
            .attr("text-anchor", "end")
            .attr("y", 5)
            .attr("x", -25)

            .attr("dy", "-5em")
            .attr("transform", "rotate(-90)")
            .text("Tree Count (According to a certain city)")

        svg.selectAll("rect")
            .transition()
            .duration(800)
            .attr("y", function(d) { return y(d.tree_count); })
            .attr("height", function(d) { return height - y(d.tree_count); })
            .delay(function(d,i){ return(i*100)})

    });
}

