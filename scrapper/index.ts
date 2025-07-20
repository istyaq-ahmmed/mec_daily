import dotenv from 'dotenv';
import fs from 'fs';
import util from 'util'
const sleep = util.promisify(setTimeout);

dotenv.config()
import puppeteer, { Page } from 'puppeteer';
import mongoose from 'mongoose';
const logFile = fs.createWriteStream( './app.log', { flags: 'a' });


 
function log(...inp:any){
    console.log(...inp)
    logFile.write(String(inp)+'\n')
}

await mongoose.connect(process.env.DB_LOCATION)

import ScrappedDataSchemaModel from './schema/scrappedData.js';
import axios from 'axios';
// log('ff')
// process.exit()
async function launchBrowser() {
    const browser=await  puppeteer.launch({headless:false});
    let page:Page
    if((await browser.pages()).length==0)
            page= await browser.newPage();
    else page=(await browser.pages())[0]
    await page.setViewport({ width: 1366, height: 768});
    await page.goto('https://google.com')
    return {browser,page}
}


const {browser,page}=await launchBrowser();

const theDailyStarRoot='https://www.thedailystar.net/'
async function getAllUrl(page:Page,root:string,url:string) {
    await page.goto(url);
    const aTags=await page.$$('a[href]')
    const localQue:string[]=[]
    for( let aTag of aTags){
        const url=await (await aTag.getProperty('href')).jsonValue();
        if(url.length>60&&url.startsWith(root) && url.includes('/news/') && !localQue.includes(url)){
            try {
                localQue.push(url)
                await ScrappedDataSchemaModel.create({url:url,scrapped:false})
            } catch (error) {
                // log(error)
            }
        }
    }
}
// getAllUrl(page,theDailyStarRoot,theDailyStarRoot)

async function scrapeUrl(page:Page,url:string) {
    try {
        await page.goto(url);
        await page.waitForSelector('article[id]')
        const contentPanel=await page.$('div.detailed-content:has(article)');
        let header= await (await ((await contentPanel.$('h1')).getProperty('innerText'))).jsonValue()
        try{

            header= await (await ((await contentPanel.$('h1')).getProperty('innerText'))).jsonValue()
        } 
        catch{
            header= await (await ((await contentPanel.$('div>h2')).getProperty('innerText'))).jsonValue()
        }
        let heroImageBuffer:Buffer
        try {
            const heroImage= await (await ((await contentPanel.$('span>picture>img')).getProperty('srcset'))).jsonValue()
            log('heroImage:',heroImage)
            const res=await axios.get(heroImage)
            log("ImgGet: ",res.status,res.statusText)
            heroImageBuffer= res.data
        } catch (error) {
            
        }
        let content
        try{

            content=await (await (await contentPanel.$('article[id] div.pb-20.clearfix')).getProperty('innerText')).jsonValue();
        } catch{
            content=await (await (await contentPanel.$('article[id] div.tds-plus-special-body')).getProperty('innerText')).jsonValue();
            
        }
        //heroImageBuffer.toString('base64'))
        log('header',header)
        // log('content',content)
        return {success:true,header,content,image:heroImageBuffer.toString('base64')}
    } catch (error) {
        console.log(error)
    }
}

while (true){
    const ns=await ScrappedDataSchemaModel.findOne({scrapped:false})
    if(!ns) break;
    log(ns.id)
    const res=await scrapeUrl(page,ns.url)
    if(res){
        ns.domain={
            name:"The Daily Star",
            url:theDailyStarRoot
        }
        ns.header=res.header,
        ns.content=res.content,
        ns.image=res.image
        ns.scrapped=true
        await ns.save() 
    }
    await sleep(15000)
}


await browser.close()
