import { useState } from 'react';

const useFetch = (url, defaultData, defaultOptions = {}) => {
  const [data, updateData] = useState(defaultData);

  const loadData = async (options = {}) => {
    let { query } = options;
    let realUrl = url;
    if (query) {
      query = Object.keys(query)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(query[k]))
        .join('&');
      realUrl = `${realUrl}?${query}`;
    }
    const resp = await fetch(realUrl, {
      headers: {
        'content-type': 'application/json',
      },
      ...defaultOptions,
      ...options,
    });
    const json = await resp.json();
    if (!resp.ok) {
      throw new Error(json.errMsg);
    }
    updateData(json);
  };

  return [data, loadData];
};

export default useFetch;
