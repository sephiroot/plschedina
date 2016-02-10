var plSchedina = angular.module('plSchedina', ['ngRoute']).run(function ($rootScope) {
    $rootScope.user = {};
    $rootScope.user.mail = "";
    $rootScope.user.pwd = "";
    $rootScope.user.logged = false;

    $rootScope.login = function () {
        $rootScope.user.logged = true;
        console.log($rootScope.user.logged);
    }
});

plSchedina.controller('listCtrl', ['$scope', '$rootScope', 'services', function ($scope, $rootScope, services) {
    $scope.currentDay = 3;  // giornata corrente di campionato
    $scope.shownDay = 0; // giorno correntemente selezionato
    $scope.daysList = ['1', '2', '3', '4'];
    $scope.days = [];
    $scope.mieSchedine = [];
    $scope.mieSchedine[$scope.currentDay] = {};
    $scope.mieSchedine[$scope.currentDay].saved = false;
    $scope.mieSchedine[$scope.currentDay].partite = [];

    /* partite delle giornate di campionato */
    services.otherDay($scope.currentDay).then(function (data) {
        $scope.days = data.data;
        $scope.shownDay = $scope.currentDay;
        $scope.mieSchedine[$scope.currentDay].partite = data.data;
        $scope.mieSchedine[$scope.shownDay].showNoSave = false;
    });

    /* change day from navigator */
    $scope.getOtherDay = function (chosenDay) {
        if (chosenDay != $scope.shownDay) {
            console.log("getOtherDay " + chosenDay);
            if (!$scope.mieSchedine[chosenDay]) {
                $scope.mieSchedine[$scope.shownDay].showNoSave = false;
                $scope.mieSchedine[chosenDay].showNoSave = false;
                services.otherDay(chosenDay).then(function (data) {
                    $scope.mieSchedine[chosenDay] = {};
                    $scope.mieSchedine[chosenDay].partite = [];
                    $scope.mieSchedine[chosenDay].partite = data.data;
                    $scope.days = $scope.mieSchedine[chosenDay].partite;
                    console.log($scope.shownDay + " -- " + $scope.currentDay);
                });
            } else {
                $scope.mieSchedine[chosenDay].showNoSave = false;
            }
            $scope.shownDay = chosenDay;
        }
    };

    $scope.checkMatchResult = function (partita) {
        if (partita.OWNER_SCORE > partita.GUEST_SCORE) {
            return partita.RESULT == 1;
        } else if (partita.OWNER_SCORE == partita.GUEST_SCORE) {
            return partita.RESULT == 'X';
        } else {
            return partita.RESULT == 2;
        }
    };

    /* reimposta la schedina della giornata corrente */
    $scope.resetSchedina = function () {
        $scope.mieSchedine[$scope.currentDay].showNoSave = false;
        for (i = 0; i < $scope.days.length; i++) {
            $scope.mieSchedine[$scope.currentDay].partite[i].RESULT = null;
        }
    };

    $scope.checkSalvataggio = function () {
        for (i = 0; i < $scope.days.length; i++) {
            console.log($scope.mieSchedine[$scope.currentDay].partite[i]);
            if ($scope.mieSchedine[$scope.currentDay].partite[i].RESULT == null
                || $scope.mieSchedine[$scope.currentDay].partite[i].RESULT == -1) {
                $scope.mieSchedine[$scope.shownDay].showNoSave = true;
                $scope.mieSchedine[$scope.currentDay].saved = false;
                return false;
            }
        }
        return true;
    };

    $scope.setResult = function (data, value) {
        if (data.RESULT === value) {
            console.log("annullo valore");
            data.RESULT = null;
        } else {
            data.RESULT = value;
        }
        console.log(data.RESULT);
    };

    /* salva la schedhina della giornata corrente */
    $scope.salvaSchedina = function () {
        if ($scope.checkSalvataggio()) {
            $scope.mieSchedine[$scope.currentDay].saved = true;
            $scope.mieSchedine[$scope.currentDay].showNoSave = false;
            return true;
        }
    };

    $scope.readOnly = function (giornata) {
        if ($scope.shownDay == $scope.currentDay) {
            return giornata.saved;
        }
        return true;
    }
}])
;

plSchedina.controller('editCtrl', function ($scope, $rootScope, $location, $routeParams, services, customer) {
    var customerID = ($routeParams.customerID) ? parseInt($routeParams.customerID) : 0;
    $rootScope.title = (customerID > 0) ? 'Edit Customer' : 'Add Customer';
    $scope.buttonText = (customerID > 0) ? 'Update Customer' : 'Add New Customer';
    var original = customer.data;
    original._id = customerID;
    $scope.customer = angular.copy(original);
    $scope.customer._id = customerID;

    $scope.isClean = function () {
        return angular.equals(original, $scope.customer);
    }

    $scope.deleteCustomer = function (customer) {
        $location.path('/');
        if (confirm("Are you sure to delete customer number: " + $scope.customer._id) == true)
            services.deleteCustomer(customer.customerNumber);
    };

    $scope.saveCustomer = function (customer) {
        $location.path('/');
        if (customerID <= 0) {
            services.insertCustomer(customer);
        }
        else {
            services.updateCustomer(customerID, customer);
        }
    };
});

plSchedina.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/', {
                title: 'Schedine',
                templateUrl: 'partials/schedine.html',
                controller: 'listCtrl'
            })
            .when('/edit-customer/:customerID', {
                title: 'Edit Customers',
                templateUrl: 'partials/edit-customer.html',
                controller: 'editCtrl',
                resolve: {
                    customer: function (services, $route) {
                        var customerID = $route.current.params.customerID;
                        return services.getCustomer(customerID);
                    }
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    }]);
plSchedina.run(['$location', '$rootScope', function ($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);