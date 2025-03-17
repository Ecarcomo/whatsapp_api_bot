const { Client ,LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Load the dialog tree
const conversationTree = JSON.parse(fs.readFileSync('./trees/dialog_tree.json', 'utf8'));
// Load the user states
const userStates = {}; 


// Create a new client instance
const client = new Client({
    authStrategy: new LocalAuth({ clientId: 'EmmaBot' }),
    puppeteer: { headless: false }
});

// When the client received QR-Code
client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, {small: true});
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Client is ready!');
});



// Listening to all incoming messages
client.on('message',async message => {
    const   chatId = message.from;
    const   text = message.body.trim();

    // Variables para controlar el flujo de la conversación
    let     inichat = false;
    let     noValid = '';

    if (!chatId.includes('33727415')) {
        return ;
    }

    if (!userStates[chatId]) {
        userStates[chatId] = "inicio";
        inichat = true;
    }
    else {
        inichat = false;
    }

    if(text) {
        console.log('Nodo Actual: ' + userStates[chatId]);
        console.log(`[${chatId}] -> "${text}"`);
        console.log('-----------------------------------');
    }
    

    const currentNode = conversationTree[userStates[chatId]];

    if (currentNode) {
    
        if (currentNode.representante) { // Reiniciar conversación después de un nodo final
            return;
        }

        if (currentNode.final) {
            delete userStates[chatId]; // Reiniciar conversación después de un nodo final
            return;
        }
    
        if (currentNode.siguientes ) {
            if(currentNode.siguientes[text]){
                if(conversationTree[currentNode.siguientes[text]]){
                   if(!inichat) userStates[chatId] = currentNode.siguientes[text];
                }
                else {
                    noValid = 'Lo siento, ha ocurrido un error';
                }
            } 
            else {
                if(userStates[chatId] !== "inicio"){
                    noValid = 'Opción no válida, por favor intenta de nuevo';
                }
                else if((userStates[chatId] === "inicio" && !inichat)){
                    noValid = 'Opción no válida, por favor intenta de nuevo';
                }
            }
        }
    }

    

    const newNode = conversationTree[userStates[chatId]];

    let response = (    noValid!==''    ?
                        `\`\`\`${noValid}\`\`\`\n\n*${newNode.mensaje}*\n`
                        :
                        `*${newNode.mensaje}*\n`
                    );

    if (newNode.opciones) {
        for (const [key, value] of Object.entries(newNode.opciones)) {
            response += `\n${key}. ${value}`;
        }
    }

    await message.reply(response);
});

// Start your client
client.initialize();