import mongoose, { Schema } from "mongoose"

const blogSchema = mongoose.Schema(
    {
        blog_id: {
            type: String,
            required: true,
            unique: true,
        },
        originalArticleURL:String,
        title: {
            type: String,
            required: true,
        },
        banner: {
            type: String,
            // required: true,
        },
        des: {
            type: String,
            maxlength: 200,
            // required: true
        },
        content: {
            type: [],
            // required: true
        },
        tags: {
            type: [String],
            // required: true
        },
        author: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "users",
        },
        activity: {
            total_likes: {
                type: Number,
                default: 0,
            },
            total_comments: {
                type: Number,
                default: 0,
            },
            total_reads: {
                type: Number,
                default: 0,
            },
            total_parent_comments: {
                type: Number,
                default: 0,
            },
        },
        comments: {
            type: [Schema.Types.ObjectId],
            ref: "comments",
        },
        draft: {
            type: Boolean,
            default: false,
        },
        ratings:{
            sport: Number,
            politics: Number,
            entertainment: Number,
            technology: Number,
            international: Number
        },
        ner:[String],
        word_vector:[String],
        frequency_vector:[Number],
    },
    {
        timestamps: {
            createdAt: "publishedAt",
        },
    }
);

export default mongoose.model("blogs", blogSchema)
