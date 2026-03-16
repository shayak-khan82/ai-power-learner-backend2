import mongoose from "mongoose";

const documentScahema = new mongoose.Schema (
    {
        userId:{
                type:mongoose.Schema.Types.ObjectId,
                ref:'User',
                required:true
            },
            title: {
                type:String,
                required: [true,'please provide a document title'],
                trim:true
            },
            fileName: {
                type:String,
                required: true
            },
            filePath: {
                type:String,
                required:true
            },
            fileSize: {
                type:String,
                required: true
            },
            extractedText: {
                type:String,
                default:''
            },
            chunks:[{
                content: {
                    type:String,
                    required: true
                },
                pageNumber:{
                    type:Number,
                    default: 0 
                },
                chunkIndex:{
                    type: Number,
                    required: true
                }
            }],
            uploadDate:{
                type: Date,
                default:Date.now
            },
            lastAccessed:{
                type: Date,
                default: Date.now
            },
            status: {
                type:String,
                enum:['processing','ready','failed'],
                default:'processing'
            }
        }, {
            timestamps: true
        }
)            

//index for faster queries

documentScahema.index({userId:1,uploadDate:-1})

const Document = mongoose.model('Document',documentScahema)

export default Document