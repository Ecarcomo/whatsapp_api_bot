import 'dotenv/config';
import authMiddleware from './auth/authMiddleware.js';
import Bot from './botClass.js';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3030;

app.use(bodyParser.json());
const bots = {};

// Aplica el middleware de autenticación a todas las rutas
app.use(authMiddleware);

//ejemplo : http://localhost:3030/startBot?nameBot=electrovision&representanteId=5491137658523@c.us&usuariosPermitidos=5551642209&usuariosExceptuados=1137658523,1133727415
app.get('/startBot', async (req, res) => {
    try {
        const nameBot = req.query.nameBot;
        const representanteId = req.query.representanteId;
        const usuariosPermitidos = req.query.usuariosPermitidos ? req.query.usuariosPermitidos.split(',') : [];
        const usuariosExceptuados = req.query.usuariosExceptuados ? req.query.usuariosExceptuados.split(',') : [];
        if (!nameBot || !representanteId) {
            return res.status(400).send('Missing nameBot or representanteId');
        }
        if (bots[nameBot]) {
            return res.status(400).send('Bot already started');
        }
        /*Los parametros son nombre del bot , 
        el id del representante y 
        los id de los usuarios a los que se les permite interactuar con el bot(en caso de estar vacio se permite a todos)
         y los id de usuarios a los que NO se les permite interactuar con el bot*/
        const bot = new Bot(nameBot, representanteId,usuariosPermitidos,usuariosExceptuados);
        if(!await bot.start()){
            console.log('Starting bot aborted');
            return res.status(400).send('Starting bot aborted');
        }
        bots[nameBot] = bot;
        res.status(200).send('Bot started successfully');
    } catch (error) {
        res.status(500).send(`Error starting bot: ${error.message}`);
    }
});

//ejemplo : http://localhost:3030/stopBot?nameBot=electrovision
app.get('/stopBot', async (req, res) => {
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
        console.log('Bot stopped successfully');
        res.status(200).send('Bot stopped successfully');
    } catch (error) {
        res.status(500).send(`Error stopping bot: ${error.message}`);
    }
});

//ejemplo : http://localhost:3030/deleteBot?nameBot=electrovision
app.get('/deleteBot', async (req, res) => {
    try {
        const nameBot = req.query.nameBot;
        if (!nameBot) {
            return res.status(400).send('Missing nameBot');
        }
        const bot = bots[nameBot];
        if (!bot) {
            return res.status(400).send('Bot not found');
        }
        delete bots[nameBot];
        console.log('Bot deleted successfully');
        res.status(200).send('Bot deleted successfully');
    } catch (error) {
        res.status(500).send(`Error for delete bot: ${error.message}`);
    }
});

//ejemplo: http://localhost:3030/listBots
app.get('/listBots', (req, res) => {
    try {
        const activeBots = Object.keys(bots);
        res.status(200).json({ activeBots });
    } catch (error) {
        res.status(500).send(`Error listing bots: ${error.message}`);
    }
});

//ejemplo: http://localhost:3030/infoBot?nameBot=electrovision
app.get('/infoBot', (req, res) => {
    try {
        const nameBot = req.query.nameBot;
        if (!nameBot) {
            return res.status(400).send('Missing nameBot');
        }
        const bot = bots[nameBot];
        if (!bot) {
            return res.status(400).send('Bot not found');
        }
        res.status(200).json(bot.getInfo());
    } catch (error) {
        res.status(500).send(`Error getting bot info: ${error.message}`);
    }
});

//ejemplo: http://localhost:3030/modBot?nameBot=electrovision&representanteId=5491137658523@c.us&usuariosPermitidos=5551642209,1137658523,1133727415
app.get('/modBot', async (req, res) => {
    try {
        const nameBot = req.query.nameBot;
        const representanteId = req.query.representanteId;
        const usuariosPermitidos = req.query.usuariosPermitidos ? req.query.usuariosPermitidos.split(',') : [];
        const usuariosExceptuados = req.query.usuariosExceptuados ? req.query.usuariosExceptuados.split(',') : [];
        if (!nameBot ) {
            return res.status(400).send('Missing nameBot');
        }
        const bot = bots[nameBot];
        if (!bot) {
            return res.status(400).send('Bot not found');
        }
        bot.setRepresentanteId(representanteId);
        bot.setUsersAllowed(usuariosPermitidos);
        bot.setUsersDenied(usuariosExceptuados);
        res.status(200).send('Bot modified successfully');
    } catch (error) {
        res.status(500).send(`Error modifying bot: ${error.message}`);
    }
}
);

//ejemplo: http://localhost:3030/updateDT?nameBot=electrovision
app.get('/updateDT', async (req, res) => {
    try {
        const nameBot = req.query.nameBot;
        if (!nameBot) {
            return res.status(400).send('Missing nameBot');
        }
        const bot = bots[nameBot];
        if (!bot) {
            return res.status(400).send('Bot not found');
        }
        await bot.updateDT();
        res.status(200).send('DialogTree updated successfully');
    } catch (error) {
        res.status(500).send(`Error updating DT: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

//Instanciar el bot de electrovision con parametros de nombreBot y representanteId
//const botElectrovision = new Bot('electrovision','5491137658523@c.us');
//botElectrovision.start();

