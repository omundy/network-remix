/**
 *	NetworkRemix - main.js
 */
"use strict";

/**

How things are

 1. init - Page loads
 2. get data in form <onload> or <if form changed>

 	A. if it is different than before
         1.if no papaparse errors
 			check CSV and convert to table
 		else if pp errors
 			stop + ask user if it is plain text or fix the CSV?
 	if plain
 		break into sentences
 		break into tokens
 		convert to table

 3. update display table
 4. convert table to JSON
 5. update network graph
*/



var table = [],		// main data table; An array of arrays
	lastinput = "",	// last input from user, check for updates
	details = { 	// store details about current dataset
		"currentTotalChars":0,
		"currentTotalWords":0,
		"currentTotalUniqueWords":0,
		"currentTableLength":0,
		"currentTableLength":0,
		"currentNodeLength":0,
		"currentEdgeLength":0,
		"format": "table"
	},
	prefs = {		// preferences
		"minWords":1,
		"maxWords": 100,
		"maxEdges": 200,
		"removeStopWords": false
	};




// after document has loaded...
$(document).ready(function() {
	init_page();
});
// 0. initialize page
function init_page(){
	// add rangeslider
	addRangeSlider();
	// listen for keyup or change in textarea
	$('#input_text').on('keyup change', function() {
		eval_input();
	});
	// start app
	//$("#sample-sportsball-csv").trigger("click");
	//$("#sample-colors-csv").trigger("click");
	$("#sample-poe-dream").trigger("click");
}



/**
 *	Evaluate the text input
 */
function eval_input(){
	// report prefs/details
	console.log("\nNEW INPUT DETECTED")
	console.dirxml(" --- preferences --- ", prefs);
	console.dirxml(" --- details --- ", details);

	// get current data in textarea and limit
	var str = $('#input_text').val().trim();

	// if input is empty exit early
	if (str === "") return;

	// if input is different then continue
    if (str !== lastinput){

    	// determine type of input (table vs. plain text)
    	details.format = strTableOrPlain(str);
		// update format
	    $('#format-detected').html(details.format);
		// update the format button
		//update_format_btn(details.format);

		// format plain text as a table
		if (details.format == "plain"){
			str = parseText(str,prefs.maxWords,prefs.maxEdges);
		}
		// and parse it using papaparse: http://papaparse.com/docs
		var pconfig = { "dynamicTyping":true, "skipEmptyLines":true };
		var p = Papa.parse(str,pconfig);
		// only proceed if there are no errors
		//console.log("INPUT CHANGE: "JSON.stringify(p));
		update_stats(str);
		// if no errors
		if (p.errors.length < 1){
			//console.log("p.data",p.data);

			// if we have a custom format
			if (details.format == "customTable"){
				// store and remove header row
				var headerRow = p.data[0];
				p.data.shift();
				// loop through each row
				for (var i=0,l=p.data.length; i<l; i++){
					// remove first index

				}
			}

			update_data_table(p.data);
			display_msg('');
			update_graph(table);
		} else {
			console.log("************************* Papaparse ERRORS *************************");
			console.log(JSON.stringify(p.errors));
			var msg = "Note: Input with commas or tabs only will be interpreted as table data, while other punctuation causes plain text analysis.";
			if (str !== "") display_msg('<div class="alert alert-warning">'+ msg +'</div>');
			update_data_table(p.data); // try anyway
		}
	}
	// remove graph if string empty
	if (str == "")
		svg.selectAll("*").remove();
	// update lastinput
	lastinput = str.trim();
}


/**
 *	Determine if str is table or plain text
 *	@param {String} str - string from the textarea
 *	@return {String} type - 'table' or 'plain'
 */
function strTableOrPlain(str){
	// create score for each type
    var strType = {'table':0,'plain':0,'customTable':0}
	// split str into lines
	var text = str.match(/[^\r\n]+/g);
	// look at lines to determine if we should treat as table or plain text
	for (var i=0; i<10; i++){
		// if line doesn't exist then exit loop
		if (text[i] == undefined) break;

		// determine if we need a custom format
		if (str.slice(0,1) == "*"){
			strType.customTable = 1;
			break;
		}

		// change to object
		text[i] = {'text':text[i]};

		// QUESTIONS FOR FUTURE CONSIDERATION OF THIS FUNCTION
		// are there multiple lines?
		// are there periods OR is there a comma in each line?
		// if there are commas, does the number of commas match on the first three lines?

		// track commas and periods
		text[i].commas = (text[i].text.match(/,/g) || []).length;
		text[i].periods = (text[i].text.match(/\./g) || []).length;
		text[i].questions = (text[i].text.match(/\?/g) || []).length;
		text[i].exclaimations = (text[i].text.match(/\!/g) || []).length;

		// early exit option
		// if period or other punctuation found then return as 'plain'
		if (text[i].periods >= 1 || text[i].questions >= 1 || text[i].exclaimations >= 1) {
			console.log( ' --- format notes --- punctuation found, format: plain' );
			return 'plain';
		}
		// increment possibilities
		strType.table += text[i].commas;
		strType.plain += text[i].periods;

		//console.log('',i,'/',text.length, JSON.stringify(text[i]), JSON.stringify(strType) );
	}
	if (strType.customTable == 1){
		var type = 'customTable';
	} else if (strType.table >= strType.plain){
		var type = 'table';
	} else if (strType.table < strType.plain){
		var type = 'plain';
	}
	console.log( ' --- format notes --- table (CSV/TSV) vs. plain text score: ', JSON.stringify(strType), 'winning format:', type );
	return type;
}



/**
 *	Update the data-table
 */
function update_data_table(arr){
	// store data
	table = arr;
    // store current number of rows in data table
    details.currentTableLength = table.length;
    // display data length in table headings
    $('#data-table-records').html("("+ details.currentTableLength + ")");
	// write table
	$("#data-table").html( create_table(table) );
}


/**
 *	Update the graph
 */
function update_graph(table){
	var dataset = convert_table_to_d3_network(table);
	//console.log(JSON.stringify(dataset))

	// store and display details about network
	details.currentNodeLength = dataset.nodes.length;
	details.currentEdgeLength = dataset.links.length;
    $('#currentNodeLength').html(details.currentNodeLength);
    $('#currentEdgeLength').html(details.currentEdgeLength);

	// display converted JSON in textarea (this is actually a handy feature for general use)
	// clean up first
	var str = JSON.stringify(dataset, null, 2);
	str = str.replace(/(?:(},\n))/g,"},");
	str = str.replace(/(?:(    {))/g,"{")
	str = str.replace(/(?:(\[\n))/g,"\[");
	$("#d3-network-format").val( str );

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
function convert_table_to_d3_network(table){
	//console.log("convert_table_to_d3_network()");

	var dataset = {"nodes":[],"links":[]},	// dataset to build
		node_order = [];					// array to track node order

	// make sure this is a two-column table
	table = convertTwoColTable(table);
	//console.log("table",table)

	// for each row in table
	for (var row in table){
		// for each col in row
		for (var col in table[row]){
			row = parseInt(row); 			// make row an integer
			col = parseInt(col); 			// make col an integer

			// if not a string (for some reason?)
			if (typeof table[row][col] !== "string"){
				console.log("NOT A STRING", row, col, table[row][col]);
				break;
			}

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
