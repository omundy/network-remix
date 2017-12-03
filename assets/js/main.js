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


var table = [],		// main data table; An array of arrays
	lastinput = "",	// last input from user, check for updates
	details = { "currentTotalWords":0, "currentTotalChars":0, "currentTotalUniqueWords":0, "currentTableLength":0, "format": "table" },
	prefs = { "minWords":1, "maxWords": 100, "maxEdges": 200 };





$(document).ready(function() { 



	// rangeslider 
	var $element = $('[data-rangeslider]');
	$element.rangeslider({
	    polyfill: false,	// Deactivate the feature detection
	    rangeClass: 'rangeslider',	 // Default CSS classes
	    disabledClass: 'rangeslider--disabled',
	    horizontalClass: 'rangeslider--horizontal',
	    verticalClass: 'rangeslider--vertical',
	    fillClass: 'rangeslider__fill',
	    handleClass: 'rangeslider__handle',
	    onInit: function() {
	        saveValue(this.$element[0]);
	    },
	    onSlide: function(position, value) {
	        //console.log('onSlide','position: ' + position, 'value: ' + value);
	        saveValue(this.$element[0]);
	    },
	    onSlideEnd: function(position, value) {
	        //console.log('onSlide','position: ' + position, 'value: ' + value);
	        saveValue(this.$element[0]);
			eval_input();
	    }
	});

	function saveValue(element) {

		// display output
		var textContent = ('textContent' in document) ? 'textContent' : 'innerText';
		var output = element.parentNode.getElementsByTagName('output')[0] || element.parentNode.parentNode.getElementsByTagName('output')[0];
		var type;

		// update preferences
		if (element.id == "word-limit"){
			prefs.maxWords = element.value;
			type = "words";
		} else if (element.id == "edge-limit"){
			prefs.maxEdges = element.value;
			type = "edges";
		}
		output[textContent] = element.value + " " + type;
	}


	/**
	 *	Forms, buttons, etc.
	 */

	// listen for keyup or change in textarea
    $('#input_text').on('keyup change', function() {
        eval_input();
    });
    /*
	// listen for format change
	$(document).on('change', '#format-options input', function (e) {
	    details.format = $('#format-options .active input').attr('id');
	    eval_input();
	    //console.log("format updated: "+formatSelected);
	});
	*/

	// btn: sample data
	$("#sample1").on("click", function(){ 	
		update_input_text(arr_to_str(table_colors));
	});
	$("#sample1_odd").on("click", function(){ 
		update_input_text(arr_to_str(table_colors_odd_columns));
	});
	$("#sample2").on("click", function(){ 
		update_input_text(arr_to_str(table_eduardo));
	});
	$("#sample3").on("click", function(){ 
		update_input_text(arr_to_str(table_eduardo,"\t"));
	});
	$("#sample4").on("click", function(){ 
		update_input_text(moby_dick_36);
	});
	$("#sample5").on("click", function(){
		update_input_text(minima_moralia);
	});
	// btn: clear
	$("#clear").on("click", function(){ 
		$('#input_text').val(""); 
		svg.selectAll("*").remove();
        eval_input();
	});

	// start
	$("#sample1").trigger("click");


});


function update_input_text(txt){
	$('#input_text').val(txt);
    eval_input();
}

function update_details(currentTotalWords){


	details.currentTotalWords = currentTotalWords;




	// update word-limit-slider max
	//$('.range-slider-word-limit input').attr('max',details.currentTotalWords);
	// temp: limit word-limit-slider max to 200 words
	$('.range-slider-word-limit input').attr('max',200);
	// update rangeslider
	$('input[type="range"]').rangeslider('update', true);
	
}


/**
 *	Change the format to match incoming text
 *	@param {String} formatId - 'table' or 'plain'
 */
function update_format_btn(format){
	// remove .active class from current .active
	$('#format-options .active ').removeClass('active');
	// add .active class to new id
	$("#"+format).parent().addClass('active');
	// save new format
	details.format = $('#format-options .active input').attr('id');
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

		// early exit option
		// if period found then return as 'plain'
		if (text[i].periods >= 1) {
			console.log( ' --- format notes --- period found, format: plain' );
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
	console.log( ' --- format notes --- table (CSV/TSV) vs. plain text score: ', JSON.stringify(strType), 'winning format:', type );
	return type;
}



/**
 *	Evaluate the text input 
 */
function eval_input(){

	console.log("\nNEW INPUT DETECTED")

	// report prefs/details
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

		// update the format button
		//update_format_btn(details.format);

		// update format
	    $('#format-detected').html(details.format);

		// format plain text as a table
		if (details.format == "plain"){
			str = parseText(str,prefs.maxWords,prefs.maxEdges);
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
	display_table(table,"data-table",1000);
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









