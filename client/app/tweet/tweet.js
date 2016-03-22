'use strict';

angular.module('highlightsApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('tweet', {
        url: '/tweet',
        templateUrl: 'app/tweet/tweet.html',
        controller: 'TweetCtrl'
      });
  });