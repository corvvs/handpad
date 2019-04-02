<template lang="pug">
#editor
  .tfields
    .field
      input(type="text" v-model="document.title" :readonly="cloud_working" ref="tf"
        @keyup.ctrl="kup" @keydown.meta="kup" @keyup.esc="kup"
      )
  .tarea
    textarea(v-model="document.text" :readonly="cloud_working" ref="ta"
      @keyup.ctrl="kup" @keydown.meta="kup" @keyup.esc="kup"
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
    // const ta: any = this.$refs.ta
    // console.log({ selectionStart: ta.selectionStart, selectionEnd: ta.selectionEnd })
    console.log(event)
    if (event instanceof KeyboardEvent) {
      switch (event.key) {
      case "Escape":
        event.preventDefault()
        this.$emit("editor-keypress", { action: "back" })
        break
      case "s":
        event.preventDefault()
        this.$emit("editor-keypress", { action: "cloudsave" })
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
