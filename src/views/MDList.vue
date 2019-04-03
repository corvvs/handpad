<template lang="pug">
#mdlist
  v-toolbar#mdlist-tb(light color="white" flat)
    v-toolbar-title md.list
    v-toolbar-items
      v-btn(icon @click="go('/md/_new')")
        v-icon add_box
    v-toolbar-items
      v-btn(icon @click="ordering.up_updated = !ordering.up_updated")
        v-icon(:color="ordering.up_updated ? 'blue' : 'grey'") timer
      v-btn(icon @click="ordering.up_star = !ordering.up_star")
        v-icon(:color="ordering.up_star ? 'blue' : 'grey'") star
      v-text-field(clearable placeholder="filter by title" v-model="title_filtering")

  #mdlist-content
  
    v-list
      template(v-if="filtered_docs.length > 0")
        v-list-tile.head
          .time(:style='ordering.up_updated ? { color: "#2196f3" } : {}')
            span.head {{ (ordering.up_updated ? '更新' : '作成') }}
          v-list-tile-action
          v-list-tile-content
            v-list-tile-title
              span.head 件名
        v-list-tile(v-for="d in filtered_docs" :key="d.document_id" @click="go(`/md/${d.document_id}`)")
          .time(:style='ordering.up_updated ? { color: "#2196f3" } : {}')
            = "{{ (ordering.up_updated ? d.updated_at : d.created_at).toLocaleString() }}"
          v-list-tile-action
            v-btn(icon @click.stop="d.star(!d.starred)")
              v-icon(:color="d.starred ? 'blue' : 'grey'") star
          v-list-tile-content
            v-list-tile-title 
              = "{{ d.title }}"
      template(v-else)
        v-list-tile
          v-list-tile-content(:style="{ 'align-items':'center' }") no document
      v-list-tile
        v-btn(:disabled="working" @click="find" flat block)
          v-icon expand_more

</template>

<script lang="ts">
import firebase, { firestore, functions } from "firebase";
import { Component, Prop, Vue } from 'vue-property-decorator';
import { MDDocument } from '../struct/mddocument';
import _ from 'underscore';

@Component
export default class MDList extends Vue {
  docs: MDDocument[] = []
  private working = false
  private query_snapshot_unsubscriber!: () => void
  private title_filtering = ""

  get tail_document_id() {
    const l = this.docs.length
    return l > 0 ? this.docs[l-1].document_id : undefined
  }

  private ordering = {
    up_star: false,
    up_updated: false,
  }

  get filtered_docs() {
    const t = (this.title_filtering || "").trim()
    let ftd = t ? this.docs.filter(d => d.title.includes(t)) : this.docs
    if (this.ordering.up_updated) {
      ftd = _(ftd).sortBy(d => d.updated_at ? -d.updated_at.getTime() : 0)
    }
    if (this.ordering.up_star) {
      ftd = _(ftd).sortBy(d => !d.starred)
    }
    return ftd
  }

  async find() {
    if (this.working) { return }
    try {
      this.working = true
      const docs = await MDDocument.find_heads(this.tail_document_id)
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

    .head
      span.head
        font-size small
        text-align left

</style>
