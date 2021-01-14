const EditPage = {
  data: ()=>({
    page: null,
    content: null,
    alert: null
  }),
  template: `<div v-if="page">
    <h3>Edit {{ page.title }} <span v-show="alert" class="badge bg-success fs-6 mt-1 align-top">{{ alert }}</span></h3>
    <form @submit.prevent="savePage" class="h-100 my-3 d-flex flex-column">
      <div>
        <button class="btn btn-primary mb-3 me-2" type="submit">Save</button>
        <button class="btn btn-secondary mb-3" type="button" @click="closePage">Close</button>
      </div>
      <div class="flex-grow-1 d-flex flex-column">
        <div class="row mb-3">
          <fieldset v-if="page.path.match(/[^404 ]/)" class="col">
            <label for="path">Path</label>
            <input class="form-control" id="path" v-model="page.path"/>
          </fieldset>
          <fieldset class="col">
            <label for="title">Title</label>
            <input class="form-control" id="title" v-model="page.title"/>
          </fieldset>
        </div>
        <fieldset class="mb-3 flex-grow-1 d-flex flex-column">
          <label for="content">Content</label>
          <textarea class="form-control flex-grow-1 code pre" autocomplete="false" spellcheck="false" id="content" v-model="content"/>
        </fieldset>
      </div>
    </form>
    <button v-if="page.path.match(/[^404 ]/)" class="btn btn-danger" @click="deletePage">Delete Page</button>
  </div>`,
  methods: {
    loadContent() {
      if(!this.page.file) {
        this.content = null
        return false
      }
      fetch('./pages/'+this.page.file)
      .then(r=>r.text())
      .then(d=>{
        this.content = d
      })
    },
    savePage() {
      if(!this.page.file) {
        this.page.file = this.page.path.toLowerCase()+'.htm'
      }
      this.$ajax('?save-page', 'POST', {name:this.page.file,data:this.content})
      .then(d=>{
        this.alert = d.msg
        setTimeout(()=>{this.alert=null},5000)
        this.$root.$emit('save-meta')
      })
    },
    closePage() {
      this.page = null
      this.$root.$emit('close-page')
    },
    deletePage() {
      if(!confirm('Are you sure you want to delete this page?')) return false
      this.$ajax('?delete-page', 'DELETE', {file:this.page.file})
      .then(d=>{
        console.log(d.msg)
        this.$root.$emit('remove-page', this.page)
      })
    }
  },
  computed: {
    codeLength() {
      return (this.content ? this.content.split(/\r\n/).length : 0) + 5
    }
  },
  created() {
    this.$root.$on('edit-page', page => {
      this.page = page
      this.loadContent()
    })
    this.$root.$on('edit-file', ()=>this.page = null)
    this.$root.$on('close-page', ()=>this.page = null)
  }
}

const EditFile = {
  data: ()=>({
    file: null,
    content: null,
    alert: null
  }),
  template: `<div v-if="file">
    <h3>Edit {{ file.name }} <span v-show="alert" class="badge bg-success fs-6 mt-1 align-top">{{ alert }}</span></h3>
    <form @submit.prevent="saveFile" class="h-100 my-3 d-flex flex-column">
      <div>
        <button class="btn btn-primary mb-3 me-2" type="submit">Save</button>
        <button class="btn btn-secondary mb-3" type="button" @click="closeFile">Close</button>
      </div>
      <fieldset class="flex-grow-1 d-flex flex-column mb-3">
        <label for="content">Content</label>
        <textarea class="form-control flex-grow-1 code pre" autocomplete="false" spellcheck="false" id="content" v-model="content"/>
      </fieldset>
    </form>
  </div>`,
  methods: {
    loadContent() {
      this.$ajax('?get-file&path='+this.file.path)
      .then(d=>{
        this.content = d.data
      })
    },
    saveFile() {
      this.$ajax('?save-file', 'POST', {name:this.file.path,data:this.content})
      .then(d=>{
        this.alert = d.msg
        setTimeout(()=>{this.alert=null},5000)
      })
    },
    closeFile() {
      this.file = null
      this.$root.$emit('close-file')
    }
  },
  computed: {
    codeLength() {
      return (this.content ? this.content.split(/\r\n/).length : 0) + 5
    }
  },
  created() {
    this.$root.$on('edit-file', file => {
      this.file = file
      this.loadContent()
    })
    this.$root.$on('edit-page', ()=>this.file = null)
    this.$root.$on('close-file', ()=>this.file = null)
  }
}

const App = {
  components: {
    EditPage,
    EditFile
  },
  data: ()=>({
    pages: [],
    themeFiles: [],
    sel: null
  }),
  template: `<div class="container">
    <div class="mt-3 d-flex align-items-center">
      <h1>Jerpy</h1>
      <span class="flex-grow-1"></span>
      <a class="btn btn-primary me-2" href="./" target="_blank">View Site</a>
      <button class="btn btn-secondary" @click="logout">Logout</button>
    </div>
    <div class="my-3 d-flex gap-4">
      <div class="w-25">
        <h3>Pages</h3>
        <button class="btn btn-success mb-3" @click="addPage">Add Page</button>
        <ul class="list-group">
          <li class="list-group-item"
            v-for="(p,i) in pages"
            :key="i" @click="openPage(p)"
            :class="{active:p==sel}"
          >
            <h5>{{ p.title }}</h5>
            <pre class="m-0"><code>/{{ p.path }}</code></pre>
          </li>
        </ul>
        <hr>
        <h3>Theme</h3>
        <ul class="list-group">
          <li class="list-group-item"
            v-for="(tf,i) in themeFiles"
            :key="i" @click="openFile(tf)"
            :class="{active:tf==sel}"
          >
            <h5>{{ tf.name }}</h5>
            <pre class="m-0"><code>{{ tf.path }}</code></pre>
          </li>
        </ul>
      </div>
      <edit-file class="w-100"/>
      <edit-page class="w-100"/>
    </div>
  </div>`,
  methods: {
    getPages() {
      this.$ajax('./pages/meta.json?v='+Date.now().toString())
      .then(d=>{
        this.pages = d.slice().sort((a,b) => {
          if (a.path > b.path) return 1
          if (b.path > a.path) return -1
          return 0
        })
      })
    },
    getThemeFiles() {
      this.$ajax('?get-theme-files')
      .then(d=>{
        this.themeFiles = d
      })
    },
    addPage() {
      let page = {
        path: 'new-page',
        title: 'New Page',
        file: null
      }
      this.pages.push(page)
      this.openPage(page)
    },
    removePage(page) {
      let idx = this.pages.indexOf(page)
      this.$delete(this.pages, idx)
      this.sel = null
      this.$root.$emit('close-page')
      this.saveMeta()
    },
    openPage(page) {
      this.sel = page
      this.$root.$emit('edit-page', page)
    },
    openFile(file) {
      this.sel = file
      this.$root.$emit('edit-file', file)
    },
    saveMeta() {
      this.$ajax('?save-meta', 'POST', this.pages)
      .then(d=>{
        console.log(d.msg)
      })
    },
    logout() {
      window.location = './backend.php?logout'
    }
  },
  created() {
    this.getPages()
    this.getThemeFiles()
    this.$root.$on('close-page', ()=>{
      this.sel = null
    })
    this.$root.$on('save-meta', ()=>{
      this.saveMeta()
    })
    this.$root.$on('remove-page', (page)=>{
      this.removePage(page)
    })
  }
}

Vue.prototype.$ajax = (url, method, body) => {
  let opts = {
    headers: {
      'content-type': 'application/json'
    },
    method: method || 'get',
    body: body ? JSON.stringify(body) : null
  }
  return fetch(url, opts).then(async res=>{
    let data = await res.json()
    if(res.ok) {
      return data
    } else {
      return Promise.reject(data)
    }
  })
}

new Vue({
  render: h=>h(App)
}).$mount('#app')
