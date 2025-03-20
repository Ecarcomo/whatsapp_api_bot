import Bot from './botClass.js';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3030;

app.use(bodyParser.json());
const bots = {};

//ejemplo : http://localhost:3030/startBot?nameBot=electrovision&representanteId=5491137658523@c.us
app.get('/startBot', async (req, res) => {
    try {
        const nameBot = req.query.nameBot;
        const representanteId = req.query.representanteId;
        if (!nameBot || !representanteId) {
            return res.status(400).send('Missing nameBot or representanteId');
        }
        if (bots[nameBot]) {
            return res.status(400).send('Bot already started');
        }
        const bot = new Bot(nameBot, representanteId);
        await bot.start();
        bots[nameBot] = bot;
        res.status(200).send('Bot started successfully');
    } catch (error) {
        res.status(500).send(`Error starting bot: ${error.message}`);
    }
});

app.get('/closeBot', async (req, res) => {
    try {
        const nameBot = req.query.nameBot;
        if (!nameBot) {
            return res.status(400).send('Missing nameBot');
        }
        const bot = bots[nameBot];
        if (!bot) {
            return res.status(400).send('Bot not found');
        }
        await bot.stop();
        delete bots[nameBot];
        res.status(200).send('Bot closed successfully');
    } catch (error) {
        res.status(500).send(`Error closing bot: ${error.message}`);
    }
});

app.get('/listBots', (req, res) => {
    try {
        const activeBots = Object.keys(bots);
        res.status(200).json({ activeBots });
    } catch (error) {
        res.status(500).send(`Error listing bots: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

//Instanciar el bot de electrovision con parametros de nombreBot y representanteId
//const botElectrovision = new Bot('electrovision','5491137658523@c.us');
//botElectrovision.start();

