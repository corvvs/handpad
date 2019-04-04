<template lang="pug">
#app
  template(v-if="authorized")
    v-navigation-drawer(permanent app light mini-variant)
      v-btn(icon large @click="go('/md')")
        v-icon library_books

      .vertical-spacer
      v-btn(icon large @click="logout" :disabled="signing_out" :loading="signing_out")
        v-icon eject

    v-content.content
      keep-alive
        router-view(v-on:snackon="pop_snackbar")
  template(v-else-if="authorized_determined")
    Authorize(:authorized="!!authorized" v-on:snackon="pop_snackbar")

  v-snackbar.snackbar(v-model="snackbar.on" :timeout="snackbar.timeout" multi-line=true :color="snackbar.cssclass" bottom)
    = "{{ snackbar.text }}"
    v-btn(dark flat @click="snackbar.on = false") 閉じる
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import firebase, { firestore, auth } from "firebase";
import Authorize from '@/views/Authorize.vue';
// const provider = new firebase.auth.GoogleAuthProvider()

@Component({
  components: {
    Authorize
  }
})
export default class App extends Vue {
  text: string = ""

  authorized = !!firebase.auth().currentUser
  private auth_unsubscriber?: firebase.Unsubscribe
  authorized_determined = false
  private signing_out = false

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

  async logout() {
    if (this.signing_out) { return }
    if (!confirm("ログアウトします")) { return }
    try {
      this.signing_out = true
      await firebase.auth().signOut()
      this.pop_snackbar({ text: "signed out" })
    } catch(e) {
      this.pop_snackbar({ text: "failed", cssclass: "red" })
      console.error(e)
    }
    this.signing_out = false
  }

  mounted() {
    this.auth_unsubscriber =  firebase.auth().onAuthStateChanged(user => {
      this.authorized = !!user
      this.authorized_determined = true
    }, console.error)
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

  .vertical-spacer
    height 40px
</style>
