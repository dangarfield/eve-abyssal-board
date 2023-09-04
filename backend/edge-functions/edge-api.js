// Test for switching to edge functions

import { MongoClient } from 'https://deno.land/x/mongo/mod.ts'

// const client = new MongoClient(Netlify.env.get('MONGO_URI'), {
//     serverApi: {
//       version: '1',
//       strict: false, // Must be false to use distinct
//       deprecationErrors: true
//     }
//   })

// const client: MongoClient = new MongoClient();
// await client.connect(dbUri);
// console.log('? Connected to MongoDB Successfully');

// export const db = client.database(dbName);

// export const configCollection = db.collection('config')

export default async (req, context) => {
  let route = req.url.split('edge-api')[1]
  if (route === '') route = '/'
  console.log('edge-api', req, context, route)
  return Response.json({ route })
}

export const config = { path: '/edge-api*' }
