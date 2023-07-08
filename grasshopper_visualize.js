// visualization code for grasshopper problem
// uses d3.js and d3-annotation.js

function delay(duration) {
  // used for animation
  return new Promise(resolve => setTimeout(resolve, duration));
}

function clearSVG(id) {
  // clear the svg with the given id
  const svg = d3.select("#" + id);
  svg.selectAll("*").remove();
}

function animateDrawPathLog(seq, pathLog, edgeMethod = "path", id, showEnd = false, goalSum, style = 'default', tDelay = 10) {
  // animate the solving algorithm for primeGrasshopper
  for (let i = 0; i < pathLog.length; i++) {
    animateDrawGraph(seq, pathLog[i], edgeMethod, id, showEnd, goalSum, style, tDelay)
  }
}

async function animateDrawGraph(seq, path, edgeMethod = "path", id, showEnd = false, goalSum, style = 'default', tDelay = 100) {
  for (let i = 1; i <= path.length; i++) {
    await delay(tDelay); // delay for animation
    clearSVG(id);
    drawGraph(seq, path.slice(0, i), edgeMethod, id, showEnd, goalSum, style);
  }

}

function drawGraph(seq, path, edgeMethod = "path", id,
  showEnd = false, goalSum, style = 'default',
  tDelay = 100) {
  // seq: the sequence of numbers
  // path: the path of numbers to highlight
  // edgeMethod: "path" or "dag" or "all"
  // id: the id of the svg element
  // showEnd: whether to show the end node
  // goalSum: the goal sum
  // style: 'default' or 'circle'
  // tDelay: the delay for animation
  const nodeColor = "yellow";
  const nodeEmpty = "#000000";
  const errorColor = "red";
  const edgeNotSelectedColor = "lightgray";
  const edgeSelectedColor = "orange";
  const nodeRadius = 15;
  const width = Math.max(300, Math.min(seq.length * nodeRadius * 4, 1000));
  const height = style === 'circle' ? Math.min(width, 600) : 220;
  const midLine = height / 2.5;
  const margin = { top: 0, right: nodeRadius + 1, bottom: 0, left: nodeRadius + 1 };
  let arc; // not using arc, not ready to delete yet
  let radius, angleScale;

  path = path.sort((a, b) => a - b); // path can get unsorted with clicking

  // show the directed acyclic graph, the user selected path, or all edges
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
      .attr("r", nodeRadius)
      .attr("cx", function (d) {
        d.x = xScale(d.id)
        return d.x
      })
      .attr("cy", midLine)
      .style("fill", function (d) {
        return path.includes(d.id) ? (pathIsPrimeApart ? nodeColor : errorColor) : nodeEmpty;
      })
      .style("stroke", nodeColor)
  } else if (style === 'circle') {
    node = svg.append("g")
      .selectAll("circle")
      .data(nodeData)
      .enter()
      .append("circle")
      .attr("r", nodeRadius)
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
    // link = svg.append("g")
    //   .selectAll("path")
    //   .data(linkData)
    //   .enter()
    //   .append("path")
    //   .attr("d", d => {
    //     const dx = (d.target.x - d.source.x);
    //     const dy = (d.target.y - d.source.y);
    //     const dr = Math.sqrt(dx * dx + dy * dy);
    //     return `M ${d.source.x},${d.source.y} A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
    //   })
    //     .style("fill", "none"); // Draw a curved line from source to target
    const lineGenerator = d3
      .line()
      .x(d => d.x)
      .y(d => d.y)
    link = svg
      .append("g")
      .selectAll("path")
      .data(linkData)
      .enter()
      .append("path")
      .attr("d", d => lineGenerator([d.source, d.target])) // Draw a line from source to target
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

  link
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)

  // don't annotate label for circle layout
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
    if (d.id !== undefined) {
      // append an annotation for the node
      const annotationsNode = [
        {
          note: {
            title: `Index: ${d.id}`,
            label: `Value: ${d.value}`,
            align: d.id === 0 ? "left" : (d.id > seq.length - 1 ? "right" : "middle"),
          },
          x: d.x,
          y: d.y,
          dy: 0,
          dx: 0
        }
      ];

      const makeNodeAnnotations = d3.annotation().annotations(annotationsNode);

      svg.append("g")
        .attr("id", 'nodeAnnotation')
        .call(makeNodeAnnotations);
    }
  }

  function mouseout() {
    link.style("opacity", 1);
    d3.select(`#nodeAnnotation`).remove();
    animateDrawGraph(seq, path, edgeMethod, id, showEnd, goalSum, style, tDelay);
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

}
