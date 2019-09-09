import * as xlsx from 'xlsx';
import * as util from 'util';
import { exec } from 'child_process';
const execAsync = util.promisify(exec);

const getSla = async (req, res) => {
  let { serviceQuality } = req.query;
  // serviceQuality might be empty string, need extra handling
  if (!serviceQuality) serviceQuality = 10;

  // sla.py should export sla.xlsx as result
  try {
    const { stdout, stderr } = await execAsync(
      `python -c 'import SLA; print SLA.SLAcheck(${serviceQuality}, "movetime.xlsx")'`,
    );
    const workbook = xlsx.readFile('./sla.xlsx');
    const wsname = workbook.SheetNames[0];
    const ws = workbook.Sheets[wsname];
    const rows = xlsx.utils.sheet_to_json(ws);
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));

    res.json({ columns, rows });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

export { getSla };
