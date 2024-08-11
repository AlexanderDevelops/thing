const express = require('express');
const app = express();

app.use(require('body-parser').json())

app.listen(3000, '', () => console.log('Wsppp!'))

module.exports = app;