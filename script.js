// load the dataset
d3.csv("yearly_section_counts.csv", d3.autoType).then((data) => {
  // filter out the sections (every column except year)
  const sections = data.columns.filter((d) => d !== "year");
  console.log(sections);

  // each dropdown option is a news section
  const select = d3.select("#section-select");
  select
    .selectAll("option")
    .data(sections)
    .join("option")
    .attr("value", (d) => d)
    .text((d) => d);

  // turns data into year and count for a section
  function prepareData(section) {
    return data.map((d) => ({ year: d.year, count: d[section] }));
  }

  // initial chart is index 0 (admin)
  let currentSection = sections[0];
  update(prepareData(currentSection));

  // when we select new section chart updates
  select.on("change", function () {
    currentSection = this.value;
    update(prepareData(currentSection));
  });

  function update(chartData) {
    // new scale (1.1 gives us a bit extra space above the line)
    y.domain([0, d3.max(chartData, (d) => d.count) * 1.1]);
    // axis change animation
    yGroup.transition().duration(750).call(yAxis);

    // binds data to line path
    const path = g.selectAll(".line-path").data([chartData], (d) => d.year);

    // if old path exists
    path.exit().remove();

    // creates or updates the line with a transition
    path
      .enter()
      .append("path")
      .attr("class", "line-path")
      .merge(path)
      .transition()
      .duration(750)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 3)
      .attr("d", lineGen);

    // hover tooltips
    const points = g.selectAll(".data-point").data(chartData, (d) => d.year);

    points.exit().remove();

    // updating points
    points
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("r", 5)
      .attr("fill", "steelblue")
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .on("mouseover", (event, d) => {
        // tooltip handlers
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `<strong>Year:</strong> ${d.year}<br/><strong>Articles:</strong> ${d.count}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 30 + "px");
      })
      .on("mouseout", () =>
        tooltip.transition().duration(500).style("opacity", 0)
      )
      .merge(points) // updating circle positions
      .transition()
      .duration(750)
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.count));
  }
});

// creating svg chart
const svg = d3.select("#chart"),
  margin = { top: 40, right: 30, bottom: 50, left: 60 },
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom;

const g = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// defining the x and y axis
const x = d3.scaleLinear().range([0, width]).domain([1999, 2019]);
const y = d3.scaleLinear().range([height, 0]);

const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
const yAxis = d3.axisLeft(y);
const yGroup = g.append("g").attr("class", "y-axis");

// drawing the x axis
g.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0,${height})`)
  .call(xAxis);

// line generator
const lineGen = d3
  .line()
  .x((d) => x(d.year))
  .y((d) => y(d.count))
  .curve(d3.curveMonotoneX);

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);
