# cyTable

`cyTable`跟插件同名，是主指令（表格数据主体，必选）。

`cyTable`一般以`A`（attribute）形式引入模板，属性值可以没有，也可以是`cyTableParams`的实例。`cyTable`指令被编译后生成表格主体。

`cyTable`总是希望模板是以下形式：

```html
<div cy-table='optionalCyTableParamsInstance'>
    <table>...</table>
</div>
```

其中`<table>`告诉指令把数据显示在哪里，`<table>`中一般还有`<tr>`模板，用于定义列标题和列对应的数据，列是否可排序等等。

## 实例分析

例子在`demo`中，已经`clone`项目的可以`npm install && bower install && gulp demo`来运行该实例，并可实时修改查看。

这里列出`cyTable`指令相关的部分并一一解说。

```html
<div ng-controller='DemoCtrl'>
    <div cy-table='tableParams' show-filter="false">
        <table class="table table-striped table-hover table-condensed table-bordered">
            <tr ng-repeat="device in $data">
                <td data-title="'店铺'" sortable="'shopName'">
                    {{device.shopName}}
                </td>
                <td data-title="'设备型号'" sortable="'apType'">
                    {{device.apType}}
                </td>
                <td data-title="'APID'" sortable="'apid'">
                    {{device.apid}}
                </td>
                <td data-title="'注册时间'" sortable="'registerTime'">
                    {{device.registerTime | date:'yyyy-MM-dd HH:mm:ss'}}
                </td>
                <td data-title="'状态'" sortable="'isOnline'">
                    {{device.isOnline}}
                </td>
                <td data-title="'在线人数'" sortable="'onlineCount'">
                    {{device.onlineCount}}
                </td>
                <td data-title="'操作'">
                    <span class='btn btn-danger' ng-click="removeBinding(device.apid)">删除</span>
                </td>
            </tr>
        </table>
    </div>
</div>
```

在`DemoCtrl`中，我们定义了`tableParams`，具体的可以到`cyTableParams`这一章节看，这里先不讲。

整体来看，指令的使用（自定义）并不复杂：

1. `cyTable`指令所在元素是表单的容器，它里面至少应该有个`table`元素作为最终表格的占位符；
2. `table`元素里面应该有个`tr`模板，用它来描述显示哪些数据，数据的顺序，数据排序和筛选等等。

**`tr`模板**：

1. 插件默认会暴露`$data`给模板，代表当前获取的数据，可以用`ng-repeat`遍历；
2. 每个`td`对应一列，`data-title`用于设置对应列标题；
3. `td`上还可以通过`sortable`设置排序，可以`ng-if`来设置是否显示等等；
4. `td`的内容一般显示实际数据，也可以显示按钮等，执行各种操作。

注意：`data-title`的值既可以是字符串等，也可以是函数调用，是函数调用时传入参数`$column`。
