(function () {

  angular.module("attachment")
    .factory('AttachmentService', AttachmentService)

  AttachmentService.$inject = ["$http", "$window"];

  function AttachmentService($http, $window) {

    var URL = "http://localhost:8090/attachments";
    var uuid = "";

    var service = {
      getAttachment: getAttachment,
      getAttachments: getAttachments,
      deleteAttachment: deleteAttachment,
      generateUUID: generateUUID,
      getUUID : getUUID,
      setUUID : setUUID
    }

    return service;

    function getAttachment(id) {
      var auth_header = JSON.parse($window.sessionStorage.getItem('token'));
      if(angular.isDefined(auth_header)){
        var access_token = auth_header.access_token;
        window.location.href = URL + "/" + id + "?access_token=" + access_token;
      } else {
        window.location.href = URL + "/" + id;
      }
    }

    function getAttachments(attachableId, className, appName) {
      return $http.get(URL + "?attachableId=" + attachableId + "&className="
        + className + "&appName=" + appName);
    }

    function deleteAttachment(id) {
      return $http.delete(URL + "/" + id);
    }

    function generateUUID() {
      if(angular.isDefined(uuid) && uuid == ""){
        var d = new Date().getTime();
        if (window.performance && typeof window.performance.now === "function") {
          d += performance.now(); //use high-precision timer if available
        }
        uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = (d + Math.random() * 16) % 16 | 0;
          d = Math.floor(d / 16);
          return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        })
      }
    }

    function getUUID(){
      return uuid;
    }

    function setUUID(id){
      uuid = id;
    }
  }

}());
