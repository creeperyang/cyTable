# `cyTable`概览

`cyTable`是一个`ng`自定义模块，用于生成动态表格。

## `cyTable`的结构

`cyTable`由4部分组成：

- `cyTableParams`，服务，定义数据获取方法，获取／设置表格状态，是模块与外界交互的核心。
- `cyTable`，`cyTablePagination`，`cyTableOperation`等指令，在模板中组合使用，高度可自定义。
- `cyTableCsv`指令，负责在前端生成和下载`csv`。
- `cyTableController`，控制器，内部使用，可忽略。

## 特性

- 易用：配置简单，能快速上手；
- 灵活：模板可自定义，配合接口可灵活配置以实现自定义需求；
- 强大：除基本的数据显示和分页，内建排序和筛选（搜索）。

## 标准实例

一个`cyTable`的标准实例的截图：

![cy-table-demo](http://7sbnba.com1.z0.glb.clouddn.com/github-cy-table.png)
