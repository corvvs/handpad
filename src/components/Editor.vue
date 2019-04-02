<template lang="pug">
#editor
  .tfields
    .field
      input(type="text" v-model="document.title" :disabled="cloud_working")
  .tarea
    textarea(v-model="document.text" :disabled="cloud_working")

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
