# cyTableParams

`cyTableParams`服务可以说是和开发者交互的核心。

`cyTableParams`是一个构造函数。一个典型的`cyTableParams`的实例如下：

```js
$scope.tableParams = new cyTableParams({
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
        DataServ.fetch(query).then(function(data) {
            $defer.resolve(data);
        });
    }
});
```

可以看出，`cyTableParams`接受两个参数：`initState`和`initProps`。

- `initState`：设置初始的表格状态，比如当前页下标，每页显示项数，排序，筛选等等。
- `initProps`：重头戏`getData`指定怎么获取数据。其它有开启调试等等。