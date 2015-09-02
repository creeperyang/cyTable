# cyTablePagination

`cyTablePagination`是可选的指令，用于生成表格的分页部分。

`cyTablePagination`指令的典型使用方式如下：

```html
<div ng-controller='DemoCtrl'>
    <div cy-table='tableParams' template-pagination="pager.html">
    	<table>...</table>
		<div class="cy-table-pagination"></div>
	</div>
</div>
<script type="text/ng-template" id='pager.html'>
    <ul class="pager ng-cloak">
        <li ng-repeat="page in pages" ng-class="{'disabled': !page.active, 'previous': page.type === 'prev', 'next': page.type==='next'}">
            <a ng-if="page.type === 'prev'" ng-click="params.page(page.number)" href="">Previous</a>
            <a ng-if="page.type === 'next'" ng-click="params.page(page.number)" href="">Next</a>
            <a ng-if="page.type === 'page' || page.type === 'first' || page.type === 'last'" ng-click="params.page(page.number)" href="">{{page.number}}</a>
            <a ng-if="page.type === 'more'" ng-click="params.page(page.number)" href="">...</a>
        </li>
    </ul>
</script>
```

分页看起来很简单，稍作分析：

1. `<div class="cy-table-pagination"></div>`是占位符，告诉指令分页应该在何处位置。
2. `template-pagination`位于`cyTable`指令所在元素，用于指定分页的自定义模板。当然，该配置项可以省略，此时将使用默认分页模板。
3. 在分页中，插件暴露`pages`数组（即插件计算出的分页数据）给模板，典型的`pages`一般是这样的：
	```js
	[{
	    "type": "prev",
	    "number": 1,
	    "active": false
	}, {
	    "type": "first",
	    "number": 1,
	    "active": false
	}, {
	    "type": "page",
	    "number": 2,
	    "active": true
	}, {
	    "type": "page",
	    "number": 3,
	    "active": true
	}, {
	    "type": "page",
	    "number": 4,
	    "active": true
	}, {
	    "type": "page",
	    "number": 5,
	    "active": true
	}, {
	    "type": "page",
	    "number": 6,
	    "active": true
	}, {
	    "type": "page",
	    "number": 7,
	    "active": true
	}, {
	    "type": "more",
	    "active": true,
	    "number": 8
	}, {
	    "type": "last",
	    "number": 72,
	    "active": true
	}, {
	    "type": "next",
	    "number": 2,
	    "active": true
	}]
	```
	- `type`有6种：`first`,`prev`,`page`,`more`,`next`,`last`，指定页面的类型。
	- `active`为`false`则表明页面是当前页。
	- `number`就是页面下标，从1开始。

