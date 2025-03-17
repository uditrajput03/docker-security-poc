import { queueFeed, queueHandler } from "./queueHandler";

export const getTags = async (image: string , page = 1) => {
    try {
        const response = await fetch(`https://hub.docker.com/v2/repositories/${image}/tags?page_size=100&page=${page}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('❌ Error fetching data:', image, error);
        return null;
    }
}

export const queryAllTags = async (image: string) => {
    try {
        let page = 1;
        let data = await getTags(image, page)
        const totalPages = data.count;
        let isNext = data.next;
        console.log(`🔹 Total count: ${totalPages} for image ${image}`);
        const results = [];
        const tags: any[] = [];
        results.push(data);
        while (isNext) {
            page += 1;
            let res = await getTags(image, page)
            results.push(res);
            isNext = res.next;
        }
        results.forEach((result, index) => {
            console.log(`🔹 Page ${index}: ${result.next}`);
            tags.push(...result.results);
        });
        return tags;
    }
    catch (error) {
        console.log('❌ Error fetching data:', error);
        return null;
    }
}
const parseTags = (tags: any[]) => {
    let tagNames: string[] = [];
    tags.forEach((tag) => {
        let name = tag.name;
        tagNames.push(name);
    });
    console.log("Total tags:", tagNames.length);
    return tagNames;
}
export const parseAllTags = async (image: string) => {
    try {
        const tags = await queryAllTags(image);
        if (!tags) return null;
        let tagNames = parseTags(tags);
        let tagNameWithImage = tagNames.map(tag => image + ':' + tag);
        return tagNameWithImage;
    } catch (error) {
        console.log('❌ Error parsing tags:', error);
        return null;
    }
}

queueHandler('imagesource', 'imageprocessing', 'imagecompleted', async (job) => {
    console.log('Processing tags:', job);
    await queueFeed('workersource', () => parseAllTags(job));
})
// parseAllTags('100xdevs/web-app').then(data => console.log(data));