import dotenv from 'dotenv';
import fs from 'fs';
import util from 'util'
import natural from 'natural'
const sleep = util.promisify(setTimeout);

dotenv.config()
import mongoose from 'mongoose';
const logFile = fs.createWriteStream( './preProcessingLog.log', { flags: 'a' });


 
function log(...inp:any){
    console.log(...inp)
    logFile.write(String(inp)+'\n')
}

await mongoose.connect(process.env.DB_LOCATION)

import ScrappedDataSchemaModel from './schema/scrappedData.js';
const tokenizer = new natural.WordTokenizer();


while (true){
    const ns=await ScrappedDataSchemaModel.findOne({word_vector:{$size:0}},{image:0})

    if(!ns) break;
    log("Start",(new Date()).toString(),ns.id)
    const tokens=tokenizer.tokenize(ns.content.toLowerCase()).filter(word => !natural.stopwords.includes(word));
    const stemmed=tokens.map(natural.PorterStemmer.stem)

    const freqObjs:{[x:string]:number} = {};
    stemmed.forEach(word => {
        freqObjs[word] = (freqObjs[word] || 0) + 1;
    });
    const word_vector:string[]=[]
    const frequency_vector:number[]=[]
    for(let key in freqObjs){
        word_vector.push(key)
        frequency_vector.push(freqObjs[key])
    }

    log(JSON.stringify(word_vector))
    log(JSON.stringify(frequency_vector))

    ns.word_vector=word_vector
    ns.frequency_vector=frequency_vector
    // log(tokens)
    await ns.save()
    log("end",ns.id,'=========================')
    // await sleep(2000000)
    // break
}
// const pipeline = [
//   {
//     $match: {
//       word_vector: { $in: tokens } // Match any query word
//     }
//   },
//   {
//     $project: {
//       url: 1,
//       header: 1,
//       word_vector: 1,
//       frequency_vector: 1,
//       matchedWords: {
//         $filter: {
//           input: "$word_vector",
//           as: "word",
//           cond: { $in: ["$$word", tokens] }
//         }
//       },
//       matchedFrequencies: {
//         $map: {
//           input: tokens,
//           as: "word",
//           in: {
//             $cond: [
//               { $in: ["$$word", "$word_vector"] },
//               {
//                 $arrayElemAt: [
//                   "$frequency_vector",
//                   { $indexOfArray: ["$word_vector", "$$word"] }
//                 ]
//               },
//               0 // If word not found, frequency = 0
//             ]
//           }
//         }
//       }
//     }
//   },
//   {
//     $addFields: {
//       queryScore: { $sum: "$matchedFrequencies" }
//     }
//   },
//   {
//     $sort: { queryScore: -1 }
//   }
// ];



// const results = await ScrappedData.aggregate(pipeline);

process.exit()