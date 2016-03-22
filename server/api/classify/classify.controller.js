'use strict';

var _ = require('lodash');
var spawn = require('child_process').spawn;
var os = require('os');
var path = require('path');

exports.index = function(req, res) {
    var classify = spawn('python3', ['classify.py', '-o', '-', '-t', '-'], {
        cwd: path.join(__dirname,'../../../../cricinfo-automatic-highlighter')
    });
    classify.stdout.setEncoding('utf-8');
    classify.stderr.setEncoding('utf-8');
    var allData = '';
    classify.stdin.end(JSON.stringify(req.body));
    classify.stdout.on('data', function(data) {
        allData += data;
        console.log("data: ", data);
    });
    classify.stderr.on('data', function(data) {
        console.log('error:', data);
    });
    classify.on('close', function(code) {
        if (code == 0) {
            res.send(allData);
        } else {
            console.log('Process exited with error code: ', code);
            res.send(500);
        }
    });
};

exports.classifyTweets = function(req, res) {
    var classify = spawn('python', ['classify.py', 'classifier.pickle', '-', '-'], {
        cwd: path.join(__dirname, '../../../../sentiment-analysis-engine')
    });

    classify.stdout.setEncoding('utf-8');
    classify.stdin.setEncoding('utf-8');
    var allData = '';
    classify.stdin.end(JSON.stringify(req.body));
    classify.stdout.on('data', function(data) {
        allData += data;
        console.log("data: ", data);
    });
    classify.stderr.on('data', function(data) {
        console.log('error:', data);
    });
    classify.on('close', function(code) {
        if (code === 0) {
            res.send(allData);
        } else {
            console.log('Process exited with error code: ', code);
            res.send(500);
        }
    });
};
