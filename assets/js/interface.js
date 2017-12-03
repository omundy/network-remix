


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
