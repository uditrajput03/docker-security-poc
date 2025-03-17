import { queueFeed, queueHandler } from "./queueHandler";

export const getIndexData = async (query: string, page: number, n: number = 100) => {
    try {
        const response = await fetch(`https://index.docker.io/v1/search?q=${query}&n=${n}&page=${page}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('❌ Error fetching data:', query, error);
        return null;
    }
}

export const queryAll = async (query: string) => {
    try {
        let data = await getIndexData(query, 1)
        const totalPages = data.num_pages;
        console.log(`🔹 Total pages: ${totalPages} for query ${query}`);
        const promises = [];
        for (let i = 2; i <= totalPages; i++) {
            promises.push(getIndexData(query, i));
        }
        const results = await Promise.all(promises);
        results.forEach((result, index) => {
            console.log(`🔹 Page ${index + 2}: ${result.page}`);
        });
        return [data, ...results];
    }
    catch (error) {
        console.log('❌ Error fetching data:', error);
        return null;
    }
}

const parseName = (data: any) => {
    const result: any[] = data.results;
    let users = [];
    users = result.map((res: any) => res.name.split('/')[0]);
    return users
}
const parseAllNames = (results: any[]) => {
    let users: string[] = [];
    results.forEach(result => {
        users.push(...parseName(result));
    });
    console.log("Total users:", users.length);
    const uniqueUsers = new Set(users);
    users = [...uniqueUsers];
    console.log("Unique users:", users.length);
    return users;
}

export const getUniqueUsers = async (query: string) => {
    try {
        const data = await queryAll(query);
        if (!data) return null;
        return parseAllNames(data);
    } catch (error) {
        console.log('❌ Error fetching data:', error);
        return null;

    }
}

// @ts-ignore
queueHandler('keywordsource', 'keywordprocessing', 'keywordcompleted', async (job: any) => {
    console.log('Processing Keyword:', job);
    await queueFeed('usersource', () => getUniqueUsers(job));
});

// getUniqueUsers('udiii').then(data => console.log(data));
// let data = getIndexData('react', 1).then(data => console.log(data.num_results));