var core = {
    config: null,
    metricName: null,
    platformName: null,
    alert: null,
    init: function () {
        // this.config = config;
        data = this.prepareData();
        // $.each(data, function(metricName, metric) {
        //     core.metricName = metricName;
        //     $.each(metric, function(platformName, platform) {
        //         core.platformName = platformName;
        //         core.createChart(platformName, platform);
        //     });
        // });
    },
    prepareData: function () {
        console.log('dd');
        var data = $.getJSON( "../data.json", function(data) {
            if (data){
                console.log(data);
                // data.allData.forEach(function (d) {
                //     core.buildTables(d);
                // });
            }
        })
        .fail(function(err) {
            console.log( err );
        });
        var newData = {};
        data.forEach(function (d) {
            if (newData[d.metric] !== undefined) {
                if (newData[d.metric][d.platform] === undefined) {
                    newData[d.metric][d.platform] = [d];
                } else {
                    newData[d.metric][d.platform].push(d);
                }
            } else {
                newData[d.metric] = {};
                newData[d.metric][d.platform] = [d];
            }
            d.date = new Date(d.date * 1000);
            d.value = Number(d.value);
        });
        return newData;
    },
    createChart: function(name, data){
        var margin = {top: 30, right: 20, bottom: 30, left: 50},
            width = 1180 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom,
            x = d3.time.scale().range([0, width]),
            y = d3.scale.linear().range([height, 0]);
        var alertData = core.alertData([data[0], data.slice(-1)[0]], core.metricName, name);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(5);
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(5);
        var line = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.value); });
        var area = d3.svg.area()
            .x(function(d) { return x(d.date); })
            .y0(height)
            .y1(function(d) { return y(d.value); });
        var svg = d3.select('.chart-svg').append("svg")
            .attr("class", "chart-body")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0,d3.max(data, function(d) { return core.alert > d.value ? core.alert + (core.alert/10) : d.value;})]);

        core.xLine(svg, xAxis, height);
        core.yLine(svg, yAxis, name);
        core.alertLine(alertData, svg, line);
        core.chartFill(data, svg, area);
        core.chartLine(data, svg, line);
    },
    alertData: function (data, metric, name) {
        var configName = name.toLowerCase();
        configName = configName == 'highendmobile' ? 'mobile' : configName;
        var value = core.config[metric][configName];
        var result = [];
        $.each(value, function(index, val) {
            core.alert = val;
            result.push([{date: data[0].date, value: val}, {date: data[1].date, value: val}]);
        });
        return result;
    },
    xLine: function (svg, xAxis, height) {
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .style("fill", "#fff")
            .call(xAxis);
    },
    yLine: function (svg, yAxis, name) {
        svg.append("g")
            .attr("class", "y axis")
            .style("fill", "#fff")
            .call(yAxis)
            .append("text")
            .attr("x", -30)
            .attr("y", -10)
            .style("fill", "#fff")
            .text(core.platformName + " - " + core.metricName);
    },
    alertLine: function (data, svg, line) {
        data.forEach(function (d, i) {
            svg.append("path")
                .style("stroke", "white")
                .attr("class", "alert-line" + i)
                .attr("d", line(d));
        })

    },
    chartFill: function (data, svg, area) {
        svg.append("path")
            .attr("class", "area")
            .attr("d", area(data));
    },
    chartLine: function (data, svg, line) {
        svg.append("path")
            .attr("class", "line")
            .attr("d", line(data));
    }
};