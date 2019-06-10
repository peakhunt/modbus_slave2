const util = require('util');
const events = require('events');
const SerialPort = require('serialport');
const handlers = require('modbus-serial/servers/servertcp_handler');

const EventEmitter = events.EventEmitter || events;

const UNIT_ID = 255;

require('modbus-serial/utils/buffer_bit')();

const crc16 = require('modbus-serial/utils/crc16');

function _callbackFactory(unitID, functionCode, rtuWriter) {
  let fc = functionCode;

  return function cb(err, responseBuffer) {
    let rspBuf = responseBuffer;

    // If we have an error.
    if (err) {
      let errorCode = 0x04; // slave device failure
      if (!Number.isNaN(err.modbusErrorCode)) {
        errorCode = err.modbusErrorCode;
      }

      // Set an error response
      fc = parseInt(fc, 10) || 0x80;
      rspBuf = Buffer.alloc(3 + 2);
      rspBuf.writeUInt8(errorCode, 2);
    }

    // If we do not have a responseBuffer
    if (!rspBuf) {
      return rtuWriter(null, rspBuf);
    }

    // add unit number and function code
    rspBuf.writeUInt8(unitID, 0);
    rspBuf.writeUInt8(fc, 1);

    // Add crc
    const crc = crc16(rspBuf.slice(0, -2));
    rspBuf.writeUInt16LE(crc, rspBuf.length - 2);

    // Call callback function
    return rtuWriter(null, rspBuf);
  };
}

function _parseModbusBuffer(reqFrame, vector, serverUnitID, rtuWriter) {
  if (reqFrame.length < 4) {
    this.numShortFrame += 1;
    return;
  }

  const unitID = reqFrame[0];
  let functionCode = reqFrame[1];
  const crc = reqFrame[reqFrame.length - 2] + reqFrame[reqFrame.length - 1] * 0x100;

  if (crc !== crc16(reqFrame.slice(0, -2))) {
    this.numCRCError += 1;
    return;
  }

  if ((serverUnitID !== 255 || serverUnitID !== 0) && serverUnitID !== unitID) {
    this.numWrongUnitID += 1;
    return;
  }
  const cb = _callbackFactory(unitID, functionCode, rtuWriter);
  const errorCode = 0x01; // illegal function
  let responseBuffer;

  switch (parseInt(functionCode, 10)) {
    case 1:
    case 2:
      handlers.readCoilsOrInputDiscretes(reqFrame, vector, unitID, cb, functionCode);
      break;
    case 3:
      handlers.readMultipleRegisters(reqFrame, vector, unitID, cb);
      break;
    case 4:
      handlers.readInputRegisters(reqFrame, vector, unitID, cb);
      break;
    case 5:
      handlers.writeCoil(reqFrame, vector, unitID, cb);
      break;
    case 6:
      handlers.writeSingleRegister(reqFrame, vector, unitID, cb);
      break;
    case 15:
      handlers.forceMultipleCoils(reqFrame, vector, unitID, cb);
      break;
    case 16:
      handlers.writeMultipleRegisters(reqFrame, vector, unitID, cb);
      break;
    case 43:
      handlers.handleMEI(reqFrame, vector, unitID, cb);
      break;
    default:
      this.numIllegalFunc += 1;

      // set an error response
      functionCode = parseInt(functionCode, 10) || 0x80;

      responseBuffer = Buffer.alloc(3 + 2);

      responseBuffer.writeUInt8(errorCode, 2);
      cb({ modbusErrorCode: errorCode }, responseBuffer);
  }
}

const ServerRTU = function serverRTU(vector, path, options) {
  const self = this;
  let opt = options;

  // options
  if (typeof opt === 'undefined') opt = {};

  opt.autoOpen = false;

  const serverUnitID = opt.unitID || UNIT_ID;

  // create the SerialPort
  self._client = new SerialPort(path, opt);
  self._rxTimeout = null;
  self._buffer = Buffer.alloc(0);
  self._length = 0;
  self._rxInProgress = false;

  self.numReq = 0;
  self.numRxTimeout = 0;
  self.numShortFrame = 0;
  self.numCRCError = 0;
  self.numWrongUnitID = 0;
  self.numIllegalFunc = 0;

  self._client.on('data', (data) => {
    self._buffer = Buffer.concat([self._buffer, data]);

    if (self._rxInProgress === false) {
      self._rxInProgress = true;

      self._rxTimeout = setTimeout(() => {
        // RX timeout occurred
        self.numRxTimeout += 1;

        self._rxInProgress = false;
        self._length = 0;
        self._buffer = Buffer.alloc(0);
        self._rxTimeout = null;
      }, opt.modbusRXTimeout);
    }

    if (self._buffer.length < 2) return;

    if (self._length === 0) {
      switch (self._buffer[1]) {
        case 1: // read coil status
        case 2: // read input status
        case 3: // read holing registers
        case 4: // read input registers
        case 5: // force single coil
        case 6: // preset single register
          self._length = 8;
          break;

        case 15:
        case 16:
          if (self._buffer.length >= 7) {
            const l = self._buffer[6] + 9;
            self._length = l;
          }
          break;

        default:
          break;
      }
    }

    const rtuWriter = (err, responseBuffer) => {
      if (err) {
        return;
      }

      // send data back
      if (responseBuffer) {
        self._client.write(responseBuffer);
      }
    };

    if (self._buffer.length === self._length) {
      self.numReq += 1;
      clearTimeout(self._rxTimeout);

      let reqFrame = Buffer.from([]);

      reqFrame = self._buffer.slice();

      self._rxInProgress = false;
      self._length = 0;
      self._buffer = Buffer.alloc(0);
      self._rxTimeout = null;

      setTimeout(
        _parseModbusBuffer.bind(self,
          reqFrame,
          vector,
          serverUnitID,
          rtuWriter), 0,
      );
    }
  });

  Object.defineProperty(self, 'isOpen', {
    enumerable: true,
    get: () => self._client.isOpen,
  });
  EventEmitter.call(self);
};

util.inherits(ServerRTU, EventEmitter);

ServerRTU.prototype.open = function open(callback) {
  this._client.open(callback);
};

ServerRTU.prototype.close = function close(callback) {
  this._client.close(callback);
};

module.exports = ServerRTU;
