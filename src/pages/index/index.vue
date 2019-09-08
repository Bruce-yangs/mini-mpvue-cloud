<template>
    <div class="content-index-wrapper">
        <div class="content" v-if="imgUrls.length > 0" >
            <swiper  :autoplay="true" :indidator-dots="true" >
                <block v-for="(item, index) in imgUrls" :key="index" >
                    <swiper-item @tap="onTap(index)">
                        <image :src="item" style="width:100%;height: 150px;" mode="aspectFill"></image>
                    </swiper-item>
                </block>
            </swiper>
            <div class="city">所在城市：{{address || '北京'}}</div>
        </div>
        <div v-for="(item,index) in movieList" :key="index" class="item" @tap="jumpToDetail(item.id)">
            <image :src="item.images.small" class="avatar"></image>
            <div class="content-wrapper">
                <div class="title line-ellipsis">{{item.title}}</div>
                <div class="average">观众评分: <span class="grade">{{item.rating.average}}</span>分</div>
                <div class="average">
                    演员:<span v-for="(name,idx) in item.casts" :key="idx" class="average">
                  {{name.name}}{{idx!== item.casts.length-1?'、':''}}
              </span>
                </div>
                <div class="average">年份:{{item.year}}</div>
                <div class="btn">评价</div>
            </div>
        </div>
    </div>
</template>
<script>
  export default {
    data() {
      return {
        movieList: [],
        imgUrls: [
         /* 'http://mss.sankuai.com/v1/mss_51a7233366a4427fa6132a6ce72dbe54/newsPicture/05558951-de60-49fb-b674-dd906c8897a6',
          'http://mss.sankuai.com/v1/mss_51a7233366a4427fa6132a6ce72dbe54/coursePicture/0fbcfdf7-0040-4692-8f84-78bb21f3395d',
          'http://mss.sankuai.com/v1/mss_51a7233366a4427fa6132a6ce72dbe54/management-school-picture/7683b32e-4e44-4b2f-9c03-c21f34320870'*/
        ],
        address:''
      }
    },
    methods: {
      getLocation() {
        const ak = 'vYMQBdUehgFHbO5ZvpefVLrDcANIZIX6';
        let url = 'https://api.map.baidu.com/reverse_geocoding/v3/';
        wx.getLocation({
          success:res=> {
            wx.request({
              url,
              data: {
                ak,
                location: `${res.latitude},${res.longitude}`,
                output: 'json'
              },
              success (result) {
                let data = result.data;
                if (data.status === 0) {
                  let city = data.result.addressComponent.city;
                    this.address = city;
                  wx.setStorageSync('city', city);
                  wx.showModal({
                    title: '提示',
                    showCancel: false,
                    content: `当前定位您所在城市${city}`
                  })
                } else {
                  wx.showToast({
                    title: '定位失败',
                    icon: 'none',
                    duration: 1500
                  })
                }
              }
            })
          }
        })
      },
      bindViewTap() {
        const url = '../logs/main'
        if (mpvuePlatform === 'wx') {
          mpvue.switchTab({url})
        } else {
          mpvue.navigateTo({url})
        }
      },
      onTap(idx) {
        let id = this.movieList[idx].id;
        console.log(id)
        wx.navigateTo({url: `../detail/main?id=${id}`})
      },
      /*跳转*/
      jumpToDetail(id) {
        console.log(id)
        wx.navigateTo({url: `../detail/main?id=${id}`})
      },
      /*获取列表*/
      getMovieList() {
        wx.showToast({
          title: '加载中...',
          icon: 'loading'
        })
        wx.cloud.callFunction({
          name: 'movieList',
          data: {
            start: this.movieList.length,
            count: 10
          },
        }).then(res => {
          this.movieList = this.movieList.concat(JSON.parse(res.result).subjects);
            this.imgUrls.push(this.movieList[0].images.large,
              this.movieList[1].images.large,
              this.movieList[2].images.large,
              this.movieList[3].images.large,
              this.movieList[4].images.large)
        }).catch(err => {
          console.error(err)
        })
      }
    },
    /*下拉加载更多*/
    onReachBottom() {
      this.getMovieList();
    },
    onLoad() {
      this.getMovieList();
      let city = wx.getStorageSync('city');
      if (!city) {
        this.getLocation();
      } else {
        this.address = '';
        this.address = city;
      }
    }
  }
</script>

<style scoped>
    .item {
        position: relative;
        display: flex;
        margin-left: 15px;
        background-color: #fff;
        border-bottom: 1rpx solid #ccc;
    }

    .item .avatar {
        width: 69px;
        flex: 0 0 64px;
        height: 95px;
        position: relative;
        margin: 12px 20px 0 0;
    }

    .item .content-wrapper {
        padding: 12px 14px 12px 0;
        flex: 1;
        line-height: 1.6;
    }

    .btn {
        position: absolute;
        right: 10px;
        bottom: 5px;
        width: 47px;
        height: 27px;
        line-height: 28px;
        text-align: center;
        box-sizing: border-box;
        background-color: #f03d37;
        color: #fff;
        border-radius: 4px;
        white-space: nowrap;
        font-size: 12px;
    }

    .title {
        font-size: 17px;
        color: #333;
        font-weight: 700;
        padding-right: 5px;
    }

    .average {
        font-size: 13px;
        color: #666;
    }

    .average .grade {
        font-weight: 700;
        color: #faaf00;
        font-size: 15px;
    }

    .line-ellipsis {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }

    .city {
        color: #fff;
        font-size: 12px;
        background-color: #f03d37;
        position:absolute;
        right:10px;
        bottom:5px;
        padding: 2px 5px;
        z-index:1;
        border-radius:8px;
    }
</style>
<style>
    .content-index-wrapper .content {
        position: relative;
    }
</style>
