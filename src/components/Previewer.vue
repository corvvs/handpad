<template lang="pug">
#previewer
  #main_viewer(v-html="htmldoc")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Marked, MarkedOptions } from 'marked-ts'
import { MDDocument, MDCloudStatus } from '@/struct/mddocument';

@Component
export default class Previewer extends Vue {
  @Prop() document!: MDDocument

  get htmldoc(): string {
    const option = new MarkedOptions()
    option.gfm = true
    option.breaks = true
    return Marked.parse(this.document.text, option)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
#previewer
  display flex
  flex-direction column
  #main_viewer
    letter-spacing 0.08em
    overflow scroll
    text-align left
    padding 8px
    flex-grow 1
    flex-shrink 1
    flex-basis 0
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
      margin-bottom 16px
    h2
      border-bottom 1px solid
      margin-bottom 12px
    h3
      border-bottom 1px dashed
      margin-bottom 8px
    
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
      padding 1px
      margin 0 2px
      font-weight normal
      font-family cd-font-family
      border-radius 0
      box-shadow none
    pre
      background-color cb-bg-color
      color cb-text-color
      padding 2px 4px
      margin 0 2px

</style>