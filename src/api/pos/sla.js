import * as xlsx from 'xlsx';
import * as util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);
import { excel2json } from '../../lib/util';
import * as futil from '../../lib/files';

// material-table will pollute original data with additional tableData property
// we have to remove it before export to needAdjustOK.xlsx
const neededColumns = [
  'CustomerID',
  'CustomerName',
  'CustomerAddress',
  'location',
];

const getCleanObj = r => {
  return neededColumns.reduce((acc, c) => {
    acc[c] = r[c];
    return acc;
  }, {});
};

const getSla = async (req, res) => {
  let { serviceQuality } = req.query;
  // serviceQuality might be empty string, need extra handling
  if (!serviceQuality) serviceQuality = 10;

  // sla.py should export sla.xlsx as result
  try {
    const { stdout, stderr } = await execAsync(
      `cd ${futil.projectRoot}/modules && python -c "import SLA; SLA.SLAcheck(${serviceQuality}, '${futil.MOVETIME_FILE_PATH}')"`,
    );
    const [rows] = excel2json(futil.NEED_ADJUST_PATH);
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));

    res.json({ columns, rows });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

const putSla = async (req, res) => {
  const { columns, rows: origRows } = req.body;
  const rows = origRows.map(r => getCleanObj(r));
  try {
    const workbook = xlsx.utils.book_new();
    workbook.SheetNames.push('sheet1');
    const worksheet = xlsx.utils.json_to_sheet(rows, {
      header: columns.map(c => c.field),
    });
    workbook.Sheets['sheet1'] = worksheet;
    xlsx.writeFile(workbook, futil.NEED_ADJUST_OK_PATH);

    res.json({ columns, rows });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

export { getSla, putSla };
