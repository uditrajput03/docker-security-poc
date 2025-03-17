import axios, { all } from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import 'dotenv/config';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

/**
 * Sends a log message to a Telegram group via bot
 * @param message The message to send
 */
export const telegramLogger = async (message: string): Promise<void> => {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });

        console.log('Log sent to Telegram:', message);
    } catch (error) {
        console.error('Failed to send log to Telegram:');
    }
};

/**
 * Sends a file to a Telegram group via bot
 * @param filePath Path to the file to send
 * @param caption Optional caption for the file
 */
export const telegramSendFile = async (filePath: string, caption: string = ''): Promise<void> => {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
        const form = new FormData();

        form.append('chat_id', TELEGRAM_CHAT_ID);
        form.append('document', fs.createReadStream(filePath));
        form.append('caption', caption);

        await axios.post(url, form, {
            headers: form.getHeaders()
        });

        console.log('File sent to Telegram:', filePath);
    } catch (error) {
        console.error('Failed to send file to Telegram:', error);
    }
};

export const telegramSendMultipleFiles = async (filePaths: string[], caption: string = ''): Promise<void> => {
    for (const filePath of filePaths) {
        try {
            await telegramSendFile(filePath, caption);
        } catch (error) {
            console.error(`Failed to send file ${filePath} to Telegram:`, error);
        }
    }
};

export const getAllFiles = (dirPath: string): string[] => {
    let filesList: string[] = [];
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            filesList = filesList.concat(getAllFiles(fullPath));
        } else if (stats.isFile()) {
            filesList.push(fullPath);
        }
    }

    return filesList;
};

// const allFiles = getAllFiles('./src');
// telegramSendMultipleFiles(allFiles, '📁 System log file attached');
// console.log('All files:', allFiles);


// Example usage
// telegramLogger('✅ System initialized successfully');
// telegramSendFile('./src/node.sh', '📁 System log file attached');
