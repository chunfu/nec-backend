import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import { PosContext } from '.';
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
              id="locationCost"
              label="各據點成本限制"
              inputClass={classes.input}
              buttonClass={classes.button}
              onChange={onFileChange('localtionCost')}
            />
            <UploadButton
              id="locationWorkerService"
              label="各據點歷年員工數與服務次數"
              inputClass={classes.input}
              buttonClass={classes.button}
              onChange={onFileChange('locationWorkerService')}
            />
            <UploadButton
              id="customerExpectService"
              label="各客戶預期未來年服務次數"
              inputClass={classes.input}
              buttonClass={classes.button}
              onChange={onFileChange('customerExpectService')}
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
  <PosContext.Consumer>{props => <FileStep {...props} />}</PosContext.Consumer>
);

export default withContext;
