# Flujo del Bot de Telegram en n8n

Este documento describe cómo se creó un bot de Telegram e integró con varias herramientas usando n8n. El bot escucha mensajes de los usuarios, los procesa y ofrece respuestas inteligentes basadas en el contexto.

---

## Resumen

### Funcionalidades:
1. **Integración con Telegram**: El bot escucha mensajes y notas de voz enviados por los usuarios y responde de manera adecuada.
2. **Integración con Google Calendar y Gmail**: Permite obtener y resumir eventos de calendario o correos electrónicos no leídos según las consultas del usuario.
3. **Integración con Notion**: Recupera y actualiza datos desde una base de datos de Notion.
4. **Integración con OpenAI**: Proporciona respuestas inteligentes utilizando modelos de OpenAI, incluyendo la transcripción de mensajes de voz.
5. **Buffer de Memoria**: Mantiene el contexto de la conversación para respuestas más coherentes.

---

## Estructura del Flujo

### 1. **Disparador: Escucha de Mensajes en Telegram**
   - **Nodo**: `TelegramTrigger`
   - **Funcionalidad**: Escucha mensajes entrantes o notas de voz enviadas por los usuarios en Telegram.

### 2. **Manejo de Notas de Voz**
   - **Condición**: Verifica si el mensaje recibido contiene una nota de voz.
   - **Nodos**:
     - `If`: Comprueba si el mensaje incluye un archivo de audio.
     - `Get Voice File`: Obtiene el archivo de voz desde Telegram.
     - `Speech to Text`: Transcribe el archivo de voz a texto usando OpenAI.

### 3. **Configuración del Contexto del Mensaje**
   - **Nodo**: `Set`
   - **Función**: Configura el texto transcrito o el mensaje del usuario para ser procesado.

### 4. **Procesamiento de Mensajes**
   - **Nodo**: `OpenAI Chat Model`
   - **Función**: Usa OpenAI para generar respuestas basadas en el mensaje recibido y el contexto disponible.

### 5. **Respuesta al Usuario**
   - **Nodo**: `Telegram`
   - **Función**: Envía la respuesta generada de vuelta al usuario en Telegram.

---

## Integraciones Adicionales

### 1. **Google Calendar**
   - **Nodo**: `Google Calendar Tool`
   - **Función**: Recupera eventos de calendario según la fecha o el rango solicitado por el usuario.

### 2. **Gmail**
   - **Nodo**: `Gmail Tool`
   - **Función**: Recupera correos electrónicos no leídos de la bandeja de entrada.

### 3. **Notion**
   - **Nodo**: `Notion Tool`
   - **Función**: Recupera o actualiza información almacenada en bases de datos de Notion.

### 4. **Buffer de Memoria**
   - **Nodo**: `Window Buffer Memory`
   - **Función**: Almacena contexto de la conversación para mantener coherencia en interacciones futuras.

---

## Cómo Funciona
1. **Mensajes Entrantes**:
   - Los mensajes o notas de voz enviados al bot son detectados por el nodo `TelegramTrigger`.
2. **Procesamiento**:
   - Si es una nota de voz, se transcribe a texto.
   - El texto se envía al modelo de OpenAI para generar una respuesta.
3. **Respuesta**:
   - El bot responde al usuario a través del nodo `Telegram`.

