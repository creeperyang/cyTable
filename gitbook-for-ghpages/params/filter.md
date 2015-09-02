# cyTableParams---筛选

## `cyTableParams#filter`

`cyTableParams#filter`用来获取或设置筛选。

**获取**：`params.filter()`。

返回筛选对象，其中`key`是要筛选的项的名字，`value`是筛选的值。比如`{name: "kate"}`表示`name`中必须含有`"kate"`。

你可以在`getData`中获取筛选对象，并作为参数传给后台，实现筛选功能。

**设置**：`params.filter(filterObj)`。

一般情况下，没有必要去手动设置筛选。

不过，`cyTableParams`初始化时可以这样设置`intiState`：

```js
{
    page: 1, // first page
    count: 10, // 10 items per page
    filter: {
        name: "Kate"
    }
}
```

这样可以设置初始筛选状态。

## `cyTableParams#filterType`

`cyTableParams#filterType`用来获取或设置筛选类型。

筛选类型有2种：`local`和`remote`。

- `local`：默认筛选类型，指筛选在本地进行（获取的当前页面队应的数据）。此时插件会自动处理（使用缓存的数据），甚至不会调用`cyTableParams#getData`。
- `remote`：只更新筛选对象。需要在`cyTableParams#getData`中获取筛选对象并以参数形式（自行处理）传给后台，以实现筛选／搜索功能。

