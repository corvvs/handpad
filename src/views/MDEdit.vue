<template lang="pug">
#mdeditor
  v-toolbar#mdeditor-tb(light color="white" flat)
    v-toolbar-title md.edit
    v-toolbar-items
      v-btn(icon @click="back")
        v-icon chevron_left
      v-btn(icon :loading="status.saving" :disabled="!savable || !changed || cloud_working" @click="cloudsave()")
        v-icon save
      v-btn(icon :loading="status.getting" :disabled="not_saved || cloud_working" @click="cloudget()")
        v-icon cloud_download
      v-btn(icon @click.stop="document.star(!document.starred)" :disabled="not_saved")
        v-icon(:color="document.starred ? 'blue' : 'grey'") star
    v-toolbar-items
      v-btn(icon :loading="status.deleting" :disabled="not_saved || cloud_working" @click="clouddelete()")
        v-icon(color="red") delete
  #mdeditor-docdata
    .id ID: {{ this.document.document_id }}
    .created_at 作成: {{ times.created_at ? times.created_at.toLocaleString() : '-' }}
    .updated_at 更新: {{ times.updated_at ? times.updated_at.toLocaleString() : '-' }}
  #mdeditor-content
    Editor(:document="document" :status="status" @editor-keypress="editor_keypress")
    Previewer(:document="document")
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Editor from '../components/Editor.vue';
import Previewer from '../components/Previewer.vue';
import { MDDocument, MDCloudStatus } from '@/struct/mddocument';

@Component({
  components: {
    Editor, Previewer,
  },
})
export default class MDEdit extends Vue {
  @Prop() public document_id!: string
  document: MDDocument = MDDocument.blank("")
  status: MDCloudStatus = {
    saving: false,
    getting: false, 
    deleting: false,
  }
  times: {
    created_at?: Date
    updated_at?: Date
  } = {
    created_at: undefined,
    updated_at: undefined,
  }
  private anchor = {
    title: "", text: "",
  }

  get savable() {
    return !!(this.document.title || "").trim()
  }

  get not_saved() {
    return !this.times.created_at
  }

  get changed() {
    return this.document.title != this.anchor.title || this.document.text != this.anchor.text
  }

  get cloud_working() {
    return this.status.saving || this.status.getting
  }

  @Watch('document_id')
  switched_document(to: string, from: string) {
    if (to === from) { return }
    this.setdocument()
  }

  setdocument() {
    console.log(this.document_id)
    if (!this.document_id || this.document_id === "_new") {
      this.document.clear()
      const id = MDDocument.payout_id()
      this.$router.replace(`/md/${id}`)
    } else {
      this.document.switch(this.document_id)
      this.cloudget(true)
    }
  }

  async cloudsave() {
    if (!this.savable || !this.changed || this.cloud_working) { return }
    try {
      this.status.saving = true
      const result = await this.document.save()
      this.anchor.title = this.document.title
      this.anchor.text = this.document.text
      this.times.created_at = this.document.created_at
      this.times.updated_at = this.document.updated_at
      this.$emit("snackon", { text: "saved.", })
    } catch(e) {
      this.$emit("snackon", { text: "Error!!", color: "red info" })
      console.error(e)
    }
    this.status.saving = false
  }

  async cloudget(no_motion: boolean = false) {
    if (this.cloud_working) { return }
    try {
      if (!no_motion && !confirm("クラウドの保存内容を取得します\n(編集内容が破棄される可能性があります)")) { return }
      this.status.getting = true
      await this.document.get()
      this.anchor.title = this.document.title
      this.anchor.text = this.document.text
      this.times.created_at = this.document.created_at
      this.times.updated_at = this.document.updated_at
      if (!no_motion) {
        this.$emit("snackon", { text: "loaded.", })
      }
    } catch(e) {
      this.$emit("snackon", { text: "Error!!", color: "red info" })
      console.error(e)
    }
    this.status.getting = false
  }

  async clouddelete() {
    if (this.cloud_working) { return }
    try {
      if (!confirm("クラウドからドキュメントを削除します(取り消せません)")) { return }
      this.status.deleting = true
      await MDDocument.delete(this.document_id)
      this.$emit("snackon", { text: "deleted.", })
      this.back()
    } catch(e) {
      this.$emit("snackon", { text: "Error!!", color: "red info" })
      console.error(e)
    }
    this.status.deleting = false
  }

  back() {
    if (this.changed) {
      if (!confirm("編集内容は保存されません")) { return }
    }
    this.go('/md')
  }

  go(path: string) { this.$router.push(path) }

  editor_keypress(payload: { action: string }) {
    switch (payload.action) {
    case "cloudsave":
      this.cloudsave()
      break
    case "back":
      this.back()
      break
    case "text-replace":
      const r: any = payload
      if (typeof r.s === "number" && typeof r.e === "number" && typeof r.text === "string") {
        this.document.text = this.document.text.substring(0,r.s) + r.text + this.document.text.substring(r.e)
      }
      break
    }
  }

  mounted() {
    this.setdocument()
  }
}
</script>

<style lang="stylus">
  #mdeditor
    height 100%
    margin 0
    display flex
    flex-direction column
    flex-wrap wrap

    #mdeditor-tb
      flex-grow 0
      flex-shrink 0
      flex-basis auto

    #mdeditor-docdata
      flex-grow 0
      flex-shrink 0
      background-color white
      display flex
      flex-direction row
      font-size smaller
      align-items center
      flex-basis 2em
      > * 
        padding 2px
        flex-grow 0
        flex-shrink 0
        &:not(:first-child)
          margin-left 10px
        
    #mdeditor-content
      flex-grow 1
      flex-shrink 1
      display flex
      flex-direction row
      #editor, #previewer
        flex-basis 50%
</style>
