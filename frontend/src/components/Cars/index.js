import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import SimpleTable from '../../widget/SimpleTable';
import useFetch from '../../utils/useFetch';

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 250,
  },
  input: {
    display: 'none',
  },
  button: {
    margin: theme.spacing(1),
  },
  table: {
    marginTop: theme.spacing(5),
  },
}));

const Cars = props => {
  const classes = useStyles();

  const [values, setValues] = useState({
    comapnyCarNumber: '',
    privateCarNumber: '',
    restTime: '',
    comapnyCarAnnualCost: '',
    comapnyCarFuelConsumption: '',
    privateCarDistance: '',
    privateCarBonus: '',
    privateCarExtraBonus: '',
    taxiDistance: '',
    taxiCost: '',
    taxiExtraCost: '',
  });
  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  const [data, loadData] = useFetch('/api/carModule', {});

  const [paramsModalOpen, setParamsModalOpen] = useState(false);
  const handleOpenParamsModal = () => setParamsModalOpen(true);
  const handleCloseParamsModal = () => setParamsModalOpen(false);

  return (
    <React.Fragment>
      <Button
        className={classes.button}
        variant="contained"
        onClick={handleOpenParamsModal}
      >
        讀取模型參數
      </Button>
      <input
        accept=".csv,.xls,.xlsx"
        className={classes.input}
        id="upload-history"
        multiple
        type="file"
      />
      <label htmlFor="upload-history">
        <Button className={classes.button} variant="contained" component="span">
          讀取歷史工作
        </Button>
      </label>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={() => loadData()}
      >
        最佳化資源配置
      </Button>
      <div className={classes.table}>
        {data.columns && (
          <SimpleTable columns={data.columns} rows={data.rows} />
        )}
      </div>
      <Dialog
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={paramsModalOpen}
        onClose={handleCloseParamsModal}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>讀取模型參數</DialogTitle>
        <DialogContent>
          <form noValidate autoComplete="off">
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
            <TextField
              label="計程車基本里程數"
              placeholder="X 公尺"
              value={values.taxiDistance}
              onChange={handleChange('taxiDistance')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            {/* （基本里程數內） */}
            <TextField
              label="計程車基本起跳價"
              placeholder="X 元"
              value={values.taxiCost}
              onChange={handleChange('taxiCost')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="計程車基本里程數外單位價格"
              placeholder="X 元/公里"
              value={values.taxiExtraCost}
              onChange={handleChange('taxiExtraCost')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
          </form>
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

export default Cars;
