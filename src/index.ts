import { GetRedis } from "./getRedis";

console.log("Hello, World!");
const client = GetRedis.getInstance().getClient();

const username = "";
const imageName = ""
const withTagName = ""

//To scane for all the Images of a user i.e scan for all the images of the username with respective tags
client.lPush('usersource', username)

//To scane for Image with Name i.e scan for all the tags of the image
client.lPush('imagesource', imageName)

//To scane for Image with Given Tag
client.lPush('workersource', withTagName)