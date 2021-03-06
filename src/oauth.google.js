angular.module('oauth.google', ['oauth.utils'])
  .factory('$google', google);

function google($q, $http, $cordovaOauthUtility) {
  return { signin: oauthGoogle };

  /*
   * Sign into the Google service
   *
   * @param    string clientId
   * @param    array appScope
   * @param    object options
   * @return   promise
   */
  function oauthGoogle(clientId, appScope, options) {
    var deferred = $q.defer();
    if(window.cordova) {
      if($cordovaOauthUtility.isInAppBrowserInstalled()) {
        var redirect_uri = "http://localhost/callback";
        if(options !== undefined) {
          if(options.hasOwnProperty("redirect_uri")) {
            redirect_uri = options.redirect_uri;
          }
        }
        var browserRef = window.open('https://accounts.google.com/o/oauth2/auth?client_id=' + clientId + '&redirect_uri=' + redirect_uri + '&scope=' + appScope.join(" ") + '&response_type=token', '_blank', 'location=yes,clearsessioncache=yes,clearcache=yes');
        browserRef.addEventListener("loadstart", function(event) {
          if((event.url).indexOf(redirect_uri + '/done') === 0) {
            browserRef.removeEventListener("exit",function(event){});
            browserRef.close();
            var callbackResponse = (event.url).split("#")[0].split("?")[1];
            var responseParameters = (callbackResponse).split("&");
            var parameterMap = [];
            for(var i = 0; i < responseParameters.length; i++) {
              parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
            }
            if(parameterMap.api_key !== undefined && parameterMap.api_key !== null && parameterMap.profile !== undefined && parameterMap.profile !== null) {
              deferred.resolve({ api_key: parameterMap.api_key, profile: JSON.parse(decodeURIComponent(parameterMap.profile)) });
            } else {
              deferred.reject("Problem authenticating");
            }
          }
        });
        browserRef.addEventListener('exit', function(event) {
          deferred.reject("The sign in flow was canceled");
        });
      } else {
        deferred.reject("Could not find InAppBrowser plugin");
      }
    } else {
      deferred.reject("Cannot authenticate via a web browser");
    }
    return deferred.promise;
  }
}

google.$inject = ['$q', '$http', '$cordovaOauthUtility'];
