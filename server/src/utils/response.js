export const customResponse = (res, { status = 200, success = true, message = '', data = null, meta = null }) => {
  const payload = { success, status: success ? 'success' : 'error', message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(status).json(payload);
};

export default customResponse;
