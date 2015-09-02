# cyTableParams---获取数据&更新

`cyTableParams#getData`用来定义表格的数据。每当表格需要数据时就会调用该方法。

**参数**：

- `$defer`：`ng`的defer对象，可以用`$defer.resolve(data)`来通知表格数据已经就绪。使用defer对象可以方便地异步获取数据，如ajax从后台取数据。
- `params`：其实就是`cyTableParams`实例本身，可以通过它来获取表格当前的状态，从而为ajax准备参数。

## 常用API

假设有`cyTableParams`实例`params`：

- `params.state()`：获取表格当前的状态，返回如`{count: 10, page: 1, ...}`。
- `params.page()`：获取表格当前页下标，返回如`1`。
- `params.count()`：获取表格页面的项数，返回如`10`。
- `params.sorting()`：获取表格当前的排序状态，返回如`{name: "desc/asc"}`。
- `params.filter()`：获取表格当前的筛选状态，返回如`{name: "myname"}`。
- ...

注意：以上所有方法都接受一个参数，此时方法的作用从获取变为设置。