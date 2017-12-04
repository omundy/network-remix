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
 *	Display CSV table in HTML
 */
function display_table(arr,id,limit){

	var str = '<table class="table table-sm">';

	// for each row
	$.each(arr, function( index, row ) {
		// confine to limit
		if (index <= limit){
			//console.log(row);

			// create headers with keys on first row only
			if (index === 0){
				str += "<thead><th>#</th>";
				$.each(row, function( key, header ) {
					str += "<th>col"+ key +"</th>"
				});
				str += "</thead>"
			}

			// add all other rows
			str += "<tr><td>"+ index +"</td>";
			$.each(row, function( key, val ) {
                str += "<td>"+ val +"</td>"
			});
			str += "</tr>"

		} else {
			// break from loop
			return false;
		}
	});
    // write table
	$("#"+id).html(str +'</table>');
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
