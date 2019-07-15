import { version } from '../../package.json';
import { Router } from 'express';

function createData(
  publicCarNum,
  companyCarCost,
  privateCarCost,
  publicCost,
  costTotal,
  fixCostTotal,
  transportationCost,
) {
  return {
    publicCarNum,
    companyCarCost,
    privateCarCost,
    publicCost,
    costTotal,
    fixCostTotal,
    transportationCost,
  };
}

const columns = [
  { label: '社車數量', key: 'publicCarNum' },
  { label: '變動成本一: 社車', key: 'companyCarCost' },
  { label: '變動成本二: 私車', key: 'privateCarCost' },
  { label: '變動成本三: 大眾運輸', key: 'publicCost' },
  { label: '變動成本統計', key: 'costTotal' },
  { label: '固定成本租金', key: 'fixCostTotal' },
  { label: '交通成本總計', key: 'transportationCost' },
];
const rows = [
  createData(0, 159, 6.0, 24, 4.0, 100, 200),
  createData(1, 237, 9.0, 37, 4.3, 100, 200),
  createData(2, 262, 16.0, 24, 6.0, 100, 200),
  createData(3, 305, 3.7, 67, 4.3, 100, 200),
  createData(4, 356, 16.0, 49, 3.9, 100, 200),
];

export default ({ config, db }) => {
  let api = Router();

  // mount the facets resource
  // api.use('/facets', facets({ config, db }));
  api.get('/carModule', (req, res) => {
    res.json({
      columns,
      rows,
    });
  });

  api.get('/posModule', (req, res) => {
    res.json({
      columns,
      rows,
    });
  });

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({ version });
  });

  return api;
};
