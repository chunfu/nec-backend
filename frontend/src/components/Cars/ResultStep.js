import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import MaterialTable from 'material-table';
import * as _ from 'lodash';

import { CarContext } from '.';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';
import tableConfig from '../../const/tableConfig';

const ResultStep = props => {
  const classes = useStyles()();
  const {
    parameter: { values },
    file: { files },
    prevData,
    setPrevData,
    showErrDialog,
    showLoading,
  } = props;
  const resultPrevData = prevData.resultStep || {};


  const [data, loadData] = useFetch('/api/car/optimal', {}, { method: 'POST' });

  const [detail, loadDetail] = useFetch('/api/car/optimal', {});
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const handleOpenDetailModal = async ccn => {
    try {
      showLoading(true);
      setDetailModalOpen(true);
      await loadDetail({ params: ccn });
    } catch (e) {
      showErrDialog(e.message);
    }
    showLoading(false);
  };
  const handleCloseDetailModal = () => setDetailModalOpen(false);

  const [sensitivity, loadSensitivity] = useFetch('/api/car/sensitivity', {});
  const [priceSensitiveModalOpen, setPriceSensitiveModalOpen] = useState(false);
  const handleOpenParamsModal = async () => {
    try {
      setPriceSensitiveModalOpen(true);
      showLoading(true);
      await loadSensitivity({ query: values });
    } catch (e) {
      showErrDialog(e.message);
    }
    showLoading(false);
  };
  const handleCloseParamsModal = () => setPriceSensitiveModalOpen(false);

  const firstColAsLink = (col, idx) => {
    const { field } = col;
    const render =
      idx === 0 &&
      (rowData => (
        <Link
          onClick={() => handleOpenDetailModal(rowData['CCcars_num'])}
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

  const onClickOptimalBtn = async () => {
    try {
      let formData = new FormData();
      Object.keys(values).forEach(valueName => {
        formData.append(valueName, values[valueName]);
      });
      ['taxiCost'].forEach(fileName => {
        if (files[fileName])
          formData.append(fileName, files[fileName], `${fileName}.xlsx`);
      });
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
        onClick={onClickOptimalBtn}
      >
        最佳化資源配置
      </Button>
      {renderedData.columns && (
        <React.Fragment>
          <Button
            className={classes.button}
            variant="contained"
            onClick={handleOpenParamsModal}
          >
            據點私車補貼價格敏感度分析表
          </Button>
          <div className={classes.table}>
            <MaterialTable
              title="年度社車供應成本表"
              columns={columns}
              data={renderedData.rows}
              {...tableConfig}
            />
          </div>
          <Dialog
            aria-labelledby="detail-modal-title"
            aria-describedby="detail-modal-description"
            open={detailModalOpen}
            onClose={handleCloseDetailModal}
            fullWidth
            maxWidth="lg"
          >
            <MaterialTable
              title="年度社車供應日常分派結果成本表"
              columns={detail.columns}
              data={detail.rows}
              {...tableConfig}
            />
          </Dialog>
          <Dialog
            aria-labelledby="price-modal-title"
            aria-describedby="price-modal-description"
            open={priceSensitiveModalOpen}
            onClose={handleCloseParamsModal}
            fullWidth
            maxWidth="lg"
          >
            <MaterialTable
              title="據點私車補貼價格敏感度分析表"
              columns={sensitivity.columns}
              data={sensitivity.rows}
              {...tableConfig}
            />
          </Dialog>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

const withContext = () => (
  <CarContext.Consumer>
    {props => <ResultStep {...props} />}
  </CarContext.Consumer>
);

export default withContext;
