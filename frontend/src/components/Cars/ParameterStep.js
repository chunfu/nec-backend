import React, { useState } from 'react';
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

const locations = [
  '淡水',
  '桃園',
  '新竹',
  '台中',
  '嘉義',
  '台南',
  '高雄',
  '屏東',
  '台東',
  '花蓮',
  '宜蘭',
];

const ParameterStep = props => {
  const classes = useStyles()();
  const { parameter: { values, setValues }} = props;

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  const [configModalOpen, setConfigModalOpen] = useState(false);
  const handleOpenConfigModal = () => setConfigModalOpen(true);
  const handleCloseConfigModal = () => setConfigModalOpen(false);

  const [paramsModalOpen, setParamsModalOpen] = useState(false);
  const handleOpenParamsModal = () => setParamsModalOpen(true);
  const handleCloseParamsModal = () => setParamsModalOpen(false);
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
              label="車輛工作間隔時間下限"
              placeholder="X 分鐘"
              value={values.restTime}
              onChange={handleChange('restTime')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="社車年租賃費用"
              placeholder="X 元/輛"
              value={values.comapnyCarAnnualCost}
              onChange={handleChange('comapnyCarAnnualCost')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="社車每單位行使油耗"
              placeholder="X 元/公里"
              value={values.comapnyCarFuelConsumption}
              onChange={handleChange('comapnyCarFuelConsumption')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="私車基本里程數"
              placeholder="X 公里"
              value={values.privateCarDistance}
              onChange={handleChange('privateCarDistance')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="私車基本里程數內單位補貼"
              placeholder="X 元/公里"
              value={values.privateCarBonus}
              onChange={handleChange('privateCarBonus')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="私車基本里程數外單位補貼"
              placeholder="X 元/公里"
              value={values.privateCarExtraBonus}
              onChange={handleChange('privateCarExtraBonus')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
          </form>
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
        <DialogContent className={classes.inputContainer}>
          <TextField
            label="目前據點社車供應"
            placeholder="X 輛"
            value={values.comapnyCarNumber}
            onChange={handleChange('comapnyCarNumber')}
            type="number"
            className={classes.textField}
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="目前據點私車供應"
            placeholder="X 輛"
            value={values.privateCarNumber}
            onChange={handleChange('privateCarNumber')}
            type="number"
            className={classes.textField}
            margin="normal"
            variant="outlined"
          />
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
              {locations.map(l => (
                <MenuItem value={l}>{l}</MenuItem>
              ))}
            </Select>
          </FormControl>
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
