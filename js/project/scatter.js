const years2 =  fetch('./data/project/years.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
years2.then(function (data){
    const yearSelect = document.getElementById('yearSelectScatter');
    data.forEach((year) => {

        const option = document.createElement('option');
        option.value = year;
        option.text = year;

        yearSelect.appendChild(option);

    });

})

$("#yearSelectScatter").on('change', function(){

    const selectedYear = $(this).val();
    const selectedParameter = $("#parameterSelectScatter").val();

    const selectedCountries =getSelectedCountries()
    drawScatterPlot(selectedYear, selectedParameter, selectedCountries)
});



$("#parameterSelectScatter").on('change', function(){

    const selectedParameter = $(this).val();
    const selectedYear = $("#yearSelectScatter").val();
    const selectedCountries = getSelectedCountries()
    drawScatterPlot(selectedYear, selectedParameter, selectedCountries)
});

$("#regionSelect").on('change', function(){

    const selectedParameter = $("#parameterSelectScatter").val();
    const selectedYear = $("#yearSelectScatter").val();
    const selectedCountries = getSelectedCountries()
    drawScatterPlot(selectedYear, selectedParameter, selectedCountries)
});

function getSelectedCountries() {

    const regionSelect = document.getElementById('regionSelect');

    var selectedCountries = []

    for(var i = 0; i < regionSelect.children.length; i++) {
        var option = regionSelect.children[i];


        if (option.selected===true) {
            selectedCountries.push(option.text)
            /*if(selectedYears.length >10){
                selectedYears.pop()
                window.alert("you cannot select more than 10 years options")
                /!*option.selected = false
                var selectDropDown = document.getElementById('drop-down');
                selectDropDown.children[i].classList.remove("checked")
                option.querySelector("input").checked = false;*!/

                /!*var selectDropDown = document.getElementById('drop-down');

                selectDropDown.children[i].children.item(0).toggleAttribute("checked")*!/



                break
            }*/
        }
    }
    return selectedCountries;
}

/*const countries =  fetch('./data/project/countries.txt').then(x => x.text())
    .then((data) => data.trim().split('\n').sort());
countries.then(function (data){
    const countrySelect = document.getElementById('countrySelect');
    var selectedCountries=[]
    data.forEach((country) => {

        const option = document.createElement('option');
        option.value = country;
        option.text = country;

        if(data.indexOf(country) < 3){
            option.setAttribute('selected', 'selected');
            selectedCountries.push(country)
        }
        countrySelect.appendChild(option);

    });

   // const select = $("#countrySelect");
    new lc_select(countrySelect, {
        wrap_width: '100%',
        min_for_search: 1,
        pre_placeh_opt: true,
    });

    new lc_select('select[name="multiple"]', {
        wrap_width : '100%',
        enable_search : false,
        max_opts : 15,

    });


    const selectedYear = $("#yearSelectScatter").val();
    const selectedParameter = $("#parameterSelectScatter").val();


    drawScatterPlot(selectedYear??"2000", selectedParameter??"alcohol", selectedCountries)
})*/


function drawScatterPlot(selectedYear = "2000", selectedParameter = "alcohol", selectedRegions=[
    "Asia", "Europe", "Africa", "North America", "South America", "Oceania"
]){
    d3.selectAll("#scatter_plot").select("svg").remove();



    var margin = {top: 20, right: 20, bottom: 100, left: 150},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page

    var svg = d3.select("#scatter_plot")
        .append('svg')
        .attr('width', 1000 + width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

//Read the data
    d3.csv("./data/project/data.csv", function(data) {


        if(selectedYear) {
            data = data.filter(function (obj) {
                return (obj.year === selectedYear);
            });
        }
        if(selectedRegions){
            data = data.filter(function (obj) {
                return selectedRegions.includes(obj.region);
            });
        }
        var regions = Array.from(new Set(data.map(e=>e.region)))

        const color = d3.scaleOrdinal()
            .domain(regions)
            .range(d3.schemeCategory10);
        // Add X axis
        //

       /* const xScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
            .range([0, width])
            .nice();

        const yScale = d3.scaleLinear()
            .domain([
                d3.min(nestedData, region => d3.min(region.values, year => year.value)),
                d3.max(nestedData, region => d3.max(region.values, year => year.value))
            ])
            .range([height, 0])
            .nice();


        console.log(d3.min(data, d => d.life_expectancy))
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis).attr("class", "axis");

        svg.append("g")
            .call(yAxis).attr("class", "axis");*/



        var x = d3.scaleLinear()
            .domain(
                [d3.min(data, d => +d.life_expectancy), d3.max(data, d => +d.life_expectancy)]
            )
            .range([ 0, width ]).nice();

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .attr("class", "axis");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([d3.min(data, function (d) {
                if(selectedParameter === "alcohol")
                    return +d.alcohol
                else return +d.BMI
            }), d3.max(data, function (d) {
                if(selectedParameter === "alcohol")
                    return +d.alcohol
                else return +d.BMI
            })])
            .range([ height, 0]).nice();
        svg.append("g")
            .call(d3.axisLeft(y))
            .attr("class", "axis");



        var tooltip = d3.select("#scatter_plot")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden")
        // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        const mouseover = function (d) {
            // Highlight the specie that is hovered

            highlight(d)
            var parameter = "";
            switch (selectedParameter) {
                case 'alcohol':
                    parameter = "Alcohol Consumption: " + `<b>${d.alcohol}</b>`
                    break;
                case 'BMI':
                    parameter = "BMI: " + `<b>${d.BMI}</b>`
                    break;
                case 'infant_deaths':
                    parameter = "Infant Deaths: " + `<b>${d.infant_deaths}</b>`
                    break;
                default:
                    parameter = "Life Expectancy: " + `<b>${d.life_expectancy}</b>`
            }

            tooltip
                .html("Country: " + `<b>${d.country}</b>` + "<br>" + "Life Expectancy: " + `<b>${d.life_expectancy}</b>`+
                    "<br>" +parameter)
                .style("visibility", "visible")
        }

        const mousemove = function (d) {
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        }

        const mouseleave = function (d) {

            removeHighlight(d)

            tooltip.html(``).style("visibility", "hidden");
        }

        function highlight(d){
            selected_specie =typeof d === 'string'? d: d.region

            d3.selectAll(".dot")
                .transition()
                .duration(200)
                .style("fill", "lightgrey")
                .attr("r", 3)

            d3.selectAll(".dot." + selected_specie.replace(/\s/g, "."))
                .transition()
                .duration(200)
                .style("fill", color(selected_specie))
                .attr("r", 7)
        }
        function removeHighlight(d){
            d3.selectAll(".dot")
                .transition()
                .duration(200)
                .style("fill", d => color(d.region))
                .attr("r", 5)
        }
        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function (d) { return "dot " + d.region })

            .attr("cy", function (d) {

                if(selectedParameter === "alcohol")
                    return y(d.alcohol);
                else return y(d.BMI)
            } )
            .attr("cx", function (d) { return x(d.life_expectancy); } )
            .attr("r", 5)
            .style("fill", function (d) { return color(d.region) })
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)


        var size = 12
        var legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(' + (width + 100) + ', -100)');

        legend.selectAll('rect')
            .data(regions)
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr("y", function(d,i){ return 100 + i*(size+10)})
            .attr('width', size)
            .attr('height', size)
            .attr('fill', function(d, i){
                return color(d);
            })
            .on("mouseover", highlight)
            //  .on("mousemove", mousemove)
            .on("mouseleave", removeHighlight)

        legend.selectAll('text')
            .data(regions)
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
            .on("mouseover", highlight)
            //.on("mousemove", mousemove)
            .on("mouseleave", removeHighlight)

        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width  - 250)
            .attr("y", height + 60)
            .text("Life Expectancy")
            .style("fill","white");

        svg.append("text")
            .attr("x", -250)
            .attr("y", -50)
            .text(selectedParameter === "alcohol"? "Alcohol Consumption (In liters)": "BMI")
            .style("fill","white")
            .attr("transform", "rotate(-90)");

    })

}

drawScatterPlot()