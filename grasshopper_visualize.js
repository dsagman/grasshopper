
function clearSVG(id) {
  const svg = d3.select("#" + id);
  svg.selectAll("*").remove();
}

function drawGraph(seq, path, edgeMethod = "path", id, showEnd = false, goalSum, style = 'default') {
  const nodeColor = "yellow";
  const nodeEmpty = "#000000";
  const errorColor = "red";
  const edgeNotSelectedColor = "lightgray";
  const edgeSelectedColor = "orange";
  const width = Math.min(seq.length * 75, 1000);
  const height = 220;
  const midLine = height / 2.5;
  const margin = { top: 0, right: 12, bottom: 0, left: 12 };
  let arc, radius, angleScale;

  path = path.sort((a, b) => a - b); // path can get unsorted with clicking

  // whether to show the directed acyclic graph or only the user selected path
  let graph;
  if (edgeMethod === "all") {
    graph = linkAll(seq);
  } else if (edgeMethod === "dag") {
    graph = dag(seq);
  } else if (edgeMethod === "path") {
    graph = linkArc(path);
  }

  const svg = d3.select("#" + id);
  svg.attr("width", width)
    .attr("height", height);

  // add the markers for the arrows
  svg
    .append("defs")
    .selectAll("marker")
    .data(["end"])
    .enter()
    .append("marker")
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 3)
    .attr("markerHeight", 3)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5");

  // make the nodes, but only add the end if showEnd is true
  const nodeData = Array(seq.length + 1)
    .fill()
    .map((_, index) => ({
      id: index,
      value: seq[index]
    }));
  if (showEnd) {
    nodeData.push({
      id: seq.length,
      value: "end"
    });
  } else {
    nodeData.pop();
  };

  if (style === 'circle') {
    radius = Math.min(width, height) / 2 - 20;
    // radius= 200;
    angleScale = d3.scaleLinear()
      .domain([0, nodeData.length - 1])
      // .range([0, 360]);
      .range([0, 2 * Math.PI]);
  }

  // Check if path is valid skip the terminal node
  let pathIsPrimeApart = true;
  for (let i = 1; i < path.length; i++) {
    if (!isPrime(Math.abs(path[i] - path[i - 1]))
      && !(nodeData[path[i]].value === undefined || nodeData[path[i]].value === 'end')) {
      pathIsPrimeApart = false;
      break;
    }
  };

  const linkData = graph.flatMap((targets, source) =>
    targets.map((target) => ({
      source: nodeData[source],
      target: nodeData[target],
    }))
  );

  // not using nodeY, may use it, don't delete yet
  const nodeY = (d) =>
    path.includes(d.id) ? midLine - 30 : midLine + 30;
  const linkY = (d) =>
    path.includes(d.source.id) && path.includes(d.target.id)
      ? midLine - 30
      : midLine + 30;

  const xScale = d3
    .scalePoint()
    .domain(nodeData.map((d) => d.id))
    .range([margin.left, width - margin.right]);

  let node;
  if (style === 'default') {
    node = svg
      .append("g")
      .selectAll("circle")
      .data(nodeData)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("cx", (d) => xScale(d.id))
      .attr("cy", midLine)
      .style("fill", function (d) {
        return path.includes(d.id) ? (pathIsPrimeApart ? nodeColor : errorColor) : nodeEmpty;
      })
      .style("stroke", nodeColor)
  // } else if (style === 'circle') {
  //   node = svg.append("g")
  //     .selectAll("circle")
  //     .data(nodeData)
  //     .enter()
  //     .append("circle")
  //     .attr("r", 10)
  //     .attr("transform", (d, i) => { // transform circle's position to circular layout
  //       let angle = angleScale(i);
  //       return `translate(${width / 2 + Math.cos(angle) * radius}, ${height / 2 + Math.sin(angle) * radius})`;
  //     })
  //     .style("fill", function (d) {
  //       return path.includes(d.id) ? (pathIsPrimeApart ? nodeColor : errorColor) : nodeEmpty;
  //     })
  //     .style("stroke", nodeColor)
  // }
} else if (style === 'circle') {
    node = svg.append("g")
      .selectAll("circle")
      .data(nodeData)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("cx", function (d, i) { // calculate and save circular positions
        d.x = width / 2 + Math.cos(angleScale(i)) * radius;
        return d.x;
      })
      .attr("cy", function (d, i) {
        d.y = height / 2 + Math.sin(angleScale(i)) * radius;
        return d.y;
      })
      .style("fill", function (d) {
        return path.includes(d.id) ? (pathIsPrimeApart ? nodeColor : errorColor) : nodeEmpty;
      })
      .style("stroke", nodeColor)
  }

  node
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("click", click);

  if (style === 'default') {
    const nodeText = svg
      .append("g")
      .selectAll("text")
      .data(nodeData)
      .enter()
      .append("text")
      .text((d) => d.value)
      .attr("x", (d) => xScale(d.id))
      .attr("y", midLine + 30)
      .attr("font-size", 16)
      .attr("text-anchor", "middle")
      .attr("fill", "yellow");
  } else if (style === 'circle') {
    const nodeText = svg
      .append("g")
      .selectAll("text")
      .data(nodeData)
      .enter()
      .append("text")
      .text((d) => d.value)
      .attr("transform", (d, i) => { // transform circle's position to circular layout
        let angle = angleScale(i);
        return `translate(${width / 2 + Math.cos(angle) * radius}, ${height / 2 + Math.sin(angle) * radius})`;
      })
      .attr("font-size", 16)
      .attr("text-anchor", "middle")
      .attr("fill", "yellow");
  }


  // .attr("d", arc) // use the arc generator
  // Offset the link coordinates by the center of the SVG
  const xOffset = width / 2,
    yOffset = height / 2;

  let link;
  if (style === 'default') {
    link = svg
      .append("g")
      .selectAll("path")
      .data(linkData)
      .enter()
      .append("path")
      .attr("d", (d) => {
        const curvature = 0.5; // adjust link curve
        const x1 = xScale(d.source.id),
          x2 = xScale(d.target.id),
          y1 = midLine,
          y2 = midLine;
        const xi = d3.interpolateNumber(x1, x2),
          x3 = xi(curvature),
          x4 = xi(1 - curvature);
        return path.includes(d.source.id) && path.includes(d.target.id)
          ? "M" + x1 + "," + y1 + "C" + x3 + "," + (y1 - 50) +
          " " + x4 + "," + (y2 - 50) + " " + x2 + "," + y2
          : "M" + x1 + "," + y1 + "C" + x3 + "," + (y1 + 50) +
          " " + x4 + "," + (y2 + 50) + " " + x2 + "," + y2;
      })
      .style("fill", "none");
  } else if (style === 'circle') {
    const lineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y);

  link = svg
    .append("g")
    .selectAll("path")
    .data(linkData)
    .enter()
    .append("path")
    .attr("d", d => lineGenerator([d.source, d.target])) // Draw a line from source to target
    .style("fill", "none")
    .style("stroke", "blue");
}
  link
    .style("stroke", function (d) {
      let sourceIndex = path.indexOf(d.source.id);
      let targetIndex = path.indexOf(d.target.id);
      return sourceIndex !== -1 &&
        targetIndex !== -1 &&
        Math.abs(sourceIndex - targetIndex) === 1
        ? edgeSelectedColor
        : edgeNotSelectedColor;
    })
    .style("stroke-width", function (d) {
      let sourceIndex = path.indexOf(d.source.id);
      let targetIndex = path.indexOf(d.target.id);
      return sourceIndex !== -1 &&
        targetIndex !== -1 &&
        Math.abs(sourceIndex - targetIndex) === 1
        ? "3px"
        : "1px"; // adjust the stroke-width here
    })
    .attr("class", "link")
    .attr("marker-end", "url(#end)");

  // don't lable for circle layout
  if (style === 'default') {
    let mySum = computeSum(seq, path);
    let gotIt = (goalSum == mySum) ? true : false;
    const annotations = [
      {
        type: d3.annotationLabel,
        note: {
          title: pathIsPrimeApart
            ? `Sum of lily pad seeds selected is: ${mySum} 
           \n Selected node indicies are: ${path.length > 0 ? path.join(", ") : "none"}`
            : `Path is not valid!!! 
           \n Selected node indicies are: ${path.length > 0 ? path.join(", ") : "none"}`,
          label: gotIt ? "That's right!" : "",
          align: "middle",
          wrapSplitter: /\n/,
        },
        x: width / 2,
        y: height - 70,
        // dy: height-30,
        // dx: 0,
      },
    ];

    const makeAnnotations = d3.annotation().annotations(annotations);
    svg.append("g").call(makeAnnotations);
  }

  function mouseover(event, d) {
    // grey out any edges not on path with mouseover  
    link.style("opacity", (l) => {
      let sourceIndex = path.indexOf(l.source.id);
      let targetIndex = path.indexOf(l.target.id);
      let inPath = sourceIndex !== -1 &&
        targetIndex !== -1 &&
        Math.abs(sourceIndex - targetIndex) === 1;
      return (inPath) ? 1 : 0.1;
    });
  }

  function mouseout() {
    link.style("opacity", 1);
  }

  function click(event, d) {
    if (path.includes(d.id)) {
      path = path.filter(item => item !== d.id);
    } else {
      path.push(d.id);
    }
    // Clear previous graph if any
    clearSVG(id);
    drawGraph(seq, path, edgeMethod, id, showEnd, goalSum, style);
  }

  // not using. but not ready to delete.
  // function neighboring(a, b) {
  //   return linkData.some(
  //     (d) =>
  //       (d.source === a && d.target === b) || (d.source === b && d.target === a)
  //   );
  // }
}
