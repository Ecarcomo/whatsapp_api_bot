const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Load the dialog tree
const conversationTree = JSON.parse(fs.readFileSync('./trees/electrovision_dialog_tree.json', 'utf8'));
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

        //console.log(`Received message from ${chatId}: ${text}`);

        if (!chatId.includes('5551642209') && !chatId.includes('60941390') && !chatId.includes('64267883')) {
            return;
        }

        if (!userStates[chatId]) {
            userStates[chatId] = { state: "inicio", lastmsj: Date.now().toString() ,data:{}};
            inichat = true;
        } else {
            inichat = false;
        }

        

        /*if (text) {
            console.log('Nodo Actual: ' + userStates[chatId].state);
            console.log(`[${chatId}] -> "${text}"`);
            console.log('-----------------------------------');
        } else {
            console.log('Message body is empty or null');
        }*/
        // Actualizar date de último mensaje
        userStates[chatId].lastmsj = Date.now().toString();


        const currentNode = conversationTree[userStates[chatId].state];

        // Validaciones de flujo de la conversación
        if (currentNode) {

            if (currentNode.representante) {
            }
            else if (currentNode.final) {
                delete userStates[chatId]; // Reiniciar conversación después de un nodo final
            }
            else if (currentNode.siguientes) {
                if (currentNode.siguientes[text]) {
                    if (conversationTree[currentNode.siguientes[text]]) {
                        if (!inichat) userStates[chatId].state = currentNode.siguientes[text];
                    } else {
                        noValid = 'Lo siento, ha ocurrido un error';
                    }
                } else {
                    if (userStates[chatId].state !== "inicio") {
                        noValid = 'Opción no válida, por favor intenta de nuevo';
                    } else if ((userStates[chatId].state === "inicio" && !inichat)) {
                        noValid = 'Opción no válida, por favor intenta de nuevo';
                    }
                }
            }
        }

        console.log(chatId,userStates[chatId]);
        console.log('-----------------------------------');

        if (currentNode.representante || currentNode.final) {
            return;
        }

        //Nuevo nodo de la conversación
        const newNode = conversationTree[userStates[chatId].state];
        //Si el nodo tiene representante, enviar mensaje al representante
        if (newNode.representante) {
            await client.sendMessage(representanteId, `📢 *Nueva solicitud de atención* 📢\n\nEnlace: https://wa.me/${chatId.replace('@c.us', '')}`);
        }

        let response = (noValid !== '' ?
            `\`\`\`${noValid}\`\`\`\n\n${newNode.mensaje}\n` :
            `${newNode.mensaje}\n`
        );

        if (newNode.opciones) {
            for (const [key, value] of Object.entries(newNode.opciones)) {
                response += `\n${key}. ${value}`;
            }
        }

        await client.sendMessage(chatId,response);
    } catch (error) {
        console.error('Error processing message:', error);
    }
});


// Listen for messages from the representative
client.on('message_create', async message => {
    try {
        if (message.from === representanteId) {
            const text = message.body.trim().toLowerCase();

            // Check if the message contains "adios" or "hasta luego"
            if (text.startsWith('adios') || text.startsWith('hasta luego')) {
                const chatIdToReset = message.to;
                if (userStates[chatIdToReset]) {
                    userStates[chatIdToReset].state = 'fin';
                    const msg = conversationTree[userStates[chatIdToReset].state].mensaje;
                    await client.sendMessage(chatIdToReset, msg);
                    delete userStates[chatIdToReset];
                    await client.sendMessage(chatIdToReset, `\`\`\`Se ha finalizado la conversación.\`\`\``);
                }
            }
        }
    } catch (error) {
        console.error('Error processing representative message:', error);
    }
});


// Function to clean up old user states
async function cleanUpUserStates() {
    const now = Date.now();
    const THIRTY_MINUTES = 30 * 60 * 1000;

    for (const chatId in userStates) {
        if (now - parseInt(userStates[chatId].lastmsj) > THIRTY_MINUTES) {
            delete userStates[chatId];
            console.log(`Estado del usuario ${chatId} eliminado por inactividad.`);
            await client.sendMessage(chatId, `\`\`\`Se cierra la conversación por inactividad. Si necesitas ayuda, por favor vuelve a escribirnos.\`\`\``);
        }
    }
}

// Set an interval to clean up old user states every hour
setInterval(cleanUpUserStates, 60 * 60 * 1000);


// Start your client
client.initialize();

function validarTexto(text) {
    // Validar si el texto es un contacto
    if (text.includes('BEGIN:VCARD') || text.includes('END:VCARD'))
        return false;

    return true;
}