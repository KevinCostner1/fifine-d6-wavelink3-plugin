const net = require('net');
const crypto = require('crypto');
const { URL } = require('url');
const EventEmitter = require('events');

class SimpleWS extends EventEmitter {
  constructor(url, defaultHeaders={}) {
    super(); this.url = new URL(url); this.defaultHeaders = defaultHeaders; this.socket=null; this.buf=Buffer.alloc(0); this.opened=false;
  }
  connect(extraHeaders={}) {
    const port = Number(this.url.port || 80), host=this.url.hostname;
    this.socket = net.createConnection({host,port},()=>{
      const key=crypto.randomBytes(16).toString('base64');
      let req=`GET ${this.url.pathname||'/'} HTTP/1.1\r\nHost: ${host}:${port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n`;
      const headers={...this.defaultHeaders,...extraHeaders};
      for(const [k,v] of Object.entries(headers)) req+=`${k}: ${v}\r\n`;
      req+='\r\n'; this.socket.write(req);
    });
    this.socket.on('data',d=>this._data(d));
    this.socket.on('error',e=>this.emit('error',e));
    this.socket.on('close',()=>{this.opened=false;this.emit('close')});
  }
  _data(d){
    this.buf=Buffer.concat([this.buf,d]);
    if(!this.opened){ const i=this.buf.indexOf('\r\n\r\n'); if(i<0)return; const h=this.buf.slice(0,i).toString(); if(!/^HTTP\/1\.1 101/.test(h)){this.emit('error',new Error('WebSocket handshake failed: '+h.split('\r\n')[0]));this.socket.destroy();return;} this.opened=true; this.emit('open'); this.buf=this.buf.slice(i+4); }
    while(this.buf.length>=2){
      const b1=this.buf[0], b2=this.buf[1]; let len=b2&127, off=2;
      if(len===126){if(this.buf.length<4)return;len=this.buf.readUInt16BE(2);off=4;} else if(len===127){if(this.buf.length<10)return; const hi=this.buf.readUInt32BE(2); const lo=this.buf.readUInt32BE(6); if(hi>0) throw new Error('Frame too large'); len=lo;off=10;}
      const masked=(b2&128)!==0; if(masked)off+=4; if(this.buf.length<off+len)return;
      let payload=this.buf.slice(off,off+len); if(masked){const mk=this.buf.slice(off-4,off);payload=Buffer.from(payload);for(let i=0;i<payload.length;i++)payload[i]^=mk[i%4];}
      this.buf=this.buf.slice(off+len); const op=b1&15;
      if(op===1)this.emit('message',payload.toString('utf8')); else if(op===8){try{this._sendFrame(Buffer.alloc(0),8)}catch{} this.socket.end();this.emit('close');return;} else if(op===9)this._sendFrame(payload,10);
    }
  }
  _sendFrame(payload, opcode=1){
    if(!this.socket || this.socket.destroyed)return; payload=Buffer.isBuffer(payload)?payload:Buffer.from(payload);
    const len=payload.length, mk=crypto.randomBytes(4); let head;
    if(len<126){head=Buffer.alloc(2);head[0]=0x80|opcode;head[1]=0x80|len;}
    else if(len<65536){head=Buffer.alloc(4);head[0]=0x80|opcode;head[1]=0x80|126;head.writeUInt16BE(len,2);}
    else {head=Buffer.alloc(10);head[0]=0x80|opcode;head[1]=0x80|127;head.writeUInt32BE(0,2);head.writeUInt32BE(len,6);}
    const out=Buffer.from(payload);for(let i=0;i<out.length;i++)out[i]^=mk[i%4];this.socket.write(Buffer.concat([head,mk,out]));
  }
  sendText(s){this._sendFrame(Buffer.from(s),1)}
  close(){try{this._sendFrame(Buffer.alloc(0),8);this.socket.end();}catch{}}
}
module.exports={SimpleWS};
