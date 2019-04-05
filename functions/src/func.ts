import * as functions from 'firebase-functions';
import * as Cors from 'cors'
const cors = Cors({origin: true})

export type APIFunc = (req: functions.Request, res: functions.Response) => any

export function func_def(func: APIFunc) { return functions.https.onRequest((req, res) => cors(req, res, async () => {
  try {
    await func(req, res)
  } catch(e) {
    console.error(e)
    res.status(500).send({ error: e })
  }
})) }

