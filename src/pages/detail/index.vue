<template>
  <div class="detail-wrapper" v-if="movieInfo">
      <div class="movie-detail" >
          <div class="poster-bg" :style="{background:'url(' + movieInfo.images.large + ') no-repeat top/cover' }"></div><!-- top/cover-->
          <div class="mask"></div>
          <div class="item">
              <img :src="movieInfo.images.large" class="avatar" />
              <div class="content-wrapper">
                  <div class="title line-ellipsis">{{movieInfo.title}}</div>
                  <div class="average">观众评分: <span class="grade">{{movieInfo.rating.average}}</span>分</div>
                  <div class="average">
                      演员:<span  v-for="(name,idx) in movieInfo.casts" :key="idx" class="average active line-ellipsis">
                  {{name.name}}{{idx!== movieInfo.casts.length-1?'、':''}}
              </span>
                  </div>
                  <div class="average">年份:{{movieInfo.year}}</div>
              </div>
          </div>
      </div>
      <h3 class="desc">故事描述</h3>
      <p v-if="movieInfo" class="summary">{{movieInfo.summary}}</p>
      <span class="desc"> 评分：</span><van-rate v-model="score" @change="changeRate"/>
      <p class="desc">有什么想说的：</p>
      <van-field
              class="field"
              v-model.trim="comment"
              @change="changeValue"
              placeholder="请写一些评价吧"

      />
      <img :src="item" class="img" alt="图片" @tap="previewImage(item)" v-for="(item,idx) in images" :key="idx">
      <br>
      <van-button type="warning" class="upload-btn" @tap="uploadImg">上传图片</van-button>
      <cover-view class="submit-btn" @tap="onSubmit">
          提交评价
      </cover-view>
  </div>
</template>
<script>
  //初始化云数据库
  const db = wx.cloud.database();
export default {
  data () {
    return {
      movieInfo: null,
      comment: '',
      score: 3,
      images: [],
      fileIDs: [],
      id:''
    }
  },
  methods: {
    clickHandle (ev) {
      console.log('clickHandle:', ev)
    },
    changeRate (ev) {
      this.score = ev.mp.detail;
      console.log('changeRate:', ev)
    },
    changeValue (ev) {
      // this.value
      this.comment = ev.mp.detail;
      console.log('changeValue:', ev)
    },
    //提交数据
    onSubmit (ev) {
      if(this.comment) {
        wx.showLoading({
          title:'正在提交信息...'
        })
      //上传图片到云存储
      let promiseArr = [];
      for(let i = 0;i < this.images.length; i ++) {
        promiseArr.push(new Promise((reslove,reject) => {
          let item = this.images[i];
          let suffix = /\.\w+$/.exec(item);
          wx.cloud.uploadFile({
            cloudPath: new Date().getTime()+suffix,
            filePath: item, // 文件路径
          }).then(res => {
            // get resource ID
            this.fileIDs = this.fileIDs.concat(res.fileID);
            reslove();
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
        }))
      }
      Promise.all(promiseArr).then(res => {
        db.collection('comment').add({
          data: {
            comment:this.comment,
            score:this.score,
            id: this.id,
            fileIds: this.fileIDs
          }
        }).then(result => {
          wx.hideLoading()
          wx.showToast({
            title:'评价成功'
          })
        }).catch(err => {
          wx.hideLoading()
          wx.showToast({
            title:'评价失败'
          })
        })
      })
      } else {
        wx.showToast({
          title: '评价不能为空',
          icon: 'none',
          duration: 1500
        })
      }
    },
    previewImage(item) {
      wx.previewImage({
        current: item, // 当前显示图片的http链接
        urls: this.images // 需要预览的图片http链接列表
      })
    },
    //上传图片
    uploadImg (ev) {
      wx.chooseImage({
        success : res=> {
          const tempFilePaths = res.tempFilePaths;
          this.images = this.images.concat(tempFilePaths);
        }
      })
    }
  },
  onLoad(option) {
    this.movieInfo = null;
    this.comment = '';
    this.score = 3;
    this.images = [];
    this.fileIDs = [];
    this.id = '';
    this.id = option.id;
    wx.showToast({
      title:'加载中...',
      icon: 'loading'
    })
    wx.cloud.callFunction({
      name: 'getDetail',
      data: {
        id: option.id
      }
    }).then(res => {
      this.movieInfo = JSON.parse(res.result)
    }).catch(err => {
      console.error(err)
    })

    db.collection('comment').where({
      id: option.id
    }).get().then(res => {
      if(res.data.length > 0) {
        let data = res.data[0];
        this.images =data.fileIds;
        this.score =data.score;
        this.comment =data.comment;
      }
    }).catch(err =>{
      console.log(err)
    })

  }
}
</script>

<style scoped>
    .detail-wrapper {
        padding-bottom:60px;
    }
    .movie-detail {
        height: 188px;
        position: relative;
        cursor: pointer;
    }
    .item {
        display:flex;
        padding-top: 6px;
        color: #fff;
    }
    .item .avatar {
        flex: 0 0 110px;
        width: 110px;
        height: 150px;
        box-sizing: border-box;
        position: relative;
        margin: 12px 20px 0 15px;
    }
    .item .content-wrapper {
        padding: 12px 14px 12px 0;
        flex: 1;
        height: 150px;
        line-height:1.7;
        max-height: 150px;
        position: relative;
    }
     .poster-bg {
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: absolute;
        -webkit-filter: blur(10px);
        filter: blur(10px);
         opacity: .4;
    }
     .mask {
         position: absolute;
         left: 0;
         top: 0;
         height: inherit;
         width: 100%;
         z-index: -1;
         background-color: #333;
     }
    .grade {
        font-weight: 700;
        color: #faaf00;
        font-size: 18px;
    }

    .img {
        width: 70px;
        height: 70px;
        margin: 5px 0 0 10px;
        border: 1rpx solid #ccc;
        box-sizing: border-box;
    }
    .submit-btn {
        position:fixed;
        left:0;
        bottom:0;
        width:100%;
        color: #fff;
        text-align: center;
        height: 50px;
        line-height: 50px;
        background-color: #e54847;
        z-index: 11;
    }
    .summary {
        padding: 10px;
    }
    .desc {
        padding: 10px 0 0 10px;
    }
    .field {
        padding: 3px 0 0 10px;
    }
    .average.active {
        font-size: 15px;
    }
</style>
<style>
    .van-rate .van-rate__item {
        margin: 5px 0 0 8px;
    }
    .upload-btn {
        margin: 5px 0 0 10px;
    }
</style>