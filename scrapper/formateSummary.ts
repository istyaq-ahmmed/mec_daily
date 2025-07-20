import dotenv from 'dotenv';
import fs from 'fs';
import util from 'util'
const sleep = util.promisify(setTimeout);

dotenv.config()
import mongoose from 'mongoose';
const logFile = fs.createWriteStream( './formattingSummary.log', { flags: 'a' });


 
function log(...inp:any){
    console.log(...inp)
    logFile.write(String(inp)+'\n')
}

await mongoose.connect(process.env.DB_LOCATION)

import ScrappedDataSchemaModel from './schema/scrappedData.js';
import { text } from 'stream/consumers';
// log('ff')
// process.exit()
function getTagContent(txt:string,tag:string){
    const input=txt+'\n**'
    const pattern=new RegExp(`\\*\\*\\s*${tag}\\s*\\*\\*([\\s\\S]*?)\\*\\*`,"i")
    const match = input.match(pattern);
    if (match) {
        return  match[1].trim();
        // console.log("Extracted Ratting:", rattingContent);
        // const parsed = JSON.parse(rattingContent);
        // console.log(parsed);
    }
}
async function formatLLMSummary(txt:string){
    console.log(txt)
    const ratting=JSON.parse(getTagContent(txt,'Ratting'))
    const summary=getTagContent(txt,'Summary').trim()
    const ner:string[]=JSON.parse(getTagContent(txt,'Entities'))
    // process.exit()
    return{
        ratting,
        summary,
        ner:ner.map(e=>e.toLowerCase())
    }
}

while (true){
    const ns=await ScrappedDataSchemaModel.findOne({summary:{$exists:true,},ratings:{$exists:false,}},{image:0})

    if(!ns) break;
    log("Start",(new Date()).toString(),ns.id)
    const {ratting,summary,ner}=await formatLLMSummary(ns.summary);
    console.log(ratting,summary,ner)
    ns.summary=summary
    ns.ratings=ratting
    ns.ner=ner
    await ns.save()
    log("end",ns.id,'=========================')
}


process.exit()