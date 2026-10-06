const fs=require('fs');
const path=require('path');
const {SimpleWS}=require('./ws');

const ACTIONS={
 'com.costner.wavelink3.mute':{name:'Mute / Unmute',kind:'mute',icon:'mic'},
 'com.costner.wavelink3.volumeup':{name:'Volume +',kind:'volume',delta:.1,sign:'plus',icon:'volume-up'},
 'com.costner.wavelink3.volumedown':{name:'Volume −',kind:'volume',delta:-.1,sign:'minus',icon:'volume-down'},
 'com.costner.wavelink3.inputstatus':{name:'Input / Entrada',kind:'status',statusIcon:'input',defaultType:'channel'},
 'com.costner.wavelink3.outputstatus':{name:'Output / Saída',kind:'status',statusIcon:'output',defaultType:'channelSend'},
 'com.costner.wavelink3.auxstatus':{name:'AUX / Mix',kind:'status',statusIcon:'aux',defaultType:'channelSend'}
};

class StreamDock{
 constructor(){this.ws=null;this.port=null;this.uuid=null;this.register=null;this.handlers={};}
 on(e,f){this.handlers[e]=f;return this;}
 connect(){const a=process.argv.slice(2);for(let i=0;i<a.length;i++){if(a[i]==='-port')this.port=a[++i];else if(a[i]==='-pluginUUID')this.uuid=a[++i];else if(a[i]==='-registerEvent')this.register=a[++i];}
  if(!this.port)return console.error('No StreamDock port');
  this.ws=new SimpleWS('ws://127.0.0.1:'+this.port);
  this.ws.on('open',()=>{this.send({event:this.register,uuid:this.uuid});this.emit('connected',{});});
  this.ws.on('message',s=>{try{const m=JSON.parse(s);this.emit(m.event,m);}catch(e){console.error('StreamDock message:',e.message)}});
  this.ws.on('error',e=>console.error('StreamDock WS:',e.message));this.ws.connect();
 }
 emit(e,m){const f=this.handlers[e];if(f)try{f(m)}catch(x){console.error(e,x)}}
 send(o){if(this.ws&&this.ws.opened)this.ws.sendText(JSON.stringify(o));}
 setTitle(c,t){this.send({event:'setTitle',context:c,payload:{title:String(t),target:0}})}
 setState(c,state){this.send({event:'setState',context:c,payload:{state:Number(state)}})}
 setImage(c,i){this.send({event:'setImage',context:c,payload:{image:i,target:0,state:0}})}
 sendPI(c,payload){this.send({event:'sendToPropertyInspector',context:c,payload});}
 setSettings(c,settings){this.send({event:'setSettings',context:c,payload:settings});}
}

class WaveLink{
 constructor(){this.ws=null;this.next=1;this.pending=new Map();this.channels=[];this.mixes=[];this.inputs=[];this.outputs=[];this.connected=false;this.connecting=false;}
 async connect(){if(this.connecting||this.connected)return;this.connecting=true;
  try{const infoPath=path.join(process.env.LOCALAPPDATA,'Packages','Elgato.WaveLink_g54w8ztgkx496','LocalState','ws-info.json');
   const info=JSON.parse(fs.readFileSync(infoPath,'utf8'));const port=Number(info.port);
   this.ws=new SimpleWS('ws://127.0.0.1:'+port,{'Origin':'streamdeck://'});
   this.ws.on('open',()=>{this.connected=true;});
   this.ws.on('message',s=>{let m;try{m=JSON.parse(s)}catch{return;}if(m.id!=null&&this.pending.has(m.id)){const p=this.pending.get(m.id);this.pending.delete(m.id);m.error?p.reject(new Error(m.error.message||'Wave Link error')):p.resolve(m.result);}});
   this.ws.on('close',()=>{this.connected=false;for(const [id,p] of this.pending){p.reject(new Error('Wave Link desconectado'));this.pending.delete(id);}setTimeout(()=>this.connect().catch(()=>{}),1200);});
   this.ws.on('error',e=>console.error('Wave Link WS:',e.message));this.ws.connect();
   await new Promise((r,j)=>{const t=setInterval(()=>{if(this.connected){clearInterval(t);r()}},25);setTimeout(()=>{clearInterval(t);j(new Error('Wave Link timeout'))},7000)});
   await this.refresh();
  }finally{this.connecting=false;}
 }
 rpc(method,params={}){return new Promise((resolve,reject)=>{if(!this.connected)return reject(new Error('Wave Link desconectado'));const id=this.next++;this.pending.set(id,{resolve,reject});this.ws.sendText(JSON.stringify({method,params,id,jsonrpc:'2.0'}));setTimeout(()=>{if(this.pending.has(id)){this.pending.delete(id);reject(new Error('Wave Link timeout'))}},4000);});}
 async refresh(){
  // Canais e mixes sao a base estavel da API. Dispositivos fisicos sao opcionais:
  // se uma chamada de hardware falhar, o painel ainda precisa receber o catalogo.
  const [c,m]=await Promise.all([this.rpc('getChannels'),this.rpc('getMixes')]);
  this.channels=Array.isArray(c?.channels)?c.channels:(Array.isArray(c)?c:(c?.result||[]));
  this.mixes=Array.isArray(m?.mixes)?m.mixes:(Array.isArray(m)?m:(m?.result||[]));
  this.inputs=[]; this.outputs=[];
  try{
   const i=await this.rpc('getInputDevices');
   const raw=Array.isArray(i?.inputDevices)?i.inputDevices:(Array.isArray(i)?i:(i?.result||[]));
   this.inputs=raw;
  }catch(e){console.error('getInputDevices optional:',e.message)}
  try{
   const o=await this.rpc('getOutputDevices');
   const raw=Array.isArray(o?.outputDevices)?o.outputDevices:(Array.isArray(o)?o:(o?.result||[]));
   this.outputs=raw;
  }catch(e){console.error('getOutputDevices optional:',e.message)}
  return true;
 }
 channel(id){return this.channels.find(x=>x.id===id)}
 mix(id){return this.mixes.find(x=>x.id===id)}
 inputTarget(id){for(const d of this.inputs){const x=(d.inputs||[]).find(v=>v.id===id);if(x)return {device:d,input:x};}return null}
 outputTarget(id){for(const d of this.outputs){const x=(d.outputs||[]).find(v=>v.id===id);if(x)return {device:d,output:x};}return null}
 getValue(t){
  if(!t)return {muted:false,level:0};
  if(t.type==='channel'){const c=this.channel(t.id);return {muted:!!c?.isMuted,level:Number(c?.level??0),name:c?.name};}
  if(t.type==='channelSend'){const c=this.channel(t.id);const m=(c?.mixes||[]).find(x=>x.id===t.mix);return {muted:!!m?.isMuted,level:Number(m?.level??0),name:c?.name};}
  if(t.type==='mix'){const m=this.mix(t.id);return {muted:!!m?.isMuted,level:Number(m?.level??0),name:m?.name};}
  if(t.type==='output'){const x=this.outputTarget(t.id);return {muted:!!x?.output?.isMuted,level:Number(x?.output?.level??0),name:x?.output?.name||x?.device?.name};}
  return {muted:false,level:0};
 }
 async mutate(t){
  const s=this.getValue(t), value=!s.muted;
  if(t.type==='channel'){
   const c=this.channel(t.id); const old=!!c?.isMuted; if(c)c.isMuted=value;
   try{return await this.rpc('setChannel',{id:t.id,isMuted:value});}
   catch(e){if(c)c.isMuted=old;throw e;}
  }
  if(t.type==='channelSend'){
   // Optimistic update: send immediately. Do not perform a getChannels round-trip
   // before the write; that round-trip was the main source of missed rapid presses.
   const c=this.channel(t.id); const m=c?.mixes?.find(x=>x.id===t.mix); if(!m)throw new Error('Mix não encontrado para o canal');
   const old=!!m.isMuted; m.isMuted=value;
   try{return await this.rpc('setChannel',{id:t.id,mixes:[{id:t.mix,isMuted:value}]});}
   catch(e){m.isMuted=old;throw e;}
  }
  if(t.type==='mix'){
   const m=this.mix(t.id); const old=!!m?.isMuted; if(m)m.isMuted=value;
   try{return await this.rpc('setMix',{id:t.id,isMuted:value});}
   catch(e){if(m)m.isMuted=old;throw e;}
  }
  if(t.type==='output'){
   const x=this.outputTarget(t.id); if(!x)throw new Error('Saída não encontrada');
   const old=!!x.output?.isMuted; if(x.output)x.output.isMuted=value;
   try{return await this.rpc('setOutputDevice',{outputDevice:{id:x.device.id,outputs:[{id:x.output.id,isMuted:value}]}});}
   catch(e){if(x.output)x.output.isMuted=old;throw e;}
  }
 }
 async change(t,delta){
  const s=this.getValue(t), level=Math.max(0,Math.min(1,s.level+delta));
  if(t.type==='channel'){
   const c=this.channel(t.id); const old=Number(c?.level??0); if(c)c.level=level;
   try{return await this.rpc('setChannel',{id:t.id,level});}
   catch(e){if(c)c.level=old;throw e;}
  }
  if(t.type==='channelSend'){
   const c=this.channel(t.id); const m=c?.mixes?.find(x=>x.id===t.mix); if(!m)throw new Error('Mix não encontrado para o canal');
   const old=Number(m.level??0); m.level=level;
   try{return await this.rpc('setChannel',{id:t.id,mixes:[{id:t.mix,level}]});}
   catch(e){m.level=old;throw e;}
  }
  if(t.type==='mix'){
   const m=this.mix(t.id); const old=Number(m?.level??0); if(m)m.level=level;
   try{return await this.rpc('setMix',{id:t.id,level});}
   catch(e){if(m)m.level=old;throw e;}
  }
  if(t.type==='output'){
   const x=this.outputTarget(t.id); if(!x)throw new Error('Saída não encontrada');
   const old=Number(x.output?.level??0); if(x.output)x.output.level=level;
   try{return await this.rpc('setOutputDevice',{outputDevice:{id:x.device.id,outputs:[{id:x.output.id,level}]}});}
   catch(e){if(x.output)x.output.level=old;throw e;}
  }
 }
 catalog(){
  const flattenInputs=this.inputs.flatMap(d=>Array.isArray(d?.inputs)
    ? d.inputs.map(x=>({id:x.id,name:((d.name||'Entrada')+' — '+(x.name||'Entrada')).trim(),isMuted:x.isMuted,gain:x.gain}))
    : (d?.id?[{id:d.id,name:d.name||'Entrada',isMuted:d.isMuted,gain:d.gain}]:[]));
  const flattenOutputs=this.outputs.flatMap(d=>Array.isArray(d?.outputs)
    ? d.outputs.map(x=>({id:x.id,name:((d.name||'Saída')+' — '+(x.name||'Saída')).trim(),isMuted:x.isMuted,level:x.level}))
    : (d?.id?[{id:d.id,name:d.name||'Saída',isMuted:d.isMuted,level:d.level}]:[]));
  return {
   channels:this.channels.map(x=>({id:x.id,name:x.name,level:x.level,isMuted:x.isMuted})),
   mixes:this.mixes.map(x=>({id:x.id,name:x.name,level:x.level,isMuted:x.isMuted})),
   inputs:flattenInputs,
   outputs:flattenOutputs
  };
 }
}

const imgDir=path.join(__dirname,'..','imgs');const imageCache={};
function img(name){if(!imageCache[name]){let p=path.join(imgDir,name+'.png');let mime='image/png';if(!fs.existsSync(p)){p=path.join(imgDir,name+'.svg');mime='image/svg+xml';}imageCache[name]='data:'+mime+';base64,'+fs.readFileSync(p).toString('base64');}return imageCache[name];}
const sd=new StreamDock(),wl=new WaveLink(),owners=new Map(),timers=new Map();
function settingTarget(a){const s=a.settings||{};if(!s.targetType||!s.targetId)return null;return {type:s.targetType,id:s.targetId,mix:s.mixId};}
function isStatus(a){return a.kind==='status';}
function stateFor(a){return wl.getValue(settingTarget(a));}
function iconBase(a){return a.icon||'speaker';}
function imageFor(a,s){
  const pctValue=Math.max(0,Math.min(100,Math.round((s.level||0)*100)));
  const pct=pctValue+'%';
  let raw;
  if(a.kind==='mute') raw=img((s.muted?'mic-muted':'mic-live')+'-'+pctValue);
  else if(a.kind==='status') raw=img(a.statusIcon+(s.muted?'-muted':'-active'));
  else raw=img(a.icon);

  if(a.kind==='status' && raw.startsWith('data:image/svg+xml;base64,')){
    const b=Buffer.from(raw.split(',')[1],'base64').toString('utf8');
    const svg=b.replace(/<text x="72" y="119"[^>]*>.*?<\/text>/s,'');
    const color=s.muted?'#ff4d5f':(a.statusIcon==='input'?'#42d9ff':a.statusIcon==='output'?'#8b7cff':'#ffb347');
    const label=`<text x="72" y="24" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="18" font-weight="700" fill="${color}">${pct}</text>`;
    raw='data:image/svg+xml;base64,'+Buffer.from(svg.replace('</svg>',label+'</svg>')).toString('base64');
  }

  return raw;
}
async function update(ctx,a){try{const s=stateFor(a);if(isStatus(a)||a.kind==='mute')sd.setState(ctx,s.muted?1:0);sd.setImage(ctx,imageFor(a,s));}catch(e){console.error('Update:',e.message);}}
function act(ctx,a){
  try{
    const t=settingTarget(a); if(!t)throw new Error('Ação não configurada');
    // Fire the Wave Link write immediately. The local state is changed before
    // rpc() returns, so consecutive key presses are never blocked by a previous
    // request. Do not refresh the whole catalog on a write failure: that used to
    // overwrite the optimistic state during rapid presses.
    const op=(a.kind==='mute'||a.kind==='status')?wl.mutate(t):wl.change(t,a.delta);
    update(ctx,a);
    op.catch(e=>{
      console.error('Wave Link action:',e.message);
      // A lightweight delayed sync is enough to recover from a rejected write.
      // It is deliberately not awaited by the key handler.
      setTimeout(()=>{wl.refresh().then(()=>update(ctx,a)).catch(()=>{});},250);
    });
  }catch(e){console.error('Wave Link action:',e.message);}
}
function startRepeat(ctx,a){stopRepeat(ctx);act(ctx,a);if(a.kind!=='volume')return;let delay;let iv;delay=setTimeout(()=>{iv=setInterval(()=>act(ctx,a),100);timers.set(ctx,{delay:null,iv});},350);timers.set(ctx,{delay,iv:null});}
function stopRepeat(ctx){const t=timers.get(ctx);if(!t)return;if(t.delay)clearTimeout(t.delay);if(t.iv)clearInterval(t.iv);timers.delete(ctx);}
function syncCatalog(ctx){const a=owners.get(ctx); if(!a)return; a.settings=Object.assign({},a.settings,{_catalog:wl.catalog()}); owners.set(ctx,a); sd.setSettings(ctx,a.settings); update(ctx,a);}
sd.on('willAppear',m=>{const def=ACTIONS[m.action];if(!def)return;const initial=Object.assign({},m.payload?.settings||{});if(def.defaultType&&!initial.targetType)initial.targetType=def.defaultType;const a=Object.assign({},def,{settings:initial});owners.set(m.context,a);if(wl.connected){syncCatalog(m.context).catch?.(()=>{});}else update(m.context,a);});
sd.on('willDisappear',m=>{stopRepeat(m.context);owners.delete(m.context);});
sd.on('keyDown',m=>{let a=owners.get(m.context);if(!a)return; if(m.payload?.settings){a.settings=Object.assign({},a.settings,m.payload.settings);owners.set(m.context,a);} if(isStatus(a)||a.kind==='mute')act(m.context,a); else startRepeat(m.context,a);});
sd.on('keyUp',m=>stopRepeat(m.context));
sd.on('didReceiveSettings',m=>{const a=owners.get(m.context);if(!a)return;const incoming=m.payload?.settings||{};a.settings=Object.assign({},a.settings,incoming);owners.set(m.context,a);update(m.context,a);});
sd.on('sendToPlugin',m=>{const p=m.payload||{};if(p.request==='catalog'){wl.refresh().then(()=>syncCatalog(m.context)).catch(e=>console.error('Catalog:',e.message));return;}});
sd.on('connected',()=>{wl.connect().then(async()=>{await updateAll(); for(const [ctx] of owners) syncCatalog(ctx);}).catch(e=>console.error('Wave Link:',e.message));});
async function updateAll(){for(const [ctx,a] of owners)await update(ctx,a);}
setInterval(async()=>{if(!wl.connected)return; try{await wl.refresh(); await updateAll();}catch(e){console.error('Wave Link refresh:',e.message)}},1500);sd.connect();
