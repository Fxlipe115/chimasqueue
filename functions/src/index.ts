import * as functions from 'firebase-functions'
import * as Payload from "slack-payload"
import {SlackPayload} from './localDefinitions'
import Chimas from './Chimas/Chimas'
import FirebaseChimas from './Chimas/FirebaseChimas'


const chimas = new Chimas()
const firebaseChimas = new FirebaseChimas()

const amargoInMemory = functions.https.onRequest((request, reply) => {
    reply.write(JSON.stringify({response_type: "in_channel"}))
    const payload =request.body as SlackPayload
    const action = payload.text
    const response = chimas.execute(action, payload)
    logInputOutput(payload,response)
    reply.send(response)
})

const amargo = functions.https.onRequest((request, reply) => {
    const payload = request.body as SlackPayload
    const action = payload.text
    firebaseChimas.execute(action,payload)
    .then(response=>{
        const slackResponse = {
            response_type: "in_channel",
            text: response
        }
        logInputOutput(payload,response)
        reply.send(slackResponse)
    })
    .catch(error=>{
        console.log(error)
        reply.send(error)
    })
})

const amargoBeta = functions.https.onRequest((request, reply) => {
    reply.status(200)
    reply.setHeader('Content-type','application/json')
    reply.write(JSON.stringify({response_type: "in_channel"}))
    const payload = request.body as SlackPayload
    const action = payload.text
    firebaseChimas.execute(action,payload)
    .then(response=>{
        const slackResponse = {
            response_type: "in_channel",
            text: response
        }
        logInputOutput(payload,response)
        reply.write(JSON.stringify(slackResponse))
        reply.end()
    })
    .catch(error=>{
        console.log(error)
        reply.send(error)
    })
})

const ping = functions.https.onRequest((request, reply) => {
    const payload = new Payload(request.body) as SlackPayload
    reply.send(JSON.stringify(payload))
})

function logInputOutput(payload: SlackPayload, response: string) {
    console.log("-----------------------------")
    console.log("Request: "+JSON.stringify(payload))
    console.log("-----------------------------")
    console.log("Response: "+response)
    console.log("-----------------------------")
}


export { amargo, amargoBeta, amargoInMemory, ping }