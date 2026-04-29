
import fs from 'fs';

const content = fs.readFileSync('c:/Users/Usuario/Documents/code/nucleo-crm/frontend/src/pages/Integracoes.tsx', 'utf8');

const divOpen = (content.match(/<div/g) || []).length;
const divClose = (content.match(/<\/div>/g) || []).length;

const buttonOpen = (content.match(/<Button/g) || []).length;
const buttonClose = (content.match(/<\/Button>/g) || []).length;

const dialogOpen = (content.match(/<Dialog( |>)/g) || []).length;
const dialogClose = (content.match(/<\/Dialog>/g) || []).length;

const dialogContentOpen = (content.match(/<DialogContent/g) || []).length;
const dialogContentClose = (content.match(/<\/DialogContent>/g) || []).length;

console.log('div:', divOpen, divClose);
console.log('Button:', buttonOpen, buttonClose);
console.log('Dialog:', dialogOpen, dialogClose);
console.log('DialogContent:', dialogContentOpen, dialogContentClose);
