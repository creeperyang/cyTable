'use strict';

describe('cy-table', function() {
    var data = [
        { id: 1, name: 'Moroni', age: 50, money: -10 },
        { id: 2, name: 'Tiancum', age: 43, money: 120 },
        { id: 3, name: 'Jacob', age: 27, money: 5.5 },
        { id: 4, name: 'Nephi', age: 29, money: -54 },
        { id: 5, name: 'Enos', age: 34, money: 110 },
        { id: 6, name: 'Tiancum', age: 43, money: 1000 },
        { id: 7, name: 'Jacob', age: 27, money: -201 },
        { id: 8, name: 'Nephi', age: 29, money: 100 },
        { id: 9, name: 'Enos', age: 34, money: -52.5 },
        { id: 10, name: 'Tiancum', age: 43, money: 52.1 },
        { id: 11, name: 'Jacob', age: 27, money: 110 },
        { id: 12, name: 'Nephi', age: 29, money: -55 },
        { id: 13, name: 'Enos', age: 34, money: 551 },
        { id: 14, name: 'Tiancum', age: 43, money: -1410 },
        { id: 15, name: 'Jacob', age: 27, money: 410 },
        { id: 16, name: 'Nephi', age: 29, money: 100 },
        { id: 17, name: 'Enos', age: 34, money: -100 }
    ];
    var cyTableParams;
    var scope;

    beforeEach(module('cyTable'));

    beforeEach(inject(function($rootScope, _cyTableParams_) {
        scope = $rootScope.$new(true);
        cyTableParams = _cyTableParams_;
    }));

    describe('basics', function(){
        var elm;
        beforeEach(inject(function($compile, $q) {
            elm = angular.element(
                    '<div cy-table="tableParams" show-filter="true">' +
                    '<table>' +
                    '<tr ng-repeat="user in $data">' +
                    '<td data-title="nameTitle()" filter="{ \'name\': \'text\' }" sortable="\'name\'" data-header-class="getCustomClass($column)"' +
                        ' ng-if="showName">' +
                    '{{user.name}}' +
                    '</td>' +
                    '<td data-title="ageTitle()" sortable="\'age\'" data-header-class="getCustomClass($column)"' +
                        ' ng-if="showAge">' +
                    '{{user.age}}' +
                    '</td>' +
                    '<td title="moneyTitle()" filter="{ \'money\': \'text\' }" header-class="getCustomClass($column)"' +
                        ' ng-if="showMoney">' +
                    '{{user.money}}' +
                    '</td>' +
                    '</tr>' +
                    '</table>' +
                    '</div>');

            scope.nameTitle = function(){
                return 'Name of person';
            };
            scope.ageTitle = function(){
                return 'Age';
            };
            scope.moneyTitle = function(){
                return 'Money';
            };

            scope.showName = true;
            scope.showAge = true;
            scope.showMoney = true;

            scope.getCustomClass = function($column){
                if ($column.title(this).indexOf('Money') !== -1){
                    return 'moneyHeaderClass';
                } else {
                    return 'customClass';
                }
            };

            scope.money = function(/*$column*/) {
                var def = $q.defer();
                def.resolve([{
                    'id': 10,
                    'title': '10'
                }]);
                return def;
            };

            $compile(elm)(scope);
            scope.$digest();
        }));

        it('should create table header', function() {
            var thead = elm.find('thead');
            expect(thead.length).toBe(1);

            var rows = thead.find('tr');
            expect(rows.length).toBe(2);

            var titles = angular.element(rows[0]).find('th');
            expect(titles.length).toBe(3);
            expect(angular.element(titles[0]).text().trim()).toBe('Name of person');
            expect(angular.element(titles[1]).text().trim()).toBe('Age');
            expect(angular.element(titles[2]).text().trim()).toBe('Money');

            expect(angular.element(rows[1]).hasClass('cy-table-filters')).toBeTruthy();
            var filters = angular.element(rows[1]).find('th');
            expect(filters.length).toBe(3);
            expect(angular.element(filters[0]).hasClass('filter')).toBeTruthy();
            expect(angular.element(filters[1]).hasClass('filter')).toBeTruthy();
            expect(angular.element(filters[2]).hasClass('filter')).toBeTruthy();
        });

        it('should create table header classes', function() {

            var thead = elm.find('thead');
            var rows = thead.find('tr');
            var titles = angular.element(rows[0]).find('th');

            expect(angular.element(titles[0]).hasClass('header')).toBeTruthy();
            expect(angular.element(titles[1]).hasClass('header')).toBeTruthy();
            expect(angular.element(titles[2]).hasClass('header')).toBeTruthy();

            expect(angular.element(titles[0]).hasClass('sortable')).toBeTruthy();
            expect(angular.element(titles[1]).hasClass('sortable')).toBeTruthy();
            expect(angular.element(titles[2]).hasClass('sortable')).toBeFalsy();

            expect(angular.element(titles[0]).hasClass('customClass')).toBeTruthy();
            expect(angular.element(titles[1]).hasClass('customClass')).toBeTruthy();
            expect(angular.element(titles[2]).hasClass('moneyHeaderClass')).toBeTruthy();
        });

        it('should create table header titles', function() {
            var thead = elm.find('thead');
            var rows = thead.find('tr');
            var titles = angular.element(rows[0]).find('th');

            expect(angular.element(titles[0]).attr('data-title').trim()).toBe('Name of person');
            expect(angular.element(titles[1]).attr('data-title').trim()).toBe('Age');
            expect(angular.element(titles[2]).attr('data-title').trim()).toBe('Money');
        });


        it('should show scope data', function() {
            var tbody = elm.find('tbody');
            expect(tbody.length).toBe(1);

            var rows = tbody.find('tr');
            expect(rows.length).toBe(0);

            var params = new cyTableParams({
                page: 1, // show first page
                count: 10 // count per page
            }, {
                total: data.length, // length of data
                getData: function($defer, params) {
                    $defer.resolve(data.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            });

            scope.tableParams = params;
            scope.$digest();

            rows = tbody.find('tr');
            expect(rows.length).toBe(10);

            scope.tableParams.page(2);
            scope.$digest();

            rows = tbody.find('tr');
            expect(rows.length).toBe(7);

            params.total(20);
            scope.$digest();

            rows = tbody.find('tr');
            expect(rows.length).toBe(7);
        });

        it('should show data-title-text', function() {
            var tbody = elm.find('tbody');

            var params = new cyTableParams({
                page: 1, // show first page
                count: 10 // count per page
            }, {
                total: data.length, // length of data
                getData: function($defer, params) {
                    $defer.resolve(data);
                }
            });
            scope.tableParams = params;
            scope.$digest();

            var filterRow = angular.element(elm.find('thead').find('tr')[1]);
            var filterCells = filterRow.find('th');
            expect(angular.element(filterCells[0]).attr('data-title-text').trim()).toBe('Name of person');
            expect(angular.element(filterCells[1]).attr('data-title-text').trim()).toBe('Age');
            expect(angular.element(filterCells[2]).attr('data-title-text').trim()).toBe('Money');

            var dataRows = elm.find('tbody').find('tr');
            var dataCells = angular.element(dataRows[0]).find('td');
            expect(angular.element(dataCells[0]).attr('data-title-text').trim()).toBe('Name of person');
            expect(angular.element(dataCells[1]).attr('data-title-text').trim()).toBe('Age');
            expect(angular.element(dataCells[2]).attr('data-title-text').trim()).toBe('Money');
        });


        it('should show/hide columns', function() {
            var tbody = elm.find('tbody');

            scope.tableParams = new cyTableParams({
                page: 1, // show first page
                count: 10 // count per page
            }, {
                total: data.length,
                data: data
            });
            scope.$digest();

            var headerRow = angular.element(elm.find('thead').find('tr')[0]);
            expect(headerRow.find('th').length).toBe(3);

            var filterRow = angular.element(elm.find('thead').find('tr')[1]);
            expect(filterRow.find('th').length).toBe(3);

            var dataRow = angular.element(elm.find('tbody').find('tr')[0]);
            expect(dataRow.find('td').length).toBe(3);

            scope.showName = false;
            scope.$digest();

            expect(headerRow.find('th').length).toBe(2);
            expect(filterRow.find('th').length).toBe(2);
            expect(dataRow.find('td').length).toBe(2);
            expect(angular.element(headerRow.find('th')[0]).text().trim()).toBe('Age');
            expect(angular.element(headerRow.find('th')[1]).text().trim()).toBe('Money');
            expect(angular.element(filterRow.find('th')[0]).find('input').length).toBe(0);
            expect(angular.element(filterRow.find('th')[1]).find('input').length).toBe(1);
        });
    });
});
