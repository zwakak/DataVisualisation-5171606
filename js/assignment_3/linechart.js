fetch('./data/assignment_3/states_with_code.json').then(x => x.json())
    .then(function (data) {
        const stateSelect = document.getElementById('stateSelect');

        for (var key in data) {
            if (data.hasOwnProperty(key)) {

                const option = document.createElement('option');
                option.value = key;
                option.text =  data[key];
                stateSelect.appendChild(option);
            }
        }
    });

$("#stateSelect").on('change', function(){

    const selectedStateCode = $(this).val();

    drawLineChart(selectedStateCode, getSelectedYears(), false)
});
function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}
function getSelectedYears() {

    const yearSelect = document.getElementById('yearSelect');

    var selectedYears = []

    for(var i = 0; i < yearSelect.children.length; i++) {
        var option = yearSelect.children[i];


        if (option.selected===true) {
            selectedYears.push(option.text)
            if(selectedYears.length >10){
                selectedYears.pop()
                window.alert("you cannot select more than 10 years options")
                /*option.selected = false
                var selectDropDown = document.getElementById('drop-down');
                selectDropDown.children[i].classList.remove("checked")
                option.querySelector("input").checked = false;*/

                /*var selectDropDown = document.getElementById('drop-down');

                selectDropDown.children[i].children.item(0).toggleAttribute("checked")*/



                break
            }
        }
    }
    return selectedYears;
}

$("#yearSelect").on('change', function(){
    var selectedYears =  getSelectedYears()

    drawLineChart($("#stateSelect").val(),selectedYears, false)

});




function drawLineChart(selectedStateCode="001", selectedYears=[], loadYearsOption=true){
    d3.select("#linechart").selectAll("svg").remove();
    var margin = {top: 20, right: 20, bottom: 150, left: 150},
        width = 700 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    const svg = d3.select('#linechart')
        .append('svg')
        .attr('width', 1000 + width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    d3.csv("./data/assignment_3/merged_results.csv", function(data){



        if(selectedStateCode!=null){
            data = data.filter((d) => d.stateCode === selectedStateCode)
        }
        if(selectedYears.length > 0) {

            data = data.filter((d) => selectedYears.includes(d.year))
        }
        const aux = data.map((d) => d.year);

        const years = [...new Set(aux)];

        if(loadYearsOption){

            const yearSelect = document.getElementById('yearSelect');


            years.forEach((year)=>{
                const option = document.createElement('option');
                option.value = year;
                option.text = year;
                if(years.indexOf(year) === 0){
                    option.selected = true
                    data = data.filter((d) => d.year === year)
                    selectedYears.push(year)
                }
                yearSelect.appendChild(option);

            })
            MultiselectDropdown(yearSelect.children)
        }



        const group = d3.nest()
            .key(function(d) { return d.year; })
            .entries(data);


        const sumstat = [...group.values()];


        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];

        const x = d3.scalePoint()
            .domain(months)
            .range([0, width]);
        svg.append('g').attr('transform', `translate(0, ${height})`).call(d3.axisBottom(x)).attr("class", "axis")
            .selectAll("text").style('fill', "white");

        const domMin = d3.extent(data, (d) => parseFloat(d.min));
        const domMax = d3.extent(data, (d) => parseFloat(d.max));
        const domains = [...domMin, ...domMax];

        const dom = [d3.min(domains), d3.max(domains)];

        const y = d3.scaleLinear().domain(dom).range([height, 0]).nice();
        svg.append('g').call(d3.axisLeft(y)).attr("class", "axis")
            .selectAll("text").style('fill', "white");



        const colors = d3.scaleOrdinal().domain(years).range(d3.schemeTableau10);

        const lineMin = d3
            .line()
            .x((d) => x(months[d.month - 1]))
            .y((d) => y(d.min));

        const lineMax = d3
            .line()
            .x((d) => x(months[d.month - 1]))
            .y((d) => y(d.max));


        const yearsDict =
            d3.nest()
                .key(function (d) { return d })
                .rollup(function (years) { return years.length })
                .map(selectedYears)



        const tooltip =d3.select("#linechart")
            .append("div")
            .style('visibility', 'hidden')
            .attr("class", "tooltip")

        function mouseover() {
            tooltip.style('z-index', 1);
            tooltip.transition().style('opacity', 0.9);
            d3.select(this).transition().attr('r', 6);

        }

        function mouseout() {
            tooltip.style('z-index', -1);
            tooltip.transition().style('opacity', 0);
            d3.select(this).transition().attr('r', 4);
        }

        function mousemove(d) {
                tooltip.style('visibility', 'visible')
            let text;
            if(this.className.baseVal.includes("dotMin")){
                text = `Min: ${d.min}&degF`;
            }else if (this.className.baseVal.includes("dotMax")){
                text = `Max: ${d.max}&degF`;
            }else {
                text = `Average: ${d.average}&degF`;
            }

            tooltip
                .html(`Date: <b>${months[parseInt(d.month) - 1]} ${d.year}</b><br>${text}`)
                .style('top', `${event.pageY}px`)
                .style('left', `${event.pageX + 20}px`);
        }



        const filteredData = sumstat.filter(function (yr) {
            return yearsDict.get(yr.key)
        });
        const legend = svg.append('g').attr('id', 'legend1').selectAll('.legend1').data(filteredData);


        var lineOpacity = "1";
        var lineOpacityHover = "0.85";
        var otherLinesOpacityHover = "0.1";
        var lineStroke = "2px";
        var lineStrokeHover = "3px";

        var circleOpacity = '0.85';
        var circleOpacityOnLineHover = "0"

        function mouseOverLine(d) {


            d3.selectAll('.line')
                .style('opacity', otherLinesOpacityHover);
            d3.selectAll('.legend')
                .style('opacity', otherLinesOpacityHover);
            d3.selectAll('.dot')
                .style('opacity', circleOpacityOnLineHover);

            d3.selectAll('.dot _'+d.key)
                .style('opacity', circleOpacity);


            d3.selectAll("._"+d.key)
                .style('opacity', lineOpacityHover)
                .style("stroke-width", lineStrokeHover)
                .style("cursor", "pointer");
        }

        function mouseOutLine(d) {
            svg.select(".title-text").remove();

            d3.selectAll(".line")
                .style('opacity', lineOpacity);

            d3.selectAll(".legend")
                .style('opacity', lineOpacity);
            d3.selectAll('.dot')
                .style('opacity', circleOpacity);
            d3.selectAll("._" + d.key)
                .style("stroke-width", lineStroke)
                .style("cursor", "none");
        }

        svg
            .selectAll('.lineMin')
            .data(filteredData)
            .enter()
            .append('path')
            .attr("class", function(d){
                return "line _"+d.key
            })
            .attr('d', (d) => lineMin(d.values))
            .attr('stroke', (d) => colors(d.key))
            .style('stroke-width', 2)
            .style('fill', 'none')
            .on("mouseover", mouseOverLine)
            .on("mouseout", mouseOutLine);

        svg
            .selectAll('.dotMin')
            .data(data.filter((d) => yearsDict.get(d.year)))
            .enter().append('circle')
            .attr('class', 'dot dotMin')
            .attr("id", "dot")
            .attr('cx', lineMin.x())
            .attr('cy', lineMin.y())
            .attr('r', 3.5)
            .style('fill', (d) => colors(d.year))
            .style('stroke', 'white')
            .style('stroke-width', '1px');



        svg
            .selectAll('.lineMax')
            .data(filteredData)
            .enter()
            .append('path')
            .attr("class", function(d){
                return "line _"+d.key
            })

            .attr('d', (d) => lineMax(d.values))
            .attr('stroke', function (d) {
                return colors(d.key)})
            .style('stroke-width', 2)
            .style('fill', 'none')


            .on("mouseover", mouseOverLine)
            .on("mouseout", mouseOutLine);

        svg
            .selectAll('.dotMax')
            .data(data.filter((d) => yearsDict.get(d.year)))
            .enter().append('circle')
            .attr('class', 'dot dotMax')
            .attr("id", ".dot")

            .attr('cx', lineMax.x())
            .attr('cy', lineMax.y())
            .attr('r', 3.5)
            .style('fill', (d) => (colors(d.year)))
            .style('stroke', 'white')
            .style('stroke-width', '1px');


        svg
            .selectAll('.dotAverage')
            .data(data.filter((d) => yearsDict.get(d.year)))
            .enter().append('circle')
            .attr('class', function (d){
                return 'dot dotAverage _' + d.year
            })
            .attr("id", ".dot")

            .attr('cx', (d) => x(months[parseInt(d.month) - 1]))
            .attr('cy', (d) => y(d.average))
            .attr('r', 3)
            .style('fill', (d) => colors(d.year))
            .style('stroke', 'none');

        svg
            .selectAll('.dot')
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
            .on('mousemove', mousemove);


        legend

            .enter().append('rect')
            .attr('x', width + margin.right )
            .attr('y', (d, i) => 20 * i)
            .attr('width', 12)
            .attr('height', 12)
            .attr('class', function (d){
                return "tooltip legend _"+d.key
            })
            .style('fill', (d) => colors(d.key))
            .style('cursor', 'pointer')
            .on("mouseover", mouseOverLine)
            .on("mouseout", mouseOutLine)
        legend
            .enter().append('text')
            .attr('x', width + margin.right + 20)
            .attr('y', (d, i) => 20 * i + 10)
            .text((d) => d.key)
            .attr('class', function (d){
                return "tooltip legend _"+d.key
            })
            .attr("hidden","true")
            .attr('fill', function(d, i){
                return colors(d.key);
            })
            .on("mouseover", mouseOverLine)
            .on("mouseout", mouseOutLine)
    })



}

drawLineChart("001", [], true)