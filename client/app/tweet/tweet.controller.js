'use strict';

var aggregateSentiment = function(tweets, numBuckets, threshold, filter) {
    threshold = threshold || 1;
    if (filter) {
        tweets = _.filter(tweets, function(tweet) {
            return tweet.tags.indexOf(filter) > -1;
        });
    }
    if (!tweets || tweets.length === 0) {
        console.log('no tweets');
        return null;
    }
    tweets = _.sortBy(tweets, 'timestamp');
    var firstTweet = tweets[0];
    var lastTweet = tweets[tweets.length - 1];
    var bucketTime = Math.ceil((lastTweet.timestamp - firstTweet.timestamp) / numBuckets);
    var aggregate = Array.apply(null, new Array(numBuckets)).map(Number.prototype.valueOf, 0);
    var labels = [];
    var i;
    var tags = [];
    for (i = 0; i < tweets.length; ++i) {
        var idx = Math.floor((tweets[i].timestamp - firstTweet.timestamp) / bucketTime);
        aggregate[idx] += tweets[i].sentiment;
        Array.prototype.push.apply(tags, tweets[i].tags);
    }
    var improvedAggregate = [];
    for (i = 0; i < aggregate.length; ++i) {
        if (aggregate[i] < 0 || aggregate[i] >= threshold) {
            improvedAggregate.push(aggregate[i]);
            var time = firstTweet.timestamp + i * bucketTime;
            labels.push(moment.unix(time).format('DD MMM, hh:mm A'));
        }
    }
    return [improvedAggregate, labels, _.uniq(tags)];
};

var chartData = function(tweets, filter) {

    console.log('chart data called');
    var aggregate = aggregateSentiment(tweets, 50, 2, filter);
    if (!aggregate || aggregate.length === 0) {
        console.log('no aggregate');
        return null;
    }
    var labels = aggregate[1];
    var tags = aggregate[2];
    aggregate = aggregate[0];

    console.log('Tags: ', tags);

    var betterLabels = [], skip = Math.ceil(labels.length / 25);
    for (var i = 0; i < labels.length; ++i) {
        if (i % skip === 0) {
            betterLabels.push(labels[i]);
        } else {
            betterLabels.push('');
        }
    }

    console.log('Aggregate: ', aggregate);

    if (aggregate.length === 0) {
        return null;
    }

    var data = {
        labels: betterLabels,
        datasets: [{
            fillColor: '#FF5A5E',
            strokeColor: '#F7464A',
            pointColor: '#F7464A',
            pointStrokeColor: '#fff',
            pointHighlightFill: '#fff',
            pointHighlightStroke: 'rgba(220,220,220,1)',
            data: aggregate
        }]
    };
    return [data, tags];
};

var reduceData = function(tweets) {
    return _.map(tweets, function(tweet) {
        return {
            timestamp: tweet.timestamp,
            sentiment: tweet.sentiment,
            tags: tweet.teams.concat(tweet.players)
        };
    });
};

angular.module('highlightsApp')
    .controller('TweetCtrl', function ($scope, $http, $timeout) {

        $scope.loadingTestData = false;
        $scope.processing = false;
        $scope.results = [];
        $scope.chartData = [];

        $scope.chartOptions = {
            animation: false,
            maintainAspectRatio: false,
            showTooltips: false
        };

        $scope.loadTestData = function(data) {
            $scope.loadingTestData = true;
            $http.get('/public/tweets/' + data.filename)
                .success(function(data) {
                    console.log('data loaded');
                    data = reduceData(data);
                    $timeout(function() {
                        console.log('starting processing');
                        $scope.results.unshift({data: data});
                        var dat = chartData(data);
                        $scope.results[0].tags = dat && dat[1];
                        $scope.results[0].chartData = dat && dat[0];
                        $scope.loadingTestData = false;
                        $scope.results[0].shortData = data.length <= 100;
                    }, 10);
                })
                .error(function(data) {
                    console.log('Error: ', data);
                    $scope.loadingTestData = false;
                });
        };

        $scope.testData = [{
            name: 'Test Set 1',
            filename: 'result.json'
        }];

        $scope.filterGraph = function(result, filter) {
            console.log('filter graph called');
            var dat = chartData(result.data, filter);
            result.chartData = dat && dat[0];
            console.log('filtering complete');
        };

        $scope.classify = function() {
            $scope.processing = true;
            $http.post('/api/classify/tweets', $scope.aceModel)
                .success(function(data, status, headers, config) {

                    data = reduceData(data);
                    console.log('starting processing');
                    $scope.results.unshift({data: data});
                    var dat = chartData(data);
                    $scope.results[0].tags = dat[1];
                    $scope.results[0].chartData = dat[0];
                    $scope.loadingTestData = false;
                    $scope.results[0].shortData = data.length <= 100;
                    $scope.processing = false;

                })
                .error(function(data, status, headers, config) {
                    console.log('Error: ', data);
                    $scope.processing = false;
                });
        };

        $http.get('/public/tweets/clean-short.json')
            .success(function(data) {
                $scope.aceModel = JSON.stringify(data, undefined, 4);
            })
            .error(function(data) {
                console.log('error: ', data);
            });

    });
