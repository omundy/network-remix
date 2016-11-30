

// main data table; An array of arrays
var table = [],
	input = "";

// sample data
var table_colors = [
	["red","orange"],
	["orange","yellow"],
	["yellow","green"],
	["green","blue"]
];
var table_eduardo = [
	["Alicia","Eduardo"],
	["Oscar","Eduardo"],
	["Annie","Oscar"],
	["Eddie","Oscar"],
	["Oliver","Eddie"],
	["Annie","Oliver"]
];


$(document).ready(function() {


	/**

	0. init
		load sample data in form

	1. user pastes or edits form 
		convert string to array
		update display table
		update network graph





	/**
	 *	Forms, buttons, etc.
	 */

	// clear
	$("#clear").on("click", function(){ 
		$('#input_text').val(""); 
		update();
	});
	// sample data
	$("#sample1").on("click", function(){ 
		$('#input_text').val(arr_to_str(table_colors));
        update();
	});
	$("#sample2").on("click", function(){ 
		$('#input_text').val(arr_to_str(table_eduardo));
        update();
	});









	// 0. populate table with sample data on load
	//$('#input_text').val(arr_to_str(table));

	// if the textarea has changed
    $('#input_text').on('keyup change', function() {
    	// get form value
    	var str = $(this).val().trim();
    	// if input is different
	    if (str !== input){
			// and parse it
			var pconfig = { "dynamicTyping":true, "skipEmptyLines":true };
			var p = Papa.parse(str,pconfig);
			// only proceed if there are no errors
			console.log("change");
			console.log(JSON.stringify(p));
			update_stats(str);

			if (p.errors.length < 1){
				update_table(p.data);
				display_msg('');
				update_graph(table);
			} else {
				console.log("************************* Papaparse ERRORS *************************");
				if (str !== "") display_msg('<div class="bg-danger">csv must contain at least one comma</div>');
				update_table(p.data); // try anyway
			}
		}
		input = str.trim();
    });





	// run everything
	$("#sample1").trigger("click");

});


function update(){
	$('#input_text').trigger('keyup');
}


function update_table(arr){
	table = arr;
	display_table(table,"data-table",10);
}

function update_stats(str){
	var report = countChars(str) +" characters and "+ countWords(str) +" words";
	$('#stats').text(report);
}

function display_msg(msg){
	$('#msg').html(msg);
}



function update_graph(table){

	var dataset = create_graph(table);
	console.log(JSON.stringify(dataset))

	/*  
		dataset = {"nodes":[{"label":"red","r":12},{"label":"orange","r":15},{"label":"yellow","r":15},{"label":"green","r":14},{"label":"blue","r":11}],
		"links":[{"source":0,"target":1},{"source":1,"target":2},{"source":2,"target":3},{"source":3,"target":4}]};
	 */ 

	   // alert(JSON.stringify(data))
	    
	 clear_graph();
	 draw_graph(dataset) ;
}	 



/**
 *	Counting functions
 */

function countChars(str) {
	return str.length;
}
function countWords(str) {
	return str.split(/[\s,]+/).length;
}




/**
*	create_graph() from table data
*	@table array
*	@description 
*	1. takes as input an array of arrays
		[["red","orange"],["orange","yellow"],["yellow","green"]]
*	2. disperses them into nodes and edges
		{"nodes":[{"name":"red","value":1},{"name":"orange","value":1}],"edges":[{"source":0,"target":1}]}
*	3. Tracks occurrences and increments values 
*/
function create_graph(table){

	console.log(JSON.stringify(table));

	// dataset to build
	var dataset = { "nodes": [], "links": [] };
	// track nodes
	var node_order = [];

	// loop through each row of table
	for (i in table){

		var n1 = table[i][0].toLowerCase();
		var n2 = table[i][1].toLowerCase();

		// if node1 does not exist 
		if (node_order.indexOf(n1) < 0){
			// track it
			node_order.push(n1);
			// and create it in dataset
			dataset.nodes.push({ 
				"label": n1, 
				"r": 1 
			});
		} else {
			// else update 
			var num = node_order.indexOf(n1)
			dataset.nodes[num].value ++;
		}

		// if node2 does not exist 
		if (node_order.indexOf(n2) < 0){
			// track it
			node_order.push(n2);
			// and create it in dataset
			dataset.nodes.push({ 
				"label": n2, 
				"r": 1 
			});
		} else {
			// else update 
			var num = node_order.indexOf(n2)
			dataset.nodes[num].value ++;
		}

		// push edges 
		dataset.links.push({ 
			"source": node_order.indexOf(n1), 
			"target": node_order.indexOf(n2) 
		});

		// reporting
		console.log(JSON.stringify(dataset));
	}
	return dataset;
}





/**
 *	Display CSV table in HTML
 */
function display_table(arr,id,limit){

	var str = '<table class="table table-condensed">';

	// for each row
	$.each(arr, function( index, row ) {
		// confine to limit
		if (index <= limit){

			console.log(row);

			// create headers with keys on first row only
			if (index === 0){ 
				str += "<thead><th>#</th>";
				$.each(row, function( key, header ) {
					str += "<th>col"+ key +"</th>"
				});
				str += "</thead>"
			}
			
			// all other rows
			str += "<tr><td>"+ index +"</td>";
			$.each(row, function( key, val ) {
				str += "<td>"+ val +"</td>"
			});
			str += "</tr>"

		} else {
			// break from loop
			//$("#"+id).after("... only "+ limit +" rows displayed");
			return false;
		}
		
	});
	$("#"+id).html(str +'</table>');
}



/**
 *	Convert a multi-dimensional array to a string
 */
function arr_to_str(arr){
	if (arr.length > 0){
		var str = "", del = "";
		// for each row
		$.each(arr, function( index, row ) {
			if (row.length > 0){
				str += del + row.join();
				del = "\n";
			}
		});
	}
	return str.trim();
}





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
   
// chart options
var width = 500, height = 500,
	margin = { top:0, left:0, bottom:0, right:0 }

var chartWidth = width - (margin.left+margin.right)
var chartHeight = height - (margin.top+margin.bottom)

// add svg to page
var svg = d3.select("#graph").append("svg")
	.attr("width", width)
	.attr("height", height);
var chartLayer = svg.append("g")
	.classed("chartLayer", true)
	.attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("transform", "translate("+[margin.left, margin.top]+")");







function clear_graph(){
	svg.selectAll("*").remove();
}


function draw_graph(data) {

	console.log(data)
     
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.index }))
        .force("collide",d3.forceCollide( function(d){ return d.r + 16 }).iterations(16) )
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(chartWidth / 2, chartWidth / 2))
        .force("y", d3.forceY(0))
        .force("x", d3.forceX(0))

    var link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "black")
    
    var node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter().append("circle")
        .attr("r", function(d){  return d.r * 6 })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));    
    
	// create div for the tooltip
	var tooltip = d3.select("body").append("div")	
	    .attr("class", "tooltip")				
	    .style("opacity", 0);

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
    
    var ticked = function() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
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




