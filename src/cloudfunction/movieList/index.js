// 云函数入口文件
const cloud = require('wx-server-sdk')
var rp = require('request-promise');
cloud.init()

// 云函数入口函数
exports.main = async (evt, context) => {
  return rp(`http://api.douban.com/v2/movie/in_theaters?apikey=0df993c66c0c636e29ecbb5344252a4a&start=${evt.start}&count=${evt.count}`)
    .then(function (res) {
      console.log(res)
      return res
    })
    .catch(function (err) {
      console.error(err)
    });
}