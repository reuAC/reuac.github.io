// ==UserScript==
// @name         行知学徒网 自动人脸识别
// @namespace    https://github.com/reuAC/ixueto
// @version      1.0
// @description  auto
// @author       reuAC
// @match        https://www.ixueto.com/*
// @match        https://kcapp.ixueto.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ixueto.com
// @grant        none
// ==/UserScript==

(function(){
    var G_faceData;

localStorage.getItem("G_faceData") ? G_faceData = localStorage.getItem("G_faceData") : G_faceData = false;

function getDiv(msg) {
    var i = document.createElement("div")
    i.textContent = msg
    return i;
}

var floatingWindow = document.createElement('div');
var offsetX, offsetY;
var fileInput = document.createElement('input');
fileInput.type="file"
fileInput.addEventListener('change', function (event) {
    var file = event.target.files[0];

    var reader = new FileReader();
    reader.onload = function (event) {
        var img = document.createElement('img');
        img.src = event.target.result;

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');

        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            G_faceData = canvas.toDataURL('image/jpeg');
            localStorage.setItem("G_faceData", G_faceData);
            floatingWindow.innerHTML = "请刷新页面。"
        };
    };

    reader.readAsDataURL(file);
});

floatingWindow.style.position = 'fixed';
floatingWindow.style.top = '50px';
floatingWindow.style.left = '50px';
floatingWindow.style.width = '200px';
floatingWindow.style.height = '150px';
floatingWindow.style.backgroundColor = '#f0f0f0';
floatingWindow.style.border = '1px solid #ccc';
floatingWindow.style.borderRadius = '5px';
floatingWindow.style.boxShadow = '2px 2px 5px rgba(0, 0, 0, 0.3)';
floatingWindow.style.zIndex = '1000';
floatingWindow.style.cursor = 'move';
floatingWindow.style.userSelect = 'none';

floatingWindow.appendChild(getDiv("成功加载脚本"))
if (!G_faceData) {
    floatingWindow.appendChild(getDiv("！！您需要进行人脸图片载入才能跳过人脸识别！！"))
} else {
    floatingWindow.appendChild(getDiv("已越过人脸识别"))
}
floatingWindow.appendChild(fileInput)

document.body.appendChild(floatingWindow);

floatingWindow.addEventListener('mousedown', function (e) {
    offsetX = e.clientX - floatingWindow.getBoundingClientRect().left;
    offsetY = e.clientY - floatingWindow.getBoundingClientRect().top;

    document.addEventListener('mousemove', onMouseMove);
});

document.addEventListener('mouseup', function () {
    document.removeEventListener('mousemove', onMouseMove);
});

function onMouseMove(e) {
    var x = e.clientX - offsetX;
    var y = e.clientY - offsetY;
    floatingWindow.style.left = x + 'px';
    floatingWindow.style.top = y + 'px';
}



const htmlC = document.documentElement.outerHTML;

var newScript = document.createElement('script');
newScript.type = 'text/javascript';

if (!G_faceData) {
    newScript.innerHTML = `
        function faceCheck() {}
        window.onload = function () {}`
    document.body.appendChild(newScript);
    return
}

if (window.location.hostname == "www.ixueto.com") {
    var pattern = /data: \{ action: 'ComparePhotoInfo', ([^\}]*) \}/;
    var pattern2 = /data: \{ action: 'SaveScreenShotInfo', ([^\}]*) \}/;
    var pattern3 = /BOSUpload\.uploadBase64\(nbase64, true, \{([^}]*)\}/;
    var pattern4 = /\{ action: "normalEndMark", ([^\}]*) \}/;

    var data1 = htmlC.match(pattern);
    var data2 = htmlC.match(pattern2);
    var data3 = htmlC.match(pattern3);
    var data4 = htmlC.match(pattern4);

    newScript.innerHTML = `
    var sendSrc = "${G_faceData}";
    function faceCheck(stage) {
        if (isfinish == 1 && stage == 1)
            return false;
        if (existModel) {
            return false;
        }
        if (showtip == false) {
            return false;
        }
        livingChecked(stage);
    }

    function livingChecked(stage) {
        let tips = $("#tips");
        const monitor_minute =600000;
        function checkEnd() {
            layer.close(layer.index);
        }
        function saveCallBack() {
            setTimeout(checkEnd, 1500);
            if (isfinish != 1) {
                setTimeout(function () {
                    faceCheck(1);
                }, monitor_minute);
            }
        }
        function saveCallBack_End() {
            tips.text("课程已结束...");
            $("#s_message").html("课程已结束");
            setTimeout(checkEnd, 1500);
            setTimeout(function () {
                if ('1' == '1' && '2' != '0') {
                    test();
                } else {
                    if ('0' == '1') {
                        fun_autonextLesson();
                    }

                }
            }, 3000);
        }
        function normalEndMark() {
            $.post("ashx/course.ashx",
                ${data4[0]},
                function (result) {
                    if (result.flag) {
                        saveCallBack_End();
                    }
                }, "json");
        }
        function saveScreenShot(base64, state, callback) {
            var path = BOSUpload.getScreenShortPath("790294",27884);
            canvasDataURL(base64, { width: 300, height: 0 }, function (nbase64, width, height) {
                ${data3[0]}, function (path) {
                    $.ajax({
                        type: "POST",
                        dataType: "json",
                        cache: false,
                        url: "/web/NewAshx/Personal.ashx",
                        ${data2[0]},
                    success: function () {
                        supervise = 0;
                        jg_code = "";
                        $("#s_message2").html("");
                        callback();
                    }
                });
                });
            });
        }
        (function compareFace(tips) {
                faceData = "${G_faceData}";
                $.ajax({
                type: "POST",
                dataType: "json",
                cache: false,
                url: "/web/NewAshx/Personal.ashx",
                ${data1[0]},
                success: function (result) {
                    if (result != null && result.flag) {
                        if (notargetCheck.notarget_decide_time > 0) {
                            notargetCheck.endCheck();
                        }
                        nErrorTimes = 0;
                        t1 = 1;
                        t2 = 1;
                        if (stage != 2) {
                            tips.text("识别成功，计时中...");
                            $("#s_message2").html("");
                            saveScreenShot(faceData, 1, saveCallBack);
                        } else {
                            saveScreenShot(faceData, 1, normalEndMark);
                        }
                    }
                    else {
                        sendNum++;
                        if (nErrorTimes == 0) {
                            updatetimes(4);
                        }
                        nErrorTimes++;
                        if (isFirst > 0) {
                            isFirst = 0;
                            t1 = 0;
                            t2 = 0;
                        }
                        if (result != null && result.showMess != null && result.showMess != "") {
                            tips.text("识别失败" + nErrorTimes + "次，" + result.showMess);
                        }
                        else {
                            tips.text("识别失败" + nErrorTimes + "次");
                        }
                        setTimeout(recheck, 2000);
                        if (faceData != null && faceData.length > 30 && sendNum == 10) {
                            saveScreenShot(faceData, 0);
                        }
                    }
                },
                error: function (e) {
                    sendNum++;
                    if (nErrorTimes == 0) {
                        updatetimes(5);
                    }
                    nErrorTimes++;
                    if (isFirst > 0) {
                        isFirst = 0;
                        t1 = 0;
                        t2 = 0;
                    }
                    tips.text("识别失败" + nErrorTimes + "次");
                    setTimeout(recheck, 2000);
                    if (faceData != null && faceData.length > 30 && sendNum == 10) {
                        saveScreenShot(faceData, 0);
                    }
                }
            });
        })(tips);
    }
`;
} else {
    var pattern = /\{\s*action: 'ComparePhotoInfo', ([^\}]*) \}/g;
    const match = htmlC.match(pattern);

    if (match) {
        if (match[1]) {
            var [max, min] = match[0].length > match[1].length ? [match[0], match[1]] : [match[1], match[0]];
            newScript.innerHTML = `
window.onload = function () {
                setTimeout(()=>{screenshot()}, 1000);
            }

    function screenshot() {
                var sendSrc = "${G_faceData}";
                var ss = "";
            $.ajax({
                type: "POST",
                dataType: "json",
                cache: false,
                url: "../web/NewAshx/Personal.ashx",
                data: ${min},
                success: function (result) {
                    if (result != null && result.flag) {
                        if (nErrorTimes > 0) {
                            sendNum = 0;
                        }
                        faceState = true;
                        sendNum += 100;
                        $("#p_mark").html('');
                        $("#s_message2").html("识别成功");
                        if (isFirst == 0) {
                            startTime = new Date();
                            isFirst++;
                        }
                        nErrorTimes = 0;
                        SaveScreenShot(sendSrc, 1);
                       // closeVideo();
                    }
                    else {
                        faceState = false;
                        if (sendNum > 100) {
                            sendNum = 0;
                        }
                        sendNum++;
                        nErrorTimes++;
                        if (nErrorTimes > 40 && isFirst > 0)//2分钟未找到，则先关闭
                        {
                            isFirst = 0;
                        }
                        setTimeout("screenshot()", 3000);
                        startTime = new Date();
                        if (result != null && result.showMess != null && result.showMess != "")
                            $("#s_message2").html("识别失败" + nErrorTimes + "次，" + result.showMess + ss);
                        else
                            $("#s_message2").html("识别失败" + nErrorTimes + "次" + ss);

                        if (nErrorTimes % 10 == 0) {
                            alert("连续" + nErrorTimes + "次未检测到你本人，请确认你本人在视频旁边");
                        }
                        if (sendSrc != null && sendSrc.length > 30 && sendNum >= 100) {
                            SaveScreenShot(sendSrc, 0);

                        }
                    }
                },
                error: function () {
                    if (sendNum > 100) {
                        sendNum = 0;
                    }
                    faceState = false;
                    sendNum++;
                    nErrorTimes++;
                    setTimeout("screenshot()", 3000);
                    startTime = new Date();
                    $("#s_message2").html("识别失败" + nErrorTimes + "次" + ss);

                    if (nErrorTimes % 10 == 0) {
                        alert("接口错误");
                    }
                    if (sendSrc != null && sendSrc.length > 30 && sendNum >= 100) {
                        SaveScreenShot(sendSrc, 0);
                    }
                }
            });
        }

        function ScreenShotSubmitExam() {
              $("#cam").show();
              $("#s_message2").html("考试结束需要截图,请进行人脸识别...");
              var sendSrc = "${G_faceData}";
              var ss = "";
              $.ajax({
                  type: "POST",
                  dataType: "json",
                  cache: false,
                  url: "../web/NewAshx/Personal.ashx",
                  data: ${max},
                success: function (result) {
                    if (result != null && result.flag) {
                        if (nErrorTimes > 0) {
                            sendNum = 0;
                        }
                        sendNum += 100;
                        $("#s_message2").html("人脸识别成功，正在提交考试。。。");
                        if (isFirst == 0) {
                            startTime = new Date();
                            isFirst++;
                        }
                        nErrorTimes = 0;
                        allow = true;
                        SaveScreenShotSubmitExam(sendSrc, 1);
                    }
                    //人脸识别未通过
                    else {
                        allow = false;
                        if (sendNum >= 20) {
                            sendNum = 0;
                        }
                        sendNum++;
                        nErrorTimes++;
                        if (nErrorTimes > 10 && videoState == 0)
                        {
                            $("#cam").show();
                            videoState = 1;
                        }
                        setTimeout("ScreenShotSubmitExam()", 3000);
                        if (result != null && result.showMess != null && result.showMess != "")
                            $("#s_message2").html("人脸识别失败" + nErrorTimes + "次。" + result.showMess + ss);
                        else
                            $("#s_message2").html("人脸识别失败" + nErrorTimes + "次。" + ss);
                        if (sendSrc != null && sendSrc.length > 30 && sendNum >= 20) {
                            SaveScreenShot(sendSrc, 0);
                        }
                    }
                },
                error: function () {
                    allow = false;
                    if (sendNum >= 20) {
                        sendNum = 0;
                    }
                    if (nErrorTimes > 10 && videoState == 0)
                    {
                        $("#cam").show();
                        videoState = 1;
                    }

                    sendNum++;
                    nErrorTimes++;
                    setTimeout("ScreenShotSubmitExam()", 3000);
                    $("#s_message2").html("人脸识别失败" + nErrorTimes + "次。" + ss);
                    if (sendSrc != null && sendSrc.length > 30 && sendNum >= 20) {
                        SaveScreenShot(sendSrc, 0);
                    }
                }
            });
          }
`;
        } else {
            newScript.innerHTML = `
window.onload = function () {
                setTimeout(()=>{screenshot()}, 1000);
            }

    function screenshot() {
                var sendSrc = "${G_faceData}";
                var ss = "";
            $.ajax({
                type: "POST",
                dataType: "json",
                cache: false,
                url: "../web/NewAshx/Personal.ashx",
                data: ${match[0]},
                success: function (result) {
                    if (result != null && result.flag) {
                        if (nErrorTimes > 0) {
                            sendNum = 0;
                        }
                        faceState = true;
                        sendNum += 100;
                        $("#p_mark").html('');
                        $("#s_message2").html("识别成功");
                        if (isFirst == 0) {
                            startTime = new Date();
                            isFirst++;
                        }
                        nErrorTimes = 0;
                        SaveScreenShot(sendSrc, 1);
                       // closeVideo();
                    }
                    else {
                        faceState = false;
                        if (sendNum > 100) {
                            sendNum = 0;
                        }
                        sendNum++;
                        nErrorTimes++;
                        if (nErrorTimes > 40 && isFirst > 0)//2分钟未找到，则先关闭
                        {
                            isFirst = 0;
                        }
                        setTimeout("screenshot()", 3000);
                        startTime = new Date();
                        if (result != null && result.showMess != null && result.showMess != "")
                            $("#s_message2").html("识别失败" + nErrorTimes + "次，" + result.showMess + ss);
                        else
                            $("#s_message2").html("识别失败" + nErrorTimes + "次" + ss);

                        if (nErrorTimes % 10 == 0) {
                            alert("连续" + nErrorTimes + "次未检测到你本人，请确认你本人在视频旁边");
                        }
                        if (sendSrc != null && sendSrc.length > 30 && sendNum >= 100) {
                            SaveScreenShot(sendSrc, 0);

                        }
                    }
                },
                error: function () {
                    if (sendNum > 100) {
                        sendNum = 0;
                    }
                    faceState = false;
                    sendNum++;
                    nErrorTimes++;
                    setTimeout("screenshot()", 3000);
                    startTime = new Date();
                    $("#s_message2").html("识别失败" + nErrorTimes + "次" + ss);

                    if (nErrorTimes % 10 == 0) {
                        alert("接口错误");
                    }
                    if (sendSrc != null && sendSrc.length > 30 && sendNum >= 100) {
                        SaveScreenShot(sendSrc, 0);
                    }
                }
            });
        }`;
        }
    }
}
document.body.appendChild(newScript);
})()