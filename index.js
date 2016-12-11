'use strict';

// var request = require('request');
var htmlparser = require('htmlparser2');

var NAME_DELIM = ':';

var META = 'meta';
var HEAD = 'head';
var TITLE = 'title';
var CHARSET = 'charset'

var parseMetaInfo = function(html, callback) {
    var meta = {meta: {}};

    var isHead = false;
    var currentTag;
    var parser = new htmlparser.Parser({
        onopentag: function(tag, attribs) {
            currentTag = tag;
            if (tag === HEAD)
                isHead = true;

            var name = attribs.name || attribs.property || attribs.itemprop;
            if (tag === META && name) {
                var nameParts = name.split(NAME_DELIM);
                var content = attribs.content || attribs.value;

                var metaRef = meta;
                if (nameParts.length > 1) {
                    var i = 0;
                    for (var length = nameParts.length; i < length - 1; i++) {
                        if (metaRef[nameParts[i]]) {
                            if (typeof metaRef[nameParts[i]] !== 'object') {
                                var base = metaRef[nameParts[i]];
                                metaRef[nameParts[i]] = { base };
                            }

                            metaRef = metaRef[nameParts[i]];
                        } else
                            metaRef = metaRef[nameParts[i]] = {};
                    }

                    if (metaRef[nameParts[i]]) {
                        if (!Array.isArray(metaRef[nameParts[i]])) {
                            metaRef[nameParts[i]] = [ metaRef[nameParts[i]] ];
                        }

                        metaRef[nameParts[i]].push(content);
                    } else
                        metaRef[nameParts[i]] = content;
                } else
                    metaRef.meta[name] = content;
            } else if (tag === META && CHARSET in attribs)
                meta.meta.charset = attribs.charset;
        },
        ontext: function(text) {
            if (text.trim().length > 0 && isHead && currentTag === TITLE)
                meta.title = text;
        },
        onclosetag: function(tag) {
            if (tag === HEAD)
                isHead = false;
        },
        onend: function() {
            callback && callback(meta);
        }
    });
    parser.write(html);
    parser.end();
}

// var getMetaInfo = function(url, callback, timeout) {
//     timeout = timeout || 10000;
//
//     var options = {
//         url: url,
//         headers: {
//             'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36'
//         },
//         timeout: timeout
//     };
//
//     request(options, function(error, response, body) {
//         if (!error && response.statusCode == 200)
//             parseMetaInfo(body, callback);
//         else
//             callback && callback(null);
//     });
// }

module.exports = {
    // getMetaInfo,
    parseMetaInfo
};
