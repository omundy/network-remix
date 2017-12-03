/**
 *  Interface
 */



// dropdowns
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
