const AV = require('leanengine');
const mail = require('./utilities/send-mail');
AV.Cloud.afterSave('Comment', function (request) {
    let currentComment = request.object;

    // 通知站长
    mail.notice(currentComment);
    
    // AT评论通知
    let pid =currentComment.get('pid');

    console.log(pid);

    if (!pid) {
        console.log("这条评论没有 @ 任何人");
        return;
    }

    // 通过被 @ 的评论 id, 则找到这条评论留下的邮箱并发送通知.
    let query = new AV.Query('Comment');
    query.get(pid).then(function (parentComment) {
        if (parentComment.get('mail')) {
            console.log(parentComment.get('mail'));
            mail.send(currentComment, parentComment);
        } else {
            console.log(currentComment.get('nick') + " @ 了" + parentComment.get('nick') + ", 但被 @ 的人没留邮箱... 无法通知");
        }
    }, function (error) {
        console.warn('好像 @ 了一个不存在的人!!!');
    });
});
