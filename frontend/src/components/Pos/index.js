import React from 'react';

import StepsComp from '../../widget/StepsComp';
import DrivingTimeStep from './DrivingTimeStep';
import ParamterStep from './ParameterStep';
import FileStep from './FileStep';
import SLAStep from './SLAStep';
import ResultStep from './ResultStep';

const steps = [
  { label: '車行時間', comp: DrivingTimeStep },
  { label: '參數設定', comp: ParamterStep },
  { label: '讀取資料', comp: FileStep },
  { label: '調整SLA無法滿足之客戶', comp: SLAStep },
  { label: '輸出結果', comp: ResultStep },
];

const Pos = props => {
  return <StepsComp steps={steps} />;
};

export default Pos;
