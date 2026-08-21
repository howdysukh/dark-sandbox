'use strict';

const node = (type, properties = {}) => ({ type, ...properties });
module.exports = { node };
