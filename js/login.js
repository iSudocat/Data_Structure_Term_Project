var tclist = [];
var tcnamelist = [];
var sslist = [];
var ssnamelist = [];
var role = -1;  //0：管理员，1：老师，2：学生
var cos = new COS({         //使用腾讯云COS存储信息，请自行注册开通后填写
    SecretId: '',
    SecretKey: '',
});

function loginFun() {

    var username = document.getElementById("input-username").value;
    var password = document.getElementById("input-password").value;
    //alert(username);
    if (username == "Admin" && password == "Admin") {
        document.cookie = "username=Admin; expires=; path=/jw/";
        window.location.href = "admin.html"
    } else if (tclist.indexOf(username) != -1 && username == password) {
        document.cookie = "username=" + username + "; expires=; path=/jw/";
        document.cookie = "name=" + tcnamelist[tclist.indexOf(username)] + "; expires=; path=/jw/";
        document.cookie = "type=teacher; expires=; path=/jw/";
        window.location.href = "teacher.html"
    } else if (sslist.indexOf(username) != -1 && username == password) {
        document.cookie = "username=" + username + "; expires=; path=/jw/";
        document.cookie = "name=" + ssnamelist[sslist.indexOf(username)] + "; expires=; path=/jw/";
        document.cookie = "type=student; expires=; path=/jw/";
        window.location.href = "student.html"
    } else {
        document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
        document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
        document.cookie = "type=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/jw/";
        document.getElementById("error").style.display = 'block';
    }
}


function getteacherlist() {
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
                    tclist.push(jsf.teachers[i].id);
                    tcnamelist.push(jsf.teachers[i].name);
                }
            }

        }

    });
}

function getstudentlist() {
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
                    sslist.push(jsf.students[i].id);
                    ssnamelist.push(jsf.students[i].name);
                }
            }
        }
    });
}

$(function () {   //页面加载完毕后执行

    getteacherlist();
    getstudentlist();

})