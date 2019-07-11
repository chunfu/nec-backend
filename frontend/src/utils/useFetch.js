import { useState } from 'react';

const useFetch = (url, defaultData) => {
  const [data, updateData] = useState(defaultData);

  const loadData = async () => {
    const resp = await fetch(url);
    const json = await resp.json();
    updateData(json);
  };

  return [data, loadData];
};

export default useFetch;