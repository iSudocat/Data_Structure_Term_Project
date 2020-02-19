var $table = $('#table')
var $remove = $('#remove')
var selections = []
var list = new LinkedList();
var ss_scorelist = new LinkedList();
var cos = new COS({         //使用腾讯云COS存储信息，请自行注册开通后填写
    SecretId: '',
    SecretKey: '',
});


function operateFormatter(value, row, index) {
    return [
        '<a class="remove" href="javascript:void(0)" title="删除">',
        '<i class="fa fa-trash"></i>',
        '</a>'
    ].join('')
}

window.operateEvents = {
    'click .remove': function (e, value, row, index) {
        $table.bootstrapTable('remove', {
            field: 'id',
            values: [row.id]
        })

        list.remove(row);
        let upjson = JSON.stringify(list.toJson());

        cos.putObject({
            Bucket: 'data-structure-term-project-1251910132',
            Region: 'ap-chengdu',
            Key: 'student.json',
            Body: upjson,
        }, function (err, data) {
            console.log(err || data);
        });

        let incourse = row.course;
        if (incourse != "") {
            for (let i = 0; i < incourse.length; i++) {
                cos.getObject({
                    Bucket: 'data-structure-term-project-1251910132',
                    Region: 'ap-chengdu',
                    Key: 'course/' + incourse[i] + '.json'
                }, function (err, data) {
                    console.log(err || data.Body);
                    if (err != null) {
                        alert("Json加载失败，请检查网络");
                    } else {
                        let jsf = JSON.parse(data.Body);
                        if (jsf != "") {    //json文件非空
                            let coursejson = {};
                            coursejson.scores = [];
                            for (let i = 0; i < jsf.scores.length; i++) {
                                if (jsf.scores[i].name != row.name) {
                                    let s = { name: jsf.scores[i].name, score: jsf.scores[i].score };
                                    coursejson.scores.push(s);
                                }

                            }

                            let upjson2 = JSON.stringify(coursejson);
                            cos.putObject({
                                Bucket: 'data-structure-term-project-1251910132',
                                Region: 'ap-chengdu',
                                Key: 'course/' + incourse[i] + '.json',
                                Body: upjson2,
                            }, function (err, data) {
                                console.log(err || data);
                            });

                        }
                    }
                });

            }
        }

    }
}


function initTable() {
    $table.bootstrapTable({
        exportTypes: ['csv'],
        exportDataType: "all",
        locale: 'zh-CN',
        columns: [
            [{
                title: '所有学生信息',
                colspan: 6,
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
                sortable: false,
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
            },
            {
                field: 'course',
                title: '课程',
                sortable: false,
                align: 'center'
            },
            {
                field: 'operate',
                title: '操作',
                align: 'center',
                clickToSelect: false,
                events: window.operateEvents,
                formatter: operateFormatter,
                width: 60
            }]
        ]
    })

}

function exclick() {
    $('#table').tableExport({ type: 'csv', ignoreColumn: [5] });
}
document.getElementById("ex").onclick = exclick;

function logoutclick() {
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
    document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
    document.cookie = "type=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
    jumptologin();
}
document.getElementById("logout").onclick = logoutclick;

function addssclick() {
    let input_id = document.getElementById("input_id").value;
    let input_name = document.getElementById("input_name").value;
    let input_grade = document.getElementById("input_grade").value;
    let input_class = document.getElementById("input_class").value;
    if (input_id == "") {
        alert("学号不能为空！");
        return 0;
    }
    if (input_name == "") {
        alert("姓名不能为空！");
        return 0;
    }
    if (input_grade == "") {
        alert("年级不能为空！");
        return 0;
    }
    if (input_class == "") {
        alert("班级不能为空！");
        return 0;
    }
    let newss = { id: input_id, name: input_name, grade: input_grade, class: input_class, course: "" };
    list.push(newss);
    $table.bootstrapTable('append', newss);

    let upjson = JSON.stringify(list.toJson());
    cos.putObject({
        Bucket: 'data-structure-term-project-1251910132',
        Region: 'ap-chengdu',
        Key: 'student.json',
        Body: upjson,
    }, function (err, data) {
        console.log(err || data);
    });
}
document.getElementById("addss").onclick = addssclick;

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
                    list.push(jsf.students[i]);
                    rows.push(jsf.students[i]);
                }
            }
            $table.bootstrapTable('load', rows);

        }

    });

})

