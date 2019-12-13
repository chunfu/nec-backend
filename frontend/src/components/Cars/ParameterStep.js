import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';

import { CarContext } from '.';
import useStyles from '../../utils/useStyles';
import useFetch from '../../utils/useFetch';

const ParameterStep = props => {
  const classes = useStyles()();
  const {
    parameter: { values, setValues },
  } = props;

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  const [configModalOpen, setConfigModalOpen] = useState(false);
  const handleOpenConfigModal = () => setConfigModalOpen(true);
  const handleCloseConfigModal = () => setConfigModalOpen(false);

  const [paramsModalOpen, setParamsModalOpen] = useState(false);
  const handleOpenParamsModal = () => setParamsModalOpen(true);
  const handleCloseParamsModal = () => setParamsModalOpen(false);

  const [locations, loadLocations] = useFetch('/api/car/locations', []);
  useEffect(() => {
    async function fetchData() {
      await loadLocations();
    }
    fetchData();
  }, []);
  return (
    <React.Fragment>
      <Button
        className={classes.button}
        variant="contained"
        onClick={handleOpenConfigModal}
      >
        系統參數
      </Button>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={configModalOpen}
        onClose={handleCloseConfigModal}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>讀取系統參數</DialogTitle>
        <DialogContent>
          <form noValidate autoComplete="off">
            <TextField
              label="車輛工作間隔時間下限(X 分鐘)"
              placeholder="X 分鐘"
              value={values.restTime}
              onChange={handleChange('restTime')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="社車每單位行使油耗(X 元/公里)"
              placeholder="X 元/公里"
              value={values.comapnyCarFuelConsumption}
              onChange={handleChange('comapnyCarFuelConsumption')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="私車基本里程數(X 公里)"
              placeholder="X 公里"
              value={values.privateCarDistance}
              onChange={handleChange('privateCarDistance')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="私車基本里程數內單位補貼(X 元/公里)"
              placeholder="X 元/公里"
              value={values.privateCarBonus}
              onChange={handleChange('privateCarBonus')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="私車基本里程數外單位補貼(X 元/公里)"
              placeholder="X 元/公里"
              value={values.privateCarExtraBonus}
              onChange={handleChange('privateCarExtraBonus')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
          </form>
          <p>
            1. 車輛工作間隔時間下限（分鐘）：
            每一輛車（社車/私車）所負責之工作中相鄰兩項工作之間需要預留的準備時間
            e.g. 輸入範例 – 30 （分鐘）
          </p>
          <p>
            2. 社車單位行駛油耗成本（元/公里）：
            平均每一輛社車行駛每一公里所需要耗費的油錢成本 e.g. 輸入範例 –
            2.42（元/公里）
          </p>
          <p>
            3. 私車基本里程數門檻（公里）：
            公司所定義之分段式補貼分界點，每一輛私車每月所累積總行駛量低於或高於該門檻值，每行駛一單位公司所補助額度會不同。
            e.g. 輸入範例 – 800.0 （公里）
          </p>
          <p>
            4. 私車「里程數內」補助額度（元/公里）：
            每輛私車每月所累積總行駛量「低於」公司設定門檻值（基本里程數），每行駛一單位公司所補助的額度。
            e.g. 輸入範例 – 6.0（元/公里）
          </p>
          <p>
            5. 私車「里程數外」補助額度（元/公里）：
            每輛私車每月所累積總行駛量「高於」公司設定門檻值（基本里程數），每行駛一單位公司所補助的額度。
            e.g. 輸入範例 – 4.0（元/公里）
          </p>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseConfigModal}
            color="primary"
            variant="contained"
          >
            確認
          </Button>
        </DialogActions>
      </Dialog>

      <Button
        className={classes.button}
        variant="contained"
        onClick={handleOpenParamsModal}
      >
        日常參數
      </Button>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={paramsModalOpen}
        onClose={handleCloseParamsModal}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>讀取日常參數</DialogTitle>
        <DialogContent>
          <FormControl
            margin="normal"
            className={classes.formControl}
            variant="outlined"
          >
            <InputLabel htmlFor="office">據點選擇</InputLabel>
            <Select
              value={values.office}
              onChange={handleChange('office')}
              input={
                <OutlinedInput labelWidth="60" name="office" id="office" />
              }
            >
              {locations.map(({ actgr: value, actgr_office: label }) => (
                <MenuItem value={value}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <div>
            <p>1. 據點選擇： 選擇本次需要最佳化配置的目標據點</p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseParamsModal}
            color="primary"
            variant="contained"
          >
            確認
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

const withContext = () => (
  <CarContext.Consumer>
    {props => <ParameterStep {...props} />}
  </CarContext.Consumer>
);

export default withContext;
