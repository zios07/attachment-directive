(function () {

  angular.module("attachment")
    .directive('omniAttachment', AttachmentDirective);

  AttachmentDirective.$inject = ["AttachmentService", "$timeout", "$http", "$uibModal"];

  function AttachmentDirective(AttachmentService, $timeout, $http, $uibModal) {

    var provider = {
      template: [
        "<div >" +
        "<script>$(document).on('click', '.browse-file', function(){\n" +
        "  var file = $(this).parent().parent().parent().find('.file');\n" +
        "  file.trigger('click');" +
        "});",
        "$(document).on('change', '.file', function(){console.log($(this))",
        "  $(this).parent().find('.form-control').val($(this).val().replace(/C:\\\\fakepath\\\\/i, ''));",
        "});</script>",
        "<div class='attachment-upload-container' ng-show='isWritingMode()'>",
        "<br>",
        "<div class='form-group upload-group'>",
        "    <input type='file' name='img[]' class='file' file-model='file'>",
        "    <div class='input-group col-xs-12'>",
        "      <span class='input-group-addon attachment-upload-component'><i class='glyphicon glyphicon-paperclip'></i></span>",
        "      <input type='text' class='form-control input-lg file-name-input attachment-upload-component' disabled placeholder='{{\"attachment.input.placeholder\" | translate}}'>",
        "      <span class='input-group-btn attachment-upload-component'>",
        "        <button class='browse browse-file btn btn-primary input-lg' type='button' ><i class='glyphicon glyphicon-search'></i> {{'attachment.button.browse' | translate}}</button>",
        "        <button class='browse btn btn-primary input-lg' type='button' ng-click='upload(file, name)' ng-disabled='error'>",
        "           <span class='glyphicon glyphicon-cloud-upload'></span> Upload",
        "        </button>",
        "      </span>",
        "    </div>",
        "  </div>",
        "<br><br>",
        "<div class='progress-container' ng-show='uploading'>",
        "<div class='progress-bar progress-bar-striped active attachment-progressbar' role='progressbar' aria-valuenow='{{progress}}' aria-valuemin='0' aria-valuemax='100' ng-style=\"{width: (progress+'%')}\">{{progress}}%</div>",
        "</div>",
        "</div>",
        "<br>",
        "<div class='attachment-success-message' ng-show='response' >",
        "<span class='alert alert-success' translate>{{response}}</span>",
        "</div>",
        "<div class='attachment-error-message' ng-show='denied'>",
        "<br>",
        "<span ng-if='denied' class='alert alert-danger' translate>{{denied}}</span>",
        "</div>",
        "<div class='attachment-error-message' ng-show='error'>",
        "<br>",
        "<span ng-if='error' class='alert alert-danger' translate>{{message}}</span>",
        "</div>",
        "<br><br>",
        "<div class='attachment-items-container' ng-show='!error'>",
        "<table class='table table-striped table-hover attachment-items'>",
        "<thead>",
        "<tr class='attachment-item-header'>",
        "<th translate='attachment.items.name'></th>",
        "<th translate='attachment.items.size'></th>",
        "<th translate='attachment.items.extension'></th>",
        "</tr>",
        "</thead>",
        "<tbody>",
        "<tr ng-repeat='attachment in attachments' class='attachment-item'>",
        "<td>{{attachment.name}}</td>",
        "<td>{{attachment.size}}</td>",
        "<td>{{attachment.fileExtension}}</td>",
        "<td>",
        "<a ng-click='getAttachment(attachment.id)' class='attachment-item-download'>",
        "<span class='glyphicon glyphicon-download-alt'></span>",
        "</a>",
        "<a ng-show='isWritingMode()' ng-click='deleteAttachment(attachment.id)' class='attachment-item-delete'>",
        "<span class='glyphicon glyphicon-remove'></span>",
        "</a>",
        "</td>",
        "</tr>",
        "<tr ng-show='!attachments' class='attachment-no-attachment-found'>",
        "<td colspan='8' translate='attachment.message.error.no-data'></td>",
        "</tr>",
        "</tbody>",
        "</table>",
        "</div>",
        "</div>"

      ].join('\n'),
      scope: {
        id: "=",
        applicationName: "=",
        className: "=",
        mode: "=",
        criteria: "=",

      },
      link: function (scope, element, attrs) {

        scope.attachments = {};
        scope.error = false;
        scope.uploading = false;

        var URL = "http://localhost:8090/attachments";

        scope.upload = function (file) {

          scope.file = file;
          AttachmentService.generateUUID();
          scope.uuid = AttachmentService.getUUID();

          scope.denied = "";
          if (angular.isDefined(scope.file)) {
            showUploadDialog();

            scope.$on('startUpload', function (event, details) {

              // remove listener
              scope.$$listeners.startUpload.splice(1);
              scope.description = details.description;
              scope.indexable = details.type.indexable;

              if (scope.file.size < 16512096) {
                var fd = new FormData();
                fd.append("file", scope.file);
                scope.uploading = true;
                scope.progress = 0;

                $http({
                  method: 'POST',
                  data: fd,
                  url: URL + "?attachableId=" + scope.id + "&className=" + scope.className + "&appName=" + scope.applicationName + "&description=" + scope.description + "&uuid=" + scope.uuid + "&indexable="+scope.indexable,
                  headers: {'Content-Type': undefined},
                  uploadEventHandlers: {
                    progress: function (e) {
                      scope.progress = Math.floor((e.loaded / e.total) * 100);
                    }
                  }
                }).then(function (response) {
                  scope.getAttachments();
                  $timeout(function () {
                    scope.uploading = false;
                    scope.response = "attachment.message.success.upload";
                  }, 700).then(function () {
                    $timeout(function () {
                      scope.response = null;
                    }, 2000)
                  })
                })
              } else {
                scope.deny("attachment.message.error.file.large-size");
              }
            })
          } else {
            scope.deny("attachment.message.error.file.no-file-selected");
          }
        }

        scope.getAttachments = function () {
          AttachmentService.getAttachments(scope.id, scope.className, scope.applicationName)
            .then(function (response) {
              if (response.status == 200) {
                // Keep attachments null if the response is empty to show the "No data found" <tr>
                if (response.data.length != 0) {
                  scope.attachments = response.data;
                  scope.formatSize(scope.attachments);
                } else {
                  scope.attachments = null;
                }
              }
            }, function (err) {
              scope.error = true;
              if (err.data != null) {
                scope.message = err.data.message;
                scope.code = err.data.code;
              } else {
                scope.message = "attachment.message.error.server";
              }
            })
        }

        scope.deleteAttachment = function (id) {

          var message = "attachment.dialog.delete.title";

          var modalHtml = '<div class="modal-header" style="font-size: large"><span translate>' + message + '</span></div>';
          modalHtml += '<div class="modal-footer" style="width=20px; padding-top: 0; padding-bottom: 5px"><button class="btn btn-danger" ng-click="ok()" translate>attachment.dialog.delete.ok</button><button class="btn btn-warning" ng-click="cancel()" translate>attachment.dialog.delete.cancel</button></div>';
          var modalInstance = $uibModal.open({
            template: modalHtml,
            controller: ModalInstanceCtrl
          });

          modalInstance.result.then(function () {
            reallyDelete(id);
          });

          var reallyDelete = function (id) {
            AttachmentService.deleteAttachment(id)
              .then(function () {
                scope.getAttachments();
                scope.response = "attachment.message.success.delete";
                $timeout(function () {
                  scope.response = null;
                }, 2500)
              }, function (err) {
                console.log(err);
                scope.error = true;
                if (err.data != null) {
                  scope.message = err.data.message;
                  scope.code = err.data.code;
                } else {
                  scope.message = "attachment.message.error.default";
                }
              })
          };
        }

        scope.getAttachment = function (id) {
          AttachmentService.getAttachment(id);
        }

        scope.truncate = function (num, places) {
          return Math.trunc(num * Math.pow(10, places)) / Math.pow(10, places);
        }

        scope.formatSize = function (attachments) {
          attachments.forEach(function (attachment, index) {
            if (attachment.size > 900 && attachment.size < 900000)
              attachment.size = scope.truncate((attachment.size / 1024), 2) + " Ko";
            else if (attachment.size > 900000)
              attachment.size = scope.truncate(((attachment.size) / 1000000), 2) + " Mb";
            else
              attachment.size = scope.truncate((attachment.size), 2) + " Octets";
          })
        }

        scope.setProgress = function (value) {
          scope.progress = value;
        }

        scope.isWritingMode = function () {
          if (scope.mode == "write")
            return true;
          else
            return false;
        }

        scope.deny = function (msg) {
          scope.denied = msg;
          $timeout(function () {
            scope.denied = "";
          }, 2500);
        }

        var ModalInstanceCtrl = function ($scope, $uibModalInstance) {
          $scope.ok = function () {
            // scope.name = $scope.name;
            $uibModalInstance.close();
          };

          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };
        }

        var ModalInstanceCtrl2 = function ($scope, $uibModalInstance, $rootScope, $http) {
          $scope.attachmentDetails = {};

          $http.get(URL + '/type').then(function(response){
            $scope.types = response.data;
          }, function(err){
            console.log(err);
          })

          $scope.ok = function () {
            if (angular.isDefined($scope.attachmentDetails.description)) {
              if(angular.isDefined($scope.attachmentDetails.type)){
                $rootScope.$broadcast('startUpload', $scope.attachmentDetails);
                $uibModalInstance.close();
              } else {
                $scope.error = "attachment.message.error.file.no-type";
              }
            } else {
              $scope.error = "attachment.message.error.file.no-name";
            }
          };

          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };
        }

        function showUploadDialog() {
          var message = "attachment.message.details";

          var modalHtml = '<div class="modal-header" style="font-size: large"><h3 translate>' + message + '</h3></div>';
          modalHtml += '<div class="modal-body" style="font-size: large">';
          modalHtml += '<span translate>attachment.description.label</span><span style="color: red" ng-hide="attachmentDetails.description">*</span><br><input type="text" ng-model="attachmentDetails.description" class="form-control" placeholder="{{\'attachment.description.placeholder\' | translate}}" /><br>';
          modalHtml += '<span translate>attachment.type.label</span><span style="color: red" ng-hide="attachmentDetails.type">*</span><br>';
          modalHtml += '<select class="form-control" ng-model="attachmentDetails.type" ng-options="type.label for type in types"></select><br>';
          modalHtml += '<span ng-if=\'error\' class=\'alert alert-danger attachment-error-message .text-center\' translate>{{error}}</span></div></div>';
          modalHtml += '<div class="modal-footer" style="width=20px; padding-top: 0; padding-bottom: 5px"><button class="btn btn-primary" ng-click="ok()" translate>Upload</button><button class="btn btn-defualt" ng-click="cancel()" translate>Annuler</button></div>';
          var modalInstance = $uibModal.open({
            template: modalHtml,
            controller: ModalInstanceCtrl2
          });

          modalInstance.result.then(function () {
          });
        }

        scope.getAttachments();
      }
    }
    return provider;
  }

  // File upload directive

  angular.module("attachment").directive("fileModel", FileUpload);

  function FileUpload($parse) {

    return {
      restrict: 'A',
      link: function (scope, element, attrs) {

        var model = $parse(attrs.fileModel);
        var modelSetter = model.assign;
        element.on("change", function () {
          scope.$apply(function () {
            modelSetter(scope, element[0].files[0]);
          })
        })
      }
    }
  }

})();
