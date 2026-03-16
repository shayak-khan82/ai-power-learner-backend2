import mongoose from "mongoose";

const chatHistroySchema = new mongoose.Schema (
    {
        userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                required:true
            },
            documentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref:'Document',
                required: true
            },
            messages:[{
                role:{
                    type:String,
                    enum:['user','assistant'],
                    required:true
                },
                content: {
                    type: String,
                    required:true
                },
                timestamp: {
                    type:Date,
                    default:Date.now
                },
                relevantChunks:{
                    type:[Number],
                    default:[]
                }
            }]
        }, {
            timestamps:true
        }     

)   
// Index for faster queries
chatHistroySchema.index({userId: 1, document: 1});

const ChatHistroy = mongoose.model("ChatHistroy", chatHistroySchema)
export default ChatHistroy