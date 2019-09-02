import * as xlsx from 'xlsx';

const getMoveTime = (req, res) => {
  const workbook = xlsx.readFile('./movetime.xlsx');
  const wsname = workbook.SheetNames[0];
  const ws = workbook.Sheets[wsname];
  const rows = xlsx.utils.sheet_to_json(ws);
  const columns = rows.length && Object.keys(rows[0]).map(key => ({ title: key, field: key }))

  res.json({
    columns,
    rows,
  });
};

export { getMoveTime };
