import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin'
import * as F from './func'
admin.initializeApp()
const db = admin.firestore()

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// exports.migrate_docs = F.func_def(async (req, res) => {
//   const user_id = "R3fCAKjyQ0f6puMST0YF9qgfRmq1"
//   const docs = await db.collection("testdoc").get()
//   const batch = db.batch()
//   docs.docs.forEach(d => {
//     const dref = db.collection("users").doc(user_id).collection("mddocs").doc(d.id)
//     batch.create(dref, d.data())
//   })
//   return res.send({ data: await batch.commit() })
// })

exports.modified_mddocs = functions.firestore
  .document('users/{user_id}/mddocs/{mddoc_id}')
  .onWrite((change, context) => {
    const mh_id = `${context.params["user_id"]}__${context.params["mddoc_id"]}`
    if (change.after.exists) {
      // not deleted
      const arg: any = change.after.data()
      arg.original_path = change.after.ref.path
      arg.user_id = context.params["user_id"]
      arg.mh_id = mh_id
      return db.collection("mddoc_heads").doc(mh_id).set(arg)
    } else {
      // deleted
      return db.collection("mddoc_heads").doc(mh_id).delete()
    }
  })