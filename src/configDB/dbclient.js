import 'dotenv/config';
import { MongoClient } from "mongodb";

class dbClient {
    constructor(){
        const queryString =`mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/?retryWrites=true&w=majority&appName=wppbotapi`;
        this.client = new MongoClient(queryString);
        this.conectarBD();
    }

    async conectarBD(){
        try {
            await this.client.connect();
            this.db = this.client.db('wpp_bot_db');
            console.log("Conectado al servidor de base de datos");
        } catch (e) {
            console.error("Error al conectar con el servidor de base de datos:", e.message);
        }
    }

}

export default new dbClient;