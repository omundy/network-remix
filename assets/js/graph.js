




/**
 *

function graph(data){

	var width = 500, height = 500;

	// add svg to page
	var svg = d3.select("#graph").append("svg")
		.attr("width", width)
		.attr("height", height);


	var nodes = svg.selectAll("circle.node")
		.data(data.nodes)
		.enter()
		.append("circle")
		.attr("class", "node")
		.attr("r", 12);


var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function(d) { return d.id; }))
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));




	var edges = svg.selectAll("line.link") 
		.data(data.edges)
		.enter()
		.append("line")
		.style("stroke","black");


/*

	force.on("tick", function() {
		edges.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; }) 
			.attr("x2", function(d) { return d.target.x; }) 
			.attr("y2", function(d) { return d.target.y; });
		nodes.attr("cx", function(d) { return d.x; }) 
			.attr("cy", function(d) { return d.y; });
	});		

}

*/





/**
 *	Draw the network graph
 *	Based on https://bl.ocks.org/shimizu/e6209de87cdddde38dadbb746feaf3a3	
 */
   



// graph options
var margin = { top: 20, right: 10, bottom: 40, left: 10 },
	width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// add svg to page
var svg = d3.select("#graph").append("svg")
	// responsive SVG needs these 2 attributes and no width and height attr
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("viewBox", "0 0 "+ width +" "+ height)
	.classed("svg-content-responsive", true); // class to make it responsive



var graphLayer = svg.append("g")
	.classed("graphLayer", true)
	.attr("width", width)
    .attr("height", height)
    .attr("transform", "translate("+[margin.left, margin.top]+")");


// create div for the tooltip
var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);




function clear_graph(){
	svg.selectAll("*").remove();
}




function draw_graph(data) {


	//console.log(data)
    
    // d3v4-force documentation: 
    // https://github.com/d3/d3-force/blob/master/README.md

	// many-body force applies mutually to all nodes
    var manyBody = d3.forceManyBody()
    	// strength accessor to the specified number or function. + nodes attract / - nodes repel. Default -30
    	//.strength(-150)
    	.strength(- table.length)
    ; 

    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.index }))
        .force("collide",d3.forceCollide( function(d){ return d.r + 16 }).iterations(16) )
        .force("charge", manyBody)
        .force("center", d3.forceCenter(width / 2, height / 2))
    //    .force("y", d3.forceY(0))
    //    .force("x", d3.forceX(0))
	.force("x", d3.forceX(width/2))
	.force("y", d3.forceY(height/2))


    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "black")


	// create a linear scale for radius
	var rScale = d3.scaleLinear()
		.domain([0, d3.max(data.nodes, function(d) { return d.r; })])
		.range([1, 15]);


	var rColor = Math.floor(Math.random()*255);
	var nodeFill = "rgba("+ rColor +","+ rColor +",255, .75)";
	var nodeStroke = "rgba(255, 0," + rColor +", 0.25)";
	var textFill = "rgba(0,0,0,1)";

    
    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter().append("circle")
        	.attr("r", function(d){ return rScale(d.r) })
			.attr("fill",nodeFill)
			.attr("stroke",nodeStroke)
			.attr("stroke-width", 5)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));    
    


    svg.selectAll("circle")	
		.on("mouseover", function(d) {
			//console.log(d3.select(this).attr("id")); // log circle id
			// show tooltip
			tooltip.transition()
				.duration(200)
				.style("opacity", .9);
			tooltip.html( "label: "+ d.label +"<br>r: "+ d.r +"<br>index: "+ d.index )
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 50) + "px");
		})
		.on("mouseout", function(d) {
			// hide tooltip
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
		});
    
	var texts = svg.selectAll("text")
    	.data(data.nodes)
    	.enter()
    	.append("text")
    	.text(function(d){ return d.label; })
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("fill", textFill);

    	

    var ticked = function() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        texts
        	.attr("x", function(d){ return d.x +5; })
	    	.attr("y", function(d){ return d.y -5; })	
        	    
    }  
    
    simulation
        .nodes(data.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(data.links);    
    

    
    
    
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
            
}


// USE THIS TO MAKE A REDRAW FUNCTION
// from : http://www.coppelia.io/2014/07/an-a-to-z-of-extra-features-for-the-d3-force-layout/
//Restart the visualisation after any node and link changes
function redraw_graph(data) {
	link = link.data(data.links);
	link.exit().remove();
	link.enter().insert("line", ".node").attr("class", "link");
	node = node.data(data.nodes);
	node.enter().insert("circle", ".cursor").attr("class", "node").attr("r", 5).call(force.drag);
	force.start();
}