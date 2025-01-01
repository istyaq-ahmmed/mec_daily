import mongoose, { Schema } from "mongoose"

const imageSchema = mongoose.Schema(
    {
        name:String,
        Content:String,
    },
    {
        timestamps: {
            createdAt: "publishedAt",
        },
    }
);

export default mongoose.model("image", imageSchema)
