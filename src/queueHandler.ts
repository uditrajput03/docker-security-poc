import { RedisCommandArgument } from "@redis/client/dist/lib/commands";
import { GetRedis } from "./getRedis"
import { telegramLogger } from "./logger";

export const queueHandler = async (
    source: RedisCommandArgument,
    processing: RedisCommandArgument,
    completed: RedisCommandArgument,
    process: (job: any) => Promise<any> = async (job: any) => {
        console.log('Processing job:', job);
    }
) => {
    if (!source || !processing || !completed) {
        console.log('❌ Invalid arguments');
        return null
    }
    let client = await GetRedis.getInstance().getClient();
    console.log('🚀 Queue handler started');
    while (true) {
        let job;
        try {
            job = await client.brPopLPush(source, processing, 0)
            // job = await client.blMove(source, processing,"LEFT", "RIGHT", 0)

            //do someting with the job
            await process(job)
            //@ts-ignore
            await client.multi().lRem(processing, 1, job).rPush(completed, job).exec()
            // telegramLogger(`job completed: ${job}`)
            console.log('Job completed:', job);
        } catch (error) {
            console.log('❌ Error fetching data:', error);
            telegramLogger(`job failed: ${job} with error ${error}`)
            await new Promise(res => setTimeout(res, 1000));
        }
    }
}

export const queueFeed = async (
    source: RedisCommandArgument, process: () => Promise<any>) => {
    try {
        if (!source) {
            console.log('❌ Invalid arguments');
            return null
        }
        let client = await GetRedis.getInstance().getClient();
        console.log('🚀 Queue feed started')
        let data = await process();
        console.log('Data inside Feeder:', data.length);
        await client.rPush(source, data);
        // telegramLogger(`Feeder added: ${data.length}`)
        console.log('Feeder added:', data.length);

    } catch (error) {
        console.log('❌ Error fetching data:', error);
        telegramLogger(`job failed: ${error}`)
    }
};


// queueHandler('source', 'processing', 'completed').then(data => console.log(data));