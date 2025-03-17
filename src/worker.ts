import { spawn } from 'child_process'
import path from 'path';
import { getAllFiles, telegramSendMultipleFiles } from './logger';
import { queueHandler } from './queueHandler';
const startWorker = async (job: string) => {
    let tagsplit = job.split(':');
    let usernamesplit = tagsplit[0].split('/');
    const userName = usernamesplit[0];
    const imageName = usernamesplit[1];
    const tagName = tagsplit[1];

    const scriptPath = path.resolve(__dirname, 'node.sh');
    const runWorker = () => {
        return new Promise<void>((resolve, reject) => {
            const process = spawn('bash', [scriptPath, imageName, userName, tagName]);

            process.stdout.on('data', (data) => console.log(`Output: ${data}`));
            process.stderr.on('data', (data) => console.error(`Error: ${data}`));
            process.on('close', (code) => {
                console.log(`Process exited with code ${code}`)
                if (code === 0) resolve();
                else reject(new Error(`Process exited with code ${code}`));
            });

            process.on('error', (err) => console.error(`Failed to start process: ${err}`));
        });
    }
    try {
        await runWorker();
        sendFiles();
    } catch (error) {
        console.error('Failed to start worker:', error);
    }
    function sendFiles() {
        const files = getAllFiles(`./${userName}/${imageName}/${tagName}`);
        telegramSendMultipleFiles(files, `Image ${userName}/${imageName}:${tagName}`);
    }
}

queueHandler('workersource', 'workerprocessing', 'workercompleted', async (job: any) => {
    console.log('Processing worker:', job);
    await startWorker(job);
})