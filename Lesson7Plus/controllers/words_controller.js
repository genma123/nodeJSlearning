var MongoClient = require('mongodb').MongoClient;

var words = null;
MongoClient.connect("mongodb://localhost/", function(err, db) {
  words = db.db("words").collection("word_stats");
  // console.log("connecting and getting words");
});

exports.getWords = function(req, res) {
	var wo = undefined;
  if (words){
	  if (req.query.newWord) {
		  // console.log("new word: " + req.query.newWord);
		  var newWord = req.query.newWord;
		  req.query.newWord = '';
		  wo = buildWordObj(newWord);
		words.insert(wo, function(err, result) {
			console.log("inserted " + wo.word);
		  findWords(req, res);
		});
	  } else {
		  findWords(req, res);
	  }
  } else {
    res.json(503, {});
  }
};

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