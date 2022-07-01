import {App} from '@tinyhttp/app';
import {v1App} from './v1.js';

export const apiApp = new App();

apiApp.get('/', (_, res) => res.status(200).send('Welcome to the API!'));
apiApp.route('/v1').use(v1App);
