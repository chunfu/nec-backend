import * as xlsx from 'xlsx';

const getOptimal = async (req, res) => {
  const {
    files,
    body: {
      comapnyCarNumber = '', // CCcars_num
      privateCarNumber = '', // PCcars_num
      restTime = '', // works_buffer
      comapnyCarAnnualCost = '', // CCcars_Rent
      comapnyCarFuelConsumption = '', // CCcars_Fuel
      privateCarDistance = '', // basic_Mileage
      privateCarBonus = '', // below_PCcarsFuel
      privateCarExtraBonus = '', // upper_PCcarsFuel
    },
  } = req;
  try {
    /*
    if (!files) throw new Error('無上傳任何檔案');
    const { taxiCost } = files;
    // error handling here
    if (!taxiCost) throw new Error('年度歷史工作紀錄 未上傳');
    if (!comapnyCarNumber) throw new Error('目前據點社車供應 未指定');
    if (!privateCarNumber) throw new Error('目前據點私車供應 未指定');
    if (!restTime) throw new Error('車輛工作間隔時間下限 未指定');
    if (!comapnyCarAnnualCost) throw new Error('社車年租賃費用 未指定');
    if (!comapnyCarFuelConsumption) throw new Error('社車每單位行使油耗 未指定');
    if (!privateCarDistance) throw new Error('私車基本里程數 未指定');
    if (!privateCarBonus) throw new Error('私車基本里程數內單位補貼 未指定');
    if (!privateCarExtraBonus) throw new Error('私車基本里程數外單位補貼 未指定');
    Object.values(files).forEach(f => f.mv(`./${f.name}`));
    */
    /* Mark it out temporarily
    const { stdout, stderr } = await execAsync(
      `python3 -c 'import NEC_OptCCModel2_OptModel; print NEC_OptCCModel2_OptModel.OptModel("mrData.xlsx", "workerData.xlsx", "officeAddress.xlsx", ${office})'`,
    );
    */

    // output 2 files: loc_DailyAssign_cost, loc_DailyAssign_detail
    const workbook = xlsx.readFile('./loc_DailyAssign_cost.xlsx');
    const wsname = workbook.SheetNames[0];
    const ws = workbook.Sheets[wsname];
    const rows = xlsx.utils.sheet_to_json(ws);
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));

    res.json({ columns, rows });
  } catch (e) {
    res.status(500).json({ errMsg: e.message });
  }
};

const getOptimalDetail = async (req, res) => {
  const {
    params: { ccn },
  } = req;
  try {
    const ccnInt = parseInt(ccn, 10);
    if (!ccnInt) throw new Error('Company car number is not a number');
    /* Mark it out temporarily
    const { stdout, stderr } = await execAsync(
      `python3 -c 'import NEC_OptCCModel2_OptModel; print NEC_OptCCModel2_OptModel.OptModel("mrData.xlsx", "workerData.xlsx", "officeAddress.xlsx", ${office})'`,
    );
    */

    // output 2 files: loc_DailyAssign_cost, loc_DailyAssign_detail
    const workbook = xlsx.readFile('./loc_DailyAssign_detail.xlsx');
    const wsname = workbook.SheetNames[0];
    const ws = workbook.Sheets[wsname];
    let rows = xlsx.utils.sheet_to_json(ws);
    const columns =
      rows.length &&
      Object.keys(rows[0]).map(key => ({ title: key, field: key }));
    // ccn is string, CCcars_num is integer
    rows = rows.filter(({ CCcars_num }) => CCcars_num === ccnInt);

    res.json({ columns, rows });
  } catch (e) {
    res.status(500).json({ errMsg: e.message });
  }
};

export { getOptimal, getOptimalDetail };
