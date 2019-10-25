 var svg = d3.select("svg"),
 margins = {top: 10, right: 20, bottom:20, left: 20},
 width = window.innerWidth - margins.right - margins.left - 10,
 height = window.innerHeight - margins.top - margins.bottom - 10;
 padding = 180;

 svg.attr("width", width)
 .attr("height", height);

 var graphGroup = svg.append('g');

 var color = d3.scaleOrdinal()
 .range(["#d3d3d3","#ffffff","#EF6F6C" ]);

 var counter = 0;

 var size = d3.scalePow()
 .exponent([0.001])
 .range([5, 30])
 .domain([0,30])

 var stroke = d3.scaleLinear()
 .range([1,6])

 d3.json("info.json", function(error, graph) {
    //    data.forEach(function(d) {
    //     d.date = parseDate(d.date);
    //     d.close = +d.close;
    // })
    ;

    graph.nodes.forEach(function(node){
      if (node.attributes.color == "topics") {
        var circularX = (width / 2 + margins.left) + (height / 2 - padding) * Math.cos(2 * Math.PI * counter / 10);
        var circularY = (height / 2 + margins.top) + (height / 2 - padding) * Math.sin(2 * Math.PI * counter / 10);
        node.fx = circularX;
        node.fy = circularY;
        counter++;
      }
    })

    var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-250))
    .force('collision', d3.forceCollide().radius(function(d) {
      return d.size + 1
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
    .attr("stroke-width", function(d) { return Math.sqrt(d.size) });


    var node = graphGroup.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(graph.nodes)
    .enter().append("g")
    .attr("r", function(d) { return size(d.size); })
    .attr("fill", function(d) { return color(d.color); })
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
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));


    var labels = node.append("svg:text")
    .filter(function(d){
      return d.attributes.color == "topics"
    })
    .text(function(d) {
      return d.attributes.value;})
    .attr("class", "labels")
    .style("fill", "black");

// tooltip

d3.selectAll("circle").on("click",d => {
  d3.selectAll("h5") .remove()
  d3.selectAll("h4").remove()
  d3.selectAll("h1").remove()
  d3.select("#tooltip").append("h5")
  .text(d.attributes.title)
  d3.select("#tooltip").append("h4")
  .text(d.attributes.author)
   d3.select("#tooltip").append("h1")
  .text(d.attributes.country)

});

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