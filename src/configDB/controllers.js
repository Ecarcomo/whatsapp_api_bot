import userStatesModel from './models.js';

class userStatesController {
    constructor(){

    }

    async create(dataBot){
        try{
            const data = await userStatesModel.create(dataBot);
        } catch(e){
            throw Error('Error al crear userStates:',e);
        }
    }

    async update(id,dataBot){
        try{
            const data = await userStatesModel.update(id,dataBot);
        } catch(e){
            throw Error('Error al actualizar userStates:',e);
        }
    }

    async delete(id){
        try{
            const data = await userStatesModel.delete(id);
        } catch(e){
            throw Error('Error al eliminar userStates:',e);
        }
    }

    async getAll(){
        try{
            const data = await userStatesModel.getAll();
        } catch(e){
            throw Error('Error al obtener todos los userStates:',e);
        }
    }

    async getOne(id){
        try{
            const data = await userStatesModel.getOne(id);
        } catch(e){
            throw Error('Error al obtener un userStates:',e);
        }
    }
}

export default new userStatesController();