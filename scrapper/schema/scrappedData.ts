import { Schema, Model, model, Types } from "mongoose";
export interface IScrappedData {
    domain:{
        url:string,
        name:string
    },
    url:string,
    scrapped:true,
    header:string,
    content:string,
    image:string,
    summary:string,
    summaryRaw:string,
    formatted:string,
    ratings:{
      sport: number,
      politics: number,
      entertainment: number,
      technology: number,
      international: number
    },
    ner:string[],
    word_vector:string[],
    frequency_vector:number[]
    
}
export interface IScrappedURL {
    url:string,
    scrapped:false,
    domain?:{
        url:string,
        name:string
    },
    header?:string,
    content?:string,
    image?:string,
    summary?:string,
    summaryRaw?:string,
    formatted?:string,
    ratings?:{
      sport: number,
      politics: number,
      entertainment: number,
      technology: number,
      international: number
    },
    ner?:string[],
    word_vector?:string[],
    frequency_vector?:number[]
}


const ScrappedDataSchema = new Schema<IScrappedData|IScrappedURL>(
  {
    url:{
        type:String,
        index:true,
        unique:true
    },
    scrapped:{
        type:Boolean,
        default:false,
        index:true
    },
    domain:{
        url:String,
        name:String
    },
    header:String,
    content:String,
    image:String,
    summaryRaw:String,

    summary:String,
    formatted:String,
    ratings:{
      sport: Number,
      politics: Number,
      entertainment: Number,
      technology: Number,
      international: Number
    },
    ner:[String],
    word_vector:[String],
    frequency_vector:[Number]
  },
  {
    timestamps: {
      createdAt: "c",
      updatedAt: "u",
    },
  },
);


export const ScrappedDataSchemaModel = model("scrapped_data", ScrappedDataSchema);

export default ScrappedDataSchemaModel;
