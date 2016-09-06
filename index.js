var fs = require('fs'),
  path = require('path'),
  defaults = {
    path : "./",
    ext : ['.srt', '.vtt'],
    dest : "./subtitles.js",
    name : "subtitles"
  };

function deepmerge(target, src) {
  if (src) {
    var array = Array.isArray(src);
    var dst = array && [] || {};

    if (array) {
      target = target || [];
      dst = dst.concat(target);
      src.forEach(function(e, i) {
        if (typeof dst[i] === 'undefined') {
          dst[i] = e;
        } else if (typeof e === 'object') {
          dst[i] = deepmerge(target[i], e);
        } else {
          if (target.indexOf(e) === -1) {
            dst.push(e);
          }
        }
      });
    } else {
      if (target && typeof target === 'object') {
        Object.keys(target).forEach(function(key) {
          dst[key] = target[key];
        })
      }
      Object.keys(src).forEach(function(key) {
        if (typeof src[key] !== 'object' || !src[key]) {
          dst[key] = src[key];
        } else {
          if (!target[key]) {
            dst[key] = src[key];
          } else {
            dst[key] = deepmerge(target[key], src[key]);
          }
        }
      });
    }
    return dst;
  } else {
    return target ||  [];
  }
}

function ArrayContains(needle) {
    // Per spec, the way to identify NaN is that it is not equal to itself
    var findNaN = needle !== needle;
    var indexOf;

    if(!findNaN && typeof Array.prototype.indexOf === 'function') {
        indexOf = Array.prototype.indexOf;
    } else {
        indexOf = function(needle) {
            var i = -1, index = -1;

            for(i = 0; i < this.length; i++) {
                var item = this[i];

                if((findNaN && item !== item) || item === needle) {
                    index = i;
                    break;
                }
            }

            return index;
        };
    }

    return indexOf.call(this, needle) > -1;
};

function toFixed(val,digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = val.toString().match(re);
    return m ? parseFloat(m[1]) : val.valueOf();
};

function _toSeconds(t) {
  var s = 0.0;
  if (t) {
    var p = t.split(':');
    for (var i = 0; i < p.length; i++)
      s = s * 60 + parseFloat(p[i].replace(',', '.'))
  }
  return toFixed(s,4);
}

function _trim(x) {
  return x.replace(/^\s+|\s+$/gm, '');
}

// function _subToObj(data) {
//   var ret = [];
//   var rawArray = data.split(/[\r\n]+/);
//   for (var i = 0, linenum = 1; i < rawArray.length; linenum++) {
//     var data = {
//       text: ''
//     };
//     if (rawArray[i] == linenum) {
//       var duration = rawArray[++i].split(' --> ');
//       data.start = _toSeconds(duration[0]);
//       data.end = _toSeconds(duration[1]);
//     }
//     var textArray = [];
//     while (i < rawArray.length && rawArray[++i] && rawArray[i] != linenum + 1) {
//       textArray.push(_trim(rawArray[i]));
//     }
//     data.text = textArray.join('<br/>');
//     if (data.text) {
//       ret.push(data);
//     }
//   }
//   return ret;
// }

function _subToObj(data) {
  if (!data) return [];
  // var cache = data.split(/\r|\n|\r\n/);
  var cache = data.split(/\r\n|\r|\n/);
  var ret = [],
    block = {};
  for (var i = 0, len = cache.length; i < len; i++) {
    var o = cache[i];
    // if (!block.num) {
    //   if (/^\d+$/.test(o)) {
    //     block.num = Number(o);
    //   }
    //   continue;
    // }
    if (block.start === undefined && block.end === undefined) {
      var m = o.split('-->');
      if (m.length > 1) {
        block.start = _toSeconds(m[0]);
        block.end = _toSeconds(m[1]);
      }
      continue;
    }
    var content = _trim(o);
    if (content === '') {
      if (block.text) {
        block.text = block.text.join('<br/>');
        ret.push(block);
      }
      block = {};
    } else {
      if (!block.text) block.text = [];
      block.text.push(content);
    }
  }
  return ret;
}

function convert(data) {
  var src = data[0];
  var ext = data[1];
  if (fs.existsSync(src)) {
    var data = _subToObj(fs.readFileSync(src).toString());
    return {
      name: src.replace(ext, ""),
      data: data
    }
  }
}

module.exports = function(options) {
  var settings = deepmerge(defaults, options);
  var files = [];
  var out = {};

  // String -> [String]
  function fileList(dir) {
    return fs.readdirSync(dir).reduce(function(list, file) {
      var name = path.join(dir, file);
      var isDir = fs.statSync(name).isDirectory();
      return list.concat(isDir ? fileList(name) : [name]);
    }, []);
  }

  fileList(settings.path).map(function(file) {
    var ext = path.extname(file);
    if(ArrayContains.call(settings.ext, ext)){
      files.push([file, ext]);
    }
  });

  for (var i = files.length - 1; i >= 0; i--) {
    var d = convert(files[i]);
    if(d){
      out[d.name] = d.data;
    }
  }

  return {
    data : function(){
      return out;
    },
    writeTo: function(dest){
      fs.writeFileSync(dest || settings.dest, 'var ' + settings.name + ' = ' + JSON.stringify(out) + ';', 'utf-8');
    }
  }
}