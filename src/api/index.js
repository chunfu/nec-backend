import { version } from '../../package.json';
import { Router } from 'express';
import { getMoveTime, putMoveTime } from './pos/movetime';
import { getSla, putSla } from './pos/sla';
import { getOptimal, getOptimalDetail } from './pos/optimal';
import { getLocations } from './pos/locations';
import { getPath, getPathDetail } from './car/path';
import {
  getOptimal as getCarOptimal,
  getOptimalDetail as getCarOptimalDetail,
} from './car/optimal';
import { getSensitivity } from './car/sensitivity';

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
  { title: '社車數量', field: 'publicCarNum' },
  { title: '變動成本一: 社車', field: 'companyCarCost' },
  { title: '變動成本二: 私車', field: 'privateCarCost' },
  { title: '變動成本三: 大眾運輸', field: 'publicCost' },
  { title: '變動成本統計', field: 'costTotal' },
  { title: '固定成本租金', field: 'fixCostTotal' },
  { title: '交通成本總計', field: 'transportationCost' },
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

  api.get('/pos/movetime', getMoveTime);
  api.put('/pos/movetime', putMoveTime);

  api.get('/pos/sla', getSla);
  api.put('/pos/sla', putSla);

  api.post('/pos/optimal', getOptimal);
  api.get('/pos/optimal/:officeName', getOptimalDetail);

  api.get('/pos/locations', getLocations);

  api.post('/car/path', getPath);
  api.get('/car/path/:pathId', getPathDetail);
  api.post('/car/optimal', getCarOptimal);
  api.get('/car/optimal/:ccn', getCarOptimalDetail);
  api.get('/car/sensitivity', getSensitivity);
  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({ version });
  });

  return api;
};
