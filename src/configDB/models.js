import { ObjectId } from "mongodb";
import dbClient from "./dbclient.js";

class userStatesModel {
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

export default new userStatesModel();