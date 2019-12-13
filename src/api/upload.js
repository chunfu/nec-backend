import * as futil from '../lib/files';

const upload = async (req, res) => {
  const {
    files,
  } = req;
  try {
    Object.values(files).forEach(f => f.mv(futil.fullPath(f.name)));
    res.json({ ok: 1 });
  } catch (e) {
    console.log(e.stack);
    res.status(500).json({ errMsg: e.message });
  }
};

export { upload };