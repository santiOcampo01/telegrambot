const TelegramBot = require('node-telegram-bot-api')
const axios = require('axios')
require('dotenv').config()
// const { google } = require('googleapis')
const { Client } = require('@notionhq/client')


const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true }) // Token de Telegram
const notion = new Client({ auth: process.env.NOTION_TOKEN }) // Token de Notion

// URL del webhook de n8n
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL 


bot.on('message', async msg => {
  const chatId = msg.chat.id
  const messageText = msg.text

  console.log(`Mensaje recibido: ${messageText}`)

  try {
    await getResponseFromOllama(messageText, chatId)
  } catch (error) {
    console.error('Error al procesar el mensaje de texto:', error)
    bot.sendMessage(chatId, 'Hubo un problema al procesar tu mensaje.')
  }
})


async function getResponseFromOllama(prompt, chatId) {
  console.log(`Solicitando respuesta de Ollama para el prompt: ${prompt}`)

  const response = await axios.post(
    'http://localhost:11434/api/generate',
    {
      model: 'llama2:latest',
      prompt: prompt,
    },
    {
      responseType: 'stream',
    },
  )
  return new Promise((resolve, reject) => {
    let result = ''
    let messageId 
    response.data.on('data', async chunk => {
      try {
        const data = JSON.parse(chunk.toString())
        console.log('Fragmento recibido de Ollama:', data)

        if (data.response) {
          result += data.response

          if (!messageId) {

            const sentMessage = await bot.sendMessage(chatId, result)
            messageId = sentMessage.message_id
          } else {

            await bot.editMessageText(result, {
              chat_id: chatId,
              message_id: messageId,
            })
          }
        }

        if (data.done) {
          console.log('Respuesta completa de Ollama recibida.')
          resolve(result)
        }
      } catch (error) {
        console.error('Error al procesar el fragmento de Ollama:', error)
        reject(error)
      }
    })

    response.data.on('error', error => {
      console.error('Error en el stream de respuesta de Ollama:', error)
      reject(error)
    })
  })
}

//funcion para la conexion con notion y agregar la nota
async function addNoteToNotion(content) {
  return await notion.pages.create({
    parent: { page_id: process.env.NOTION_PAGEID }, 
    properties: {
      title: {
        title: [
          {
            text: {
              content: content,
            },
          },
        ],
      },
    },
    children: [
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: content,
              },
            },
          ],
        },
      },
    ],
  })
}

//comando de telegram para agregar la nota a notion con /nota "contenido aqui"
bot.onText(/\/nota (.+)/, async (msg, match) => {
  const chatId = msg.chat.id
  const noteContent = match[1]

  try {
    await addNoteToNotion(noteContent)
    bot.sendMessage(chatId, 'Nota agregada a Notion correctamente.')
  } catch (error) {
    console.error('Error al agregar la nota a Notion:', error)
    bot.sendMessage(chatId, 'Hubo un problema al agregar la nota a Notion.')
  }
})


// const calendar = google.calendar('v3')

// async function authenticateGoogle() {
//   const auth = new google.auth.GoogleAuth({
//     keyFile: 'credentials.json', 
//     scopes: ['https://www.googleapis.com/auth/calendar'],
//   })
//   return await auth.getClient()
// }

// async function listUpcomingEvents() {
//   const auth = await authenticateGoogle()
//   const calendar = google.calendar({ version: 'v3', auth })

//   const res = await calendar.events.list({
//     calendarId: 'primary',
//     timeMin: new Date().toISOString(),
//     maxResults: 10,
//     singleEvents: true,
//     orderBy: 'startTime',
//   })
//   const events = res.data.items
//   if (events.length) {
//     return events.map(event => `${event.start.dateTime || event.start.date} - ${event.summary}`).join('\n')
//   } else {
//     return 'No hay próximos eventos.'
//   }
// }

// // Comando para ver el calendario
// bot.onText(/\/calendario/, async msg => {
//   const chatId = msg.chat.id

//   try {
//     const events = await listUpcomingEvents()
//     bot.sendMessage(chatId, `Próximos eventos:\n${events}`)
//   } catch (error) {
//     console.error('Error al obtener eventos del calendario:', error)
//     bot.sendMessage(chatId, 'Hubo un problema al obtener los eventos del calendario.')
//   }
// })

