fetch('./data/assignment_3/states_with_code.json').then(x => x.json())
    .then(function (data) {
        const stateSelect2 = document.getElementById('stateSelect2');

        for (var key in data) {
            if (data.hasOwnProperty(key)) {

                const option = document.createElement('option');
                option.value = key;
                option.text =  data[key];
                stateSelect2.appendChild(option);
            }
        }
    });

$("#stateSelect2").on('change', function(){

    const selectedStateCode = $(this).val();

    drawRadarChart(selectedStateCode, getSelectedYears2(), false,"#radarchart1", "min")
    drawRadarChart(selectedStateCode, getSelectedYears2(), false,"#radarchart2", "max")
    drawRadarChart(selectedStateCode, getSelectedYears2(), false,"#radarchart3", "average")


});

function getSelectedYears2() {
    const yearSelect2 = document.getElementById('yearSelect2');
    var selectedYears2 = []
    for(var i = 0; i < yearSelect2.children.length; i++) {
        var option = yearSelect2.children[i];

        if (option.selected) {
            selectedYears2.push(option.text)
            if(selectedYears2.length >10){
                selectedYears2.pop()
                window.alert("you cannot select more than 10 years options")
                option.selected = false
               /* var selectDropDown = document.getElementById('drop-down');
                selectDropDown.children[i].classList.remove("checked")
                option.querySelector("input").checked = false;
*/
                /*var selectDropDown = document.getElementById('drop-down');

                selectDropDown.children[i].children.item(0).toggleAttribute("checked")*/



                break
            }
        }
    }
    return selectedYears2;
}

$("#yearSelect2").on('change', function(){
    var selectedYears = getSelectedYears2()
    drawRadarChart($("#stateSelect2").val(), selectedYears, false,"#radarchart1", "min")
    drawRadarChart($("#stateSelect2").val(), selectedYears, false, "#radarchart2", "max")
    drawRadarChart($("#stateSelect2").val(), selectedYears, false, "#radarchart3", "average")

});

function drawRadarChart(selectedStateCode="001", selectedYears=[], loadYearsOption=true,
                        divId="#radarchart1", dataName="min"){
    d3.select(divId).selectAll("svg").remove();

    var margin = {top: 20, right: 20, bottom: 90, left: 50},
        width = 500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    const svg = d3.select(divId)
        .append('svg')
        .attr('width', width + width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${150},${150})`);



    d3.csv("./data/assignment_3/"+dataName+".csv", function(data){


        if(selectedStateCode!=null){
            data = data.filter((d) => d.stateCode.toString() === selectedStateCode.toString())
        }
        if(selectedYears.length > 0) {

            data = data.filter((d) => selectedYears.includes(d.year))
        }

        const aux = data.map((d) => d.year);
        const years = [...new Set(aux)];
        if(loadYearsOption){
            const yearSelect2 = document.getElementById('yearSelect2');
            years.forEach((year)=>{

                const option = document.createElement('option');
                option.text = year;
                if(years.indexOf(year) === 0){
                    option.selected = true
                    data = data.filter((d) => d.year === year)
                    selectedYears=[]
                    selectedYears.push(year)
                }
                yearSelect2.appendChild(option);

            })

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

        const dom = d3.extent(data, (d) => parseFloat(d.value));
        const total = months.length; // The number of different axes
        const radius = 100; // Radius of the outermost circle
        const angleSlice = (Math.PI * 2) / total; // The width in radians of each 'slice'

        const rScale = d3.scaleLinear().range([0, radius]).domain(dom);

        const axisGrid = svg.append('g').attr('class', 'axisWrapper');

        const levels = 5;


        const yearsDict =
            d3.nest()
                .key(function (d) { return d })
                .rollup(function (years) { return years.length })
                .map(selectedYears)

        const radarLine = d3
            .lineRadial()
            .radius(function (d) {
             return rScale(parseFloat(d.value))
            })
            .angle(function (d, i) {
                return i * angleSlice
            });

        const colors = d3.scaleOrdinal().domain(years).range(d3.schemeTableau10);

        const tooltip =d3.select(divId)
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
            var degreeCelsius = Math.round((parseFloat(d.value) - 32)/1.8)
            tooltip
                .html(`Date: <b>${months[parseInt(d.month) - 1]} ${d.year}</b><br>${d.value}&degF / ${degreeCelsius}&degC`)
                .style('top', `${event.pageY}px`)
                .style('left', `${event.pageX + 20}px`);
        }


        const legend = svg.append('g').attr('id', 'legend2').selectAll('.legend2').data(selectedYears);

        axisGrid
            .selectAll('.levels')
            .data(d3.range(1, levels + 1).reverse())
            .enter().append('circle')
            .attr('class', 'gridCircle')
            .attr('r', (d) => (radius / levels) * d)
            .style('fill', '#D3D3D3')
            .style('stroke', '#DCDCDC')
            .style('fill-opacity', 0.1);

        axisGrid
            .selectAll('.axisLabel')
            .data(d3.range(1, levels + 1).reverse())
            .enter().append('text')
            .attr('class', 'axisLabel')
            .attr('x', 4)
            .attr('y', (d) => (-d * radius) / levels)
            .attr('dy', '0.4em')
            .style('font-size', '10px')
            .attr('fill', 'white')
            .text(function (d) {
                return `${Math.round((dom[1] * d) / levels)}°C`
            });

        const axis = axisGrid.selectAll('.axis').data(months).enter().append('g').attr('class', 'axis');
        axis
            .append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', function (d, i) {
                return rScale(dom[1] * 1.1) * Math.cos(angleSlice * i - Math.PI / 2)
            })
            .attr('y2', (d, i) => rScale(dom[1] * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr('class', 'line2')
            .style('stroke', '#D3D3D3')
            .style('stroke-width', '1px');

        axis
            .append('text')
            .attr('class', 'legend')
            .style('font-size', '11px')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('x', (d, i) => rScale(dom[1] * 1.2) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('y', (d, i) => rScale(dom[1] * 1.2) * Math.sin(angleSlice * i - Math.PI / 2))
            .text((d) => d);

        const filteredData = sumstat.filter(function (yr) {
            return yearsDict.get(yr.key)
        });

        const blobWrapper = svg
            .selectAll('.radarWrapper')
            .data(filteredData)
            .enter().append('g')
            .attr('class', 'radarWrapper');

        blobWrapper
            .append('path')
            .attr('class', 'radarArea')
            .attr('d', function (d){
                return radarLine(d.values)
            })
            .style('fill', (d) => colors(parseInt(d.key)))
            .style('fill-opacity', 0.1);

        blobWrapper
            .append('path')
            .attr('class', 'radarStroke')
            .attr('d', (d) => radarLine(d.values))
            .style('stroke-width', '1px')
            .style('stroke', (d) => colors(parseInt(d.key)))
            .style('fill', 'none');

        blobWrapper
            .selectAll('.radarCircle')
            .data((d) => d.values)
            .enter().append('circle')
            .attr('class', 'radarCircle')
            .attr('r', 3)
            .attr('cx', (d, i) => rScale(parseFloat(d.value)) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr('cy', (d, i) => rScale(parseFloat(d.value)) * Math.sin(angleSlice * i - Math.PI / 2))
            .style('fill', (d) => colors(parseInt(d.year)))
            .style('fill-opacity', 1)
            .style('stroke', 'none')
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
            .on('mousemove', mousemove);

        legend
            .enter().append('rect')
            .attr('x', width / 3)
            .attr('y', (d, i) => 20 * i - height / 4)
            .attr('width', 12)
            .attr('height', 12)
            .attr('class', 'check2')
            .style('fill', function (d) {
                return colors(d)
            })
            .style('cursor', 'pointer')
        legend
            .enter().append('text')
            .attr('x', width / 3 + 20)
            .attr('y', (d, i) => 20 * i - height / 4 + 7)
            .text((d) => d)
            .style('fill', function (d) {
                return colors(d)
            })
            .attr('class', 'textSelected2')
            .style('font-size', '12px')
            .style('alignment-baseline', 'middle');

    })


    svg.append("text")
        .attr("class", "axis")
        .attr("text-anchor", "end")
        .attr("x", 15)
        .attr("y", height - 200)
        .text(dataName.slice(0, 1). toUpperCase() + dataName.slice(1, dataName.length))
}

drawRadarChart("001", [], true, "#radarchart1", "min")
drawRadarChart("001", ["1895"], false, "#radarchart2", "max")
drawRadarChart("001", ["1895"], false, "#radarchart3", "average")
