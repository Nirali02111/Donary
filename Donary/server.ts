import 'zone.js/node';
import 'localstorage-polyfill'
import * as express from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
const compression = require('compression');

const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist/browser');

const domino = require('domino');
const template = readFileSync(join(DIST_FOLDER, 'index.html')).toString();
const win = domino.createWindow(template.toString());

const Element = domino.impl.Element; 
const HTMLAnchorElement = domino.impl.HTMLAnchorElement;

win.Object = Object;
global['window'] = win;
global['document'] = win.document;
global['self'] = win
global['IDBIndex'] = win.IDBIndex
global['document'] = win.document
global['navigator'] = win.navigator
global['getComputedStyle'] = win.getComputedStyle;
global['Element'] = Element;
global['HTMLAnchorElement'] = HTMLAnchorElement;
global['localStorage'] = localStorage;
global['DOMTokenList'] = win.DOMTokenList;

app.use(compression());

const { AppServerModuleNgFactory, LAZY_MODULE_MAP, ngExpressEngine, provideModuleMap } = require('./dist/server/main');

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);
app.disable('x-powered-by');

app.get('*.*', express.static(join(process.cwd(), 'dist/browser'), {
  maxAge: '1y'
}));

app.get('*', (req, res) => {
  res.render('index', { req, res });
});

app.listen(PORT, () => {
  console.log(`Node Express server listening on http://localhost:${PORT}`);
});
