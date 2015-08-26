'use strict';

;(function(angular, factory) {

    if (typeof define === 'function' && define.amd) {
        define(['angular'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(angular);
    } else {
        return factory(angular);
    }

}(angular || null, function(angular) {

    var app = angular.module('cyTable', []);

    /*
     * attension: AngularJS 1.3.x, $$SanitizeUriProvider set aHrefSanitizationWhitelist = /^\s*(https?|ftp|mailto|tel|file):/
     * and export csv, href would be like `data:text/csv...`
     * if dont change this, angular would add `unsafe:` prefix, so modify aHrefSanitizationWhitelist
    */
    app.config(['$compileProvider', function($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|data):/);
    }]);

    /**
     * @ngdoc service
     * @name cyTable.factory:cyTableParams
     * @description Parameters manager for cyTable
     */
    app.factory('cyTableParams', ['$q', '$log', '$filter', function($q, $log, $filter) {
        var isNumber = function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        };
        var getkeysLength = function(obj) {
            return Object.keys ? Object.keys(obj).length : (function(obj) {
                var i = 0, p;
                for (p in obj) {
                    i++;
                }
                return i;
            })(obj);
        };
        // data handlers to handle data get from #getData
        // inner usage now
        var dataHandlers = {
            adjust: function adjustData(data, tableParams, notCutData) {
                if (angular.isArray(data)) {
                    return {
                        list: notCutData ? data : data.slice(0, tableParams.count()),
                        total: data.length
                    };
                } else if (angular.isObject(data)) {
                    data.list = notCutData ? data.list : data.list.slice(0, tableParams.count());
                    return data;
                } else {
                    tableParams.data = [];
                    tableParams.total(0);
                    return false;
                }
            },
            filter: function filterData(data, tableParams) {
                var filter = tableParams.filter();
                var list = filter ? $filter('filter')(data.list, filter) : undefined;
                return list ? {
                    list: list,
                    total: list.length === tableParams.$state.count ? tableParams.originalTotal : list.length
                } : data;
            },
            sort: function sortData(data, tableParams) {
                var sorting = tableParams.sorting();
                var list = sorting ? $filter('orderBy')(data.list, tableParams.orderBy()) : undefined;
                return list ? {
                    list: list,
                    total: data.total
                } : data;
            }
        };

        var cyTableParams = function(initState, initProps) {
            var self = this;
            var log = function() {
                if (props.debugMode && $log.debug) {
                    $log.debug.apply(this, arguments);
                }
            };

            // table data
            this.data = [];
            // used to keep original data(fetched from remote)
            this.originalData = undefined;
            this.originalTotal = undefined;
            // Whether to use cache.
            // Useful for example, when you set page length 50 to 20, no need to reload data.
            this.cacheType = undefined;
            // the changed state properties, reset after reload,
            this.changedStates = {};

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#state
             * @methodOf cyTable.factory:cyTableParams
             * @description Set new state or get current state
             *
             * @param {string} newState New state
             * @returns {Object} Current state or `this`
             */
            this.state = function(newState) {
                if (angular.isDefined(newState)) {
                    for (var key in newState) {
                        var value = newState[key];
                        self.trackChanges(key, value, state[key]);
                        state[key] = (isNumber(newState[key]) ?
                            parseFloat(newState[key]) : newState[key]);
                    }
                    log('cyTable: set state', state);
                    return this;
                }
                return state;
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#props
             * @methodOf cyTable.factory:cyTableParams
             * @description Set new props or get current props
             *
             * @param {string} newProps New props or undefined
             * @returns {Object} Current props or `this`
             */
            this.props = function(newProps) {
                if (angular.isDefined(newProps)) {
                    props = angular.extend(props, newProps);
                    log('cyTable: set props', props);
                    return this;
                }
                return props;
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#page
             * @methodOf cyTable.factory:cyTableParams
             * @description If parameter page not set return current page else set current page
             *
             * @param {string} page Page number
             * @returns {Object|Number} Current page or `this`
             */
            this.page = function(page) {
                return angular.isDefined(page) ? this.state({
                    'page': page
                }) : state.page;
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#filter
             * @methodOf cyTable.factory:cyTableParams
             * @description If parameter page not set return current filter else set current filter
             *
             * @param {string} filter New filter
             * @returns {Object} Current filter or `this`
             */
            this.filter = function(filter) {
                return angular.isDefined(filter) ? this.state({
                    'filter': filter
                }) : state.filter;
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#count
             * @methodOf cyTable.factory:cyTableParams
             * @description If parameter count not set return current count per page else set count per page
             *
             * @param {string} count Count per number
             * @returns {Object|Number} Count per page or `this`
             */
            this.count = function(count) {
                // reset to first page because can be blank page
                return angular.isDefined(count) ? this.state({
                    'count': count,
                    'page': 1
                }) : state.count;
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#sortType
             * @methodOf cyTable.factory:cyTableParams
             * @description If parameter sortType not set return current sortType else set sortType
             *
             * @param {string} sortType how to sort data('remote': let server sort all data in db|'local': sort local)
             * @returns {Object|Number} SortType or `this`
             */
            this.sortType = function(sortType) {
                // reset to first page because can be blank page
                return angular.isDefined(sortType) ? this.state({
                    'sortType': sortType,
                    'page': 1
                }) : state.sortType;
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#filterType
             * @methodOf cyTable.factory:cyTableParams
             * @description If parameter filterType not set return current filterType else set filterType
             *
             * @param {string} filterType how to filter data('remote': let server search from db|'local': filter local)
             * @returns {Object|Number} FilterType or `this`
             */
            this.filterType = function(filterType) {
                // reset to first page because can be blank page
                return angular.isDefined(filterType) ? this.state({
                    'filterType': filterType,
                    'page': 1
                }) : state.filterType;
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#total
             * @methodOf cyTable.factory:cyTableParams
             * @description If parameter total not set return current quantity else set quantity
             *
             * @param {string} total Total quantity of items
             * @returns {Object|Number} Current total or `this`
             */
            this.total = function(total) {
                return angular.isDefined(total) ? this.props({
                    'total': total
                }) : props.total;
            };



            // inner usage only now
            // track what changed with state
            this.trackChanges = function(key, newValue, oldValue) {
                self.changedStates[key] = {
                    name: key,
                    prev: oldValue,
                    cur: newValue
                };
            };

            // inner usage only now
            // determine whether to use cache
            this.shouldUseCache = function(state, changedStates) {
                var length = getkeysLength(changedStates);
                if (length === 1) {
                    if (changedStates.sorting) {
                        return self.$state.sortType === 'local' ? 'sort-local' : false;
                    }
                    if (changedStates.filter) {
                        return state.filterType === 'local' ? 'filter-local' : false;
                    }
                } else if (length === 2) {
                    if (changedStates.page && changedStates.count) {
                        return changedStates.page.cur === changedStates.page.prev &&
                            changedStates.count.cur <= changedStates.count.prev ? 'count-local' : false;
                    }
                }
                return false;
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#query
             * @methodOf cyTable.factory:cyTableParams
             * @description Called by user to build query params for ajax.
             *
             * @param {Function|Array} optional filter. When it's array, it's property names which needed by user;
             *     when it's function, return true|false to filter properties, or return an array([updatedName, updatedValue]).
             */
            this.query = function(filter) {
                var ret = {}, p, tmp;
                if (angular.isArray(filter)) {
                    for (p in filter) {
                        (p in state) && (ret[p] = state[p]);
                    }
                } else if (angular.isFunction(filter)) {
                    for (p in state) {
                        if (p === 'filterType' || p === 'sortType') {
                            continue;
                        }
                        tmp = filter(p, state[p]);
                        if (tmp === true) {
                            ret[p] = state[p];
                        } else if (angular.isArray(tmp)) {
                            ret[tmp[0]] = tmp[1];
                        }
                    }
                } else {
                    for (p in state) {
                        if (p === 'filterType' || p === 'sortType') {
                            continue;
                        }
                        ret[p] = state[p];
                    }
                }
                return ret;
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#getData
             * @methodOf cyTable.factory:cyTableParams
             * @description Called to get new data when state changed
             *
             * @param {Object} $defer promise object
             * @param {Object} state New state
             * @param {boolean} all Whether to get all data
             */
            this.getData = function($defer, state, all) {
                if (angular.isArray(this.data) && angular.isObject(state)) {
                    $defer.resolve({
                        list: all ? this.data : this.data.slice((state.page() - 1) * state.count(), state.page() * state.count())
                    });
                } else {
                    $defer.resolve({
                        list: [],
                        total: 0
                    });
                }
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#getAllData
             * @methodOf cyTable.factory:cyTableParams
             * @description Called when want to load all data(such as export csv)
             *
             * @returns {Object} $defer
             */
            this.getAllData = function() {
                var $defer = $q.defer();
                props.getData($defer, self, true);
                $defer.promise.then(function(data) {
                    props.$scope.$allData = dataHandlers.adjust(data, self, true).list;
                });
                return $defer;
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#reload
             * @methodOf cyTable.factory:cyTableParams
             * @description Reload table data
             */
            this.reload = function() {
                var $defer = $q.defer();
                var promise;

                // set loading to true
                props.loading = props.$scope.$loading = true;

                log('cyTable: about to reload.');

                if ((self.cacheType = self.shouldUseCache(state, self.changedStates))) {
                    $defer.resolve({
                        list: (self.originalData || self.data).slice(0, state.count),
                        total: self.originalTotal || state.total
                    });
                    promise = $defer.promise;
                } else {
                    props.getData($defer, self);
                    promise = $defer.promise.then(function(data) {
                        var handledData = dataHandlers.adjust(data, self);
                        if (handledData) {
                            self.originalData = handledData.list;
                            self.originalTotal = handledData.total;
                        } else {
                            log('cyTable: data is empty or not valid.', data);
                        }
                        return handledData;
                    });
                }

                self.changedStates = {};

                promise.then(function(handledData) {
                    props.loading = props.$scope.$loading = false;
                    props.$scope.$csvGenerated = false; // need regenerate csv
                    if (!handledData) {
                        return;
                    }
                    // filter local
                    if (state.filterType === 'local' && state.filter) {
                        handledData = dataHandlers.filter(handledData, self);
                    }
                    // sort local
                    if (state.sortType === 'local' && state.sorting) {
                        handledData = dataHandlers.sort(handledData, self);
                    }

                    log('cyTable: current scope', props.$scope);
                    
                    self.data = props.$scope.$data = handledData.list;

                    if (isNumber(handledData.total)) {
                        self.total(handledData.total);
                    }
                    props.$scope.pages = self.generatePagesArray(self.page(), self.total(), self.count());
                    props.$scope.$emit('cyTableAfterReloadData');
                });
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#generatePagesArray
             * @methodOf cyTable.factory:cyTableParams
             * @description Generate array of pages
             *
             * @param {boolean} currentPage which page must be active
             * @param {boolean} totalItems Total quantity of items
             * @param {boolean} pageSize Quantity of items on page
             * @returns {Array} Array of pages
             */
            this.generatePagesArray = function(currentPage, totalItems, pageSize) {
                var maxBlocks, maxPage, maxPivotPages, minPage, numPages, pages;
                var tmpItem;
                maxBlocks = 11;
                pages = [];
                numPages = Math.ceil(totalItems / pageSize);
                if (numPages > 1) {
                    pages.push({
                        type: 'prev',
                        number: Math.max(1, currentPage - 1),
                        active: currentPage > 1
                    });
                    pages.push({
                        type: 'first',
                        number: 1,
                        active: currentPage > 1
                    });
                    maxPivotPages = Math.round((maxBlocks - 5) / 2);
                    minPage = Math.max(2, currentPage - maxPivotPages);
                    maxPage = Math.min(numPages - 1, currentPage + maxPivotPages * 2 - (currentPage - minPage));
                    minPage = Math.max(2, minPage - (maxPivotPages * 2 - (maxPage - minPage)));
                    var i = minPage;
                    while (i <= maxPage) {
                        if ((i === minPage && i !== 2) || (i === maxPage && i !== numPages - 1)) {
                            tmpItem = {
                                type: 'more',
                                active: currentPage !== i,
                                number: i
                            };
                        } else {
                            tmpItem = {
                                type: 'page',
                                number: i,
                                active: currentPage !== i
                            }
                        }
                        pages.push(tmpItem);
                        i++;
                    }
                    pages.push({
                        type: 'last',
                        number: numPages,
                        active: currentPage !== numPages
                    });
                    pages.push({
                        type: 'next',
                        number: Math.min(numPages, currentPage + 1),
                        active: currentPage < numPages
                    });
                }
                return pages;
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#sorting
             * @methodOf cyTable.factory:cyTableParams
             * @description If 'sorting' parameter is not set, return current sorting. Otherwise set current sorting.
             *
             * @param {string} sorting New sorting
             * @returns {Object} Current sorting or `this`
             */
            this.sorting = function(sorting) {
                if (arguments.length === 2) {
                    var sortArray = {};
                    sortArray[sorting] = arguments[1];
                    this.state({
                        'sorting': sortArray
                    });
                    return this;
                }
                return angular.isDefined(sorting) ? this.state({
                    'sorting': sorting
                }) : state.sorting;
            };

            /**
             * @ngdoc method
             * @name cyTable.factory:cyTableParams#orderBy
             * @methodOf cyTable.factory:cyTableParams
             * @description Return object of sorting parameters for angular filter
             *
             * @returns {Array} Array like: [ '-name', '+age' ]
             */
            this.orderBy = function() {
                var sorting = [];
                for (var column in state.sorting) {
                    sorting.push((state.sorting[column] === 'asc' ? '+' : '-') + column);
                }
                return sorting;
            };

            // the state will be watched by controller to reload
            var state = this.$state = {
                page: 1,
                count: 5,
                filter: null,
                filterType: 'local', // 'remote'|'local'
                sorting: null,
                sortType: 'local' // 'remote'|'local'
            };

            // although some like total is more appropriate to place to state,
            // it's placed here to avoid extra realod
            var props = {
                loading: false,
                total: 0,
                $scope: null, // set by cyTableController
                defaultSort: 'desc',
                filterDelay: 750,
                counts: [5, 10, 25, 50],
                sortingIndicator: 'span',
                getData: this.getData
            };

            this.props(initProps);
            this.state(initState);

            return this;
        };
        return cyTableParams;
    }]);

    /**
     * @ngdoc object
     * @name cyTable.directive:cyTable.cyTableController
     *
     * @description
     * Each {@link cyTable.directive:cyTable cyTable} directive creates an instance of `cyTableController`
     */
    var cyTableController = ['$scope', 'cyTableParams', '$timeout', function($scope, cyTableParams, $timeout) {
        var delayFilter = (function() {
            var timer = 0;
            return function(callback, ms) {
                $timeout.cancel(timer);
                timer = $timeout(callback, ms);
            };
        })();

        $scope.$watch('params', function(newParams, oldParams) {
            if (angular.isUndefined(newParams)) {
                return;
            }

            $scope.$watch('filterType', function(filterType) {
                if (!filterType) {
                    return;
                }
                setFilterType(filterType);
            });
            $scope.$watch('sortType', function(sortType) {
                if (!sortType) {
                    return;
                }
                setSortType(sortType);
            });
            $scope.$watch('params.$state', function(newState, oldState) {
                if (angular.isUndefined(newState)) {
                    return;
                }
                if (!angular.equals(newState.filter, oldState && oldState.filter)) {
                    delayFilter(function() {
                        $scope.params.$state.page = 1;
                        $scope.params.reload();
                    }, $scope.params.props().filterDelay);
                } else {
                    $scope.params.reload();
                }
            }, true);
        });

        $scope.sortBy = function(column, event) {
            var parsedSortable = $scope.parse(column.sortable);
            if (!parsedSortable) {
                return;
            }
            var defaultSort = $scope.params.props().defaultSort;
            var inverseSort = (defaultSort === 'asc' ? 'desc' : 'asc');
            var sorting = $scope.params.sorting() && $scope.params.sorting()[parsedSortable] && ($scope.params.sorting()[parsedSortable] === defaultSort);
            var sortingParams = (event.ctrlKey || event.metaKey) ? $scope.params.sorting() : {};
            sortingParams[parsedSortable] = (sorting ? inverseSort : defaultSort);
            $scope.params.state({
                sorting: sortingParams
            });
        };

        function setSortType(type) {
            $scope.params.sortType(type);
        }
        function setFilterType(type) {
            $scope.params.filterType(type);
        }
    }];

    /**
     * @ngdoc directive
     * @name cyTable.directive:cyTable
     * @restrict EA
     *
     * @description
     * Directive that instantiates {@link cyTable.directive:cyTable.cyTableController cyTableController}.
     */
    app.directive('cyTable', ['$compile', '$q', '$parse',
        function($compile, $q, $parse) {

            return {
                restrict: 'A',
                priority: 1001,
                scope: true,
                controller: cyTableController,
                compile: function(element) {
                    var columns = [];
                    var i = 0;
                    var rowTpl;

                    // custom header
                    var table = element.find('table');
                    var thead = table.find('thead');
                    var row = angular.element(element[0].querySelector('tr:not(.cy-table-group)'));

                    if (!row || !row[0]) {
                        return;
                    }

                    angular.forEach(row.find('td'), function(item) {
                        var el = angular.element(item);
                        if (el.attr('ignore-cell') && 'true' === el.attr('ignore-cell')) {
                            return;
                        }

                        var getAttrValue = function(attr) {
                            return el.attr('data-' + attr) || el.attr(attr);
                        };
                        var parsedAttribute = function(attr, defaultValue) {
                            var expr = getAttrValue(attr);
                            return function(scope) {
                                return expr ? $parse(expr)(scope, {
                                    $columns: columns
                                }) : defaultValue;
                            };
                        };

                        var parsedTitle = parsedAttribute('title', ' '),
                            headerTemplateURL = parsedAttribute('header', false),
                            filter = parsedAttribute('filter', false)(),
                            filterTemplateURL = false,
                            filterName = false;

                        if (filter && filter.$$name) {
                            filterName = filter.$$name;
                            delete filter.$$name;
                        }
                        if (filter && filter.templateURL) {
                            filterTemplateURL = filter.templateURL;
                            delete filter.templateURL;
                        }

                        var titleExpr = getAttrValue('title');
                        if (titleExpr) {
                            el.attr('data-title-text', '{{' + titleExpr + '}}');
                        }
                        columns.push({
                            id: i++,
                            title: parsedTitle,
                            sortable: parsedAttribute('sortable', false),
                            'class': parsedAttribute('header-class', ''),
                            filter: filter,
                            filterTemplateURL: filterTemplateURL,
                            filterName: filterName,
                            headerTemplateURL: headerTemplateURL,
                            filterData: (el.attr('filter-data') ? el.attr('filter-data') : null),
                            show: (el.attr('ng-if') ? function(scope) {
                                return $parse(el.attr('ng-if'))(scope);
                            } : function() {
                                return true;
                            })
                        });
                    });
                    rowTpl = row.outerHTML ? row.outerHTML : angular.element('<div></div>').append(row.clone()).html();

                    return function(scope, element, attrs, ctrl) {
                        var table = element.find('table').addClass('cy-table-content');
                        scope.$columns = columns;
                        scope.$rowTpl = '<table><tbody>' + rowTpl.replace(/^(\s*<\s*tr.+)(\$data)/, '$1$allData') + '</tbody></table>';

                        attrs.$observe('filterType', function(filterType) {
                            scope.filterType = filterType;
                        });
                        attrs.$observe('sortType', function(sortType) {
                            scope.sortType = sortType;
                        });
                        scope.$watch(attrs.cyTable, (function(params) {
                            if (angular.isUndefined(params)) {
                                return;
                            }
                            scope.paramsModel = $parse(attrs.cyTable);
                            scope.params = params;
                            params.props().$scope = scope;
                        }), true);
                        scope.parse = function(text) {
                            return angular.isDefined(text) ? text(scope) : '';
                        };
                        if (attrs.showFilter) {
                            scope.$parent.$watch(attrs.showFilter, function(value) {
                                scope.showFilter = value;
                            });
                        }
                        angular.forEach(columns, function(column) {
                            var def;
                            if (!column.filterData) {
                                return;
                            }
                            def = $parse(column.filterData)(scope, {
                                $column: column
                            });
                            if (!(angular.isObject(def) && angular.isObject(def.promise))) {
                                throw new Error('Function ' + column.filterData + ' must be instance of $q.defer()');
                            }
                            delete column.filterData;
                            return def.promise.then(function(data) {
                                if (!angular.isArray(data)) {
                                    data = [];
                                }
                                data.unshift({
                                    title: '-',
                                    id: ''
                                });
                                column.data = data;
                            });
                        });
                        if (!element.hasClass('cy-table')) {
                            scope.templates = {
                                header: (attrs.templateHeader ? attrs.templateHeader : 'cy-table/header.html'),
                                pagination: (attrs.templatePagination ? attrs.templatePagination : 'cy-table/pager.html'),
                                operation: (attrs.templateOperation ? attrs.templateOperation : 'cy-table/operation.html')
                            };
                            var headerTemplate = thead.length > 0 ? thead : angular.element(document.createElement('thead')).attr('ng-include', 'templates.header');
                            var paginationTemplate = angular.element(element[0].querySelector('.cy-table-pagination'));
                            var operationTemplate = angular.element(element[0].querySelector('.cy-table-operation'));
                            paginationTemplate.attr({
                                'cy-table-pagination': 'params',
                                'template-url': 'templates.pagination'
                            });
                            operationTemplate.attr({
                                'cy-table-operation': '',
                                'template-url': 'templates.operation'
                            });
                            element.find('thead').remove();
                            element.addClass('cy-table');
                            table.prepend(headerTemplate);
                            $compile(headerTemplate)(scope);
                            $compile(paginationTemplate)(scope);
                            $compile(operationTemplate)(scope);
                        }
                    };
                }
            }
        }
    ]);


    /**
     * @ngdoc directive
     * @name cyTable.directive:cyTablePagination
     * @restrict A
     *
     * @description
     * Directive that handles pagination
     */
    app.directive('cyTablePagination', ['$compile',
        function($compile) {
            return {
                restrict: 'A',
                scope: {
                    'params': '=cyTablePagination',
                    'templateUrl': '='
                },
                replace: false,
                link: function(scope, element, attrs) {
                    scope.$watch('params', function(params) {
                        if (angular.isUndefined(params)) {
                            return;
                        }
                        scope.params.props().$scope.$on('cyTableAfterReloadData', function() {
                            scope.pages = scope.params.generatePagesArray(scope.params.page(), scope.params.total(), scope.params.count());
                        }, true);
                    });

                    scope.$watch('templateUrl', function(templateUrl) {
                        if (angular.isUndefined(templateUrl)) {
                            return;
                        }
                        var template = angular.element(document.createElement('div'))
                        template.attr({
                            'ng-include': 'templateUrl'
                        });
                        element.append(template);
                        $compile(template)(scope);
                    });
                }
            };
        }
    ]);

    /**
     * @ngdoc directive
     * @name cyTable.directive:cyTableOperation
     * @restrict A
     *
     * @description
     * Directive that handles table's page count, filter, and so on
     */
    app.directive('cyTableOperation', ['$compile',
        function($compile) {
            return {
                restrict: 'A',
                scope: true,
                replace: false,
                require: '^cyTable',
                link: function(scope, element, attrs) {
                    if (!attrs.templateUrl) {
                        return;
                    }
                    attrs.$observe('templateUrl', function(templateUrl) {
                        if (angular.isUndefined(templateUrl)) {
                            return;
                        }
                        var template = angular.element(document.createElement('div'));
                        template.attr({
                            'ng-include': templateUrl
                        });
                        element.append(template);
                        $compile(template)(scope);
                    });
                }
            };
        }
    ]);

    /**
     * @ngdoc directive
     * @name cyTable.directive:cyTableCsv
     * @restrict A
     *
     * @description
     * Directive that helps export table to csv
     */
    app.directive('cyTableCsv', ['$parse', '$compile', '$timeout', function ($parse, $compile, $timeout) {
        return {
            restrict: 'A',
            scope: false,
            link: function(scope, element, attrs) {
                var csvStr = '';
                var allData;
                var slice = Array.prototype.slice;
                // actual delimiter characters for CSV format
                var colDelim = '","';
                var rowDelim = '"\r\n"';
                // Temporary delimiter characters unlikely to be typed by keyboard
                // This is to avoid accidentally splitting the actual contents
                var tmpColDelim = String.fromCharCode(11); // vertical tab character
                var tmpRowDelim = String.fromCharCode(0); // null character
                var csv = {
                    stringify: function(str) {
                        return str.replace(/^\s\s*/, '').replace(/\s*\s$/, '') // trim spaces
                            .replace(/"/g,'""'); // replace quotes with double quotes
                    },
                    generate: function($event, all) {
                        var target;
                        if (scope.$csvGenerated) {
                            return;
                        }
                        csv.generating = true;
                        if (all && scope.params.getAllData) {
                            $event.preventDefault();
                            $event.stopPropagation();
                            target = $event.target;
                            scope.params.getAllData().promise.then(function() {
                                var table = $compile(scope.$rowTpl)(scope);
                                $timeout(function() {
                                    table.prepend(element.find('thead').clone());
                                    csvStr = genCsv(table.find('tr'), function(row) {
                                        return row && row.hasClass('ng-table-filters');
                                    });
                                    csv.generating = false;
                                    $timeout(function() {
                                        target.click();
                                    });
                                });
                            });
                        } else {
                            csvStr = genCsv(element.find('tr'), function(row) {
                                return row && row.hasClass('ng-table-filters');
                            });
                            csv.generating = false;
                        }
                        scope.$csvGenerated = true;
                    },
                    link: function() {
                        return 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvStr);
                    },
                    download: function(fileName) {
                        download(csvStr, fileName || 'dowload.csv', 'text/csv');
                    },
                    generating: false
                };
                $parse(attrs.cyTableCsv).assign(scope.$parent, csv);

                function genCsv(rows, ignoreRow) {
                    if (!rows || !rows.length) {
                        return '';
                    }
                    var handledRows = [];
                    slice.call(rows).map(function (row) {
                        row = angular.element(row);
                        var cols = row.find('th');
                        if (cols.length === 0) {
                            cols = row.find('td');
                        }
                        if (ignoreRow && ignoreRow(row)) {
                            return;
                        }
                        handledRows.push(slice.call(cols).map(function (col) {
                            return csv.stringify(angular.element(col).text());
                        }).join(tmpColDelim));
                    });
                    return '"' + handledRows.join(tmpRowDelim)
                        .split(tmpRowDelim).join(rowDelim)
                        .split(tmpColDelim).join(colDelim) + '"';
                }

                // most compatible csv generator/download <http://stackoverflow.com/a/29304414>
                function download(content, fileName, mimeType) {
                    var a = document.createElement('a');
                    mimeType = mimeType || 'application/octet-stream';

                    if (navigator.msSaveBlob) { // IE10/11/Edge
                        return navigator.msSaveBlob(new Blob([content], {
                            type: mimeType
                        }), fileName);
                    } else if ('download' in a) { //html5 A[download]
                        a.href = 'data:' + mimeType + ',' + encodeURIComponent(content);
                        a.setAttribute('download', fileName);
                        document.body.appendChild(a);
                        setTimeout(function() {
                            a.click();
                            document.body.removeChild(a);
                        }, 66);
                        return true;
                    } else { //do iframe dataURL download (old ch+FF):
                        var f = document.createElement('iframe');
                        document.body.appendChild(f);
                        f.src = 'data:' + mimeType + ',' + encodeURIComponent(content);

                        setTimeout(function() {
                            document.body.removeChild(f);
                        }, 333);
                        return true;
                    }
                }
            }
        };
    }]);

    app.run(['$templateCache', function($templateCache) {
        $templateCache.put('cy-table/filters/text.html', '<input type="text" name="{{column.filterName}}" ng-model="params.filter()[name]" ng-change="params.trackChanges(\'filter\', params.filter())" ng-if="filter === \'text\' && params.filterType() === \'local\'" class="input-filter form-control" />');
        $templateCache.put('cy-table/header.html', '<tr><th ng-repeat="$column in $columns" ng-if="$column.show(this)" data-title="{{$column.title(this)}}" ng-class="{ \'sortable\': parse($column.sortable), \'sort-asc\': params.sorting()[parse($column.sortable)]==\'asc\', \'sort-desc\': params.sorting()[parse($column.sortable)]==\'desc\' }" ng-click="sortBy($column, $event)" ng-init="template=$column.headerTemplateURL(this)" class="header {{$column.class(this)}}"><div ng-if="!template" ng-bind="$column.title(this)"></div><div ng-if="template"><div ng-include="template"></div></div></th></tr><tr ng-show="showFilter && params.filterType() === \'local\'" class="cy-table-filters"><th ng-repeat="$column in $columns" data-title-text="{{$column.title(this)}}" ng-if="$column.show(this)" class="filter"><div ng-repeat="(name, filter) in $column.filter"><div ng-if="$column.filterTemplateURL"><div ng-include="$column.filterTemplateURL"></div></div><div ng-if="!$column.filterTemplateURL"><div ng-include="\'cy-table/filters/\' + filter + \'.html\'"></div></div></div></th></tr>');
        $templateCache.put('cy-table/pager.html', '<ul class="cy-table-pager pager ng-cloak"><li ng-repeat="page in pages" ng-class="{\'disabled\': !page.active, \'previous\': page.type === \'prev\', \'next\': page.type===\'next\'}"><a ng-if="page.type === \'prev\'" ng-click="params.page(page.number)" href="">Prev</a><a ng-if="page.type === \'next\'" ng-click="params.page(page.number)" href="">Next</a><a ng-if="page.type === \'page\' || page.type === \'first\' || page.type === \'last\'" ng-click="params.page(page.number)" href="">{{page.number}}</a><a ng-if="page.type === \'more\'" ng-click="params.page(page.number)" href="">...</a></li></ul>');
    }]);

    return app;
}));
