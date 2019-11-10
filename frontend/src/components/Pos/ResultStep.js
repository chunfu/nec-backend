import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import MaterialTable from 'material-table';
import * as _ from 'lodash';

import { PosContext } from '.';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';
import tableConfig from '../../const/tableConfig';

const ResultStep = props => {
  const {
    // read parameter from context provider
    parameter: { values },
    file: { files },
    prevData,
    setPrevData,
    showErrDialog,
    showLoading,
  } = props;
  const resultPrevData = prevData.resultStep || {};

  const classes = useStyles()();
  const [data, loadData] = useFetch('/api/pos/optimal', {}, { method: 'POST' });

  const [detail, loadDetail] = useFetch('/api/pos/optimal', {});
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const handleOpenDetailModal = async officeName => {
    try {
      showLoading(true);
      setDetailModalOpen(true);
      await loadDetail({ params: officeName });
    } catch (e) {
      showErrDialog(e.message);
    }
    showLoading(false);
  };
  const handleCloseDetailModal = () => setDetailModalOpen(false);

  const firstColAsLink = (col, idx) => {
    const { field } = col;
    const render =
      idx === 0 &&
      (rowData => (
        <Link
          onClick={() => handleOpenDetailModal(rowData[field])}
          className={classes.link}
        >
          {rowData[field]}
        </Link>
      ));
    return {
      ...col,
      ...(render && { render }),
    };
  };

  const onClickOptimalButton = async () => {
    let formData = new FormData();
    Object.keys(values).forEach(valueName => {
      formData.append(valueName, values[valueName]);
    });
    Object.keys(files).forEach(fileName => {
      formData.append(fileName, files[fileName], `${fileName}.xlsx`);
    });
    try {
      showLoading(true);
      const resp = await loadData({ headers: {}, body: formData });
      setPrevData({ ...prevData, resultStep: resp });
    } catch (e) {
      showErrDialog(e.message);
    }
    showLoading(false);
  };

  const renderedData = _.isEmpty(data) ? resultPrevData : data;
  let columns = [];
  if (renderedData.columns) {
    columns = renderedData.columns.map(firstColAsLink);
  }

  return (
    <React.Fragment>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={onClickOptimalButton}
      >
        服務據點選擇最佳化
      </Button>
      {renderedData.columns && (
        <div className={classes.table}>
          <MaterialTable
            title="最佳化結果"
            columns={columns}
            data={renderedData.rows}
            {...tableConfig}
          />
          <Dialog
            aria-labelledby="detail-modal-title"
            aria-describedby="detail-modal-description"
            open={detailModalOpen}
            onClose={handleCloseDetailModal}
            fullWidth
            maxWidth="lg"
          >
            <MaterialTable
              title="該據點客戶分配"
              columns={detail.columns}
              data={detail.rows}
              {...tableConfig}
            />
          </Dialog>
        </div>
      )}
    </React.Fragment>
  );
};

const withContext = () => (
  <PosContext.Consumer>
    {props => <ResultStep {...props} />}
  </PosContext.Consumer>
);

export default withContext;
