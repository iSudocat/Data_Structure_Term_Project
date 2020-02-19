var $table = $('#table');
var $remove = $('#remove');
var selcourse = "";
var courselist = [];
var scorelist = [];

var cos = new COS({         //使用腾讯云COS存储信息，请自行注册开通后填写
    SecretId: '',
    SecretKey: '',
});

function initTable() {
    $table.bootstrapTable({
        exportTypes: ['csv'],
        exportDataType: "all",
        locale: 'zh-CN',
        columns: [
            [{
                title: '所修课程信息',
                colspan: 2,
                align: 'center'
            }],
            [{
                field: 'course',
                title: '课程名称',
                sortable: true,
                align: 'center'
            },
            {
                field: 'score',
                title: '成绩',
                sortable: true,
                align: 'center'
            }]
        ]
    })
}

function exclick() {
    $('#table').tableExport({ type: 'csv' });
}
document.getElementById("ex").onclick = exclick;

function logoutclick() {
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
    document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
    document.cookie = "type=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
    jumptologin();
}
document.getElementById("logout").onclick = logoutclick;

function getscores() {
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
                    if (jsf.students[i].name == getCookie("name")) {
                        courselist = jsf.students[i].course;
                        break;
                    }

                }
                let rows = [];
                let tjson = {};
                for (let i = 0; i < courselist.length; i++) {
                    cos.getObject({
                        Bucket: 'data-structure-term-project-1251910132',
                        Region: 'ap-chengdu',
                        Key: 'course/' + courselist[i] + '.json'
                    }, function (err, data) {
                        console.log(err || data.Body);
                        if (err != null) {
                            alert("Json加载失败，请检查网络");
                        } else {
                            let jsf = JSON.parse(data.Body);
                            if (jsf != "") {    //json文件非空
                                for (let j = 0; j < jsf.scores.length; j++) {
                                    if (jsf.scores[j].name == getCookie("name")) {
                                        tjson = { course: courselist[i], score: jsf.scores[j].score };
                                        rows.push(tjson);
                                        scorelist.push(jsf.scores[j].score);
                                        break;
                                    }
                                }
                                $table.bootstrapTable('load', rows);
                            }
                        }
                    });
                }


            }

        }

    });
}

$(function () {   //页面加载完毕后执行
    getscores();
    initTable();

})