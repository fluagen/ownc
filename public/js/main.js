(function($) {
    var md = window.markdownit({
        html: false, // Enable HTML tags in source
        xhtmlOut: false, // Use '/' to close single tags (<br />)
        breaks: false, // Convert '\n' in paragraphs into <br>
        linkify: true, // Autoconvert URL-like text to links
        typographer: true, // Enable smartypants and other sweet transforms
    });
    var linkify = md.linkify;
    linkify.add('@', {
        validate: function(text, pos, self) {
            var tail = text.slice(pos);

            if (!self.re.twitter) {
                self.re.twitter = new RegExp(
                    '^([a-zA-Z0-9_]){1,15}(?!_)(?=$|' + self.re.src_ZPCc + ')'
                );
            }
            if (self.re.twitter.test(tail)) {
                // Linkifier allows punctuation chars before prefix,
                // but we additionally disable `@` ("@@mention" is invalid)
                if (pos >= 2 && tail[pos - 2] === '@') {
                    return false;
                }
                return tail.match(self.re.twitter)[0].length;
            }
            return 0;
        },
        normalize: function(match) {
            match.url = '/user/' + match.url.replace(/^@/, '');
        }
    });
    var ownc = {
        init: function() {
            var self = this;
            self.initAtAuthor();
            self.initTextareaAutoResize();
            self.initEditorBar();
            self.initImageUpload();
            self.initReplySubmit();
            self.initReplyUp();
            self.initTopicCollect();
            self.initTopicFollow();
        },
        initAtAuthor: function() {
            var allAuthors = $('.author').map(function(idx, ele) {
                return $(ele).text().trim();
            }).toArray();
            allAuthors = _.uniq(allAuthors);
            $('.editor-text').atwho({
                at: "@",
                data: allAuthors
            });
        },
        initTextareaAutoResize: function() {
            autosize($('.editor-text'));
        },
        insertStringToEditor: function(str) {
            $target = $(".editor-text");
            start = $target[0].selectionStart;
            end = $target[0].selectionEnd;
            $target.val($target.val().substring(0, start) + str + $target.val().substring(end));
            $target[0].selectionStart = $target[0].selectionEnd = start + str.length;
            $target.focus();
        },
        initEditorBar: function() {
            $('#edit-btn').click(function() {
                $('.editor-box').toggle(true);
                $('.editor-bar-fa').toggle(true);
                $('.preview-box').toggle(false);

                $('#preview-btn').toggle(true);
                $('#edit-btn').toggle(false);

                $('.preview-box').html('');
            });
            $('#preview-btn').click(function() {
                $('.editor-box').toggle(false);
                $('.editor-bar-fa').toggle(false);
                $('.preview-box').toggle(true);

                $('#preview-btn').toggle(false);
                $('#edit-btn').toggle(true);

                $('.preview-box').html(md.render($('.editor-text').val()));
            });
        },
        initImageUpload: function() {
            var self = this;
            $('#fileupload').fileupload({
                dataType: 'json',
                url: '/upload',
                acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                maxFileSize: 1000 * 500, // 500k
                messages: {
                    acceptFileTypes: '只接收gif,jpe,jpeg,png格式的图片文件',
                    maxFileSize: '图片文件不能大于500k'
                }
            }).on('fileuploaddone', function(e, data) {
                var result = data.result;
                if (result.status === 'success') {
                    var imgtext = '![](' + result.path + ') \n';
                    self.insertStringToEditor(imgtext);
                }
            }).on('fileuploadfail', function(e, data) {
                var file = data.files[0];
                if (file.error) {
                    alert(file.error);
                    return;
                }
            }).on('fileuploadprocessfail', function(e, data) {
                var file = data.files[0];
                if (file.error) {
                    alert(file.error);
                    return;
                }
            });
            $('#fileupload_btn').click(function() {
                $('#fileupload').click();
            });
        },
        alertMessageBar: function(box, type, msg) {
            if (!type) {
                type = "alert-info";
            }
            var html = "<div class=\"alert " + type + " alert-dismissable fade in \">" +
                "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\"> &times;" +
                "</button>" + msg +
                "</div>";
            box.prepend(html);
            return;
        },
        initReplySubmit: function() {
            var self = this;
            $('.reply-btn').click(function() {
                var text = $('.editor-text').val();
                if (!text || text.trim() === '') {
                    self.alertMessageBar($('.editor-box'), "alert-danger", "回复内容不能为空");
                    return;
                }
                $('.reply-form').submit();
            });
        },
        initReplyUp: function() {
            $('.opt-up').click(function() {
                var reply_id = $(this).closest('.reply-box').attr('id');
                var $this = $(this);
                var $upcount = $(this).find('.up-count');
                $.ajax({
                    url: '/reply/' + reply_id + '/up',
                    method: 'POST',
                }).done(function(data) {
                    if (data.success) {
                        var currentCount = Number($upcount.text().trim()) || 0;
                        if (data.action === 'up') {
                            $upcount.text(currentCount + 1);
                            $this.addClass('active');
                        } else {
                            if (data.action === 'down') {
                                currentCount = currentCount - 1;
                                if (currentCount < 1) {
                                    $upcount.text('');
                                } else {
                                    $upcount.text(currentCount);
                                }
                                $this.removeClass('active');
                            }
                        }
                    } else {
                        alert(data.message);
                    }
                }).fail(function(xhr) {
                    if (xhr.status === 403) {
                        //alert('请先登录，登陆后即可点赞。');
                        window.location.href = '/login-required';
                        return;
                    }
                });
            });
        },
        initTopicCollect: function() {
            $(".bookmark").click(function() {
                var topic_id = $(".topic-heading").attr('id');
                var $this = $(this);
                $.ajax({
                    url: '/topic/' + topic_id + '/collect',
                    method: 'POST',
                }).done(function(data) {
                    if (data.success) {
                        if (data.action === 'bookmark') {
                            $this.addClass('active');
                        } else {
                            $this.removeClass('active');
                        }
                    } else {
                        alert(data.message);
                    }
                }).fail(function(xhr) {
                    if (xhr.status === 403) {
                        window.location.href = '/login-required';
                        return;
                    }
                });
            });
        },
        initTopicFollow: function() {
            $(".follow").click(function() {
                var topic_id = $(".topic-heading").attr('id');
                var $this = $(this);
                $.ajax({
                    url: '/topic/' + topic_id + '/follow',
                    method: 'POST',
                }).done(function(data) {
                    if (data.success) {
                        if (data.action === 'follow') {
                            $this.addClass('active');
                        } else {
                            $this.removeClass('active');
                        }
                    } else {
                        alert(data.message);
                    }
                }).fail(function(xhr) {
                    if (xhr.status === 403) {
                        window.location.href = '/login-required';
                        return;
                    }
                });
            });
        }

    };
    var replyOne = function(username) {
        var mention = '\n' + '@' + username + ' ';
        ownc.insertStringToEditor(mention);
    };
    window.ownc = ownc;
    window.replyOne = replyOne;
})(jQuery);

$(document).ready(function() {
    ownc.init();
});