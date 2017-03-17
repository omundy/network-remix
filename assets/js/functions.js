
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
// e.g. var report = countChars(str) +" characters and "+ countWords(str) +" words";







/* 
	FIND UNIQUE WORDS 
	CREDIT: http://stackoverflow.com/a/30335883/441878 
	TODO: Find or write a more substantial class to handle all this.
*/

function cleanString(str) {
    return str.replace(/[^\w\s]|_/g, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .trim();
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
        //console.log(map);
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

    details.currentTotalWords = wordCount;
    details.currentTotalChars = charCount;
    details.currentTotalUniqueWords = uniqueWords;
    $('#currentTotalWords').html(details.currentTotalWords);
    $('#currentTotalChars').html(details.currentTotalChars);
    $('#currentTotalUniqueWords').html(details.currentTotalUniqueWords);
};





















// Credit: https://gist.github.com/netj/5728205
var unicodePunctuationRe = "!-#%-*,-/:;?@\\[-\\]_{}\xa1\xa7\xab\xb6\xb7\xbb\xbf\u037e\u0387\u055a-\u055f\u0589\u058a\u05be\u05c0\u05c3\u05c6\u05f3\u05f4\u0609\u060a\u060c\u060d\u061b\u061e\u061f\u066a-\u066d\u06d4\u0700-\u070d\u07f7-\u07f9\u0830-\u083e\u085e\u0964\u0965\u0970\u0af0\u0df4\u0e4f\u0e5a\u0e5b\u0f04-\u0f12\u0f14\u0f3a-\u0f3d\u0f85\u0fd0-\u0fd4\u0fd9\u0fda\u104a-\u104f\u10fb\u1360-\u1368\u1400\u166d\u166e\u169b\u169c\u16eb-\u16ed\u1735\u1736\u17d4-\u17d6\u17d8-\u17da\u1800-\u180a\u1944\u1945\u1a1e\u1a1f\u1aa0-\u1aa6\u1aa8-\u1aad\u1b5a-\u1b60\u1bfc-\u1bff\u1c3b-\u1c3f\u1c7e\u1c7f\u1cc0-\u1cc7\u1cd3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205e\u207d\u207e\u208d\u208e\u2329\u232a\u2768-\u2775\u27c5\u27c6\u27e6-\u27ef\u2983-\u2998\u29d8-\u29db\u29fc\u29fd\u2cf9-\u2cfc\u2cfe\u2cff\u2d70\u2e00-\u2e2e\u2e30-\u2e3b\u3001-\u3003\u3008-\u3011\u3014-\u301f\u3030\u303d\u30a0\u30fb\ua4fe\ua4ff\ua60d-\ua60f\ua673\ua67e\ua6f2-\ua6f7\ua874-\ua877\ua8ce\ua8cf\ua8f8-\ua8fa\ua92e\ua92f\ua95f\ua9c1-\ua9cd\ua9de\ua9df\uaa5c-\uaa5f\uaade\uaadf\uaaf0\uaaf1\uabeb\ufd3e\ufd3f\ufe10-\ufe19\ufe30-\ufe52\ufe54-\ufe61\ufe63\ufe68\ufe6a\ufe6b\uff01-\uff03\uff05-\uff0a\uff0c-\uff0f\uff1a\uff1b\uff1f\uff20\uff3b-\uff3d\uff3f\uff5b\uff5d\uff5f-\uff65",
    maxLength = 50,
    words = []
    ;

var stopWords = /^(i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/,
    punctuation = new RegExp("[" + unicodePunctuationRe + "]", "g"),
    wordSeparators = /[ \f\n\r\t\v\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g,
    discard = /^(@|https?:|\/\/)/
    ;

/**
 *  Find all words in a text or array, score by occurance
 */
function wordsByOccurrence(text,rmStops,rmPunct) {
    var tags = {},
        cases = {};
    if ( !Array.isArray(text) )                 // if string
        text.split(wordSeparators);             // convert to array
    text.forEach(function(word) {
        if (discard.test(word)) return;         // remove links
        if (rmPunct) word = word.replace(punctuation, "");   // remove punctuation
        if (rmStops && stopWords.test(word.toLowerCase())) return;  // do|not include stop words
        word = word.substr(0, maxLength);       // remove very long words
        cases[word.toLowerCase()] = word;       // convert to lowercase
        tags[word = word.toLowerCase()] = (tags[word] || 0) + 1;    // count words
    });
    tags = d3.entries(tags).sort(function(a, b) { return b.value - a.value; });
    tags.forEach(function(d) { d.key = cases[d.key]; });

    return tags;
}




/**
 *  Limit a string by number of characters
 *  @param {String} str - input string
 *  @param {Integer} limit - character limit
 *  @return {String} str - original string, limited
 */
function charLimit(str, limit){
    var cut = str.indexOf(' ', limit);
    if (cut == -1) return str;
    return str.substring(0, cut);
}





/**
 *  Find all words in a text or array, score by occurance
 */
function parseText(text,wordLimit=-1,connectionLimit=3){

    // split ("tokenize") text into array
    var textArr = text.trim().split(wordSeparators);

    // save number for use elsewhere
    update_details(textArr.length);

    // limit number of words
    textArr = textArr.slice(0,wordLimit); // this is probably slower

    // sort words by occurrence, do not remove stop words
    var topWords = wordsByOccurrence(textArr,false,false);

    console.log("topWords.length = "+ topWords.length, ", wordLimit = ", wordLimit);
    //console.log( JSON.stringify(topWords) );


    // find the positions of each of these topWords
    for (var i=0; i<topWords.length; i++){
        //console.log(i +". "+ JSON.stringify(topWords[i]));

        // if key doesn't exist skip
        if (!prop(topWords[i].key)) return;

        // store word
        var word = topWords[i].key;

        // store occurances of this word in topWords[i]
        topWords[i].indices = getAllIndexes(textArr,word);
    }
    console.log("topWords",topWords);

    var table = [];
    var table_tracker = [];
    var table_str = '';

    // loop through top words again to find previous and next words
    for (var i=0; i<topWords.length; i++){
        console.log(topWords[i]);

        // limit by connections, turning off for now because not sure if this is a good feature
        //if ( topWords[i].indices.length < connectionLimit ) continue;

        // loop through indices of that word
        for (var j in topWords[i].indices){

            // if word index exists AND there are no periods
            if ( topWords[i].key && topWords[i].key.indexOf('.') === -1){

                // store info
                var word = topWords[i].key;
                var pos = topWords[i].indices[j];
                //console.log( textArr[pos] );

                // if previous exists AND there are no periods AND it is a string
                if ( prop(textArr[pos-1]) && textArr[pos-1].indexOf('.') === -1 && typeof textArr[pos-1] === "string" ){

                    // create a "tracking string" with both words and their positions
                    var track = textArr[pos-1] +"-"+ String(pos-1) +"_"+ word +"-" + pos;
                    //console.log(track);

                    // if tracking string doesn't exist in tracking array
                    if ( table_tracker.indexOf(track) === -1 ){
                        // add it
                        table_tracker.push( track );
                        // and push to main table
                        var arr = [ cleanString(textArr[pos-1]), cleanString(word) ];
                        table.push(arr);
                        table_str += "\n"+arr.toString();
                    }
                } else {
                    break; // ?
                }
                // if next exists AND there are no periods AND it is a string
                if ( prop(textArr[pos+1]) && textArr[pos+1].indexOf('.') === -1 && typeof textArr[pos+1] === "string" ){

                    // create a "tracking string" with both words and their positions
                    var track = word +"-" + pos +"_"+ textArr[pos+1] +"-"+ String(pos+1);
                    //console.log(track);

                    // if tracking string doesn't exist in tracking array
                    if ( table_tracker.indexOf(track) === -1 ){
                        // add it
                        table_tracker.push( track );
                        // and push to main table
                        var arr = [ cleanString(word), cleanString(textArr[pos+1]) ];
                        table.push(arr);
                        table_str += "\n"+arr.toString();
                    }
                } else {
                    break; // ?
                }
            }
        }
    }
    details.currentTableLength = table.length
    console.log("table = ", JSON.stringify(table));

    return table_str.trim();
}


/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}



function getAllIndexes(arr, val) {
    var indexes = [], i;
    for(i = 0; i < arr.length; i++)
        //console.log(arr[i], val);
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
}



function getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

function bigrams(arr) {
    var res = [],
        l = arr.length;
    for(var i=0; i<l; ++i)
        for(var j=i+1; j<l; ++j)
            res.push([arr[i], arr[j]]);
    return res;
}









