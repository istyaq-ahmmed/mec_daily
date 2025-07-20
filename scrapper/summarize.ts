import dotenv from 'dotenv';
import fs from 'fs';
import util from 'util'
const sleep = util.promisify(setTimeout);

dotenv.config()
import mongoose from 'mongoose';
const logFile = fs.createWriteStream( './appSummary.log', { flags: 'a' });


 
function log(...inp:any){
    console.log(...inp)
    logFile.write(String(inp)+'\n')
}

await mongoose.connect(process.env.DB_LOCATION)

import ScrappedDataSchemaModel from './schema/scrappedData.js';
import axios from 'axios';
// log('ff')
// process.exit()

async function getLLM_Summary(txt:string){

}

while (true){
    const ns=await ScrappedDataSchemaModel.findOne({summary:{$exists:false}},{image:0})

    log("Start",(new Date()).toString(),ns.id)
    if(!ns) break;

    const res=await axios.post('http://192.168.1.100:11434/api/generate',{
            "model": "llama3.1:latest",
            "stream": false,
            "prompt":`You are to analyze a news article and generate output using the **exact format below** for programmatic parsing. Do not skip or modify any part of the template.

Instructions:
- First, rate the article in these categories: sport, politics, entertainment, technology, international (0-10 scale). Output as a valid JSON object using **double quotes**.
- Use **Bangladesh** as the country context when assigning relevance scores.
- Insert this JSON inside the "Ratting" section.
- Then, generate a concise 2–3 line summary of the article and place it inside the "Summary" section.
- Finally, extract all named entities (people, organizations, countries, cities, etc.) as a **JSON list of strings only** inside the "Entities" section.

**IMPORTANT: Strictly follow this output template. Do not change spacing, do not reword section titles, do not omit or reorder anything.**

Template Start

** Ratting **
    {Place Ratting Object here}
** Ratting **

** Summary **
    {Place Summary String here}
** Summary **
    
** Entities **
    {Place Summary String here}
** Entities **
Template End

Now, analyze the following article:
${ns.content}
`
},{timeout:180000})
    // const res={status:'',data:{response:'resp'}}
    if(res){
        
        ns.summaryRaw=res.data.response,
        log(ns.summary)
        
        await ns.save()
    }
    log("end",ns.id,'=========================')
    await sleep(1000)
}


process.exit()