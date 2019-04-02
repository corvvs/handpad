<template lang="pug">
#app
  v-navigation-drawer(permanent app light mini-variant)
    v-btn(icon large @click="go('/md')")
      v-icon library_books
  v-content.content
    keep-alive
      router-view(v-on:snackon="pop_snackbar")

  v-snackbar.snackbar(v-model="snackbar.on" :timeout="snackbar.timeout" multi-line=true :color="snackbar.cssclass" top)
    = "{{ snackbar.text }}"
    v-btn(dark flat @click="snackbar.on = false") 閉じる
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component({
})
export default class App extends Vue {
  text: string = ""

  snackbar: {
    on: boolean
    timeout: number
    text: string
    cssclass: string
  } = {
    on: false,
    timeout: 3000,
    text: "",
    cssclass: "",
  }

  editor_text_updated(payload: string) {
    console.log(process.env)
    this.text = payload
  }

  pop_snackbar(payload: { text: string, cssclass?: string }) {
    console.log(payload)
    this.snackbar.text = payload.text
    this.snackbar.cssclass = payload.cssclass || ""
    this.snackbar.on = true
  }

  go(path: string) {
    this.$router.push(path)
  }
}
</script>

<style lang="stylus">
*
  box-sizing border-box
html
  height 100%
body
  height 100%
  margin 0

#app
  height 100%
  margin 0
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50

  background-color #ddd
  .content, .content > *
    height 100%
</style>
