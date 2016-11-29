

// main data table; An array of arrays
var table = [];

// sample data
var table_eduardo = [
	["Alicia","Eduardo"],
	["Oscar","Eduardo"],
	["Annie","Oscar"],
	["Eddie","Oscar"],
	["Oliver","Eddie"],
	["Annie","Oliver"]
];
var table_colors = [
	["red","orange"],
	["orange","yellow"],
	["yellow","green"],
	["green","blue"]
];


$(document).ready(function() {


	/**

	0. init
		load sample data in form

	1. user pastes or edits form 
		convert string to array
		update display table
		update network viz





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
    	var str = $(this).val();
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
		} else {
			console.log("************************* Papaparse ERRORS *************************");
			if (str !== "") display_msg('<div class="bg-danger">csv must contain at least one comma</div>');
			update_table(p.data); // try anyway
		}
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





/**
 *	Counting functions
 */

function countChars(str) {
	return str.length;
}
function countWords(str) {
	return str.split(/\s+/).length;
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
	var dataset = { "nodes": [], "edges": [] };
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
				"name": n1, 
				"value": 1 
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
				"name": n2, 
				"value": 1 
			});
		} else {
			// else update 
			var num = node_order.indexOf(n2)
			dataset.nodes[num].value ++;
		}

		// push edges 
		dataset.edges.push({ 
			"source": node_order.indexOf(n1), 
			"target": node_order.indexOf(n2) 
		});

		// reporting
		console.log(JSON.stringify(dataset));
	}
	return dataset;
}
//var dataset = create_graph(table);
//console.log(JSON.stringify(dataset))
//viz(dataset)




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

//display_table(table,"data-table",10)


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




/*




function viz(data){

	var width = 1500, height = 1500;

	var svg = d3.select("body")
		.append("svg")
		.attr("width", width)
		.attr("height", height);

	var nodes = svg.selectAll("circle.node")
		.data(data.nodes)
		.enter()
		.append("circle")
		.attr("class", "node")
		.attr("r", 12);

	var edges = svg.selectAll("line.link") 
		.data(data.edges)
		.enter()
		.append("line")
		.style("stroke","black");


	var force = d3.layout.force()
		.nodes(data.nodes)
		.links(data.edges)
		.size([width, height])
		.linkDistance(30)
		.charge(-120)
		.start();

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

