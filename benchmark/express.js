var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/savescore', function (req, res) {
    var score = Number(req.query.finalscore);
    var browser = req.query.browser;
    writeScoreToFile(score, browser, function (passed) {
	if (passed) {
	    res.redirect('http://localhost:9876/base/benchmark/pass.html?score=' + score);
	} else {
	    res.redirect('http://localhost:9876/base/benchmark/fail.html?score=' + score);
	}
    });
//    writeScoreToMongo(score, browser, function(scoreCount) {
//	if (score > 1000) {
//	    res.redirect('http://localhost:9876/base/benchmark/pass.html?score=' + score);
//	} else {
//	    res.redirect('http://localhost:9876/base/benchmark/fail.html?score=' + score);
//	}
//    });
    
});

app.listen(3000, function () {
  console.log('Benchmark database writer listening on port 3000!');
});

function scorePasses( score, prevScores ) {
    var mean = getMean(prevScores);
    var stdDev = getStdDev(prevScores);
    var currentDiff = mean - score;
    if (currentDiff > stdDev) {
	return false;
    } else {
	prevScores.push(score);
	prevScores.shift();
	return true;
    }
}

function getMean( numArray ) {
    if (!Array.isArray(numArray)) {
	return 0;
    }
    var numValues = numArray.length;
    if (numValues == 0) {
	return 0;
    }
    var sum = 0;
    for (var index = 0; index < numValues; ++index) {
	sum += numArray[index];
    }
    return sum / numValues;
}

function getStdDev( numArray ) {
    if (!Array.isArray(numArray)) {
	return 0;
    }
    var numValues = numArray.length;
    if (numValues == 0) {
	return 0;
    }
    var mean = getMean(numArray);
    var totalDev = 0;
    for (var index = 0; index < numValues; ++index) {
	var diff = numArray[index] - mean;
	totalDev += (diff * diff);
    }
    var variance = totalDev / numValues;
    return Math.sqrt(variance);
}

function writeScoreToFile( score, browser, cb) {
    var fs = require("fs");
    if (!fs.existsSync("benchmark/json")) {
	fs.mkdirSync("benchmark/json");
    }
    var fileName = "benchmark/json/Scores_" + browser + ".json";
    var fileData = "{\n\t\"scores\": []\n}";
    if (fs.existsSync(fileName)) {
	fileData = fs.readFileSync(fileName);
    }
    var JSONdata = JSON.parse(fileData);
    var scoreData = JSONdata.scores;
    var numScores = scoreData.length;
    if (numScores < 10) {
	scoreData.push(score);
	fs.writeFileSync(fileName, JSON.stringify(JSONdata, null, 4));
	cb(true);
	return;
    }
    if (scorePasses(score, scoreData)) {
	cb(true);
    } else {
	if (!fs.existsSync("benchmark/failed")) {
	    fs.mkdirSync("benchmark/failed");
	}
	fileName = "benchmark/json/FailedScores.json";
	fileData = "{ \"failedScores\": [] }"
	if (fs.existsSync(fileName)) {
	    fileData = fs.readFileSync(fileName);
	}
	JSONdata = JSON.parse(fileData);
	JSONdata.failedScores.push({"browser": browser, "date": new Date(), "score": score});
	cb(false);
    }
    fs.writeFileSync(fileName, JSON.stringify(JSONdata, null, 4));
}

//function writeScoreToMongo( score, browser, cb ) {
//    
//    var MongoClient = require('mongodb').MongoClient;
//    var Server = require('mongodb').Server;
//    var Db = require('mongodb').Db;
//
//    console.log("Adding score of " + score + " to DB");
//    MongoClient.connect("mongodb://localhost:27017", function(err, db) {
//	db.createCollection('scores', function(err, scoreCollection) {
//	    scoreCollection.count(function(err, scoreCount) {
//		console.log(scoreCount + " scores already in DB");
//		cb(scoreCount);
//	    });
//	    var scoreEntry = {'score': score, 'date': new Date(), 'browser': browser};
//	    scoreCollection.insert(scoreEntry);
//	});
//    });
//}
