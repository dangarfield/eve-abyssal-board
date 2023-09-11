// import sde from '../../frontend/src/generated-data/sde.json' // assert breaks netlify prod, but is required in heroku
import sde from '../../frontend/src/generated-data/sde.json' assert {type:'json'} // assert breaks netlify prod, but is required in heroku

export async function handler (event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ sde })
  }
}
