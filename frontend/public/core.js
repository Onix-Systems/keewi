$(function () {
    var margin = {top: 30, right: 20, bottom: 30, left: 50};
    var width = 500 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5);
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(5);
    var line = d3.svg.line()
            .x(function(d) { return x(d.time_stamp); })
            .y(function(d) { return y(d[core.type]); });
    var type;
    var core = {
        build: function (data) {
            if (data.device_id) {
                this.buildDevice(data);
            }
        },
        buildDevice: function (data) {
            data.data.forEach(function (element) {
                element.time_stamp = new Date(element.time_stamp);
            });
            this.createChart(data.data, 'kWh', data.device_id);
            this.createChart(data.data, 'Power', data.device_id);
        },
        createChart: function (data, type, id) {
            var svg = d3.select('.main-container').append("svg")
                .attr("class", "chart-body")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            core.type = type;
            x.domain(d3.extent(data, function(d) { return d.time_stamp; }));
            y.domain(d3.extent(data, function(d) { return d[core.type]; }));

            core.xLine(svg, xAxis, height);
            core.yLine(svg, yAxis, type + ' - ' + id);
            core.chartLine(data, svg, line);
        },
        xLine: function (svg, xAxis, height) {
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .style("fill", "#000")
                .call(xAxis);
        },
        yLine: function (svg, yAxis, name) {
            svg.append("g")
                .attr("class", "y axis")
                .style("fill", "#000")
                .call(yAxis)
                .append("text")
                .attr("x", -30)
                .attr("y", -10)
                .style("fill", "#000")
                .text(name);
        },
        alertLine: function (data, svg, line) {
            data.forEach(function (d, i) {
                svg.append("path")
                    .style("stroke", "white")
                    .attr("class", "alert-line" + i)
                    .attr("d", line(d));
            })

        },
        chartLine: function (data, svg, line) {
            svg.append("path")
                .attr("class", "line")
                .attr("d", line(data));
        }
    };
    var jqxhr = $.getJSON( "data.json", function(data) {
        if (data){
            data.forEach(function (d) {
                core.build(d);
            });
        }
    })
    .fail(function(err) {
        console.log( err );
    });
});