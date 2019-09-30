import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Dialog from '@material-ui/core/Dialog';
import MaterialTable from 'material-table';

import { CarContext } from '.';
import useFetch from '../../utils/useFetch';
import useStyles from '../../utils/useStyles';
import tableConfig from '../../const/tableConfig';

const ResultStep = props => {
  const classes = useStyles()();
  const {
    parameter: { values },
    file: { files },
    showErrDialog,
    showLoading,
  } = props;

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
    setDetailModalOpen(false);
    showLoading(false);
  };
  const handleCloseDetailModal = () => setDetailModalOpen(false);

  const [sensitivity, loadSensitivity] = useFetch('/api/car/sensitivity', {});
  const [priceSensitiveModalOpen, setPriceSensitiveModalOpen] = useState(false);
  const handleOpenParamsModal = () => {
    setPriceSensitiveModalOpen(true);
    loadSensitivity({ query: values });
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

  let columns = [];
  if (data.columns) {
    columns = data.columns.map(firstColAsLink);
  }

  const onClickOptimalBtn = async () => {
    try {
      showLoading(true);
      await loadData();
    } catch (e) {
      showErrDialog(e.message);
    }
    showLoading(false);
  };
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
      {data.columns && (
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
              data={data.rows}
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
