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
    const { stdout, stderr } = await execAsync(
      `python3 -c 'import NEC_OptCCModel2_OptModel; print NEC_OptCCModel2_OptModel.OptModel("mrData.xlsx", "workerData.xlsx", "officeAddress.xlsx", ${office})'`,
    );

    // output 2 files: pathDistDetail.xlsx, pathDistAnaly.xlsx
    res.json({ msg: 1 });
  } catch (e) {
    res.status(500).json({ errMsg: e.message });
  }
};

export { getOptimal };
