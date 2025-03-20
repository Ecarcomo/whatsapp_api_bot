// Import the required libraries
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;



class Bot {
    constructor(nameBot,representanteId) {
        this.nameBot = nameBot;
        this.client = new Client({
            authStrategy: new LocalAuth({ clientId:  this.nameBot }),
            puppeteer: { headless: true }
        });
        this.userStates = {};
        this.representanteId = representanteId;
        this.conversationTree = JSON.parse(fs.readFileSync(`./trees/${this.nameBot}_dialog_tree.json`, 'utf8'));

        // When the client received QR-Code
        this.client.on('qr', (qr) => {
            console.log(`QR Bot:"${this.nameBot}" RECEIVED`, qr);
            qrcode.generate(qr, { small: true });
        });

        // When the client is ready, run this code (only once)
        this.client.once('ready', () => {
            console.log(`BOT ${this.nameBot} is ready!`);
        });

        // Listening to all incoming messages
        this.client.on('message_create', async message => {
            try {
                const chatId = message.from;
                let text = message.body ? message.body.trim() : '';

                // Validar si el texto es solo una cadena de caracteres
                if (this.validarTexto(text)) {
                    text = message.body.trim();
                } else {
                    text = '';
                }

                // Variables para controlar el flujo de la conversación
                let inichat = false;
                let noValid = '';

                //console.log(`Received message from ${chatId}: ${text}`);

                if (!chatId.includes('63522348') && !chatId.includes('60941390') && !chatId.includes('5551642209')) {
                    return;
                }

                if (!this.userStates[chatId]) {
                    this.userStates[chatId] = { state: "inicio", lastmsj: Date.now().toString() ,data:{}};
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
                this.userStates[chatId].lastmsj = Date.now().toString();


                const currentNode = this.conversationTree[this.userStates[chatId].state];

                // Validaciones de flujo de la conversación
                if (currentNode) {

                    if (currentNode.representante) {
                    }
                    else if (currentNode.final) {
                        delete this.userStates[chatId]; // Reiniciar conversación después de un nodo final
                    }
                    else if (currentNode.siguientes) {
                        if (currentNode.siguientes[text]) {
                            if (this.conversationTree[currentNode.siguientes[text]]) {
                                if (!inichat) this.userStates[chatId].state = currentNode.siguientes[text];
                            } else {
                                noValid = 'Lo siento, ha ocurrido un error';
                            }
                        } else {
                            if (this.userStates[chatId].state !== "inicio") {
                                noValid = 'Opción no válida, por favor intenta de nuevo';
                            } else if ((this.userStates[chatId].state === "inicio" && !inichat)) {
                                noValid = 'Opción no válida, por favor intenta de nuevo';
                            }
                        }
                    }
                }

                console.log(`BOT ->${this.nameBot} | ChatId: ${chatId} | `,this.userStates[chatId]);
                console.log('-----------------------------------');

                if (currentNode.representante || currentNode.final) {
                    return;
                }

                //Nuevo nodo de la conversación
                const newNode = this.conversationTree[this.userStates[chatId].state];
                //Si el nodo tiene representante, enviar mensaje al representante
                if (newNode.representante) {
                    await this.client.sendMessage(this.representanteId, `📢 *Nueva solicitud de atención* 📢\n\nEnlace: https://wa.me/${chatId.replace('@c.us', '')}`);
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

                await this.client.sendMessage(chatId,response);
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });


        // Listen for messages from the representative
        this.client.on('message_create', async message => {
            try {
                if (message.from === representanteId) {
                    // Check if the representative is saying goodbye
                    if (this.despedidaRepresentante(message.body)) {
                        const chatIdToReset = message.to;
                        if (this.userStates[chatIdToReset]) {
                            this.userStates[chatIdToReset].state = 'fin';
                            const msg = this.conversationTree[this.userStates[chatIdToReset].state].mensaje;
                            await this.client.sendMessage(chatIdToReset, msg);
                            delete this.userStates[chatIdToReset];
                            await this.client.sendMessage(chatIdToReset, `\`\`\`Se ha finalizado la conversación.\`\`\``);
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing representative message:', error);
            }
        });
        
        this.client.on('disconnected', (reason) => {
            console.log(`Bot ${this.nameBot} was logged out`, reason);
        });
    }

    destructor() {
        // Add destructor logic here if needed
    }

    stop(){
        this.client.logout();
        //this.client.destroy();
    }
    // Function to clean up old user states
    async cleanUpUserStates() {
        await this.client.sendMessage(chatId, `\`\`\`Se cierra la conversación por inactividad. Si necesitas ayuda, por favor vuelve a escribirnos.\`\`\``);
        const THIRTY_MINUTES = 30 * 60 * 1000;

        for (const chatId in this.userStates) {
            if (now - parseInt(this.userStates[chatId].lastmsj) > THIRTY_MINUTES) {
                delete userStates[chatId];
                console.log(`Estado del usuario ${chatId} eliminado por inactividad.`);
                await this.client.sendMessage(chatId, `\`\`\`Se cierra la conversación por inactividad. Si necesitas ayuda, por favor vuelve a escribirnos.\`\`\``);
            }
        }
    }

    // Function to check if the user is saying goodbye
    despedidaRepresentante(text) {
        const txt = text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        // Add representative farewell logic here if needed
        if (txt.startsWith('adios') || txt.includes('hasta luego') || txt.includes('chau')) {
            return true;
        }
        return false;
    }

    validarTexto(text) {
    // Validar si el texto es un contacto
    if (text.includes('BEGIN:VCARD') || text.includes('END:VCARD'))
        return false;
    return true;
    }

    // Start your client
    start(){
        this.client.initialize();
        // Set an interval to clean up old user states every hour
        setInterval(()=>this.cleanUpUserStates(), 60 * 60 * 1000);
    }

}

export default Bot;