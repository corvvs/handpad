import firebase, { firestore, functions } from "firebase";
import * as uuid from 'uuid'
import { start } from 'repl';

const colname = "testdoc"

export type MDCloudStatus = {
  saving: boolean
  getting: boolean
  deleting: boolean
}

export class MDDocument {
  document_id: string
  title: string
  text: string
  starred: boolean
  created_at?: Date
  updated_at?: Date

  constructor(id?: string) {
    this.document_id = id || Date.now().toString() + "_" + uuid.v4()
    this.title = ""
    this.text = ""
    this.starred = false
  }

  static blank() { return new this("") }

  serialize(): any {
    return {
      document_id: this.document_id,
      title: this.title,
      text: this.text,
      starred: !!this.starred,
      created_at: this.created_at,
      updated_at: this.updated_at,
    }
  }

  static deserialize(doc: firestore.DocumentSnapshot) {
    const data = doc.data() || {}
    const d = new this(data.document_id)
    d.title = data.title
    d.text = data.text
    d.starred = !!data.starred
    console.log(data.created_at, data.updated_at)
    d.created_at = data.created_at && data.created_at.seconds ? new Date(data.created_at.seconds * 1000) : undefined
    d.updated_at = data.updated_at && data.updated_at.seconds ? new Date(data.updated_at.seconds * 1000) : undefined
    console.log(d)
    return d
  }

  static async get(id: string) {
    const doc = await firebase.firestore().collection(colname).doc(id).get()
    return doc.exists ? this.deserialize(doc) : new this()
  }

  static async find_heads(startAfter?: string) {
    let q = firebase.firestore().collection(colname).orderBy("created_at", "desc").limit(100)
    if (startAfter) {
      q = q.startAfter(await firebase.firestore().collection(colname).doc(startAfter).get())
    }
    return (await q.get()).docs.map(d => this.deserialize(d))
  }

  async save() {
    const od = this.serialize()
    const ts = Date.now()
    const tt = new Date(ts)
    od.created_at = od.created_at || tt
    od.updated_at = tt
    const doc = await firestore().collection(colname).doc(this.document_id).get()
    const result = await (doc.exists ? doc.ref.update(od) : doc.ref.set(od))
    console.log(result)
    this.created_at = od.created_at
    this.updated_at = od.updated_at
    return result
  }

  static delete(id: string) {
    return firestore().collection(colname).doc(id).delete()
  }

  async star(on: boolean) {
    this.starred = on
    await firestore().collection(colname).doc(this.document_id).update({ starred: on })
  }

  static observe_heads(callback: (d: firestore.DocumentChange) => void) {
    return firebase.firestore().collection(colname).orderBy("created_at", "desc")
      .limit(100)
      .onSnapshot(snapshot => snapshot.docChanges().forEach(callback))
  }
}
