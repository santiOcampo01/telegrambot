
const readline = require('readline')
const axios = require('axios')
const http = require('http')

function startConsole() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const askQuestion = () => {
    rl.question('Pregunta al chatbot: ', async question => {
      if (question.toLowerCase() === 'exit') {
        console.log('Saliendo...')
        rl.close()
        return
      }

      try {
        // Realiza una petición al webhook del chatbot
        const response = await axios.post('https://2ff4-181-237-110-37.ngrok-free.app/webhook/webhook', {
          question: question,
        })
        console.log('Respuesta del chatbot:', response.data)
      } catch (error) {
        console.error('Error al comunicarse con el chatbot:', error.message)
      }

      askQuestion()
    })
  }

  askQuestion()
}

// Servidor HTTP para la consola
function startServer() {
  http
    .createServer(async (req, res) => {
      if (req.method === 'POST' && req.url === '/ask') {
        let body = ''
        req.on('data', chunk => {
          body += chunk.toString()
        })
        req.on('end', async () => {
          const { question } = JSON.parse(body)
          try {
            const response = await axios.post('https://2ff4-181-237-110-37.ngrok-free.app/webhook/webhook', {
              question,
            })
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ response: response.data }))
          } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Error al comunicarse con el chatbot' }))
          }
        })
      } else {
        res.writeHead(404)
        res.end()
      }
    })
    .listen(3000, () => {
      console.log('Servidor HTTP escuchando en http://localhost:3000')
    })
}

// Ejecutar las funciones
;(async () => {
  startConsole()
  startServer()
})()
