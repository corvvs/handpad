<template lang="pug">
#editor
  .tfields
    .field
      input(type="text" v-model="document.title" :readonly="cloud_working" ref="tf"
        placeholder="document title" autocomplete="false" spellcheck="false"
        @keyup.ctrl="kup" @keydown.meta="kup" @keyup.esc.stop="kup"
      )
  .tarea
    textarea(v-model="document.text" :readonly="cloud_working" ref="ta"
      autocomplete="false" spellcheck="false"
      @keyup.ctrl="kup" @keydown.meta="kup" @keyup.esc.stop="kup"
    )

</template>

<script lang="ts">
import firebase, { firestore, functions } from "firebase";
import { Component, Prop, Vue } from 'vue-property-decorator';
import * as uuid from 'uuid'
import { MDDocument, MDCloudStatus } from '@/struct/mddocument';

@Component
export default class Editor extends Vue {
  @Prop() document!: MDDocument
  @Prop() status!: MDCloudStatus

  get cloud_working(): boolean {
    return this.status.saving || this.status.getting
  }

  kup(event: Event) {
    console.log(event)
    if (event instanceof KeyboardEvent) {
      const keyWith = {
        meta: event.metaKey,
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
      }
      switch (event.key) {
      case "Escape":
        event.preventDefault()
        this.$emit("editor-keypress", { action: "back" })
        break
      case "s":
        if (keyWith.meta || keyWith.ctrl) {
          event.preventDefault()
          this.$emit("editor-keypress", { action: "cloudsave" })
        }
        break
      case "i":
      case "b":
      case "k":
        const ta = this.$refs.ta
        console.log(ta)
        const paren = {
          b: "**", i: "*", k: "~~",
        }[event.key]
        if ((keyWith.meta || keyWith.ctrl) && (ta instanceof HTMLTextAreaElement) && paren) {
          event.preventDefault()
          const ss = ta.selectionStart, se = ta.selectionEnd
          if (typeof ss === "number" && typeof se === "number") {
            console.log({ 
              selectionStart: ss, 
              selectionEnd: se, 
              value: ta.value,
              sv: ta.value.substring(ss,se)
            })
            const s: string = ta.value
            const v = paren + s.substring(ss,se) + paren
            document.execCommand("insertText", false, v)
          }
        }
        break
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
@import "../assets/common"

#editor
  display flex
  flex-direction column
  .tfields
    flex-grow 0
    display flex
    flex-direction row
    .field
      flex-grow 1
      flex-shrink 1
      border-bottom 1px solid #888
      input[type=text]
        outline none
        background-color editor-bg-color-nofocus
        &:focus
          background-color editor-bg-color-onfocus
        font-size medium
        font-family cd-font-family
        letter-spacing 1pt
        width 100%
        height 40px
        font-size 20px
        padding 8px
        color editor-text-color
  .tarea
    flex-grow 1
    textarea
      outline none
      font-size medium
      font-family cd-font-family
      letter-spacing 1pt
      width 100%
      height 100%
      resize none
      background-color editor-bg-color-nofocus
      &:focus
        background-color editor-bg-color-onfocus
      color editor-text-color
      padding 8px
  .operations
    flex-grow 0
    display flex
    flex-direction row
</style>
