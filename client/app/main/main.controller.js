'use strict';

var generateData = function(commentary) {

    var data = {
        labels: [],
        datasets: [
            {
                fillColor: '#F7464B',
                strokeColor: '#F7464A',
                pointColor: '#F7464A',
                pointStrokeColor: '#fff',
                pointHighlightFill: '#fff',
                pointHighlightStroke: 'rgba(220,220,220,1)',
                data: []
            }
        ]
    };
    for (var i = 0; i < commentary.length; ++i) {
        var ball = parseFloat(commentary[i].ball);
        if (commentary.length <= 50 ||
            (ball - 0.1) % 1 === 0) {
            data.labels.push(Math.floor(commentary[i].index/6) + 1);
        } else {
            data.labels.push('');
        }

        data.datasets[0].data.push(commentary[i].score);
    }
    console.log('labels: ', data.labels);
    return data;
};

angular.module('highlightsApp')
    .controller('MainCtrl', function ($scope, $http) {
        $scope.results = [];
        $scope.processing = false;
        $scope.loadingTestData = false;

        var initCommentary = [{
            commentary: [
                {
                    ball: '0.1',
                    text: 'And so it begins.'
                },
                {
                    ball: '0.2',
                    text: 'This is another one.'
                }
            ]
        }];

        $scope.aceModel = JSON.stringify(initCommentary, undefined, 4);
        $scope.classify = function() {
            $scope.processing = true;
            $http.post('/api/classify', $scope.aceModel)
                .success(function(data, status, headers, config) {

                    //var sorted = _.sortBy(data.commentary, 'score');

                    //sorted = sorted.reverse();

                    var sorted = data.commentary;

                    sorted = _.sortBy(sorted, function(item) {
                        return parseFloat(item.ball);
                    });

                    $scope.results.unshift(sorted);
                    $scope.processing = false;
                    $scope.results[0].chartData = generateData(sorted);
                    $scope.results[0].highlights = _.filter(sorted, 'isHighlight');
                    $scope.results[0].score = data.average_score;
                })
                .error(function(data, status, headers, config) {
                    console.log('Error: ', data);
                    $scope.processing = false;
                });
        };

        $scope.chartOptions = {
            animation: false,
            maintainAspectRatio: false,
            showTooltips: false,
            scaleShowLabels: true
        };

        $scope.loadTestData = function(data) {
            $scope.loadingTestData = true;
            $http.get('/public/highlights/ipl-2014/' + data.filename)
                .success(function(data) {
                    console.log('Got test data');
                    $scope.aceModel = JSON.stringify(data, undefined, 4);
                    $scope.loadingTestData = false;
                }).error(function(data) {
                    console.log('error: ', data);
                    $scope.loadingTestData = false;
                });
        };

        $scope.testData = [];
        for (var i = 1; i <= 60; ++i) {
            for (var j = 1; j <= 2; ++j) {
                var name = i + '-' + j;
                $scope.testData.push({
                    name: name,
                    filename: name + '.json'
                });
            }
        }

    })
    .filter('prettify', function() {
        return function(input) {
            delete input.$$hashKey;
            return JSON.stringify(input, undefined, 4);
        };
    })
    .filter('stripDollar', function() {
        return function(input) {
            return input.replace(/\$/g, '');
        };
    });
