import express from 'express';
import chalk from 'chalk';
import debugLibrary from 'debug';
import morgan from 'morgan';
import api from './api/productsApi.js';

const app = express();
const debug = debugLibrary('app');
const PORT = process.env.PORT || 3000;
app.use(morgan('tiny'));
app.use('/api', api(debug));

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({ 
        error: {
            message: 'Server Error'
        }
    });
});

app.listen(PORT, () => {
    debug(`listening on port ${chalk.green(PORT)}`);
});
