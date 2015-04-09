require('./');

var app = angular.module('MapDemo', ['MapComponents']);

/*@ngInject*/
app.controller('MapDemoCtrl', function ($scope) {
  $scope.mapLocation = {
    zoom: 10,
    lat: 58.3,
    lng: -134.41
  };
});
