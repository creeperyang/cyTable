var app = angular.module('testApp', [
        'ui.bootstrap',
        'cyTable'
    ]);

app.service('DataServ', function($http) {
    var promise;
    this.fetch = function(query) {
        if(!promise) {
            promise = $http.get('/data/data.json');
        }
        query = query || {start: 0, length: 10};
        console.log('fetch remote data, query is', query);
        return promise.then(function(res) {
            var data = res.data;
            return {
                total: data.total,
                list: data.list.slice(query.start, query.start + query.length)
            }
        });
    };
});
app.controller('DemoCtrl', function($scope, cyTableParams, DataServ) {
    $scope.tableParams = new cyTableParams({
        // filter: {
        //     shopName: '香蕉巴士'
        // },
        page: 1, // first page
        count: 10 // 10 items per page
    }, {
        debugMode: true,
        getData: function($defer, params) {
            var page = params.page(),
                count = params.count(),
                pageIndex = page - 1,
                query = {
                    start: pageIndex * count,
                    length: count
                };
            /*params.query(function(key, value) {
                if(key === 'page') {
                    return ['start', (value - 1) * params.count()];
                }
                if(key === 'count') {
                    return ['length', value];
                }
                return false;
            })*/
            DataServ.fetch(query).then(function(data) {
                setTimeout(function() {
                    console.log(data)
                    $defer.resolve(data);
                }, 1000);//Math.floor(Math.random() * 5000));
            });
        }
    });
});