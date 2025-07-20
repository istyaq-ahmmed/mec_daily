import express from "express"

// middlewares
import Image from "../../../models/image.js"
const router = express.Router()
router.use((req,res,next)=>{
    console.log(req.url,req.method)
    next()
})
async function upload_image(req,res){
    try {
        const img =await Image.findOne({name:req.params.img})
        // console.log(req.body.img)
        img.Content=req.body.img
        await img.save()
        // console.log(req.params)
        return res.status(200).json({
            status: 6000,
        })
    } catch (error) {
        console.log(error)
    }
}
async function get_image(req,res){
    try {
        const img =await Image.findOne({name:req.params.img})
        // console.log(req.body.img)
        const content=img.Content;
        // const content='';
        const l=content.split(',')
        var ft=l[0].split(';')
        ft=ft[0].replace('data:','')
        var imgRes = Buffer.from(l[1], 'base64');

        console.log(ft)
        res.writeHead(200, {
            'Content-Type': ft,
            // 'Content-Type': 'image/jpeg',
            'Content-Length': imgRes.length
          });
          res.end(imgRes);
    } catch (error) {
        console.log(error)
    }
}

router.put("/upload-image/:img", upload_image)
router.get("/upload-image/:img", get_image)



export default router
