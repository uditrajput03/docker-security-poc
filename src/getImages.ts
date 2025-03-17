import { queueFeed, queueHandler } from "./queueHandler";

export const getImages = async (username: string, page: number, n: number = 100) => {
    try {
        const response = await fetch(`https://hub.docker.com/v2/repositories/${username}/?page=${page}&page_size=100`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('❌ Error fetching data:', username, error);
        return null;
    }
}

export const queryAllImages = async (username: string) => {
    try {
        let page = 1;
        let data = await getImages(username, page)
        const totalPages = data.count;
        let isNext = data.next;
        console.log(`🔹 Total count: ${totalPages} for user ${username}`);
        const results = [];
        const images: any[] = [];
        results.push(data);
        while (isNext) {
            page += 1;
            let res = await getImages(username, page)
            console.log('fetching page:', page);
            results.push(res);
            isNext = res.next;
        }
        results.forEach((result, index) => {
            console.log(`🔹 Page ${index}: next:${result.next}`);
            images.push(...result.results);
        });
        return images;
    }
    catch (error) {
        console.log('❌ Error fetching data:', error);
        return null;
    }
}

const fileterImages = (images: any[], maxPulls: number = 10000) => {
    let imageNames: string[] = [];

    images.forEach((image) => {
        if ((image.pull_count < maxPulls) && (image.status !== 0)) {
            let name = image?.namespace + '/' + image.name;
            // console.log(name, image.pull_count, image.status);
            imageNames.push(name);
        }
    });
    console.log("Total images:", imageNames);
    return imageNames;
}

export const parseImages = async (username: string, maxPulls: number = 10000) => {
    try {
        const images = await queryAllImages(username);
        // console.log(images);
        if (!images) return null;
        return fileterImages(images, maxPulls);
    } catch (error) {
        console.log('❌ Error fetching data:', username, error);
        return null;

    }
}


queueHandler('usersource', 'userprocessing', 'usercompleted', async (job: any) => {
    console.log('Processing job:', job);
    await queueFeed('imagesource', () => parseImages(job));
    // console.log(images);
    // return images;
})


// parseImages('100xdevs').then(data => {
//     console.log(data?.length)
// });