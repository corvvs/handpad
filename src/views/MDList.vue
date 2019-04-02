<template lang="pug">
#mdlist
  v-toolbar#mdlist-tb(light color="white" flat)
    v-toolbar-title mdlist
    v-btn(icon @click="go('/md/_new')")
      v-icon add_box

  #mdlist-content
  
    v-list
      v-list-tile(v-for="d in docs" :key="d.document_id" @click="go(`/md/${d.document_id}`)")
        .time {{ d.created_at.toLocaleString() }}
        v-list-tile-content
          v-list-tile-title 
            = "{{ d.title }}"
</template>

<script lang="ts">
import firebase, { firestore, functions } from "firebase";
import { Component, Prop, Vue } from 'vue-property-decorator';
import { MDDocument } from '../struct/mddocument'

@Component
export default class MDList extends Vue {
  docs: MDDocument[] = []
  private working = false
  private query_snapshot_unsubscriber!: () => void

  async find() {
    if (this.working) { return }
    try {
      this.working = true
      const docs = await MDDocument.find_heads()
      docs.forEach(d => this.docs.push(d)) 
      this.query_snapshot_unsubscriber = MDDocument.observe_heads(change => {
        console.log(change, change.doc.data())
        const doc = change.doc
        switch (change.type) {
        case "added":
        case "modified":
          (() => {
            const i = this.docs.findIndex(d => d.document_id === doc.id)
            if (0 <= i) {
              this.docs.splice(i,1,MDDocument.deserialize(doc))
            } else {
              this.docs.splice(0,0,MDDocument.deserialize(doc))
            }
          })()
          break
        case "removed":
          (() => {
            const i = this.docs.findIndex(d => d.document_id === doc.id)
            if (0 <= i) {
              this.docs.splice(i,1)
            }
          })()
          break
        }
      })
    } catch(e) {
      console.error(e)
    }
    this.working = false
  }

  go(path: string) { this.$router.push(path) }

  mounted() {
    this.find()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
@import "../assets/common"

#mdlist
  display flex
  flex-direction column
  height 100%

  #mdlist-tb
    flex-grow 0
    flex-shrink 0
  #mdlist-content
    flex-grow 1
    flex-shrink 1

    .time
      font-size smaller
      width 11em
      text-align left
</style>
