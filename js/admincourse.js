var $table = $('#table');
var $remove = $('#remove');
var selcourse = "";
var courselist = [];
var ss_scorelist = new LinkedList();  //该链表存储某课程的学生及分数
var ss_list = new LinkedList();  //该链表存储student.json的信息
var cos = new COS({         //使用腾讯云COS存储信息，请自行注册开通后填写
    SecretId: '',
    SecretKey: '',
});


function delcourseclick() {
    if (selcourse == "") {
        alert("请先加载一门课程");
    } else {
        let delcoursename = selcourse;

        cos.deleteObject({
            Bucket: 'data-structure-term-project-1251910132',
            Region: 'ap-chengdu',
            Key: 'course/' + delcoursename + '.json',
        }, function (err, data) {
            console.log(err || data);
        });
        $table.bootstrapTable('removeAll');
        courselist.splice(courselist.indexOf(delcoursename), 1);
        selcourse = "";
        let ob = document.getElementById('dmenu');  //下拉列表添加课程
        ob.innerHTML = "";

        for (let i = 0; i < courselist.length; i++) {   //重绘下拉列表
            let b = document.createElement('button');
            b.setAttribute("type", "button");
            b.setAttribute("id", courselist[i]);
            b.setAttribute("class", "dropdown-item");
            b.innerHTML = courselist[i];
            b.setAttribute("onclick", "loadcourse(" + i + ")");
            ob.appendChild(b);
        }

        current = ss_list.head;

        for (let i = 0; i < ss_list.size() && current != null; i++) {
            temp = current.element.course;  //某学生的course的数组
            let cindex = temp.indexOf(delcoursename);

            if (cindex != -1) {
                temp.splice(cindex, 1);
                current.element.course = temp;
            }
            current = current.next;
        }

        let upjson = JSON.stringify(ss_list.toJson());
        cos.putObject({
            Bucket: 'data-structure-term-project-1251910132',
            Region: 'ap-chengdu',
            Key: 'student.json',
            Body: upjson,
        }, function (err, data) {
            console.log(err || data);
        });

    }
}
document.getElementById("delcourse").onclick = delcourseclick;

function logoutclick() {
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
    document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
    document.cookie = "type=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
    jumptologin();
}
document.getElementById("logout").onclick = logoutclick;

function loadcourse(courseindex) {
    var rows = [];
    selcourse = courselist[courseindex];
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
            }
            $table.bootstrapTable('load', rows);
        }
    });


}

$(function () {   //页面加载完毕后执行

    let num;
    cos.getBucket({
        Bucket: 'data-structure-term-project-1251910132',
        Region: 'ap-chengdu',
        Prefix: 'course/',
    }, function (err, data) {
        console.log(err || data.Contents);
        num = data.Contents.length;
        let ob = document.getElementById('dmenu');  //下拉列表添加课程
        for (let i = 1; i < num; i++) {
            let str = data.Contents[i].Key;
            let cname = str.split('/');
            let cc = cname[1].split('.');

            courselist.push(cc[0]);   //将课程名加入courselist

            let b = document.createElement('button');
            b.setAttribute("type", "button");
            b.setAttribute("id", cc[0]);
            b.setAttribute("class", "dropdown-item");
            b.innerHTML = cc[0];

            let t = i - 1;
            b.setAttribute("onclick", "loadcourse(" + t + ")");
            ob.appendChild(b);
        }

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
    });

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
                    ss_list.push(jsf.students[i]);
                }
            }
        }
    });

})
