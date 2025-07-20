import dotenv from 'dotenv';
import fs from 'fs';
import util from 'util'
import {generate} from 'randomstring'
const sleep = util.promisify(setTimeout);
dotenv.config()
import mongoose from 'mongoose';
const logFile = fs.createWriteStream( './uploadToServer.log', { flags: 'a' });


 
function log(...inp:any){
    console.log(...inp)
    logFile.write(String(inp)+'\n')
}

await mongoose.connect(process.env.DB_LOCATION)

import ScrappedDataSchemaModel from './schema/scrappedData.js';
import axios from 'axios';
while (true){
    const ns=await ScrappedDataSchemaModel.findOne({uploaded:{$exists:false}})

    if(!ns) break;
    log("Start",(new Date()).toString(),ns.id)
    const tags:string[]=[]
    for(let key in ns.ratings){
        if(ns.ratings[key]>2) tags.push(key)
    }
    if(tags.length==0) tags.push('None');

    const uploadUrl=(await axios.get(`${process.env.HOST}/api/v1/blogs/get-upload-url`)).data.uploadUrl
    // const { uploadUrl } = uploadUrl?.data

    console.log(uploadUrl)
    await axios.put(`${process.env.HOST}${uploadUrl}`,{
        img:ns.image
    })
    await axios.post(`${process.env.HOST}/api/v1/blogs/create`,{
        title:ns.header,
        content:{
            "time": ns.c.getTime(),
            "blocks": [
                {
                "id": generate({
                    length: 10,
                    charset: 'alphabetic'
                    }),
                "type": "paragraph",
                "data": {
                    "text": ns.summary
                }
                }
            ],
            "version": "2.28.2"
        },
        originalArticleURL:ns.url,
        des:ns.summary.substring(0,200),
        tags:tags,
        banner:uploadUrl,
        draft:false,
        authorId:'677434f111adb942d9420b4d',
        ratings:ns.ratings,
        ner:ns.ner,
        word_vector:ns.word_vector,
        frequency_vector:ns.frequency_vector
    })
    // console.log(uploadID)
    // ns.summary=summary
    // ns.ratings=ratting
    // ns.ner=ner
    ns.uploaded=true
    await ns.save()
    
    log("end",ns.id,'=========================')


    
}


process.exit()