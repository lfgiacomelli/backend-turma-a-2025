import jwt from 'jsonwebtoken';

const secret = 'smithgg415_zoomx_token';
const token = jwt.sign({ foo: 'bar' }, secret, { expiresIn: '1h' });

console.log(token);
