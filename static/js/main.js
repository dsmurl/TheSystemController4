'use strict';


angular.module('app', ['ngRoute', 'ngWebsocket', 'appServices'])
    .run(['$websocket', '$rootScope', function ($websocket, $rootScope) {
        var ws = $websocket.$new('ws://' + window.location.hostname + ':9000');

        ws.$on('$open', function () {
            console.log('WS Opened');
            ws.$emit('add', {
                    a: 5,
                    b: 4
                });
        });

        ws.$on('$message', function (data) {
            $rootScope.$broadcast(data.event, data.result);
        });

        ws.$on('$close', function () {
            console.log('WS Closed');
        });
    }])
    .run(function() {
        // Add in the mobile menu closing code
        // todo make this use angular variables avoid using jquery
         var navMenu= $("#navbar-collapse");
         navMenu.on("click", "a", null, function () {
             navMenu.collapse('hide');
         });
    })
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'html/home.html',   controller: function ($scope) {

                }
            })
            .when('/sensors', {
                templateUrl: 'html/sensors.html',   controller: ['$scope', 'Rpc', function ($scope, Rpc) {

                    $scope.sensor_values = {};

                    Rpc.listSensor()
                        .success(function (r) {
                            $scope.sensors = r.result;
                        });

                    $scope.deleteSensor = function ( index ) {
                        var sensorId = $scope.sensors[ index ].id;
                        Rpc.deleteSensor(sensorId)
                            .success(function (r) {
                                if (r.result) {
                                    $scope.sensors.splice(index, 1);
                                }
                            });
                    };

                    $scope.$on('sensors', function (event, values) {
                        $scope.$apply(function () {
                            $scope.sensor_values = values;
                        });
                    });

                    $scope.sensorRead = function ( index ) {
                        var sensorId = $scope.sensors[ index ].id;
                        console.log("Reading sensor " + sensorId);

                        Rpc.readSensor( sensorId )
                            .success(function (r) {
                                console.log("Success and read Sensor " + sensorId + " = ", r);
				                console.log("sensors", $scope.sensors);

                                $scope.sensors[ index ].value =  r.result;
                            });
                    };
                }]
            })
            .when('/sensor/:id', {
                templateUrl: 'html/sensor-edit.html',
                controller: ['$scope', '$routeParams', 'Rpc', '$location',
                    function ($scope, $routeParams, Rpc, $location) {
                    var sensorId = parseInt($routeParams.id);

                    Rpc.getSensor(sensorId)
                        .success(function (r) {
                            $scope.sensor = r.result;
                        });

                    $scope.save = function () {
                        Rpc.saveSensor($scope.sensor)
                            .success(function (r) {
                                $location.path('/sensors');
                                // or $scope.sensor = r.result to update current scope
                            });
                    };
                }]
            })
            .when('/devices', {
                templateUrl: 'html/devices.html',   controller: ['$scope', 'Rpc', function ($scope, Rpc) {
                    Rpc.listDevice()
                        .success(function (r) {
                            $scope.devices = r.result;
                        });

                    $scope.deleteDevice = function (index) {
                        var deviceId = $scope.devices[index].id;
                        Rpc.deleteDevice(deviceId)
                            .success(function (r) {
                                if (r.result) {
                                    $scope.devices.splice(index, 1);
                                }
                            });
                    }
                }]
            })
            .when('/device/:id', {
                templateUrl: 'html/device-edit.html',   controller: ['$scope', '$routeParams', 'Rpc', '$location', function ($scope, $routeParams, Rpc, $location) {
                    var deviceId = parseInt($routeParams.id);

                    Rpc.getDevice(deviceId)
                        .success(function (r) {
                            $scope.device = r.result;
                        });

                    $scope.save = function () {
                        Rpc.saveDevice($scope.device)
                            .success(function (r) {
                                $location.path('/devices');
                                // or $scope.device = r.result to update current scope
                            });
                    };
                }]
            })
            .when('/rules', {
                templateUrl: 'html/rules.html',   controller: ['$scope', '$routeParams', 'Rpc', '$location', function ($scope, $routeParams, Rpc, $location) {
                    Rpc.listRule()
                        .success(function (r) {
                            $scope.rules = r.result;
                        });

                    $scope.deleteRule = function (index) {
                        var ruleId = $scope.rules[index].id;
                        Rpc.deleteRule(ruleId)
                            .success(function (r) {
                                if (r.result) {
                                    $scope.rules.splice(index, 1);
                                }
                            });
                    };

                    $scope.runRule = function (ruleId) {
                        Rpc.runRule(ruleId)
                            .success(function (r) {
                                alert('Result: ' + r.result);
                            });
                    };

                }]
            })
            .when('/rule/:id', {
                templateUrl: 'html/rule-edit.html',   controller: ['$scope', '$routeParams', 'Rpc', '$location', function ($scope, $routeParams, Rpc, $location) {
                    var ruleId = parseInt($routeParams.id);

                    Rpc.getRule(ruleId)
                        .success(function (r) {
                            $scope.rule = r.result;
                        });

                    $scope.save = function () {
                        Rpc.saveRule($scope.rule)
                            .success(function (r) {
                                $location.path('/rules');
                                // or $scope.device = r.result to update current scope
                            });
                    };

                    $scope.addCondition = function () {
                        $scope.rule.conditions.push([null, null, null]);
                    };

                    $scope.deleteCondition = function (index) {
                        $scope.rule.conditions.splice(index, 1);
                    };

                    $scope.addAction = function () {
                        $scope.rule.actions.push([null, null]);
                    };

                    $scope.deleteAction = function (index) {
                        $scope.rule.actions.splice(index, 1);
                    };

                    $scope.getDevicesAndSensors = function () {
                        var data = [];
                        angular.forEach($scope.sensors, function (sensor) {
                            data.push(sensor);
                        });

                        angular.forEach($scope.devices, function (device) {
                           data.push(device);
                        });

                        return data;
                    };

                    $scope.devices = [];
                    $scope.sensors = [];
                    $scope.operators = [];

                    Rpc.listSensor()
                        .success(function (r) {
                            $scope.sensors = r.result;
                        });

                    Rpc.listDevice()
                        .success(function (r) {
                            $scope.devices = r.result;
                        });

                    Rpc.listOperator()
                        .success(function (r) {
                            $scope.operators = r.result;
                        });
                }]
            })
            .when('/poc', {
                templateUrl: 'html/poc.html',   controller: ['$scope', '$routeParams', 'Rpc', '$location', '$interval', function ($scope, $routeParams, Rpc, $location, $interval) {

                    ////  Toggle LED section
                    $scope.led_value = false;

                    console.log("init led_value = " + $scope.led_value);

                    // Handler for the the toggle LED button click
                    $scope.toggleLed = function () {
                        console.log("Called toggleLed with led_value = " + $scope.led_value);

                        Rpc.toggleLed(!$scope.led_value)    // Swap the led_value and call the RPC
                            .success(function (r) {
                                console.log("Success with led_value = " + $scope.led_value);
                                console.log(r);

                                $scope.led_value = ! $scope.led_value;
                            });
                    };



                    //// Read sensor id 1
                    $scope.sensorId = 1;
                    $scope.sensor1Reading = -1;
                    $scope.sensorReadings = {}

                    $scope.sensorRead = function () {
                        console.log("Reading sensor " + $scope.sensorId);

                        Rpc.readSensor($scope.sensorId)
                            .success(function (reading) {
                                console.log("Success and read Sensor " + $scope.sensorId + " = ", reading );
                                $scope.sensor1Reading = reading.result;
                            });
                    };

                    var updateReading = function() {
                        Rpc.readSensors()
                                .success(function (reading) {
//                                    console.log("Success and read = ", reading.result);
                                    $scope.sensorReadings = reading.result;
                                });
                    }

                    // TODO: find out if this needs to be stopped when the nav changes
                    var updateReadingInterval = $interval(updateReading, 2500);

                    // listen on DOM destroy (removal) event, and cancel the next UI update
                    // to prevent updating time after the DOM element was removed.
                    // TODO: find out why this doesn't work
//                    element.on('$destroy', function() {
//                    $interval.cancel(updateReadingInterval);
//                    });
                }]
            })
            .when('/logs', {
                templateUrl: 'html/logs.html',   controller: function ($scope) {

                }
            })
            .otherwise({redirectTo: '/'});
    }]);


angular.module('appServices', ['angular-json-rpc'])

        .factory ('Rpc', ['$http', function ($http) {
            var rpcRequest = function (method, args) {
                return $http.jsonrpc('rpc', method, args, {});
            };

            return {
                // Sensor Section
                listSensor: function () {
                    return rpcRequest('list_sensor');
                },
                getSensor: function (id) {
                    return rpcRequest('get_sensor', {sensor_id: id});
                },
                deleteSensor: function (id) {
                    return rpcRequest('delete_sensor', {sensor_id: id});
                },
                saveSensor: function (sensor) {
                    return rpcRequest('save_sensor', {data: sensor});
                },

                // Device Section
                listDevice: function () {
                    return rpcRequest('list_device');
                },
                getDevice: function (id) {
                    return rpcRequest('get_device', {device_id: id});
                },
                deleteDevice: function (id) {
                    return rpcRequest('delete_device', {device_id: id});
                },
                saveDevice: function (device) {
                    return rpcRequest('save_device', {data: device});
                },

                // Rule section
                listRule: function () {
                    return rpcRequest('list_rule');
                },
                getRule: function (id) {
                    return rpcRequest('get_rule', {rule_id: id});
                },
                deleteRule: function (id) {
                    return rpcRequest('delete_rule', {rule_id: id});
                },
                saveRule: function (rule) {
                    return rpcRequest('save_rule', {data: rule});
                },

                listOperator: function () {
                    return rpcRequest('list_operator');
                },

                runRule: function (id) {
                    return rpcRequest('run_rule', {rule_id: id});
                },


                // POC section
                toggleLed: function (desiredSwitchValue) {
                    return rpcRequest('toggle_led', {on_off: desiredSwitchValue});
                },

                readSensor: function (sensor_id) {
                    return rpcRequest('read_sensor', {id: sensor_id});
                },

                readSensors: function () {
                    return rpcRequest('read_sensors', {});
                }
            };
        }]);
