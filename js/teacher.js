var $table = $('#table');
var $remove = $('#remove');
var selcourse = "";
var courselist = [];
var ss_scorelist = new LinkedList();  //该链表存储某课程的学生及分数
var ss_list = new LinkedList();  //该链表存储student.json的信息
var score_total = 0;
var pass_num = 0;

var cos = new COS({         //使用腾讯云COS存储信息，请自行注册开通后填写
    SecretId: '',
    SecretKey: '',
});

function initTable() {
    console.log("初始化");
    $table.on('all.bs.table', function (e, name, args) {
        console.log("运行")
        console.log(args)
        if (args.length == 4) {
            document.getElementById("input_name").value = args[2].name;
            document.getElementById("input_score").value = args[2].score;
        }
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

function fixgradeclick() {
    if (document.getElementById("input_name").value == "") {
        alert("请输入姓名！");
        return 0;
    }
    if (document.getElementById("input_score").value == "") {
        alert("请输入分数！");
        return 0;
    }
    let num = ss_scorelist.size();
    let coursejson = {};
    coursejson.scores = [];
    let current = ss_scorelist.head;
    let rows = [];
    let flag = 0;   //0代表未找到输入的学生，1代表找到
    let temp;
    let input_score;
    let s;
    for (let i = 0; i < num && current != null; i++) {
        temp = current.element;
        if (temp.name == document.getElementById("input_name").value) {
            flag = 1;
            input_score = document.getElementById("input_score").value;
            if (input_score >= 0 && input_score <= 100) {
                temp.score = input_score;
            } else {
                alert("请输入介于0~100之间的分数！");
                return 0;
            }
            current.element = temp;
        }
        s = { name: temp.name, score: temp.score };
        coursejson.scores.push(s);
        rows.push(s);
        current = current.next;
    }

    if (flag == 0) {
        alert("未找到该学生，请检查输入再试！");
        return 0;
    }

    $table.bootstrapTable('removeAll');
    $table.bootstrapTable('load', rows);

    let upjson = JSON.stringify(coursejson);
    cos.putObject({
        Bucket: 'data-structure-term-project-1251910132',
        Region: 'ap-chengdu',
        Key: 'course/' + selcourse + '.json',
        Body: upjson,
    }, function (err, data) {
        console.log(err || data);
    });

    cal();

}
document.getElementById("fixgrade").onclick = fixgradeclick;

function loadteachcourse() {     //加载老师所教科目
    cos.getObject({
        Bucket: 'data-structure-term-project-1251910132',
        Region: 'ap-chengdu',
        Key: 'teacher.json'
    }, function (err, data) {
        console.log(err || data.Body);
        if (err != null) {
            alert("Json加载失败，请检查网络");
        } else {
            let jsf = JSON.parse(data.Body);
            if (jsf != "") {    //json文件非空
                for (let i = 0; i < jsf.teachers.length; i++) {
                    if (jsf.teachers[i].name == getCookie("name"))
                        courselist = jsf.teachers[i].course;
                }
                let ob = document.getElementById('dmenu');  //下拉列表添加课程
                for (let i = 0; i < courselist.length; i++) {
                    let cname = courselist[i];
                    let b = document.createElement('button');
                    b.setAttribute("type", "button");
                    b.setAttribute("id", cname);
                    b.setAttribute("class", "dropdown-item");
                    b.innerHTML = cname;
                    b.setAttribute("onclick", "loadcourse(" + i + ")");
                    ob.appendChild(b);
                }
            }

        }
    });
}

function loadcourse(courseindex) {      //加载所选科目
    let rows = [];
    selcourse = courselist[courseindex];
    ss_scorelist.clear();
    cos.getObject({
        Bucket: 'data-structure-term-project-1251910132',
        Region: 'ap-chengdu',
        Key: 'course/' + selcourse + '.json'
    }, function (err, data) {
        console.log(err || data.Body);
        if (err != null) {
            alert("Json加载失败，请检查网络");
        } else {
            let jsf = JSON.parse(data.Body);
            if (jsf != "") {    //json文件非空
                for (let i = 0; i < jsf.scores.length; i++) {
                    ss_scorelist.push(jsf.scores[i]);
                    rows.push(jsf.scores[i]);
                }
                cal();
            }
            $table.bootstrapTable('load', rows);
        }
    });

    document.getElementById("input_name").value = "";
    document.getElementById("input_score").value = "";
}

function cal() {
    score_total = 0;
    pass_num = 0;
    let score = 0;
    let current = ss_scorelist.head;

    for (let i = 0; i < ss_scorelist.size() && current != null; i++) {
        score = parseInt(current.element.score, 10);
        if (score > 0) {
            score_total += score;
        }

        if (score >= 60)
            pass_num += 1;
        current = current.next;
    }


    let average = score_total / ss_scorelist.size();
    average = average.toFixed(3);
    let passrate = pass_num / ss_scorelist.size();
    passrate = Number(passrate * 100).toFixed(2)
    let b = document.getElementById('bar');
    b.innerHTML = "及格率：" + passrate + "%  平均分：" + average;
}


$(function () {   //页面加载完毕后执行
    loadteachcourse();
    initTable();
    $table.bootstrapTable({
        exportTypes: ['csv'],
        exportDataType: "all",
        locale: 'zh-CN',
        columns: [
            [{
                title: '课程学生信息',
                colspan: 2,
                align: 'center'
            }],
            [{
                field: 'name',
                title: '学生姓名',
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

})