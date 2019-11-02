import * as xlsx from 'xlsx';

/**	Creates a callback that proxies node callback style arguments to an Express Response object.
 *	@param {express.Response} res	Express HTTP Response
 *	@param {number} [status=200]	Status code to send on success
 *
 *	@example
 *		list(req, res) {
 *			collection.find({}, toRes(res));
 *		}
 */
export function toRes(res, status=200) {
	return (err, thing) => {
		if (err) return res.status(500).send(err);

		if (thing && typeof thing.toObject==='function') {
			thing = thing.toObject();
		}
		res.status(status).json(thing);
	};
}

export function excel2json(path) {
  const workbook = xlsx.readFile(path);
  const wsname = workbook.SheetNames[0];
  const ws = workbook.Sheets[wsname];
  return [xlsx.utils.sheet_to_json(ws, { raw: false }), workbook];
}
