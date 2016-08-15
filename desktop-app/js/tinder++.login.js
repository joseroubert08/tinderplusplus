(function() {
  gui = require('nw.gui');
  module = angular.module('tinder++.login', ['tinder++.api']);

  module.controller('LoginController', function LoginController($scope, $http, API) {
    $scope.loginUrl = 'https://www.facebook.com/v2.6/dialog/oauth?redirect_uri=fb464891386855067%3A%2F%2Fauthorize%2F&state=%7B%22challenge%22%3A%22q1WMwhvSfbWHvd8xz5PT6lk6eoA%253D%22%2C%220_auth_logger_id%22%3A%2254783C22-558A-4E54-A1EE-BB9E357CC11F%22%2C%22com.facebook.sdk_client_state%22%3Atrue%2C%223_method%22%3A%22sfvc_auth%22%7D&scope=user_birthday%2Cuser_photos%2Cuser_education_history%2Cemail%2Cuser_relationship_details%2Cuser_friends%2Cuser_work_history%2Cuser_likes&response_type=token%2Csigned_request&default_audience=friends&return_scopes=true&auth_type=rerequest&client_id=464891386855067&ret=login&sdk=ios&logger_id=54783C22-558A-4E54-A1EE-BB9E357CC11F#_=';
    $scope.fbAuthData = {};

    $scope.startLogin = function() {
      window.loginWindow = gui.Window.open($scope.loginUrl, {
        title: 'Login to Facebook',
        position: 'center',
        width: 400,
        height: 480,
        focus: true
      });
      var interval = window.setInterval(function() {
        if (window.loginWindow) {
          checkForToken(window.loginWindow.window, interval);
        }
      }, 500);
      window.loginWindow.on('closed', function() {
        window.clearInterval(interval);
        window.loginWindow = null;
      });
      ga_storage._trackEvent('Login', 'Login Started');
      window._rg.record('login', 'started', { origin: 'tinderplusplus' });
    };

    var tinderLogin = function() {
      API.login($scope.fbAuthData['fb_id'], $scope.fbAuthData['access_token']);
    };

    var checkForToken = function(loginWindow, interval) {
      if (loginWindow.closed) {
        window.clearInterval(interval);
      } else {
        var url = loginWindow.document.URL;
        if (url === 'https://m.facebook.com/v2.6/dialog/oauth/confirm') {
          var resp = unescape(loginWindow.document.getElementsByTagName('script')[0].innerHTML);
          var pattern = /access_token=(.*)&/;
          var token = resp.match(pattern)[1];
          $scope.fbAuthData['access_token'] = token;

          loginWindow.close();
          window.clearInterval(interval);
          getFBUserId($scope.fbAuthData['access_token']);
        }
      }
    };

    var getFBUserId = function(token) {
      var graphUrl = 'https://graph.facebook.com/me?access_token=' + token;
      $http.get(graphUrl)
          .success(function(data) {
            console.log(data);
            $scope.fbAuthData['fb_id'] = data.id;
            tinderLogin();
          })
          .error(function(data) {
            console.log(data);
          });
    }
  });
})();
