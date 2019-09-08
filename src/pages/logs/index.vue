<template>
    <div>
        <!--  <swiper v-if="imgUrls.length > 0" indidator-dots="imgUrls.length > 1" >
          <block v-for="(item, index) in imgUrls" :key="index" >
            <swiper-item>
              <image :src="item" mode="scaleToFill"></image>
            </swiper-item>
          </block>
        </swiper>

        <ul class="container log-list">
          <li v-for="(log, index) in logs" :class="{ red: aa }" :key="index" class="log-item">
            <card :text="(index + 1) + ' . ' + log"></card>
          </li>
        </ul>-->
        <div class="top-box">
            <div class="content">
                <image :src="src"
                       style="border-radius: 50%;width: 80px; height: 80px; background-color: #eeeeee;"></image>
                <p>{{nickName}}</p>
                <p>今天是 {{date}}</p>
                <progress :percent='percent' class="progress"></progress>
                <p>{{year}}已经过去了{{days}}天，{{percent}}%</p>
                <p>还剩下{{otherDate}}天</p>
                <p class="desc-learn">终身学习，不断追求。</p>
            </div>
        </div>
        <div>云数据库</div>
        <button @tap="addInfo">插入数据</button>
        <button @tap="updateInfo">更新数据</button>
        <button @tap="searchInfo">查找数据</button>
        <button @tap="deleteInfo">删除数据</button>
        <div>云函数</div>
        <button @tap="sum">求和数据</button>
        <button @tap="getOpenId">获取用户的openId</button>
        <button @tap="deleteInfoAll">批量删除</button>
        <div>云存储</div>
        <button @tap="upLoad">上传</button>
        <button @tap="showImage">展示图片</button>
        <block v-for="(item,index) in images" :key="index">
            <image :src="item.fileID"></image>
            <button size="mini" @tap="downFile(item.fileID)">图片下载</button>
        </block>
        <van-button type="danger">危险按钮</van-button>
        <button open-type="getUserInfo" lang="zh_CN" @getuserinfo="onGotUserInfo">获取用户信息</button>
        <van-search :value="value" placeholder="请输入搜索关键词"/>
        <!--<open-data type="groupName" ></open-data>
        <open-data type="userAvatarUrl"></open-data>
        <open-data type="userGender" lang="zh_CN"></open-data>-->
    </div>
</template>

<script>
  import {formatTime} from '@/utils/index'
  import card from '@/components/card'
  //初始化云数据库
  const db = wx.cloud.database();
  export default {
    components: {
      card

    },
    data() {
      return {
        logs: [],
        value: '此小程序为云开发版本',
        imgUrls: [
          'http://mss.sankuai.com/v1/mss_51a7233366a4427fa6132a6ce72dbe54/newsPicture/05558951-de60-49fb-b674-dd906c8897a6',
          'http://mss.sankuai.com/v1/mss_51a7233366a4427fa6132a6ce72dbe54/coursePicture/0fbcfdf7-0040-4692-8f84-78bb21f3395d',
          'http://mss.sankuai.com/v1/mss_51a7233366a4427fa6132a6ce72dbe54/management-school-picture/7683b32e-4e44-4b2f-9c03-c21f34320870'
        ],
        images: [],
        src: '',
        nickName: '',
        date: '',
        otherDate: '',
      }
    },

    created() {
      let logs
      if (mpvuePlatform === 'my') {
        logs = mpvue.getStorageSync({key: 'logs'}).data || []
      } else {
        logs = mpvue.getStorageSync('logs') || []
      }
      this.logs = logs.map(log => formatTime(new Date(log)))

      wx.getUserInfo({
        success: (res) => {
          let userInfo = res.userInfo
          this.nickName = userInfo.nickName;
          this.src = userInfo.avatarUrl;
        }
      });
      this.getDate();
    },
    methods: {
      onGotUserInfo(ev) {
        console.log(ev);
      },
      /*新建数据*/
      addInfo() {
        db.collection('user').add({
          data: {
            name: 'hh',
            age: 21,
            // 描述，String 类型
            "description": "learn mini-program cloud service",
            // 截止时间，Date 类型
            "due": Date("2018-09-01"),
            // 标签，Array 类型
            "tags": [
              "tech",
              "mini-program",
              "cloud"
            ],
            // 个性化样式，Object 类型
            "style": {
              "color": "red"
            },
            // 是否已完成，Boolean 类型
            "done": false
          }
        }).then(res => {
          console.log(res)
        }).catch(err => {
          console.log(err)
        })
      },
      /*更新数据*/
      updateInfo() {
        db.collection('user').doc('face13585d4e498d104db6896985c849').update({
          data: {
            age: 33
          }
        })
          .then(res => {
            console.log(res)
          }).catch(err => {
          console.log(err)
        })
      },
      /*查找数据*/
      searchInfo() {
        db.collection('user').where({
          name: 'jack'
        }).get().then(res => {
          console.log(res)
        }).catch(err => {
          console.log(err)
        })
      },
      /*删除数据*/
      deleteInfo() {
        db.collection('user').doc('face13585d4e498d104db6896985c849').remove().then(res => {
          console.log(res)
        }).catch(err => {
          console.log(err)
        })
      },
      /*云函数求和*/
      sum() {
        wx.cloud.callFunction({
          name: 'sum',
          data: {
            a: 1,
            b: 1
          }
        }).then(res => {
          console.log(res)
        })
      },
      /*获取用户的openId*/
      getOpenId() {
        wx.cloud.callFunction({
          name: 'login'
        }).then(res => {
          console.log(res);
        }).catch(err => {
          console.log(err);
        })
      },
      /*批量删除*/
      deleteInfoAll() {
        wx.cloud.callFunction({
          name: 'delete'
        }).then(res => {
          console.log(res);
        }).catch(err => {
          console.log(err);
        })
      },
      /*上传*/
      upLoad() {
        wx.chooseImage({
          success(res) {
            const tempFilePaths = res.tempFilePaths
            wx.cloud.uploadFile({
              cloudPath: new Date().getTime() + '.png',
              filePath: tempFilePaths[0], // 文件路径
            }).then(res => {
              // get resource ID
              console.log(res.fileID)
              db.collection('image').add({
                data: {
                  fileID: res.fileID
                }
              }).then(res => {
                console.log(res)
              }).catch(error => {
                console.error(error)
              })
            }).catch(error => {
              console.error(error)
            })
          }
        })
      },
      /*展示图片*/
      showImage() {
        wx.cloud.callFunction({
          name: 'login'
        }).then(res => {
          db.collection('image').where({
            _openid: res.result.openid
          }).get().then(res2 => {
            this.images = res2.data;
            console.log(res2)
          })
        })
      },
      /*下载图片*/
      downFile(id) {
        wx.cloud.downloadFile({
          fileID: id
        }).then(res => {
          // get temp file path
          console.log(res.tempFilePath)
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              wx.showToast({})
              title:'保存成功'
            }
          })
        }).catch(error => {
          // handle error
        })
      },
      isLeapYear() {
        const year = new Date().getFullYear()
        if (year % 400 === 0) {
          return true
        } else if (year % 4 === 0 && year % 100 !== 0) {
          return true
        } else {
          return false
        }
      },
      getDayOfYear() {
        return this.isLeapYear() ? 366 : 365
      },
      getDateOther() {
        this.otherDate = this.getDayOfYear() - this.days;
      },
      getDate() {
        let data = new Date();
        let Y = data.getFullYear();
        let M = data.getMonth() + 1;
        let D = data.getDate();
        let myddy = data.getDay();//获取存储当前日期
        let weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        this.getDateOther();
        this.date = `${Y}-${this.zeroPadding(M)}-${this.zeroPadding(D)} ${weekday[myddy]}`;
      },
      zeroPadding(n) {
        return n < 10 ? '0' + n : n;
      }
    },
    computed: {
      year() {
        return new Date().getFullYear()
      },
      days() {
        let start = new Date()
        start.setMonth(0)
        start.setDate(1)
        // start就是今年第一天
        // 今天的时间戳 减去今年第一天的时间戳
        let offset = new Date().getTime() - start.getTime()
        return parseInt(offset / 1000 / 60 / 60 / 24) + 1
      },
      percent() {
        return (this.days * 100 / this.getDayOfYear()).toFixed(1)
      }
    }
  }
</script>

<style>
    .top-box {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 240px;
        background-color: #f03d37;
    }

    .top-box .content {
        margin-top: -20px;
        text-align: center;
    }

    .top-box p {
        color: #fff;
    }

    .progress {
        margin: 10px 0;
    }
    .desc-learn {
        padding-top: 5px;
    }
</style>
