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
 *	Inserts sample data into textarea and evaluates
 */
function update_input_text(txt){
	$('#input_text').val(txt);
    eval_input();
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
 *	Add rangeslider
 */
function addRangeSlider(){
    var $element = $('[data-rangeslider]');
    $element.rangeslider({
        polyfill: false,
        rangeClass: 'rangeslider',
        disabledClass: 'rangeslider--disabled',
        horizontalClass: 'rangeslider--horizontal',
        verticalClass: 'rangeslider--vertical',
        fillClass: 'rangeslider__fill',
        handleClass: 'rangeslider__handle',
        onInit: function() {
            saveRangeSliderValue(this.$element[0]);
        },
        onSlide: function(position, value) {
            saveRangeSliderValue(this.$element[0]);
        },
        onSlideEnd: function(position, value) {
            saveRangeSliderValue(this.$element[0]);
            eval_input();
        }
    });
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
function updateRangeSliderTotal(id,currentTotalWords){
	// update word-limit-slider max
	$(id +' input').attr('max',details.currentTotalWords);
	// temp: limit word-limit-slider max to 200 words
	//$('.range-slider-word-limit input').attr('max',200);
	// update rangeslider
	$('input[type="range"]').rangeslider('update', true);
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
$("#sample-sportsball-csv").on("click", function(){
    update_input_text(arr_to_str(table_sportball));
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
