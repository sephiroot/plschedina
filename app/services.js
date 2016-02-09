/**
 * Created by Ilario on 09/02/2016.
 */
angular.module("plSchedina").factory("services", ['$http', function ($http) {
    var serviceBase = 'services/';
    var obj = {};
    obj.days = function () {
        console.log("called");
        console.log($http.get(serviceBase + 'day'));
        return $http.get(serviceBase + 'day');
    };
    obj.otherDay = function (day) {
        console.log("called day " + day);
        return $http.get(serviceBase + 'day?day=' + day);
    };

    obj.insertCustomer = function (customer) {
        return $http.post(serviceBase + 'insertCustomer', customer).then(function (results) {
            return results;
        });
    };

    obj.updateCustomer = function (id, customer) {
        return $http.post(serviceBase + 'updateCustomer', {id: id, customer: customer}).then(function (status) {
            return status.data;
        });
    };

    obj.deleteCustomer = function (id) {
        return $http.delete(serviceBase + 'deleteCustomer?id=' + id).then(function (status) {
            return status.data;
        });
    };

    return obj;
}]);