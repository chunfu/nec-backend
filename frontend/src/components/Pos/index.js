import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import StepsComp from '../../widget/StepsComp';
import DrivingTimeStep from './DrivingTimeStep';
import ParamterStep from './ParameterStep';
import FileStep from './FileStep';
import SLAStep from './SLAStep';
import ResultStep from './ResultStep';

export const PosContext = React.createContext({
  parameter: {},
  file: {},
});

const steps = [
  { label: '車行時間', comp: DrivingTimeStep },
  { label: '參數設定', comp: ParamterStep },
  { label: '讀取資料', comp: FileStep },
  { label: '調整SLA無法滿足之客戶', comp: SLAStep },
  { label: '輸出結果', comp: ResultStep },
];

const Pos = props => {
  const [values, setValues] = useState({
    fuelCost: '',
    serviceQuality: '',
    reservationSite: [],
    checkOther: false,
    otherLocation: '',
  });

  const [files, setFiles] = useState({});

  const [errDialogOpen, setErrDialogOpen] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const showErrDialog = (errMsg) => {
    setErrDialogOpen(true);
    setErrMsg(errMsg);
  };

  return (
    <PosContext.Provider
      value={{
        parameter: { values, setValues },
        file: { files, setFiles },
        showErrDialog,
      }}
    >
      <StepsComp steps={steps} />
      <Dialog
        open={errDialogOpen}
        onClose={() => setErrDialogOpen(false)}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          錯誤訊息
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {errMsg}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setErrDialogOpen(false)} color="primary" autoFocus>
            關閉
          </Button>
        </DialogActions>
      </Dialog>
    </PosContext.Provider>
  );
};

export default Pos;
