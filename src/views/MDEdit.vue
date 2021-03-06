<template lang="pug">
#mdeditor(@keyup.esc="keyup_esc" tabindex="0")
  v-toolbar#mdeditor-tb(light color="white" flat)
    v-toolbar-title md.edit
    v-toolbar-items
      v-btn(icon @click="back")
        v-icon chevron_left
      v-btn(icon :loading="status.saving" :disabled="!savable || !changed || cloud_working" @click="cloudsave()")
        v-icon save
      v-btn(icon :loading="status.getting" :disabled="not_saved || cloud_working" @click="cloudget()")
        v-icon cloud_download
      v-btn(icon @click.stop="star(!document.starred)" :disabled="not_saved")
        v-icon(:color="document.starred ? 'blue' : 'grey'") star

      v-btn(icon @click="copy_text_to")
        v-icon file_copy

    v-toolbar-items
      .statuslabel
        .text {{ statustext }}

    v-spacer
    v-toolbar-items
      v-btn(icon :loading="status.deleting" :disabled="not_saved || cloud_working" @click="clouddelete()")
        v-icon(color="red") delete
  #mdeditor-docdata
    .id ID: {{ this.document.document_id }}
    .created_at 作成: {{ times.created_at ? times.created_at.toLocaleString() : '-' }}
    .updated_at 更新: {{ times.updated_at ? times.updated_at.toLocaleString() : '-' }}
  #mdeditor-content
    Editor(:document="document" :status="status" @editor-keypress="editor_keypress" @status_event="status_receive")
    Previewer(:document="document" @status_event="status_receive")
</template>

<script lang="ts">

import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import Editor from '../components/Editor.vue';
import Previewer from '../components/Previewer.vue';
import { MDDocument, MDCloudStatus } from '@/struct/mddocument';
import { sprintf } from 'sprintf-js';

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
  statustext: string = ""
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

  keyup_esc(event: Event) {
    console.log(event)
    this.back()
  }

  copy_text_to() {
    try {
      const nav: any = navigator
      nav.clipboard.writeText(this.document.text)
      this.statustext = "text copied."
    } catch(e) {
      console.error(e)
      this.$emit("snackon", { text: "failed to copy text", cssclass: "red" })
    }
  }

  setdocument() {
    console.log(this.document_id)
    this.statustext = ""
    this.document.clear()
    if (!this.document_id || this.document_id === "_new") {
      const id = MDDocument.payout_id()
      this.$router.replace(`/md/${id}`)
    } else {
      this.document.switch(this.document_id)
      this.cloudget(true)
    }
  }

  async star(on: boolean) {
    await this.document.star(on)
    this.statustext = `star ${on ? "on" : "off"}.`
  }

  async cloudsave() {
    if (!this.savable || !this.changed || this.cloud_working) { return }
    try {
      this.statustext = "saving..."
      this.status.saving = true
      const result = await this.document.save()
      this.anchor.title = this.document.title
      this.anchor.text = this.document.text
      this.times.created_at = this.document.created_at
      this.times.updated_at = this.document.updated_at
      const t = new Date()
      this.statustext = sprintf("saved(%02d:%02d:%02d).", t.getHours(), t.getMinutes(), t.getSeconds())
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
      this.statustext = "loading..."
      this.status.getting = true
      const exists = await this.document.get()
      this.anchor.title = this.document.title
      this.anchor.text = this.document.text
      this.times.created_at = this.document.created_at
      this.times.updated_at = this.document.updated_at
      if (!no_motion) {
        this.$emit("snackon", { text: "loaded.", })
      }
      const t = new Date()
      this.statustext = sprintf("%s(%02d:%02d:%02d).", exists ? "loaded" : "generated", t.getHours(), t.getMinutes(), t.getSeconds())
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

  activated() {
    window.addEventListener("keyup", this.mkeyup)
  }

  deactivated() {
    window.removeEventListener("keyup", this.mkeyup)
  }

  mkeyup(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.back()
    }
  }

  status_receive(event: { text: string }) {
    this.statustext = event.text
  }
}
</script>

<style scoped lang="stylus">
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

      .statuslabel
        display flex
        flex-direction column
        justify-content center

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
