'use strict';

angular.module('highlightsApp')
    .controller('NavbarCtrl', function ($scope, $location) {
        $scope.menu = [
            {
                'title': 'Highlight Extraction',
                'link': '/'
            },
            {
                'title': 'Tweet Analysis',
                'link': '/tweet'
            }
        ];

        $scope.isCollapsed = true;

        $scope.isActive = function(route) {
            return route === $location.path();
        };
    });
