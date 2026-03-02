import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });
import Curriculum from '../models/Curriculum.js';

const check = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const names = await Curriculum.distinct('courseName');
    console.log(names);
    process.exit(0);
};
check();
