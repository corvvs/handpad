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

exports.migrate_docs = F.func_def(async (req, res) => {
  const user_id = "R3fCAKjyQ0f6puMST0YF9qgfRmq1"
  const docs = await db.collection("testdoc").get()
  const batch = db.batch()
  docs.docs.forEach(d => {
    const dref = db.collection("users").doc(user_id).collection("mddocs").doc(d.id)
    batch.create(dref, d.data())
  })
  return res.send({ data: await batch.commit() })
})
