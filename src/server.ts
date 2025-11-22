import app from "./app.js";
import config from "./config/config.js";
import { initCollection } from "./utils/vector.js";

app.listen(config.port, async () => {
    await initCollection();
    console.log('SERVER STARTED')
})
