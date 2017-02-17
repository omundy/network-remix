/**
 *	NetworkRemix - main.js
 *	
 *
 *
 *


ORDER OF PROGRAM

0. init - Page loads
   
   	<dev only> populate form

1. grab data in form <on load> or <if form changed>

	if it is different than before or if format changed
		
		if no format checked || if CSV checked
			if no papaparse errors
				check CSV and convert to table
			else if pp errors
				stop + ask user if it is plain text or fix the CSV?
		if plain checked
			break into sentences
			break into tokens
			convert to table

2. update display table
3. convert table to JSON
4. update network graph



*/
"use strict";



/**
 *	
 */
var g = new function() {

    var internalFunction = function() {

    };

    this.publicFunction = function() {

    };


};





var table = [],		// main data table; An array of arrays
	lastinput = "",	// last input from user, check for updates
	formatSelected = "table"; // format of incoming data


$(document).ready(function() { 




	/**
	 *	Forms, buttons, etc.
	 */

	// listen for keyup or change in textarea
    $('#input_text').on('keyup change', function() {
        eval_input();
    });
	// listen for format change
	$(document).on('change', '#format-options input', function (e) {
	    formatSelected = $('#format-options .active input').attr('id');
	    eval_input();
	    //console.log("format updated: "+formatSelected);
	});

	// btn: sample data
	$("#sample1").on("click", function(){ 
		$('#input_text').val(arr_to_str(table_colors));
        eval_input();
	});
	$("#sample1_odd").on("click", function(){ 
		$('#input_text').val(arr_to_str(table_colors_odd_columns));
        eval_input();
	});
	$("#sample2").on("click", function(){ 
		$('#input_text').val(arr_to_str(table_eduardo));
        eval_input();
	});
	$("#sample3").on("click", function(){ 
		$('#input_text').val(arr_to_str(table_eduardo,"\t"));
        eval_input();
	});
	$("#sample4").on("click", function(){ 
		$('#input_text').val(charLimit(moby_dick_36,1000));
        eval_input();
	});
	$("#sample5").on("click", function(){
		$('#input_text').val(charLimit(minima_moralia,500));
        eval_input();
	});

	// btn: clear
	$("#clear").on("click", function(){ 
		$('#input_text').val(""); 
		svg.selectAll("*").remove();
        eval_input();
	});

	// start
	$("#sample4").trigger("click");

});



/**
 *	Change the format to match incoming text
 *	@param {String} formatId - 'table' or 'plain'
 */
function update_format_btn(formatId){
	// remove .active class from current .active
	$('#format-options .active ').removeClass('active');
	// add .active class to new id
	$(formatId).parent().addClass('active');
	// save new format
	formatSelected = $('#format-options .active input').attr('id');
	//console.log("formatSelected:", formatSelected, "formatId:", formatId);
}



/**
 *	Determine if str is table or plain text
 *	@param {String} str - string from the textarea 
 *	@return {String} type - 'table' or 'plain'
 */
function strTableOrPlain(str){
	// score each type
    var strType = {'table':0,'plain':0}
	// split str into lines
	var text = str.match(/[^\r\n]+/g);
	// look at lines to determine if we should treat as table or plain text
	for (var i=0; i<10; i++){
		// if line doesn't exist then exit loop
		if (text[i] == undefined) break;

		// change to object
		text[i] = {'text':text[i]};

		// QUESTIONS FOR FUTURE CONSIDERATION OF THIS FUNCTION
		// are there multiple lines?
		// are there periods OR is there a comma in each line?
		// if there are commas, does the number of commas match on the first three lines?

		// track commas and periods
		text[i].commas = (text[i].text.match(/,/g) || []).length;
		text[i].periods = (text[i].text.match(/\./g) || []).length;

		// if period found then return as 'plain'
		if (text[i].periods >= 1) {
			console.log( 'period found, format: plain' );
			return 'plain';
		}
		
		// increment possibilities
		strType.table += text[i].commas;
		strType.plain += text[i].periods;

		//console.log('',i,'/',text.length, JSON.stringify(text[i]), JSON.stringify(strType) );
	}

	if (strType.table >= strType.plain){
		var type = 'table';
	} else if (strType.table < strType.plain){
		var type = 'plain';
	}
	console.log( 'table (CSV/TSV) vs. plain text score: ', JSON.stringify(strType), 'winning format:', type );
	return type;
}



/**
 *	Evaluate the text input 
 */
function eval_input(){

	// get current data in textarea
	var str = $('#input_text').val().trim();

	// if input is different then continue
    if (str !== lastinput){

    	// determine type of input (table vs. plain text)
    	var format = strTableOrPlain(str);

		// update the format button
		update_format_btn("#"+format);

		// format plain text as a table
		if (format == "plain"){
			str = parseText(str);
		}
		


//debugger;


/**/
	
		// and parse it using papaparse: http://papaparse.com/docs
		var pconfig = { "dynamicTyping":true, "skipEmptyLines":true };
		var p = Papa.parse(str,pconfig);
		// only proceed if there are no errors
		//console.log("INPUT CHANGE: "JSON.stringify(p));
		update_stats(str);
		// if no errors
		if (p.errors.length < 1){
			update_table(p.data);
			display_msg('');
			update_graph(table);
		} else {
			console.log("************************* Papaparse ERRORS *************************");
			console.log(JSON.stringify(p.errors));
			if (str !== "") display_msg('<div class="bg-danger">csv must contain at least one comma</div>');
			update_table(p.data); // try anyway
		}



	}
	if (str == ""){
		svg.selectAll("*").remove();
	}
	lastinput = str.trim(); // update lastinput

}





function update_table(arr){
	table = arr;
	display_table(table,"data-table",10);
}



function display_msg(msg){
	$('#msg').html(msg);
}



function update_graph(table){
	var dataset = prepare_graph_data(table);
	//console.log(JSON.stringify(dataset))

	clear_graph();
	// instead look to see if it exists and redraw

	//redraw_graph(dataset);
	draw_graph(dataset) ;
}	 





/**
 *	Convert a >=3 column table of relationships to 2 columns
 *	@param {Array} table - 3d array
 *	@description 
 *	1. input: (e.g.) [["red","orange","yellow"],["yellow","green"]]
 *	2. output: (e.g.) [["red","orange"],["orange","yellow"],["yellow","green"]]
 * 	@return {Object} dataset - a json object
 */
function convertTwoColTable(table){
	
	var twoColTable = [];
	// for each row in table
	for (var row in table){
		// if the row has more than two relationships
		if (table[row].length > 2){
			// for each col in row
			for (var col in table[row]){
				col = parseInt(col);
				if ( col < table[row].length-1 ){
					twoColTable.push([ table[row][col], table[row][col+1] ]);
				}
			}
		} else {
			twoColTable.push(table[row])
		}
	}
	// reporting
	//console.log("  input --> original table --> " + JSON.stringify(table) );
	//console.log("  input --> 2 column table --> " + JSON.stringify(twoColTable) );
	return twoColTable;
}

/**
 *	Prepare graph object for D3 from table data
 *	@param {Array} table - 3d array
 *	@description 
 *	1. input an array of arrays. (e.g.) [["red","orange"],[...]]
 *	2. convert to nodes and edges. (e.g.) {"nodes":[{"name":"red","value":1},{"name":"orange","value":1}],"edges":[{"source":0,"target":1}]}
 *	3. Tracks occurrences and increments values 
 * 	@return {Object} dataset - a json object
 */
function prepare_graph_data(table){

	//console.log("prepare_graph_data()");

	var dataset = {"nodes":[],"links":[]},	// dataset to build
		node_order = [];					// array to track node order

	table = convertTwoColTable(table);		// make sure this is a two-column table

	// for each row in table
	for (var row in table){
		// for each col in row
		for (var col in table[row]){
			row = parseInt(row); 			// make row an integer
			col = parseInt(col); 			// make col an integer

			// clean node name
			var node = table[row][col].trim();	
			//console.log(row,col,node);

			// if node does not yet exist 
			if (node_order.indexOf(node) < 0){
				// add to node_order
				node_order.push(node);
				// add to dataset
				dataset.nodes.push({ 
					"label": node, 
					"r": 1 
				});
			} else {
				// or update node count in dataset
				var num = node_order.indexOf(node)
				dataset.nodes[num].r ++;
			}
			//console.log("node_order: "+ JSON.stringify(node_order));

			// create a link between current node/col and previous node/col
			// starting with second column, only those with at least 2 columns
			if (col > 0 && table[row].length >= 2 ){
				// push edges 
				dataset.links.push({ 
					"source": node_order.indexOf(table[row][col-1]),// new node
					"target": node_order.indexOf(table[row][col]) 	// next node 
				});
			}	
		}
	}
	// reporting
	//console.log("  output --> nodes: "+ JSON.stringify(dataset.nodes));
	//console.log("  output --> links: "+ JSON.stringify(dataset.links));
	
	// return example_graph;
	return dataset;
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
var margin = { top: 20, right: 10, bottom: 40, left: 10 },
	width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// add svg to page
var svg = d3.select("#graph").append("svg")
	// responsive SVG needs these 2 attributes and no width and height attr
	.attr("preserveAspectRatio", "xMinYMin meet")
	.attr("viewBox", "0 0 "+ width +" "+ height)
	.classed("svg-content-responsive", true); // class to make it responsive



var chartLayer = svg.append("g")
	.classed("chartLayer", true)
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



