<template>
    <el-card>
        <!-- 面包屑 -->
        <my-bread slot="header">
            <template slot="title">发布文章</template>
        </my-bread>
        <!-- 表单元素 -->
        <el-form ref="publishForm" :model="formData" :rules="publishRules" style="margin-left:50px" label-width="100px">
            <el-form-item prop="title" label="标题">
                <el-input v-model="formData.title" style="width:65%"></el-input>
            </el-form-item>
            <el-form-item prop="content"  label="内容">
                <quill-editor  style="height:400px;" v-model="formData.content" type="textarea" :rows="4"></quill-editor>
            </el-form-item>
            <el-form-item prop="type" label="封面" style="margin-top:140px">
                <el-radio-group @change="changeType" v-model="formData.cover.type">
                    <el-radio :label="1">单图</el-radio>
                    <el-radio :label="3">三图</el-radio>
                    <el-radio :label="0">无图</el-radio>
                    <el-radio :label="-1">自动</el-radio>
                </el-radio-group>
            </el-form-item>
               <!-- 放置一个封面组件  父组件  => 子组件 props -->
          <C-image @CoverOneImg="PubImg" :list="formData.cover.images"></C-image>
            <el-form-item prop="channel_id" label="频道">
                <el-select v-model="formData.channel_id">
                    <!-- 循环生成文章列表数据 -->
                    <el-option  v-for="item in channels" :key="item.id" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item>
                <!-- @事件名="方法" =>有默认参数 => 方法()  => 方法() =>一个参数都没有 -->
                <el-button @click="publishArticle()" type="primary">发布</el-button>
                <el-button @click="publishArticle(true)">存入草稿</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script>
export default {
  data () {
    return {
      channels: [], // 定义一个channels 接收频道数据
      formData: {
        title: '', // 标题
        content: '', // 文章内容
        cover: {
          type: 0, //   封面类型 -1:自动，0-无图，1-1张，3-3张
          images: [] //  存储图片的地址
        },
        channel_id: null // 频道id
      },
      publishRules: {
        title: [{
          required: true, message: '标题内容不能为空'
        }, {
          min: 5, max: 30, message: '标题长度需要在5到30字符之间'
        }],
        content: [{
          required: true, message: '文章内容不能为空'
        }],
        channel_id: [{
          required: true, message: '频道分类不能为空'
        }]
      }
    }
  },
  watch: {
    $route: function (to, from) {
      if (Object.keys(to.params).length) {
        //  有参数  => 修改
      } else {
        // 没有参数  => 发布 // 没有参数  => 发布
        this.formData = {
          title: '', // 标题
          content: '', // 文章内容
          cover: {
            type: 0, //   封面类型 -1:自动，0-无图，1-1张，3-3张
            images: [] // 存储的图片的地址
          }
        }
      }
    }
    // 'formData.cover.type': function () {
    //   //  this指向组件实例
    //   // if (this.formData.cover.type === 0 || this.formData.cover.type === -1) {
    //   //   // 无图或者自动模式
    //   //   this.formData.cover.images = []
    //   // } else if (this.formData.cover.type === 1) {
    //   //   this.formData.cover.images = [''] // 单图模式
    //   // } else if (this.formData.cover.type === 3) {
    //   //   this.formData.cover.images = ['', '', ''] // 单图模式
    //   // }
    // }
  },
  methods: {
    // 接收传过来的值，修改图片
    PubImg (img, index) {
      this.formData.cover.images = this.formData.cover.images.map((item, i) => i === index ? img : item)
    },
    // 切换类型时触发  该方法 只有点击切换时才会触发
    changeType () {
      // alert(1)
      if (this.formData.cover.type === 0 || this.formData.cover.type === -1) {
        // 无图或者自动模式
        this.formData.cover.images = []
      } else if (this.formData.cover.type === 1) {
        this.formData.cover.images = [''] // 单图模式
      } else if (this.formData.cover.type === 3) {
        this.formData.cover.images = ['', '', ''] // 单图模式
      }
    },
    // 发布文章
    publishArticle (draft) {
      this.$refs.publishForm.validate((isOK) => {
        if (isOK) {
          let { arId } = this.$route.params // 回去动态路由参数 articleId已经是字符串
          this.$axios({
            method: arId ? 'put' : 'post',
            url: arId ? `/articles/${arId}` : `/articles`,
            params: { draft }, // query参数
            data: this.formData
          }).then(result => {
            this.$router.push('/home/articles') // 回到内容列表
          })
          // if (articleId) {
          //   // 修改文章
          //   this.$axios({
          //     method: 'put',
          //     url: `/articles/${articleId}`,
          //     params: { draft }, // query参数
          //     data: this.formData
          //   }).then(() => {
          //   // 新增成功 => 应该去内容列表
          //     this.$router.push('/home/articles') // 回到内容列表
          //   })
          // } else {
          // // 可以去进行 发布接口调用
          //   this.$axios({
          //     url: '/articles',
          //     method: 'post',
          //     params: { draft }, // query参数
          //     data: this.formData
          //   }).then(() => {
          //   // 新增成功 => 应该去内容列表
          //     this.$router.push('/home/articles') // 回到内容列表
          //   })
          // }
        }
      })
    },
    //   获取频道数据
    async  getChannels () {
      let result = await this.$axios({
        url: '/channels'
      })
      this.channels = result.data.channels // 获取文章列表
    },
    // 获取文章详情通过id
    async   getArticleById (arId) {
      let result = await this.$axios({
        url: `/articles/${arId}`
      })
      this.formData = result.data // 将指定文章数据给data数据
    }
  },
  created () {
    this.getChannels() // 获取文章列表
    // 获取id 判断有无di 有id 就是修改 没id就是发布
    let { arId } = this.$route.params //     回去动态路由参数 arId
    arId && this.getArticleById(arId) // 获取文章数据
  }
}
</script>

<style>

</style>
