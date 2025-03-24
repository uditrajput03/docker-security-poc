import { GetRedis } from "./getRedis";

async function main() {

    const client = await GetRedis.getInstance().getClient();

    // const username = ""; // Make sure to use your username
    const imageName = "uditrajput03/image-containing-env"
    // const withTagName = ""

    //To scane for all the Images of a user i.e scan for all the images of the username with respective tags
    // client.lPush('usersource', username)

    //To scane for Image with Name i.e scan for all the tags of the image
    await client.lPush('imagesource', imageName)

    //To scane for Image with Given Tag
    // client.lPush('workersource', withTagName)
    console.log("Pushed to the Queue");
    
}
main();