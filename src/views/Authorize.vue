<template lang="pug">
#authorize
  form
    v-card
      v-card-title 認証
      v-card-text
        v-text-field(label="user id(mail)" v-model="authparam.id")
        v-text-field(type="password" label="password" v-model="authparam.password")

        .cu {{ cu }}
      v-card-actions.actions
        v-btn(:disabled="!trimmed_authparam || authorizing" :loading="authorizing" @click="go_auth") Go

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import firebase, { firestore, auth } from "firebase";
const provider = new firebase.auth.GoogleAuthProvider()

@Component({
})
export default class Authorize extends Vue {
  @Prop() authorized!: boolean
  authparam: {
    id: string
    password: string
  } = {
    id: "",
    password: "",
  }

  private authorizing = false

  get cu() { return firebase.auth().currentUser }
  get trimmed_authparam() {
    const { id, password } = this.authparam
    const r = {
      id: (id || "").trim(),
      password: (password || "").trim(),
    }
    return (r.id && r.password) ? r : undefined
  }

  async go_auth() {
    if (this.authorizing) { return }
    if (!this.trimmed_authparam) { return }
    try {
      this.authorizing = true
      const { id, password } = this.trimmed_authparam
      const cred = await firebase.auth().signInWithEmailAndPassword(id, password)
      if (!cred.user) {
        throw { message: "authorization failed" }
      }
      this.$emit("snackon", { text: "authorization ok" })
    } catch(e) {
      console.error(e)
      this.$emit("snackon", { text: "authorization failed", color: "red info" })
    }
    this.authorizing = false
  }

  mounted() {
  }
}
</script>

<style scoped lang="stylus">
#authorize
  display flex
  flex-direction column
  justify-content center
  align-items center
  height 100%
  form
    flex-grow 0
    flex-shrink 0
    flex-basis 400px
    width 400px
</style>
