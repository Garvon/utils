/*
 *   des:        时间格式化
 *   @formatStr: 格式化参数
 *   @return:    string类型时间
 *   ex:         new Date().formatDate('yyyy-MM-dd')
 */
Date.prototype.formatDate = function (formatStr) {
    if (!formatStr || typeof formatStr != 'string') formatStr = "yyyy-MM-dd HH:mm";
    var dict = {
        "yyyy": this.getFullYear(),
        "M": this.getMonth() + 1,
        "d": this.getDate(),
        "H": this.getHours(),
        "m": this.getMinutes(),
        "s": this.getSeconds(),
        "MM": ("" + (this.getMonth() + 101)).substr(1),
        "dd": ("" + (this.getDate() + 100)).substr(1),
        "HH": ("" + (this.getHours() + 100)).substr(1),
        "mm": ("" + (this.getMinutes() + 100)).substr(1),
        "ss": ("" + (this.getSeconds() + 100)).substr(1)
    };
    return formatStr.replace(/(yyyy|MM?|dd?|HH?|ss?|mm?)/g, function () {
        return dict[arguments[0]];
    });
};

/*
 *   des:        时间操作
 *   @proStr:    格式化参数
 *   @return:    date类型时间
 *   ex:         new Date().datePro('{%y+1}-{%M+2}-{%d+1}-{%H+1}-{%m+1}-{%s+1}') //年月日时分秒全部加1
 */
Date.prototype.datePro = function (proStr) {
    var dealWith = function (str, date) {
        var t = str.substr(0, 1),
            num = 0;
        if (str.indexOf('+') > -1) {
            num = str.substr(str.indexOf('+'));
        } else if (str.indexOf('-') > -1) {
            num = str.substr(str.indexOf('-'));
        }
        switch (t) {
            case 'y':
                date.setFullYear(date.getFullYear() + parseInt(num));
                break;
            case 'M':
                date.setMonth(date.getMonth() + parseInt(num));
                break;
            case 'd':
                date.setDate(date.getDate() + parseInt(num));
                break;
            case 'H':
                date.setHours(date.getHours() + parseInt(num));
                break;
            case 'm':
                date.setMinutes(date.getMinutes() + parseInt(num));
                break;
            case 's':
                date.setSeconds(date.getSeconds() + parseInt(num));
                break;
        }
        return date;
    }

    var arr = [],
        date;
    arr = proStr.split('{%');
    for (var i = 1; i < arr.length; i++) {
        arr[i] = arr[i].replace('}-', '');
        arr[i] = arr[i].replace('}', '');
        date = dealWith(arr[i], this);
    }
    return date;
};

/*
 *   des:        字符串转时间
 *   @return:    date类型时间
 *   ex:         '1991-01-01 08:00'.toDate()
 */
String.prototype.toDate = function () {
    var date = this.toString();
    //IE
    if (!!window.ActiveXObject || "ActiveXObject" in window) {
        var result = new Date();
        if (date.length <= 10) {
            var str = date.split('-');
            result.setUTCFullYear(str[0], str[1] ? str[1] - 1 : 0, str[2] ? str[2] : 1);
            result.setUTCHours(-8, 0, 0, 0);
        } else {
            var strs = date.trim().split(" ");
            var one = strs[0].split('-'),
                two = strs[1].split(':');
            result.setUTCFullYear(one[0], one[1] ? one[1] - 1 : 0, one[2] ? one[2] : 1);
            result.setUTCHours(two[0] - 8, two[1] ? two[1] : 0, two[2] ? two[2] : 0, 0);
        }
        return result;
    } else {
        //火狐
        if (navigator.userAgent.indexOf('Firefox') > -1) {
            date = new Date(date.replace(/ /g, 'T').replace(/\//g, "-"));
        } else {
            date = new Date(date.replace(/T/g, ' ').replace(/-/g, "/"));
        }
    }
    return date;
};

/*
 *   des:        用正则表达式将前后空格去掉
 *   @return:    前后无空格的字符串
 *   ex:         " #FF0000 ".trim()
 */
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
};