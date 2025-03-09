import app from './app';
import {Config} from "./utils/Config";

const port = Config.PORT;

app.get('/', (req, res) => {
    res.send('Running!');
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});