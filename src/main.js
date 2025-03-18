const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Load the dialog tree
const conversationTree = JSON.parse(fs.readFileSync('./trees/dialog_tree.json', 'utf8'));
// Load the user states
const userStates = {};
// Número del representante con código de país

const representanteId = "5491137658523@c.us";

// Create a new client instance
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'EmmaBot' }),
    puppeteer: { headless: false }
});

// When the client received QR-Code
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Client is ready!');
});

// Listening to all incoming messages
client.on('message_create', async message => {
    try {
        const chatId = message.from;
        let text = message.body ? message.body.trim() : '';

        // Validar si el texto es solo una cadena de caracteres
        if (validarTexto(text)) {
            text = message.body.trim();
        } else {
            text = '';
        }

        // Variables para controlar el flujo de la conversación
        let inichat = false;
        let noValid = '';

        console.log(`Received message from ${chatId}: ${text}`);

        if (!chatId.includes('5551642209')) {
            return;
        }

        if (!userStates[chatId]) {
            userStates[chatId] = "inicio";
            inichat = true;
        } else {
            inichat = false;
        }

        if (text) {
            console.log('Nodo Actual: ' + userStates[chatId]);
            console.log(`[${chatId}] -> "${text}"`);
            console.log('-----------------------------------');
        } else {
            console.log('Message body is empty or null');
        }

        const currentNode = conversationTree[userStates[chatId]];

        if (currentNode) {
            if (currentNode.representante) {
                return;
            }

            if (currentNode.final) {
                delete userStates[chatId]; // Reiniciar conversación después de un nodo final
                return;
            }

            if (currentNode.siguientes) {
                if (currentNode.siguientes[text]) {
                    if (conversationTree[currentNode.siguientes[text]]) {
                        if (!inichat) userStates[chatId] = currentNode.siguientes[text];
                    } else {
                        noValid = 'Lo siento, ha ocurrido un error';
                    }
                } else {
                    if (userStates[chatId] !== "inicio") {
                        noValid = 'Opción no válida, por favor intenta de nuevo';
                    } else if ((userStates[chatId] === "inicio" && !inichat)) {
                        noValid = 'Opción no válida, por favor intenta de nuevo';
                    }
                }
            }
        }

        const newNode = conversationTree[userStates[chatId]];

        if (newNode.representante) {
            await client.sendMessage(representanteId, `📢 *Nueva solicitud de atención* 📢\n\nEnlace: https://wa.me/${chatId.replace('@c.us', '')}\nMensaje: "${text}"`);
        }

        let response = (noValid !== '' ?
            `\`\`\`${noValid}\`\`\`\n\n*${newNode.mensaje}*\n` :
            `*${newNode.mensaje}*\n`
        );

        if (newNode.opciones) {
            for (const [key, value] of Object.entries(newNode.opciones)) {
                response += `\n${key}. ${value}`;
            }
        }

        await message.reply(response);
    } catch (error) {
        console.error('Error processing message:', error);
    }
});


// Listen for messages from the representative
client.on('message_create', async message => {
    if (message.from === representanteId) {
        const text = message.body.trim().toLowerCase();

        // Check if the message contains "adios" or "hasta luego"
        if (text.startsWith('adios') || text.startsWith('hasta luego')) {
            const chatIdToReset = message.to;
            if (userStates[chatIdToReset]) {
                await client.sendMessage(chatIdToReset, 'Gracias por contactarnos. Por favor, déjanos una reseña en el siguiente enlace: [enlace de reseñas]');
                delete userStates[chatIdToReset];
                await message.reply(`Se ha finalizado la conversación.`);
            }
        }
    }
});


// Start your client
client.initialize();

function validarTexto(text) {
    // Validar si el texto es un contacto
    if (text.includes('BEGIN:VCARD') || text.includes('END:VCARD'))
        return false;

    return true;
}