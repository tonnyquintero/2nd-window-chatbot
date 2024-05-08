const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require("dotenv").config()
const path = require("path")
const fs = require("fs")
const chat = require("./chatgpt")
const { handlerAI } = require('./whisper')

const menuPath = path.join(__dirname, "mensajes", "menu.txt")
const menu = fs.readFileSync(menuPath, "utf8")

const pathConsultas = path.join(__dirname, "mensajes", "promptConsultas.txt")
const promptConsultas = fs.readFileSync(pathConsultas, "utf8")

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
// const MockAdapter = require('@bot-whatsapp/database/mock')
const MongoAdapter = require('@bot-whatsapp/database/mongo')


const flowConsultas = addKeyword(EVENTS.WELCOME)
    .addAnswer('Hola Bienvenido a tu restaurante 😋', {
        media: 'https://www.sus-medicos.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2FmenuRestaurante.2e9ef668.png&w=1080&q=75',
    })
    .addAnswer("En que te podemos ayudar?", { capture: true }, async (ctx, ctxFn) => {
        const prompt = promptConsultas
        const consulta = ctx.body
        const answer = await chat(prompt, consulta)
        await ctxFn.flowDynamic(answer.content)
    })



const flowVoice = addKeyword(EVENTS.VOICE_NOTE).addAnswer ('Procesando nota de voz...', null, async(ctx, ctxFn) => {
    const text = await handlerAI(ctx)
    const prompt = promptConsultas
    const consulta = text
    const answer = await chat(prompt, consulta)
    await ctxFn.flowDynamic(answer.content)

})







const main = async () => {
    const adapterDB = new MongoAdapter({
        dbUri: process.env.MONGO_KEY,
        dbName: 'windows-chat-bot-3new'
    })
    const adapterFlow = createFlow([flowConsultas, flowVoice])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
