import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });
import Curriculum from '../models/Curriculum.js';

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return resolve([]);
        }
        console.log(`Reading CSV: ${filePath}`);
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                // Determine tech or non-tech based on the Set Type or topic.
                // In the prompt, the user asks to map:
                // "Set Type	Unit ID	Duration	Tech/NonTech,Course Name	Course ID	Topic	Topic ID	Session Name/Unit Name	Set Type	Unit ID	Duration (in mins)	Languages	Session Link"
                // It seems they want to update the schema to include `isTech` (Tech/NonTech) mapping, but
                // since they haven't given explicitly the mapping rule, we will map basic fields out.
                // The prompt says "map the Set Type Unit ID Duration Tech/NonTech,Course Name Course ID Topic Topic ID Session Name/Unit Name Set Type Unit ID Duration (in mins) Languages Session Link map the duration".

                // Let's create a tech/nontech mapping heuristic based on Course Name or Topic
                const course = (data['Course Name'] || '').toLowerCase();
                const topic = (data['Topic'] || '').toLowerCase();

                // Common non-tech keywords
                const nonTechKeywords = ['english', 'aptitude', 'reasoning', 'spoken', 'written', 'communication', 'skills', 'logic'];

                let isTech = 'Tech';
                for (const keyword of nonTechKeywords) {
                    if (course.includes(keyword) || topic.includes(keyword)) {
                        isTech = 'NonTech';
                        break;
                    }
                }

                results.push({
                    courseName: data['Course Name'],
                    courseId: data['Course ID'],
                    topic: data['Topic'],
                    topicId: data['Topic ID'],
                    sessionName: data['Session Name/Unit Name'],
                    setType: data['Set Type'],
                    unitId: data['Unit ID'],
                    duration: data['Duration (in mins)'],
                    languages: data['Languages'],
                    sessionLink: data['Session Link'],
                    outcomes: data['Outcomes'],
                    prerequisites: data['Prerequisites'],
                    techNonTech: isTech // New field mapping added!
                });
            })
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Check command line arguments, use default if not provided
        let filePaths = process.argv.slice(2);
        if (filePaths.length === 0) {
            filePaths = ['/Users/sravankumarega/Downloads/Curriculum Reference - Academy - Final.csv'];
        }

        let allResults = [];
        for (const fp of filePaths) {
            const res = await parseCSV(fp);
            if (res.length > 0) {
                console.log(`Successfully parsed ${res.length} rows from ${fp}`);
                allResults = allResults.concat(res);
            }
        }

        if (allResults.length === 0) {
            console.log("No valid CSV data parsed.");
            process.exit(1);
        }

        // Clear existing data
        await Curriculum.deleteMany();
        console.log('Cleared existing Curriculum data');

        await Curriculum.insertMany(allResults);
        console.log(`Successfully imported total of ${allResults.length} records!`);

        process.exit(0);

    } catch (error) {
        console.error('Data import failed:', error);
        process.exit(1);
    }
};

importData();
