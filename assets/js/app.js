// Function that remove anything in SVG if it is not empty, so we can replace it with resized version
function makeResponsive() {

    var svgArea = d3.select("body").select("svg");

    if (!svgArea.empty()) {
      svgArea.remove();
    };

    // Set svg width and height
    var svgWidth = window.innerWidth*.8;
    var svgHeight = svgWidth*0.7;

    var textSize = svgWidth*0.01;

    // Set margin
    var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
    };

    // Set chartGroup width and height
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // Create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // Append an SVG group
    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "healthcare";

    // function used for updating x-scale var upon click on axis label
    function xScale(stateData, chosenXAxis) {
    // create scales
        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.9,
            d3.max(stateData, d => d[chosenXAxis]) * 1.1
        ])
            .range([0, width]);

        return xLinearScale;

    }

    // function used for updating x-scale var upon click on axis label
    function yScale(stateData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.min(stateData, d => d[chosenYAxis]) * 0.9,
            d3.max(stateData, d => d[chosenYAxis]) * 1.1
            ])
            .range([height, 0]);
    
        return yLinearScale;
    
    }

    // function used for updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // function used for updating yAxis var upon click on axis label
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;
    }

    // function used for updating circles group with a transition to
    // new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    };

    // function used for updating state name in circles
    function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => (newYScale(d[chosenYAxis])+4));
        
        return textGroup;
    };

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup, chosenYAxis) {

        var labelX;
        var labelY;

        if (chosenXAxis === "poverty") {
            labelX = "Proverty: ";
        }
        else if (chosenXAxis==='age'){
            labelX = "Age:";
        }
        else {
            labelX= "Household Income: $"
        };

        if (chosenYAxis === "healthcare") {
            labelY = "Lacks Healthcare:";
        }
        else if (chosenYAxis==='smokes'){
            labelY = "Smokes:";
        }
        else {
            labelY= "Obesity:"
        };

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function(d) {
                if (chosenXAxis==='poverty'){
                    return (`${d.state}<br>${labelX}${d[chosenXAxis]}%<br>${labelY} ${d[chosenYAxis]}%`); 
                }
                else {
                    return (`${d.state}<br>${labelX}${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}%`);
                };
            });

        circlesGroup.call(toolTip);

        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data, this);
        })
            // onmouseout event
            .on("mouseout", function(data, index) {
            toolTip.hide(data);
            });

        return circlesGroup;
    }



    // Retrieve data from the CSV file and execute everything below
    d3.csv("assets/data/data.csv").then(function(stateData, err) {
        if (err) throw err;

        // parse data
        stateData.forEach(function(data) {
            data.poverty = parseFloat(data.poverty);
            data.age = parseFloat(data.age);
            data.income = parseFloat(data.income);
            data.healthcare = parseFloat(data.healthcare);
            data.obesity = parseFloat(data.obesity);
            data.smokes = parseFloat(data.smokes);
    });

        // xLinearScale function above csv import
        var xLinearScale = xScale(stateData, chosenXAxis);

        // Create y scale function
        var yLinearScale = yScale(stateData, chosenYAxis);


        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        var yAxis = chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(stateData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("r",10)
            .classed("stateCircle", true)
            .attr("opacity", "0.9");

        // append state names on circles
        var textGroup = chartGroup.selectAll("text")
            .exit() //because enter() before, clear cache
            .data(stateData)
            .enter()
            .append("text")
            .text(d => d.abbr)
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis])+4)
            .attr("font-size", textSize+"px")
            .attr("text-anchor", "middle")
            .attr("class","stateText");

        // Create group for y-axis and x-axis labels
        var labelsXGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);
        
        var labelsYGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");

        // append x axis
        var povertyLabel = labelsXGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .attr('class', 'textX')
            .classed("active", true)
            .text("In Poverty(%)");

        var ageLabel = labelsXGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .attr('class', 'textX')
            .classed("inactive", true)
            .text("Age (Median)");

        var householdIncomeLabel = labelsXGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .attr('class', 'textX')
            .classed("inactive", true)
            .text("Household Income (Median)");

        // append y axis
        var heathcareLabel = labelsYGroup.append("text")
            .attr("x", `-${height/2}`)
            .attr("y", -30)
            .attr("value", "healthcare") // value to grab for event listener
            .attr('class', 'textY')
            .classed("active", true)
            .text("Lacks Healthcare (%)");

        var smokesLabel = labelsYGroup.append("text")
            .attr("x", `-${height/2}`)
            .attr("y", -50)
            .attr("value", "smokes") // value to grab for event listener
            .attr('class', 'textY')
            .classed("inactive", true)
            .text("Smokes (%)");

        var obeseLabel = labelsYGroup.append("text")
            .attr("x", `-${height/2}`)
            .attr("y", -70)
            .attr("value", "obesity") // value to grab for event listener
            .attr('class', 'textY')
            .classed("inactive", true)
            .text("Obese (%)");


        // chartGroup.append("text")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", 0 - margin.left)
        //     .attr("x", 0 - (height / 2))
        //     .attr("dy", "1em")
        //     .classed("axis-text", true)
        //     .text("Number of Billboard 500 Hits");

        // updateToolTip function above csv import
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

        // x axis labels event listener
        labelsXGroup.selectAll(".textX")
            .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
    
            if (value !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(stateData, chosenXAxis);

                // updates y scale for new data
                yLinearScale = yScale(stateData, chosenYAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates state names with new x values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltip with new x values
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis)

                // changes classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    householdIncomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age"){
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    householdIncomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "income"){
                    householdIncomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
            // chosenXAxis=value;
            // return chosenXAxis;
        });
        labelsYGroup.selectAll(".textY")
            .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");

            if (value !== chosenYAxis) {

                // replaces chosenYAxis with value
                chosenYAxis = value;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(stateData, chosenXAxis);

                // updates y scale for new data
                yLinearScale = yScale(stateData, chosenYAxis);

                // updates y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates state names with new y values
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // updates tooltip with new y values
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis)

                // changes classes to change bold text
                if (chosenYAxis === "healthcare") {
                    heathcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes"){
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    heathcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity"){
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    heathcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                };
            }
        
        });

    }).catch(function(error) {
    console.log(error);
})};

makeResponsive();
d3.select(window).on('resize', makeResponsive);
