var svgWidth = 960;
var svgHeight = 500;

var margin = {
top: 30,
right: 30,
bottom: 1000,
left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// D3 Wrapper
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var label = "Poverty";
var chosenYAxis = "smokes";


// function for xScale 
function xScale(stateHealthData, chosenXAxis) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(stateHealthData, d => d[chosenXAxis]) * 0.9,
      d3.max(stateHealthData, d => d[chosenXAxis]) * 1.1
    ])
    .range([0, width]);

  return xLinearScale;

}

// function for yScale
function yScale(stateHealthData, chosenYAxis) {

  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(stateHealthData, d => d[chosenYAxis]) * 0.9,
      d3.max(stateHealthData, d => d[chosenYAxis]) * 1.1
    ])
    .range([height, 0]);

  return yLinearScale;

}
// function for rendering Xaxis 
function renderXaxis(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// function for rendering Yaxis
function renderYaxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function to render the circles and set duration
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(500) // duration of transition
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating the axis
function updateCircle(chosenXAxis, circlesGroup, chosenYAxis) {

  if (chosenXAxis === "healthcare") {
    var label = "Healthcare:";
  }
  else {
    var label = "Poverty:";
  }
    
  return circlesGroup;
}

// Get data from CSV.  
d3.csv("data/data.csv").then(function(stateHealthData, err) {
  if (err) throw err;

  stateHealthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;

  });

  var xLinearScale = xScale(stateHealthData, chosenXAxis);

  var yLinearScale = yScale(stateHealthData, chosenYAxis);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(stateHealthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Create group for 2 axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("data-axis", "x")
    .attr("value", "poverty")
    .classed("active", true)
    .text("Percent of Populace in Poverty");

  var healthcareLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("data-axis", "x")
    .attr("value", "healthcare") 
    .classed("inactive", true)
    .text("Healthcare (Percent Uninsured)");

  // Create group for 3 y-axis labels
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${60}, ${(height + 100) / 2 - 100})rotate(-90)`);

  var smokesLabel = yLabelsGroup.append("text")
    // .attr("transform", "rotate(-90)")
    .attr("y", -120)
    .attr("x", -26)
    .attr("data-axis", "y")
    .attr("dy", "1em")
    .classed("axis-text active", true)
    .attr("value", "smokes") 
    .text("Smokes");

    var ageLabel = yLabelsGroup.append("text")
    .attr("y", -160)
    .attr("x", -26)
    .attr("data-axis", "y")
    .attr("dy", "1em")
    .classed("axis-text active", true)
    .attr("value", "age")
    .text("Age");


    var incomeLabel = yLabelsGroup.append("text")
    .attr("y", -120)
    .attr("x", -24)
    .attr("data-axis", "y")
    .attr("value", "income") 
    .classed("axis-text inactive", true)
    .text("Income");

  var circlesGroup = updateCircle(chosenXAxis, circlesGroup);

  d3.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      var axis = d3.select(this).attr("data-axis");

      if (value !== chosenXAxis && value !== chosenYAxis) {
        if (axis === "x") {
        chosenXAxis = value;
        } else {
          chosenYAxis = value;
        }
        xLinearScale = xScale(stateHealthData, chosenXAxis);
        yLinearScale = yScale(stateHealthData, chosenYAxis);
        // updates x axis with transition
        xAxis = renderXaxis(xLinearScale, xAxis);
        yAxis = renderYaxis(yLinearScale, yAxis);

        circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        circlesGroup = updateCircle(chosenXAxis, circlesGroup, chosenYAxis);

        if (chosenXAxis === "healthcare") {
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      
        if (chosenYAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);

        }
        else if (chosenYAxis === "age") {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true)
           ageLabel
            .classed("active", true)
            .classed("inactive", false);
  
            ;
        }

        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);

        }
      }
    });

})
