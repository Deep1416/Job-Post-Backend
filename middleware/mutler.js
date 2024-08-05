import express from "express";
import multer from "multer";
// const upload = multer({ dest: 'uploads/' })
const storage = multer.memoryStorage();
export const singleUpload = multer({ storage }).single("file");
