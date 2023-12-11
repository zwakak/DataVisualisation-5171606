fetch('./data/assignment_3/states_with_code.json').then(x => x.json())
    .then(function (data) {
        const stateSelect3 = document.getElementById('stateSelect3');

        for (var key in data) {
            if (data.hasOwnProperty(key)) {

                const option = document.createElement('option');
                option.value = key;
                option.text =  data[key];
                stateSelect3.appendChild(option);
            }
        }
    });

$("#stateSelect3").on('change', function(){

    const selectedStateCode = $(this).val();

    drawRidgeLine(selectedStateCode, getSelectedYears3(), false)


});

function getSelectedYears3() {
    const yearSelect3 = document.getElementById('yearSelect3');
    var selectedYears3 = []
    for(var i = 0; i < yearSelect3.children.length; i++) {
        var option = yearSelect3.children[i];

        if (option.selected) {
            selectedYears3.push(option.text)
            if(selectedYears3.length >10){
                selectedYears3.pop()
                window.alert("you cannot select more than 10 years options")
                option.selected = false
                /*var selectDropDown = document.getElementById('drop-down');
                selectDropDown.children[i].classList.remove("checked")
                option.querySelector("input").checked = false;*/

                /*var selectDropDown = document.getElementById('drop-down');

                selectDropDown.children[i].children.item(0).toggleAttribute("checked")*/



                break
            }
        }
    }
    return selectedYears3;
}

$("#yearSelect3").on('change', function(){
    var selectedYears = getSelectedYears3()
    drawRidgeLine($("#stateSelect3").val(), selectedYears, false)

});

function drawRidgeLine(selectedStateCode="001", selectedYears=[], loadYearsOption=true) {
    d3.select("#ridgelinechart").selectAll("svg").remove();
    var margin = {top: 80, right: 30, bottom: 50, left:110},
        width = 660 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    const svg = d3.select('#ridgelinechart')
        .append('svg')
        .attr('width', 1000 + width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);


    d3.csv("./data/assignment_3/ridge_line.csv", function (data) {


        if (selectedStateCode != null) {
            data = data.filter((d) => d.stateCode.toString() === selectedStateCode.toString())
        }
        if (selectedYears.length > 0) {

            data = data.filter((d) => selectedYears.includes(d.year))
        }


        const years = [...new Set(data.map((d) => d.year))];
        if (loadYearsOption) {
            const yearSelect3 = document.getElementById('yearSelect3');
            years.forEach((year) => {

                const option = document.createElement('option');
                option.text = year;
                if (years.indexOf(year) === 0) {
                    option.selected = true
                    data = data.filter((d) => d.year === year)
                    selectedYears = []
                    selectedYears.push(year)
                }
                yearSelect3.appendChild(option);

            })
        }



        // Get the different categories and count them
        const categories = ["min", "max"]
        const n = categories.length

        // Add X axis
        const x = d3.scaleLinear()
            .domain([0, Math.ceil(d3.max(data).max / 10) * 10 + 10])
            .range([0, width]);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .attr("class", "axis")
            .selectAll("text").style('fill', "white");

        // Create a Y scale for densities
        const y = d3.scaleLinear()
            .domain([0, 0.75])
            .range([height, 0]);

        // Create the Y axis for names
        const yName = d3.scaleBand()
            .domain(Array.from(new Set(data.map((d)=>d.year))))
            .range([0, height])
            .paddingInner(1)

        svg.append("g")
            .call(d3.axisLeft(yName))
            .attr("class", "axis")
            .selectAll("text").style('fill', "white");





       var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40))
        var allDensity = []
        for (var i = 0; i < selectedYears.length; i++) {
            var year = selectedYears[i];
            for (var j = 0; j < categories.length; j++) {
                var key = categories[j];

                var density = kde(data.filter(d => d.year === year).map(d => d[key]));
                allDensity.push({ key: key, year: year, density: density });
            }
        }
        console.log(allDensity)
        // Add areas
        svg.selectAll("areas")
            .data(allDensity)
            .enter().append("path")
            .attr("transform", function (d) {
                return (`translate(0, ${(yName(d.year) - height)})`) })
            .attr("stroke", function(d){
                console.log(d)
                if(d.key === "min")
                    return "#4e79a7"
                else return "#fc3565"
            })
            .datum(function (d) { return d.density })
            .attr("fill-opacity", "0")

            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .curve(d3.curveBasis)
                .x(function (d) { return x(d[0]); })
                .y(function (d) { return y(d[1]); })
            )

        const legend = svg.append('g').attr('id', 'legend1').selectAll('.legend1').data(categories);

        legend

            .enter().append('rect')
            .attr('x', width + margin.right )
            .attr('y', (d, i) => 20 * i)
            .attr('width', 12)
            .attr('height', 12)

            .style('fill', function(d, i){
                if(d === "min"){
                    return "#4e79a7"
                }
                else return "#fc3565"
            })
            .style('cursor', 'pointer')

        legend
            .enter().append('text')
            .attr('x', width + margin.right + 20)
            .attr('y', (d, i) => 20 * i + 10)
            .text(function (d) {
                if(d === "min"){
                    return "Minimum Temperature"
                }
                return "Maximum Temperature"
            })

            .attr("hidden","true")
            .attr('fill', function(d, i){
                if(d === "min"){
                    return "#4e79a7"
                }
                else return "#fc3565"
            })



    })

    function kernelDensityEstimator(kernel, X) {

        return function(V) {
            return X.map(function(x) {

                return [x, d3.mean(V, function(v) { return kernel(x - v); })];
            });
        };
    }
    function kernelEpanechnikov(k) {

        return function(v) {
            return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }


}
drawRidgeLine("001", [], true,)

