import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { CarContext } from '.';
import UploadButton from '../../widget/UploadButton';
import useStyles from '../../utils/useStyles';
import useFetch from '../../utils/useFetch';

const FileStep = props => {
  const {
    file: { files, setFiles },
  } = props;

  const classes = useStyles()();
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const handleOpenFileModal = () => setFileModalOpen(true);
  const handleCloseFileModal = () => setFileModalOpen(false);

  const [_, upload] = useFetch('/api/car/upload', {}, { method: 'POST' });
  const onFileChange = name => async e => {
    const file = e.target.files[0];
    let formData = new FormData();
    formData.append(name, file, `${name}.xlsx`);
    await upload({ headers: {}, body: formData });
    setFiles({
      ...files,
      [name]: file,
    });
  };

  return (
    <React.Fragment>
      <Button
        className={classes.button}
        variant="contained"
        onClick={handleOpenFileModal}
      >
        讀取資料
      </Button>
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
              id="mrData"
              label="年度歷史工作紀錄"
              inputClass={classes.input}
              buttonClass={classes.button}
              onChange={onFileChange('mrData')}
              selectedFile={files['mrData']}
            />
            <UploadButton
              id="workerData"
              label="年度員工服務紀錄"
              inputClass={classes.input}
              buttonClass={classes.button}
              onChange={onFileChange('workerData')}
              selectedFile={files['workerData']}
            />
            <UploadButton
              id="officeAddress"
              label="各據點地址資訊"
              inputClass={classes.input}
              buttonClass={classes.button}
              onChange={onFileChange('officeAddress')}
              selectedFile={files['officeAddress']}
            />
            <UploadButton
              id="taxiCost"
              label="各地區計程車費率"
              inputClass={classes.input}
              buttonClass={classes.button}
              onChange={onFileChange('taxiCost')}
              selectedFile={files['taxiCost']}
            />
          </form>
          <p>1. 年度歷史工作紀錄：MR各項服務明細紀錄</p>
          <p>2. 年度員工服務紀錄：服務編號與員工配對資訊</p>
          <p>3. 各據點地址資訊：NEC全台各據點地址與車輛資訊</p>
          <p>4. 各地區計程車費率：全台各據點所在地區計程車收費標準</p>
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

const withContext = () => (
  <CarContext.Consumer>{props => <FileStep {...props} />}</CarContext.Consumer>
);

export default withContext;
