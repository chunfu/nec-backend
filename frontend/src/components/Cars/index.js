import React from 'react';

import StepsComp from '../../widget/StepsComp';
import FileStep from './FileStep';
import ParameterStep from './ParameterStep';
import InfoStep from './InfoStep';
import ResultStep from './ResultStep';

const steps = [
  { label: '檔案讀取', comp: FileStep },
  { label: '參數設定', comp: ParameterStep },
  { label: '路徑資訊', comp: InfoStep },
  { label: '輸出結果', comp: ResultStep },
];

const Cars = props => {
  return <StepsComp steps={steps} />;
};

export default Cars;
