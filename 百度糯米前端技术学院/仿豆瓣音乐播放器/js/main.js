
function $(selector) {
  return document.querySelector(selector);
}

var EventUtil = {
  addHandler: function (el, type, handler) {
    if (el.addEventListener) {
      el.addEventListener(type, handler, false);
    } else if (el.attachEvent) {
      el.attachEvent('on'+type, handler);
    } else{
      el['on' + type] = handler;
    }
  },
  removeHandler: function (el, type, handler) {
    if (el.removeEventListener) {
      el.removeEventListener(type, handler);
    } else if (el.detachEvent) {
      el.detachEvent(type, handler);
    } else {
      el['on' + type] = null;
    }
  },
  getEvent: function (event) {
    return event?event:window.event;
  },
  getTarget: function () {
    return event.target || event.srcElement;
  },

}

var Public = {
  addOnloadEvent: function (func) {
    var oldOnload = window.onload;
    if (typeof oldOnload != 'function') {
      window.onload = func;
    } else {
      window.onload = function () {
        oldOnload();
        func();
      }
    }
  },
}

// 全局变量                                               
var mPlayer = $('audio')// audio元素                                            
    msinger = $('#singer')// 歌手                                            
    mname = $('#name')// 歌名
    mpic = $('#cd') // 图片                                          
    mlast = $('#last')// 上一首                                            
    mnext = $('#next')// 下一首                                            
    mnowtime = $('#nowtime')// 播放时间  
    mplaytime = $('.music-len') //进度条                               
    mvolume = $('.volume-len') //音量条                               
    mcontainer = $('#container')// 容器                                            
    msearchinput = $('#searchinput')// 搜索                                            
    msearchbtn = $('searchbtn')// 搜索按键                                            
    mlist = $('.play-list ul')// 播放列表                                            
    mplayandpause = $('#playandpause')// 播放暂停建                                            
    msearchlist = []// 搜索歌曲存放列表
    index = 0

// 构造函数
function Player(index = 0) {
  this.mindex = index;
  this.init();
}

// 原型方法
Player.prototype = {

  init: function() {
    var that = this;
    EventUtil.addHandler(container,'click',function (e) {
      id = e.target.id;
      switch (id){
        case 'cd': console.log('click cd'); break;
        case 'last': console.log('click last'); break;
        case 'searchbtn': that.search.bind(that)(); break;
        default: break;
      }
      console.log(id)
    });

    EventUtil.addHandler(mlist,'click',function (e) {
      var tgindex = e.target.dataset.index || e.target.parentNode.dataset.index;
      if(tgindex){
        that.playindex(tgindex);
      }
    });

    EventUtil.addHandler(mplayandpause,'click',function (e) {
      that.playandpause.bind(that)();
    });

    EventUtil.addHandler(mnext,'click',function (e) {
      that.next.bind(that)();
    });

    EventUtil.addHandler(mPlayer,'timeupdate',function (e) {
      that.nowtime.bind(that)();
    });

    EventUtil.addHandler(mplaytime,'click',function (e) {
      that.changeplaytime.bind(that)(e);
    });

    EventUtil.addHandler(mvolume,'click',function (e) {
      that.volchange.bind(that)(e);
    });

    this.search('田馥甄').then(function(){
      that.playindex(1);
    }).then(function(){
      that.liststylechange();
    });

    $(".volume-len-top").style.width = (mPlayer.volume * 60) + 'px';
  },

  playindex: function(idx) {
    if(idx < msearchlist.length){
      index = idx
      mPlayer.src = msearchlist[index].m4a;
      mPlayer.load();
      mPlayer.play();
      this.liststylechange();
      this.infochange(msearchlist[index]);
      $('#playandpause use').setAttribute('xlink:href', '#icon-song-pause')
      $('#cd').style.animationPlayState = "running";
    }
  },

  search: function(diyvalue = '') {
    var that = this;
    var searchvalue = diyvalue || $('#searchinput').value;

    //发起请求
    var url = 'https://route.showapi.com/213-1?showapi_appid=35940&showapi_sign=f1a4fcbd4d4e45eebcf2d9f700aadd9a&keyword=' + searchvalue;
    console.log(url)
    return fetch(url).then(function(response){
      return response.json()
    }).then(function(data){
      var songsinfo = data["showapi_res_body"]["pagebean"]["contentlist"];
      msearchlist = [];
      songsinfo.forEach(function (item) {
          msearchlist.push(item)
      });
      that.showmlist();
      console.log(msearchlist);
    });
  },

  showmlist: function() {
    mlist.innerHTML = "";
    msearchlist.forEach(function(song, index) {
      mlist.innerHTML += '<li '+'data-index='+index+'>'+'<span>'+song.songname+'</span>'+'<span class="col-g1">'+song.singername+'</span>'+'</li>'
    })
  },

  playandpause: function() {
    if(mPlayer.paused){
      mPlayer.play();
      $('#playandpause use').setAttribute('xlink:href', '#icon-song-pause')
      $('#cd').style.animationPlayState = "running";
    }else{
      mPlayer.pause();
      $('#playandpause use').setAttribute('xlink:href', '#icon-song-play')
      $('#cd').style.animationPlayState = "paused";
    }
  },

  next: function() {
    if(msearchlist){
      mPlayer.src = msearchlist[++index].m4a;
      mPlayer.load()
      mPlayer.play()
      this.liststylechange();
    }else {
      alert('播放列表为空');
    }
  },

  last: function() {
    if(msearchlist){
      mPlayer.src = msearchlist[--index].m4a;
      mPlayer.load()
      mPlayer.play()
    }else {
      alert('播放列表为空');
    }
  },

  changeplaytime: function(e) {
    console.log(e)
    var w = e.offsetX;
    $(".music-len-top").style.width = parseInt(w) + 'px';
    mPlayer.currentTime = mPlayer.duration * (w / 360);
  },

  nowtime: function() {
    var m = Math.floor(mPlayer.currentTime / 60);
    var s = Math.floor(mPlayer.currentTime % 60);
    var nowtime = mPlayer.currentTime / mPlayer.duration;
    var Allm = Math.floor(mPlayer.duration / 60);
    var Alls = Math.floor(mPlayer.duration % 60);
    $('#nowtime').innerHTML = m+':'+s+'/'+Allm+':'+Alls;
    $('.music-len-top').style.width = (nowtime * 360) + 'px';
    if(nowtime===1){
      this.next()
    }
  },

  volchange: function(e) {
    console.log(e)
    var w = e.offsetX;
    $(".volume-len-top").style.width = parseInt(w) + 'px';
    mPlayer.volume = w / 60;
  },

  liststylechange: function() {
    document.querySelectorAll('li span').forEach(function(span){
      span.style.color = null;
    })
    document.querySelectorAll('li')[index].childNodes.forEach(function(span){
      span.style.color = '#e9ca93'
    })
  },

  infochange: function(song) {
    msinger.innerHTML = song.singername;
    mname.innerHTML =  song.songname;
    mpic.setAttribute('src', song.albumpic_big)
  }


};

var app = new Player()
