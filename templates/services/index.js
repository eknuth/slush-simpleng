var services = angular.module('Component.services', []);

<% _.each( existingServices, function( service ){ %>
services.factory('<%= service.replace("_service", "") %>', require('./<%= service %>'));
<% }); %>
