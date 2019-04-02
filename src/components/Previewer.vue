<template lang="pug">
#previewer
  #main_viewer(v-html="htmldoc")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Marked } from 'marked-ts'
import { MDDocument, MDCloudStatus } from '@/struct/mddocument';

@Component
export default class Previewer extends Vue {
  @Prop() document!: MDDocument

  get htmldoc(): string {
    return Marked.parse(this.document.text)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
#previewer
  display flex
  flex-direction column
  #main_viewer
    overflow scroll
    text-align left
    padding 4px
    flex-grow 1
    background-color #eee
</style>

<style lang="stylus">
@import "../assets/common"
#previewer
  #main_viewer

    font-size 14px
    p, ul, ol, dl, li, blockquote
      margin 0
    p
      margin 0.8em 0
    li p
      margin 0

    h1
      border-bottom 2px solid
    h2
      border-bottom 1px solid
    h3
      border-bottom 1px dashed
    
    blockquote
      padding 0.8em
      border-left 4px solid #ccc
    ul
      padding-left 1.5em
    li
      margin 0.5em 0
    code
      background-color cb-bg-color
      color cb-text-color
      padding 2px 4px
      margin 0 2px
      font-family cd-font-family
    pre
      background-color cb-bg-color
      color cb-text-color
      padding 2px 4px
      margin 0 2px

</style>