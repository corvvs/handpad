<template lang="pug">
#mdeditor
  v-toolbar#mdlist-tb(light color="white" flat)
    v-toolbar-title md.edit
    v-btn(icon @click="back")
      v-icon chevron_left
    v-btn(icon :loading="status.saving" :disabled="!changed || cloud_working" @click="cloudsave()")
      v-icon save
    v-btn(icon :loading="status.getting" :disabled="cloud_working" @click="cloudget()")
      v-icon cloud_download
  #mdeditor-docdata
    .id ID: {{ document_id }}
    .created_at 作成: {{ document.created_at || '-' }}
    .updated_at 更新: {{ document.updated_at || '-' }}
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
  document: MDDocument = MDDocument.blank()
  status: MDCloudStatus = {
    saving: false,
    getting: false,
  }
  private anchor = {
    title: "", text: "",
  }

  get not_saved(): boolean {
    return !this.document.created_at && !!this.document.text.match(/^(\s*\n)*\s*$/u)
  }

  @Watch('document_id')
  switched_document(to: string, from: string) {
    if (to === from) { return }
    this.setdocument()
  }

  setdocument() {
    console.log(this.document_id)
    if (!this.document_id || this.document_id === "_new") {
      this.document = new MDDocument()
      console.log(this.document)
      this.$router.replace(`/md/${this.document.document_id}`)
    } else {
      this.document = MDDocument.blank()
      this.cloudget(true)
    }
  }

  get changed(): boolean {
    return this.document.title != this.anchor.title || this.document.text != this.anchor.text
  }

  get cloud_working(): boolean {
    return this.status.saving || this.status.getting
  }

  async cloudsave() {
    if (!this.changed || this.cloud_working) { return }
    try {
      this.status.saving = true
      const result = await this.document.save()
      this.anchor.title = this.document.title
      this.anchor.text = this.document.text
      console.log(result, "!!!!")
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
      this.status.getting = true
      this.document = await MDDocument.get(this.document_id)
      this.anchor.title = this.document.title
      this.anchor.text = this.document.text
      if (!no_motion) {
        this.$emit("snackon", { text: "loaded.", })
      }
    } catch(e) {
      this.$emit("snackon", { text: "Error!!", color: "red info" })
      console.error(e)
    }
    this.status.getting = false
  }

  back() {
    if (this.changed) {
      if (!confirm("編集内容が破棄されます")) { return }
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

    #mdeditor-docdata
      background-color white
      display flex
      flex-direction row
      font-size smaller
      align-items center
      min-height 2em
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
