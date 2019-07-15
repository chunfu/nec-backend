import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import SimpleTable from '../../widget/SimpleTable';
import useFetch from '../../utils/useFetch';

const useStyles = makeStyles(theme => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
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

const UploadButton = ({ id, label, inputClass, buttonClass }) => (
  <React.Fragment>
    <input accept=".csv" className={inputClass} id={id} type="file" />
    <label htmlFor={id}>
      <Button className={buttonClass} variant="contained" component="span">
        {label}
      </Button>
    </label>
  </React.Fragment>
);

const Pos = props => {
  const classes = useStyles();

  const [values, setValues] = useState({
    fuelCost: '',
    serviceQuality: '',
  });
  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  const [data, loadData] = useFetch('/api/posModule', {});

  const [paramsModalOpen, setParamsModalOpen] = useState(false);
  const handleOpenParamsModal = () => setParamsModalOpen(true);
  const handleCloseParamsModal = () => setParamsModalOpen(false);

  const [fileModalOpen, setFileModalOpen] = useState(false);
  const handleOpenFileModal = () => setFileModalOpen(true);
  const handleCloseFileModal = () => setFileModalOpen(false);

  return (
    <React.Fragment>
      <Button
        className={classes.button}
        variant="contained"
        onClick={handleOpenParamsModal}
      >
        讀取模型參數
      </Button>
      <Button
        className={classes.button}
        variant="contained"
        onClick={handleOpenFileModal}
      >
        讀取資料
      </Button>
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
        aria-labelledby="parameter-modal-title"
        aria-describedby="parameter-modal-description"
        open={paramsModalOpen}
        onClose={handleCloseParamsModal}
      >
        <DialogTitle>模型參數設定</DialogTitle>
        <DialogContent>
          <form noValidate autoComplete="off">
            <TextField
              label="油錢"
              placeholder="X 元/公里"
              value={values.fuelCost}
              onChange={handleChange('fuelCost')}
              type="number"
              className={classes.textField}
              margin="normal"
              variant="outlined"
            />
            <TextField
              label="服務水準"
              placeholder="X 分鐘內抵達"
              value={values.serviceQuality}
              onChange={handleChange('serviceQuality')}
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
      <Dialog
        aria-labelledby="file-modal-title"
        aria-describedby="file-modal-description"
        open={fileModalOpen}
        onClose={handleCloseFileModal}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>讀取資料</DialogTitle>
        <DialogContent>
        <form noValidate autoComplete="off">
          <UploadButton
            id="officeCost"
            label="據點辦公室成本"
            inputClass={classes.input}
            buttonClass={classes.button}
          />
          <UploadButton
            id="capacity"
            label="服務據點容量限制"
            inputClass={classes.input}
            buttonClass={classes.button}
          />
          <UploadButton
            id="employeeCost"
            label="各據點單位員工成本"
            inputClass={classes.input}
            buttonClass={classes.button}
          />
          <UploadButton
            id="serviceTimes"
            label="客戶歷年服務平均次數"
            inputClass={classes.input}
            buttonClass={classes.button}
          />
          <UploadButton
            id="office2customerTime"
            label="服務據點到客戶門市車行時間"
            inputClass={classes.input}
            buttonClass={classes.button}
          />
          <UploadButton
            id="serviceQualityChange"
            label="服務水準可否調派"
            inputClass={classes.input}
            buttonClass={classes.button}
          />
          <UploadButton
            id="serviceHistory"
            label="歷史服務紀錄"
            inputClass={classes.input}
            buttonClass={classes.button}
          />
        </form>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseFileModal}
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

export default Pos;
