"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const logger_1 = require("./logger");
const queueHandler_1 = require("./queueHandler");
const startWorker = (job) => __awaiter(void 0, void 0, void 0, function* () {
    let tagsplit = job.split(':');
    let usernamesplit = tagsplit[0].split('/');
    const userName = usernamesplit[0];
    const imageName = usernamesplit[1];
    const tagName = tagsplit[1];
    const scriptPath = path_1.default.resolve(__dirname, 'node.sh');
    const runWorker = () => {
        return new Promise((resolve, reject) => {
            const process = (0, child_process_1.spawn)('bash', [scriptPath, imageName, userName, tagName]);
            process.stdout.on('data', (data) => console.log(`Output: ${data}`));
            process.stderr.on('data', (data) => console.error(`Error: ${data}`));
            process.on('close', (code) => {
                console.log(`Process exited with code ${code}`);
                if (code === 0)
                    resolve();
                else
                    reject(new Error(`Process exited with code ${code}`));
            });
            process.on('error', (err) => console.error(`Failed to start process: ${err}`));
        });
    };
    try {
        yield runWorker();
        sendFiles();
    }
    catch (error) {
        console.error('Failed to start worker:', error);
    }
    function sendFiles() {
        const files = (0, logger_1.getAllFiles)(`./${userName}/${imageName}/${tagName}`);
        (0, logger_1.telegramSendMultipleFiles)(files, `Image ${userName}/${imageName}:${tagName}`);
    }
});
(0, queueHandler_1.queueHandler)('workersource', 'workerprocessing', 'workercompleted', (job) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Processing worker:', job);
    yield startWorker(job);
}));
