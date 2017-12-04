/**
 *  Interface
 */


/**
 *  Display a message under the input_text box
 */
function display_msg(msg){
    $('#msg').html(msg);
}


/**
 *	Saves values from rangeslider(s)
 */
function saveRangeSliderValue(element) {

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
 *	Display CSV table in HTML
 */
function create_table(arr,headers=[],limit=1000){

	var str = '<table class="table table-sm">';

	// for each row
	$.each(arr, function( index, row ) {

        // create headers with keys on first row only
        if (index <= limit  && index === 0){
            // add row and number column first
            str += "<thead><th class='num'>#</th>";
            // if headers were supplied (as array)
            if (headers.length > 0){
                // add each header
                $.each(headers, function( key, header ) {
                    str += "<th>"+ header +"</th>";
                });
            }
            // if not supplied, in the case of dynamically-determined col numbers
            else {
                $.each(row, function( key, header ) {
                    str += "<th>col"+ key +"</th>";
                });
            }
            str += "</thead><tbody>";
        }

		// confine to limit
		if (index <= limit){
			//console.log(row);

			// add row and number column
			str += "<tr><td class='num'>"+ index +"</td>";
            // add all other rows
			$.each(row, function( key, val ) {
                str += "<td>"+ val +"</td>";
			});
			str += "</tr>";

		} else {
			// break from loop
			return false;
		}
	});
    str += "</tbody></table>";
    return str;
}

/* Sliders */

$("#d3-network-format-toggle").on("click", function(e){
    e.preventDefault();
    $("#d3-network-format").slideToggle();
});
$("#data-details-toggle").on("click", function(e){
    e.preventDefault();
    $("#data-details").slideToggle();
});
$("#data-table-toggle").on("click", function(e){
    e.preventDefault();
    $("#data-table").slideToggle();
});
$("#word-frequency-toggle").on("click", function(e){
    e.preventDefault();
    $("#word-frequency").slideToggle();
});


/* Sample Data */

// colors
$("#sample-colors-csv").on("click", function(){
    update_input_text(arr_to_str(table_colors));
});
$("#sample-colors-csv-odd-columns").on("click", function(){
    update_input_text(arr_to_str(table_colors_odd_columns));
});
$("#sample-colors-tsv").on("click", function(){
    update_input_text(arr_to_str(table_colors,"\t"));
});
// literature
$("#sample-moby-dick-36").on("click", function(){
    update_input_text(moby_dick_36);
});
$("#sample-minima-moralia").on("click", function(){
    update_input_text(minima_moralia);
});

// clear
$("#clear").on("click", function(){
    $('#input_text').val("");
    svg.selectAll("*").remove();
    eval_input();
});
