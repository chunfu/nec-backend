import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { CarContext } from '.';
import UploadButton from '../../widget/UploadButton';
import useStyles from '../../utils/useStyles';

const FileStep = props => {
  const classes = useStyles()();
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const handleOpenFileModal = () => setFileModalOpen(true);
  const handleCloseFileModal = () => setFileModalOpen(false);

  const {
    file: { files, setFiles },
  } = props;
  const onFileChange = name => e => {
    setFiles({
      ...files,
      [name]: e.target.files[0],
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
