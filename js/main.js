    var svg = d3.select("svg"),
    margins = {top: 20, right: 20, bottom:20, left: 50},
    width = window.innerWidth,
    height = 800,
    padding = 10;

    svg.attr("width", width)
    .attr("height", height);

    var graphGroup = svg.append('g');

    var color = d3.scaleOrdinal()
    .range(["#D3D3D3","#EF6F6C","#ffffff" ]);

    var size = d3.scalePow()
    .exponent([0.5])
    .range([5,35])

    var stroke = d3.scaleLinear()
    .range([1,6])

     d3.json("data.json", function(error, graph) {
      if (error) throw error;

    var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-10))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(function(d) {
      return size(d.size) + 20
    }));

    var zoom_handler = d3.zoom()
    .on("zoom", zoom_actions);
    zoom_handler(svg);


      size.domain(d3.extent(graph.nodes, function(d) { return d.size}))
      stroke.domain(d3.extent(graph.links, function(d) { return d.attributes.force}))
      console.log(stroke.domain())



      var link = graphGroup.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
      .attr("stroke-width", function(d) { return stroke(d.attributes.force); });

      var node = graphGroup.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(graph.nodes)
      .enter().append("g")
      .on('mouseover.fade', fade(0.1))
      .on("mouseout.fade", function() {
        circle.transition()
        .duration(100)
        .style("opacity", 0);
      })
      .on('mouseout.fade', fade(1))
      .on("mousemove", function() {  
      })
      .on('dblclick',releasenode)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged))


      var circles = node.append("circle")
      .attr("r", function(d) {return size(d.size);})
      .attr("fill", function(d) { return color(d.attributes.paper); })
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

      var lables = node.append("text")
      .text(function(d) {
        return d.label;
      })
      .attr('x', 6)
      .attr('y', 3)
      .attr('font-size', function(d) {return size(d.size);});
      node.append("title")
      .text(function(d) { return d.id; });

      simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

      simulation.force("link")
      .links(graph.links);

      simulation.on("tick", ticked);
      const linkedByIndex = {};
      graph.links.forEach(d => {
        linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
      });

      //FUNCTIONS//

      function isConnected(a, b) {
        return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
      }

      function fade(opacity) {
        return d => {
          node.style('stroke-opacity', function (o) {
            const thisOpacity = isConnected(d, o) ? 1 : opacity;
            this.setAttribute('fill-opacity', thisOpacity);
            return thisOpacity;
          });

          link.style('stroke-opacity', o => (o.source === d || o.target === d ? 0.6 : opacity));

        };
      }


      function ticked() {
        link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

        node
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
      }
    });


    function zoom_actions(d){
      graphGroup.attr("transform", d3.event.transform);
    // graphGroup.selectAll("text").style("font-size", size(d.size) / d3.event.transform.k + "px");
    // graphGroup.selectAll(".links").style("stroke-width", d.attributes.force / d3.event.transform.k);
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function releasenode(d) {
    d.fx = null;
    d.fy = null;
  }