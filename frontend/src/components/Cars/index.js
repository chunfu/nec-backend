import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import useLocalStorage from '../../utils/useLocalStorage';
import StepsComp from '../../widget/StepsComp';
import FileStep from './FileStep';
import ParameterStep from './ParameterStep';
import InfoStep from './InfoStep';
import ResultStep from './ResultStep';

export const CarContext = React.createContext({
  parameter: {},
  file: {},
});

const steps = [
  { label: '檔案讀取', comp: FileStep },
  { label: '參數設定', comp: ParameterStep },
  { label: '路徑資訊', comp: InfoStep },
  { label: '輸出結果', comp: ResultStep },
];

const Cars = props => {
  const [values, setValues] = useLocalStorage('cars-parameters', {
    // daily parameter
    comapnyCarNumber: '',
    // daily parameter
    privateCarNumber: '',
    // daily parameter
    office: '',
    restTime: '',
    comapnyCarAnnualCost: '',
    comapnyCarFuelConsumption: '',
    privateCarDistance: '',
    privateCarBonus: '',
    privateCarExtraBonus: '',
  });

  const [files, setFiles] = useState({});

  const [errDialogOpen, setErrDialogOpen] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const showErrDialog = errMsg => {
    setErrDialogOpen(true);
    setErrMsg(errMsg);
  };

  return (
    <CarContext.Provider
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
        <DialogTitle id="responsive-dialog-title">錯誤訊息</DialogTitle>
        <DialogContent>
          <DialogContentText>{errMsg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setErrDialogOpen(false)}
            color="primary"
            autoFocus
          >
            關閉
          </Button>
        </DialogActions>
      </Dialog>
    </CarContext.Provider>
  );
};

export default Cars;
