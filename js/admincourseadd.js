var $table = $('#table')
var $remove = $('#remove')
var selections = [];
var sslist = new LinkedList();    //存储学生信息的链表
var courselist = [];
var cos = new COS({     //使用腾讯云COS存储信息，请自行注册开通后填写
    SecretId: '',
    SecretKey: '',
});

function getIdSelections() {
    return $.map($table.bootstrapTable('getSelections'), function (row) {
        return row.id
    })
}


function initTable() {
    $table.bootstrapTable({
        exportTypes: ['csv'],
        exportDataType: "all",
        locale: 'zh-CN',
        columns: [
            [{
                field: 'state',
                checkbox: true,
                rowspan: 2,
                align: 'center',
                valign: 'middle'
            }, {
                title: '请选择学生加入该课程',
                colspan: 4,
                align: 'center'
            }],
            [{
                title: '学号',
                field: 'id',
                align: 'center',
                valign: 'middle',
                sortable: true
            },
            {
                field: 'name',
                title: '姓名',
                sortable: true,
                align: 'center'
            },
            {
                field: 'grade',
                title: '年级',
                sortable: true,
                align: 'center'
            },
            {
                field: 'class',
                title: '班级',
                sortable: true,
                align: 'center'
            }]
        ]
    })
    $table.on('check.bs.table uncheck.bs.table ' +
        'check-all.bs.table uncheck-all.bs.table',
        function () {
            $remove.prop('disabled', !$table.bootstrapTable('getSelections').length)
            selections = getIdSelections()
        })
    $table.on('all.bs.table', function (e, name, args) {
        console.log(name, args)
    })

}

function addclick() {
    let addcoursename = document.getElementById("input_coursename").value;
    if (addcoursename == "") {
        alert("课程名称不能为空！");
        return 0;
    }
    if (courselist.indexOf(addcoursename) != -1) {
        alert("该课程已存在！")
    } else {

        current = sslist.head;
        let coursejson = {};
        coursejson.scores = [];
        for (let i = 0; i < sslist.size() && current != null; i++) {
            id = current.element.id;
            if (selections.indexOf(id) != -1) {     //某学生被选中
                let temp = current.element.course;  //某学生的course的数组
                if (current.element.course == "")
                    temp = [];
                temp.push(addcoursename);
                current.element.course = temp;
                let s = { name: current.element.name, score: "" };
                coursejson.scores.push(s);
            }
            current = current.next;
        }

        let upjson = JSON.stringify(sslist.toJson());
        cos.putObject({
            Bucket: 'data-structure-term-project-1251910132',
            Region: 'ap-chengdu',
            Key: 'student.json',
            Body: upjson,
        }, function (err, data) {
            console.log(err || data);
        });

        let upjson2 = JSON.stringify(coursejson);
        cos.putObject({
            Bucket: 'data-structure-term-project-1251910132',
            Region: 'ap-chengdu',
            Key: 'course/' + addcoursename + '.json',
            Body: upjson2,
        }, function (err, data) {
            console.log(err || data);
        });

        alert("课程添加成功！");

    }

}
document.getElementById("add").onclick = addclick;

function logoutclick() {
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
    document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
    document.cookie = "type=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
    jumptologin();
}
document.getElementById("logout").onclick = logoutclick;

$(function () {   //页面加载完毕后执行
    initTable();
    $('zh-CN').change(initTable);

    let rows = []
    cos.getObject({
        Bucket: 'data-structure-term-project-1251910132',
        Region: 'ap-chengdu',
        Key: 'student.json'
    }, function (err, data) {
        console.log(err || data.Body);
        if (err != null) {
            alert("Json加载失败，请检查网络");
        } else {
            let jsf = JSON.parse(data.Body);
            if (jsf != "") {    //json文件非空
                for (let i = 0; i < jsf.students.length; i++) {
                    sslist.push(jsf.students[i]);
                    rows.push(jsf.students[i]);
                }
            }
            $table.bootstrapTable('load', rows);

        }

    });


    cos.getBucket({
        Bucket: 'data-structure-term-project-1251910132',
        Region: 'ap-chengdu',
        Prefix: 'course/',
    }, function (err, data) {
        console.log(err || data.Contents);
        num = data.Contents.length;

        for (let i = 1; i < num; i++) {
            let str = data.Contents[i].Key;
            let cname = str.split('/');
            let cc = cname[1].split('.');
            courselist.push(cc[0]);   //将课程名加入courselist

        }
    });

})

