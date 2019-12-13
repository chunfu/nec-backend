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
import { getSensitivity, getAllSensitivity } from './car/sensitivity';
import { getCarLocations } from './car/locations';
import { upload } from './upload';

export default ({ config, db }) => {
  let api = Router();

  // mount the facets resource
  // api.use('/facets', facets({ config, db }));

  api.get('/pos/movetime', getMoveTime);
  api.put('/pos/movetime', putMoveTime);

  api.get('/pos/sla', getSla);
  api.put('/pos/sla', putSla);

  api.post('/pos/optimal', getOptimal);
  api.get('/pos/optimal/:officeName', getOptimalDetail);

  api.get('/pos/locations', getLocations);

  api.post('/car/upload', upload);
  api.get('/car/locations', getCarLocations);
  api.post('/car/path', getPath);
  api.get('/car/path/:pathId', getPathDetail);
  api.post('/car/optimal', getCarOptimal);
  api.get('/car/optimal/:ccn', getCarOptimalDetail);
  api.get('/car/sensitivity', getSensitivity);
  api.post('/car/sensitivity/all', getAllSensitivity);
  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    res.json({ version });
  });

  return api;
};
