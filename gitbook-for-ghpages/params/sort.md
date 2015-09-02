# cyTableParams---排序

## `cyTableParams#sort`

`cyTableParams#sort`用来获取或设置排序。

**获取**：`params.sorting()`。

返回排序对象，其中`key`是要排序的项的名字，`value`是`desc|asc`，表示降序或升序。比如`{name: "desc", age: "asc"}`表示`name`降序和`age`升序。

你可以在`getData`中获取排序对象，并作为参数传给后台，实现排序功能。

**设置**：`params.sorting(sortingObj)`。

一般情况下，没有必要去手动设置排序。

不过，`cyTableParams`初始化时可以这样设置`intiState`：

```js
{
    page: 1, // first page
    count: 10, // 10 items per page
    sort: {
        name: "desc"
    }
}
```

这样可以设置初始排序状态。

## `cyTableParams#sortType`

`cyTableParams#sortType`用来获取或设置排序类型。

排序类型有2种：`local`和`remote`。

- `local`：默认排序类型，指排序在本地进行（获取的当前页面队应的数据）。此时插件会自动处理（使用缓存的数据），甚至不会调用`cyTableParams#getData`。
- `remote`：只更新排序对象。需要在`cyTableParams#getData`中获取排序对象并以参数形式（自行处理）传给后台，以实现排序功能。

