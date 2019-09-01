import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { PosContext } from '.';
import useStyles from '../../utils/useStyles';

const locationNames = [
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

const ParameterStep = props => {
  const classes = useStyles()();
  const { parameter: { values, setValues }} = props;

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  const handleLocationChange = name => e => {
    const checked = e.target.checked;
    let newLocations = values.locations.slice();
    if (checked) {
      // add to new locations
      newLocations.push(name);
    } else {
      // remove from new locations
      const nameIdx = newLocations.findIndex(l => l === name);
      newLocations.splice(nameIdx, 1);
    }

    setValues({ ...values, locations: newLocations });
  };

  const handleCheckOther = e => {
    const checked = e.target.checked;
    let otherLocation = values.otherLocation;
    if (!checked) {
      // clear otherLocation
      otherLocation = '';
    }
    setValues({ ...values, checkOther: checked, otherLocation });
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
        fullWidth
        maxWidth="lg"
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
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel>必須保留的據點</FormLabel>
              <FormGroup className={classes.horizontalFormGroup}>
                {locationNames.map(name => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!values.locations.find(l => l === name)}
                        onChange={handleLocationChange(name)}
                        value={name}
                        color="primary"
                      />
                    }
                    label={name}
                  />
                ))}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.checkOther}
                      onChange={handleCheckOther}
                      value="其他"
                      color="primary"
                    />
                  }
                  label="其他"
                />
                {values.checkOther && (
                  <TextField
                    value={values.otherLocation}
                    onChange={handleChange('otherLocation')}
                  />
                )}
              </FormGroup>
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

const withContext = () => (
  <PosContext.Consumer>
    {props => <ParameterStep {...props} />}
  </PosContext.Consumer>
);

export default withContext;
