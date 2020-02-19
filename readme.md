## 概述
* 数据结构课程大作业：学院级学生管理系统

## 需求分析
* 设计一个学院级学生管理系统：
 * 每个学生的信息包括：学号，姓名，班级，年级，修的课程，每门课程的总成绩；
 * 支持添加、删除学生功能，将该学生相关的所有信息删除（管理员权限）；
 * 支持添加、删除课程的功能，需要将该课程的所有分数信息都删除（管理员权限）；
 * 支持输入某个学生某门课程的分数的功能（教师权限）；
 * 支持分数统计，可统计每门课程的及格率，平均分数（教师权限）；
 * 支持列表输出：将所有学生的某门功课成绩作成表格输出（可以是简单文本格式)（教师权限）；
 * 支持学生信息的查询、保存为磁盘文件（学生权限）。

## 总体设计
* 根据项目需求，决定编写一套静态网站（无后端）。项目使用HTML + CSS + JavaScript进行编写，使用BootStrap作为前端框架，使用BootStrap Table作为表格框架，使用tableExport.jquery.plugin作为数据导出拓展，使用腾讯云COS JavaScript SDK支持数据访存功能。
* 本网站HTML页面：
 * 登录页面 login.html
 * 管理员端页面 admin.html  admincourse.html  admincourseadd.html
 * 教师端页面 teacher.html
 * 学生端页面 student.html
* 交互控制逻辑由对应的JS实现：
 * 登录页面 login.js
 * 管理员端页面 admin.js  admincourse.js  admincourseadd.js
 * 教师端页面 teacher.js
 * 学生端页面 student.js

## 数据结构分析
* 内部数据：
课程与学生信息在内存中均采用单链表形式存储，便于增删查改
链表的定义与相关操作见 js/LinkedList.js文件
* 外部文件：
数据全部存储在JSON文件中，这些文件均位于云端（腾讯云对象存储COS）中，可从任意处访问与修改

## 注意事项
* 所有JS文件中的腾讯云SecretID和SecretKey均已删除，请填写自己的进行测试

## 特别感谢
* 前端框架：[Bootstrap](https://code.z01.com/v4/)
* 表格拓展：[Bootstrap Table](https://bootstrap-table.com/)
* 外部数据存储：[腾讯云COS](https://cloud.tencent.com/product/cos)
