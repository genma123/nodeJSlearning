// The original version of this comes from "Node.js, MongoDB, and AngularJS Web Development", an video book by Brad Dayley.
// The orignial version of this can be found here:
// http://www.informit.com/content/images/9780133929201/downloads/NodeMongoAngular_final_code.zip .
var MongoClient = require('mongodb').MongoClient;

var words = null;
MongoClient.connect((process.env.MONGOLAB_URI || "mongodb://localhost/"), function(err, db) {
  words = db.db("words").collection("word_stats");
  // console.log("connecting and getting words");
});

// This has been modified to allow the option of addinga word.
// If the "newWord" parameter is present, then the user is adding a word.
// Either way, they will get a response in the same format.
exports.getWords = function(req, res) {
	var wo = undefined;
  if (words){
	  if (req.query.newWord) {
		  // console.log("new word: " + req.query.newWord);
		  var newWord = req.query.newWord;
		  req.query.newWord = '';
		  wo = buildWordObj(newWord);
		  // Having built the word object, it can be inserted into the collection.
		  // Then the response is built as usual, by supplying findWords as
		  // the callback
		words.insert(wo, function(err, result) {
			console.log("inserted " + wo.word);
		  findWords(req, res); // findWords was refactored out
								// to a separate function
		});
	  } else if (req.query.toDelete) {
		  var toDelete = req.query.toDelete;
		  words.remove({word:toDelete}, function(err, result) {
			console.log("deleted " + toDelete);
		  findWords(req, res);
		 });
	  } else {
		  findWords(req, res); // see previous comment.
	  }
  } else {
    res.json(503, {});
  }
};

// This function is copied and pasted from Lesson 2 in which the data is originally
// populated.
function buildWordObj(word) {
	var vowelArr = "aeiou";
	var consonantArr = "bcdfghjklmnpqrstvwxyz";
	
    var letters = [];
    var vowels = [];
    var consonants = [];
    var other = [];
	
    var vowelCnt = ("|"+word+"|").split(/[aeiou]/i).length-1;
    var consonantCnt =
      ("|"+word+"|").split(/[bcdfghjklmnpqrstvwxyz]/i).length-1;

    for (var j=0; j<word.length; j++){
      var ch = word[j];
      if (letters.indexOf(ch) === -1){
        letters.push(ch);
      }
      if (vowelArr.indexOf(ch) !== -1){
        if(vowels.indexOf(ch) === -1){
          vowels.push(ch);
        }
      }else if (consonantArr.indexOf(ch) !== -1){
        if(consonants.indexOf(ch) === -1){
          consonants.push(ch);
        }
      }else{
        if(other.indexOf(ch) === -1){
          other.push(ch);
        }
      }
    }
    var wordObj = {
      word: word,
      first: word[0],
      last: word[word.length-1],
      size: word.length,
      letters: letters,
      stats: { vowels: vowelCnt, consonants: consonantCnt }
    };
    if(other.length){
      wordObj.otherChars = other;
    }

	return wordObj;
}

// This was the entire getWords functionality apart from handling
// the error response, now it has been refactored out.
var findWords = function(req, res) {
	// console.log("in findWords");
	words.find({ word: new RegExp(req.query.contains, 'i')},
			   { limit: req.query.limit,
				 skip: req.query.skip,
				 //+ add sort to query
				 sort: getSortObj(req)},
	  function(err, cursor){
		cursor.toArray(function(err, wordsArr){
		  res.json(wordsArr);
		});
	});
};

//+^ map request sort fields to document fields
function getSortObj(req){
  var field = "word";
  if(req.query.sort === 'Vowels'){
    field = 'stats.vowels';
  } else if(req.query.sort === 'Consonants'){
    field = 'stats.consonants';
  } else if(req.query.sort === 'Length'){
    field = 'size';
  }else{
    field = req.query.sort.toLowerCase();
  }
  return [[field, req.query.direction]];
}