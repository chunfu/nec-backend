import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  formControl: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 250,
  },
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

const locations = [
  '南港',
  '淡水',
  '桃園',
  '新竹',
  '台中',
  '宜蘭',
  '花蓮',
  '台東',
  '台南',
  '嘉義',
  '高雄',
  '屏東',
];

const DrivingTimeStep = props => {
  const classes = useStyles();

  const [values, setValues] = useState({
    fuelCost: '',
    serviceQuality: '',
    location: '',
  });
  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

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
            <FormControl className={classes.formControl} variant="outlined">
              <InputLabel htmlFor="location">必須保留的據點</InputLabel>
              <Select
                value={values.location}
                onChange={handleChange('location')}
                input={
                  <OutlinedInput
                    labelWidth="110"
                    name="location"
                    id="location"
                  />
                }
              >
                {locations.map(l => (
                  <MenuItem value={l}>{l}</MenuItem>
                ))}
              </Select>
            </FormControl>
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

export default DrivingTimeStep;
