
/**
 *  These functions are in the public domain
 *  Owen Mundy owenmundy.com
 */
 
 


/**
 *	Load a remote CSV file
 */
function load_csv(file,callback){
	$.ajax({
        type: "GET",
        url: file,
        dataType: "text",
        success: function(data) { callback(data); }
     });
}



/**
 *  Make sure a property or method is:
 *  1. declared
 *  2. is !== null, undefined, NaN, empty string (""), 0, false
 */
function prop(val){
    if (typeof val !== 'undefined' && val){ 
        return true; 
    } else { 
        return false; 
    }
}


/**
 *	Convert a multi-dimensional array to a string
 */
function arr_to_str(arr,delimiter=","){
	if (arr.length > 0){
		var str = "", del = "";
		// for each row
		$.each(arr, function( index, row ) {
			if (row.length > 0){
				str += del + row.join(delimiter);
				del = "\n";
			}
		});
	}
	return str.trim();
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

			//console.log(row);

			// create headers with keys on first row only
			if (index === 0){ 
				str += "<thead><th>#</th>";
				$.each(row, function( key, header ) {
					str += "<th>column "+ key +"</th>"
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
 *	Counting functions
 */

function countChars(str) {
	return str.length;
}
function countWords(str) {
	return str.split(/[\s,]+/).length;
}



/* 
	FIND UNIQUE WORDS 
	CREDIT: http://stackoverflow.com/a/30335883/441878 
	TODO: Find or write a more substantial class to handle all this.
*/

function cleanString(str) {
    return str.replace(/[^\w\s]|_/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

function extractSubstr(str, regexp) {
    return cleanString(str).match(regexp) || [];
}

function getWordsByNonWhiteSpace(str) {
    return extractSubstr(str, /\S+/g);
}

function getWordsByWordBoundaries(str) {
    return extractSubstr(str, /\b[a-z\d]+\b/g);
}

function wordMap(str) {
    return getWordsByWordBoundaries(str).reduce(function(map, word) {
        map[word] = (map[word] || 0) + 1;
        return map;
    }, {});
}

function mapToTuples(map) {
    return Object.keys(map).map(function(key) {
        return [ key, map[key] ];
    });
}

function mapToSortedTuples(map, sortFn, sortOrder) {
    return mapToTuples(map).sort(function(a, b) {
        return sortFn.call(undefined, a, b, sortOrder);
    });
}

function countWords(str) {
    return getWordsByWordBoundaries(str).length;
}

function wordFrequency(str) {
    return mapToSortedTuples(wordMap(str), function(a, b, order) {
        if (b[1] > a[1]) {
            return order[1] * -1;
        } else if (a[1] > b[1]) {
            return order[1] * 1;
        } else {
            return order[0] * (a[0] < b[0] ? -1 : (a[0] > b[0] ? 1 : 0));
        }
    }, [1, -1]);
}

function printTuples(tuples) {
    return tuples.map(function(tuple) {
        return padStr(tuple[0], ' ', 12, 1) + ' -> ' + tuple[1];
    }).join('\n');
}

function padStr(str, ch, width, dir) { 
    return (width <= str.length ? str : padStr(dir < 0 ? ch + str : str + ch, ch, width, dir)).substr(0, width);
}

function toTable(data, headers) {
    return $('<table class="table table-condensed">').append($('<thead>').append($('<tr>').append(headers.map(function(header) {
        return $('<th>').html(header);
    })))).append($('<tbody>').append(data.map(function(row) {
        return $('<tr>').append(row.map(function(cell) {
            return $('<td>').html(cell);
        }));
    })));
}

function addRowsBefore(table, data) {
    table.find('tbody').prepend(data.map(function(row) {
        return $('<tr>').append(row.map(function(cell) {
            return $('<td>').html(cell);
        }));
    }));
    return table;
}

function update_stats(){
    var str = $('#input_text').val();
    var wordFreq = wordFrequency(str);
    var wordCount = countWords(str);
    var charCount = countChars(str);
    var uniqueWords = wordFreq.length;
    var summaryData = [
        [ 'TOTAL CHARACTERS', charCount ],
        [ 'TOTAL WORDS', wordCount ],
        [ 'UNIQUE WORDS', uniqueWords ]
    ];
    var table = toTable(wordFreq, ['Word', 'Frequency']);
    addRowsBefore(table, summaryData);
    $('#stats').html(table);
};