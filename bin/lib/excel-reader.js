const Excel = require('exceljs');

filename = "../data/T_11_06_2_10.xls"
const workbook = new Excel.Workbook();
await workbook.xlsx.readFile(filename);

const worksheet = workbook.worksheets[0] //workbook.getWorksheet("2013-2017")


const columnsOrigin = [
    "C", "F", "I", "L", "O", "R", "U", "X", "AA", "AD", "AG", "AJ", "AM", "AP" 
    //nord, oeust, sud, est (AS AV AY BB), 
]

for (var communeOrigine of columnsOrigin){
    
}