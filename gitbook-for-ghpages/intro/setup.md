# 上手与简单实例

我们通过一个可能是最简单的实例来看看怎么使用`cyTable`。

假设你有一个html页面，那么基本的步骤如下（资深开发者扫读即可）：

1. 在页面中引入`AngularJS`（`1.3.x`和`1.4.x`都可以）;
2. 在页面中引入`cyTable`的JS和CSS文件;
3. 在声明app模块的地方加入`cyTable`依赖：
    `angular.module('app',['cyTable']);`
4. 在JS文件中，控制器内加上数据：
    ```js
    $scope.users = [{name: "Moroni", age: 50},
                    {name: "Tiancum", age: 43},
                    {name: "Jacob", age: 27},
                    {name: "Nephi", age: 29},
                    {name: "Enos", age: 34}];
    ```
5. 页面中对应模板内，你可以这样来用`cyTable`：
    ```html
    <div cy-table>
        <table>
            <tr ng-repeat="user in users">
                <td data-title="'Name'" sortable="'name'">
                    { {user.name} }
                </td>
                <td data-title="'Age'" sortable="'age'">
                    { {user.age} }
                </td>
            </tr>
        </table>
    </div>
    ```


以上是`cyTable`的使用步骤，这个简单示例的代码可在*codepen*中查看：

<p data-height="281" data-theme-id="0" data-slug-hash="PPYppL" data-default-tab="result" data-user="creeper" class='codepen'>See the Pen <a href='http://codepen.io/creeper/pen/PPYppL/'>cy-table-simple-demo</a> by creeper (<a href='http://codepen.io/creeper'>@creeper</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>
