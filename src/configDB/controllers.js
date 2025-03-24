import {userStatesModel,dialogTreeModel} from './models.js';

class userStatesController {
    constructor(){
        this.USModel = new userStatesModel();
    }

    async create(dataBot){
        try{
            const data = await this.USModel.create(dataBot);
        } catch(e){
            throw Error('Error al crear userStates:',e);
        }
    }

    async update(id,dataBot){
        try{
            const data = await this.USModel.update(id,dataBot);
        } catch(e){
            throw Error('Error al actualizar userStates:',e);
        }
    }

    async delete(id){
        try{
            const data = await this.USModel.delete(id);
        } catch(e){
            throw Error('Error al eliminar userStates:',e);
        }
    }

    async getAll(){
        try{
            const data = await this.USModel.getAll();
        } catch(e){
            throw Error('Error al obtener todos los userStates:',e);
        }
    }

    async getOne(id){
        try{
            const data = await this.USModel.getOne(id);
        } catch(e){
            throw Error('Error al obtener un userStates:',e);
        }
    }
}

class dialogTreeController {
    constructor(){
        this.DTModel = new dialogTreeModel();
    }

    async create(dataDT){
        try{
            const data = await this.DTModel.create(dataDT);
            return data;
        } catch(e){
            throw Error('Error al crear dialogTree:',e);
        }
    }

    async update(id,dataDT){
        try{
            const data = await this.DTModel.update(id,dataDT);
            return data;
        } catch(e){
            throw Error('Error al actualizar dialogTree:',e);
        }
    }

    async delete(id){
        try{
            const data = await this.DTModel.delete(id);
            return data;
        } catch(e){
            throw Error('Error al eliminar dialogTree:',e);
        }
    }

    async getAll(){
        try{
            const data = await this.DTModel.getAll();
            return data;
        } catch(e){
            throw Error('Error al obtener todos los dialogTree:',e);
        }
    }

    async getOne(nameBot){
        try{
            const data = await this.DTModel.getOne(encodeURI(nameBot));
            return data;
        } catch(e){
            throw Error('Error al obtener un dialogTree:',e);
        }
    }
}

const  uSC = new userStatesController();
const  dTC = new dialogTreeController();

export {uSC,dTC};