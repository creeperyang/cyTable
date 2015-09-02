# cyTableOperation

`cyTableOperation`是可选的指令，用于生成表格的其它操作部分。

`cyTableOperation`不如`cyTablePagination`功能明确，像指定每页显示多少项，搜索等杂七杂八的功能都可以放在这里面。

`cyTableOperation`指令的典型使用方式如下：

```html
<div ng-controller='DemoCtrl'>
    <div cy-table='tableParams' template-operation="pager.html">
    	<table>...</table>
		<div class="cy-table-operation"></div>
	</div>
</div>
<script type="text/ng-template" id="operation.html">
    <div>
        <div class="col-sm-6 col-md-3">
            <p>每页项数</p>
            <div class="cy-dropdown page-size-dropdown" dropdown>
                <div class='input-group'>
                    <input type='text' class='left-input form-control' value='{{params.count()}}' />
                    <span class="input-group-btn">
                        <button type="button" class="btn btn-success right-action" dropdown-toggle>
                            <i class='glyphicon glyphicon-menu-down'></i>
                        </button>
                    </span>
                </div>
                <ul class="dropdown-menu" role="menu">
                    <li><a ng-class="{'active':params.count() == 5}" ng-click="params.count(5)">5</a>
                    </li>
                    <li><a ng-class="{'active':params.count() == 10}" ng-click="params.count(10)">10</a>
                    </li>
                    <li><a ng-class="{'active':params.count() == 15}" ng-click="params.count(15)">15</a>
                    </li>
                    <li><a ng-class="{'active':params.count() == 20}" ng-click="params.count(20)">20</a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</script>
```
