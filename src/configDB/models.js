import { ObjectId } from "mongodb";
import dbClient from "./dbclient.js";

export class userStatesModel {
    async create(userStates){
        const colletUS = dbClient.db.collection('userStates');
        return await colletUS.insertOne(pedido);
    }

    async update(id,userStates){
        const colletUS = dbClient.db.collection('userStates');
        return await colletUS.updateOne({_id: new ObjectId(id)},{$set: userStates});
    }

    async delete(id){
        const colletUS = dbClient.db.collection('userStates');
        return await colletUS.deleteOne({_id: new ObjectId(id)});
    }

    async getAll(){
        const colletUS = dbClient.db.collection('userStates');
        return await colletUS.find({}).toArray();
    }

    async getOne(id){
        const colletUS = dbClient.db.collection('userStates');
        return await colletUS.findOne({_id: new ObjectId(id)});
    }
}

export class dialogTreeModel {
    async create(dialogTree){
        const colletDT = dbClient.db.collection('dialogTree');
        return await colletDT.insertOne(pedido);
    }

    async update(id,dialogTree){
        const colletDT = dbClient.db.collection('dialogTree');
        return await colletDT.updateOne({_id: new ObjectId(id)},{$set: dialogTree});
    }

    async delete(id){
        const colletDT = dbClient.db.collection('dialogTree');
        return await colletDT.deleteOne({_id: new ObjectId(id)});
    }

    async getAll(){
        const colletDT = dbClient.db.collection('dialogTree');
        return await colletDT.find({}).toArray();
    }

    async getOne(nameBot){
        const colletDT = dbClient.db.collection('dialogTree');
        return await colletDT.findOne({ 'nameBot': nameBot });
    }
}

//export default new userStatesModel();