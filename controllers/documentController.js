import { error } from "console";
import  Document  from "../models/Document.js";
import flashcard from '../models/Flashcard.js'
import Quiz from '../models/Quiz.js'
import {extractTextFromPDF} from '../utils/pdfParser.js'
import {chunkText} from '../utils/textChunker.js'
import fs from 'fs/promises'
import mongoose from "mongoose";
import Flashcard from "../models/Flashcard.js";

//@desc Upload PDF document
//@routes POST /api/documents/upload
//@access Private

export const uploadDocument = async (req,res,next) => {
    try {
        if(!req.file) {
            return res.status(400).json({
                success:false,
                error:'Please upload a PDF file',
                statusCode:400
            })
        }
        const {title } =  req.body;

        if(!title) {
            //Delete uploaded file if no title provided
            await fs.unlink(req.file.path);
            return res.status(400).json({
               success: false,
               error:'please provide a document title',
               statusCode:400
            })
        }
        //construct the URl for the upload
        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`
        //Create document recode

        const document = await Document.create({
            userId:req.user._id,
            title,
            fileName:req.file.originalname,
            filePath:fileUrl,
            fileSize:req.file.size,
            status:'processing'
        })

        //Process PDF in Background (in production, use q queue like Bull)
        processPDF(document._id, req.file.path).catch(error => {
            console.error('PDF processing error:',error)
        })
        res.status(201).json({
            success:true,
            data:document,
            message:'Documnet upload successfully. processing in progress...'
        })
    } catch (error) {
        if (req.file) {
            await fs.unlink(req.file.path).catch(() => {})
        }
        next(error)
    }

}
//helper function to process PDF
const processPDF = async(documentId,filePath)=>{
    try {
        const {text} = await extractTextFromPDF(filePath);
        //create chunks
        const chunks = chunkText(text,500,50);

        //updata document
        await Document.findByIdAndUpdate(documentId, {
            extractedText:text,
            chunks:chunks,
            status:'ready'
        })
        console.log(`Documnet ${documentId} processed successfully`);
    } catch (error) {
        console.error(`Error processsing document ${documentId}:`, error)
        await Document.findByIdAndUpdate(documentId, {
            status:'failed'
        })
    }
}

//@desc Get all user documents
//@routes Get /api/documents
//@access Private
export const getDocuments = async (req,res,next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: {userId: new mongoose.Types.ObjectId(req.user._id)}
            },
            {
                $lookup:{
                    from:'flashcards',
                    localField:'_id',
                    foreignField:'documentId',
                    as:'flashcardSets'
                }
            },{
                 $lookup:{
                    from:'quizzes',
                    localField:'_id',
                    foreignField:'documentId',
                    as:'quizzes'
                }
            }, 
            {
                $addFields:{
                    flashcardCount : {$size:'$flashcardSets'},
                    quizCount:{$size:'$quizzes'}
                }
            },
            {
                $project: {
                    extractText:0,
                    chunks:0,
                    flashcardSets:0,
                    quizzes:0
                }
            },
            {
                $sort:{uploadDate:-1}
            }
        ])

        res.status(200).json({
            success:true,
            count:documents.length,
            data:documents
        })
    } catch (error) {
        next(error)
    }

}
//@desc Get single document with chunks
//@routes Get /api/documents/:id
//@access Private

export const getDocument = async(req,res,next) => {
    try {
        const document = await Document.findOne({
            _id:req.params.id,
            userId:req.user._id

        })
        if(!document) {
            return res.status(404).json({
                success:false,
                error:'Document not found',
                statusCode:404
            })
        }
        //Get counts of associated flashcards and quizzes
        const flashcardCount = await Flashcard.countDocuments({documentId: document._id, userId: req.user._id})
        const quizCount = await Quiz.countDocuments({ documentId: document._id, userId: req.user._id})

        // Updata last accessed
        // document.lastAccessed = Date.now();
        // await document.save();
        await Document.findByIdAndUpdate(
       document._id,
      { lastAccessed: Date.now() }
       )

        //combine documnet data with counts
        const documentData = document.toObject();
        documentData.flashcardCount = flashcardCount
        documentData.quizCount = quizCount

        res.status(200).json({
            success:true,
            data:documentData
        })
    } catch (error) {
        next(error)
    }
}

//@desc Delete document title
//@routes DELETE /api/documents/:id
//@access Private
export const deleteDocument = async (req,res,next) => {
    try {
        const document = await Document.findOne({
            _id:req.params.id,
            userId:req.user._id
        })

         if(!document) {
            return res.status(404).json({
                success:false,
                error:'Document not found',
                statusCode:404
            })
        }
        //delete file filesystem
        await fs.unlink(document.filePath).catch(async () => {
            //Delete documnet
            await document.deleteOne();

             res.status(200).json({
            success:true,
            message:"Document is deleted successfully"
        })
        })
    } catch (error) {
        next(error)
    }
}
//@desc update document title
//@routes PUT /api/documents/:id
//@access Private

export const updataDocument = async(req,res,next) => {
    
}