import sde from '../../frontend/src/generated-data/sde.json' // no assert is ok in netlify
// import sde from '../../frontend/src/generated-data/sde.json' assert {type:'json'} // assert breaks netlify prod

export async function handler (event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ sde })
  }
}
