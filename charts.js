/* SVG renderer; no external libraries, network requests or canvas bitmaps. */
(()=>{
const NS="http://www.w3.org/2000/svg",D=window.MWS_DATA;
function el(tag,attrs={},text){let n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n}
function add(p,tag,attrs,text){let n=el(tag,attrs,text);p.append(n);return n}
function svg(host,w=1060,h=520,title="График"){host.replaceChildren();const n=el("svg",{viewBox:`0 0 ${w} ${h}`,class:"plot__svg",role:"img","aria-label":title});add(n,"title",{},title);host.append(n);return n}
function marker(p,shape,x,y,c,r=6){const a={fill:"#fff",stroke:c,"stroke-width":2.5};if(shape==="square")return add(p,"rect",{x:x-r,y:y-r,width:r*2,height:r*2,...a});if(shape==="triangle")return add(p,"path",{d:`M${x},${y-r-1} L${x+r+1},${y+r} L${x-r-1},${y+r} Z`,...a});if(shape==="diamond")return add(p,"path",{d:`M${x},${y-r-2} L${x+r+2},${y} L${x},${y+r+2} L${x-r-2},${y} Z`,...a});if(shape==="cross")return add(p,"path",{d:`M${x-r},${y-r} L${x+r},${y+r} M${x+r},${y-r} L${x-r},${y+r}`,fill:"none",stroke:c,"stroke-width":3});return add(p,"circle",{cx:x,cy:y,r,...a})}
function axis(s,{w=1060,h=520,max=100,min=0,xLabels=[],xLabel="",yLabel="",numericX=false,xMax=100,right=100,left=78}={}){
 const L=left,R=w-right,T=42,B=h-76,W=R-L,H=B-T;
 for(let i=0;i<=4;i++){let v=min+(max-min)*i/4,y=B-i*H/4;add(s,"line",{x1:L,y1:y,x2:R,y2:y,class:i?"chart-grid":"chart-baseline"});add(s,"text",{x:L-16,y:y+6,"text-anchor":"end",class:"chart-axis"},Number(v.toFixed(2)).toLocaleString("ru-RU"))}
 add(s,"text",{x:L,y:20,class:"chart-axis-title"},yLabel);
 if(numericX){for(let i=0;i<=4;i++)add(s,"text",{x:L+i*W/4,y:B+32,"text-anchor":"middle",class:"chart-axis"},String(i*xMax/4))}
 else xLabels.forEach((t,i)=>add(s,"text",{x:L+i*W/Math.max(1,xLabels.length-1),y:B+32,"text-anchor":"middle",class:"chart-axis"},t));
 if(xLabel)add(s,"text",{x:R,y:h-8,"text-anchor":"end",class:"chart-axis-title"},xLabel);
 return {L,R,T,B,W,H,x:i=>L+i*W/Math.max(1,xLabels.length-1),y:v=>B-(v-min)*H/(max-min)};
}
function sample(series){const n=el("svg",{viewBox:"0 0 72 26","aria-hidden":"true"});add(n,"line",{x1:1,y1:13,x2:71,y2:13,stroke:series.color,"stroke-width":3,"stroke-dasharray":series.dash});marker(n,series.marker,36,13,series.color,5);return n}
function lineChart(host,{count=5,selected=null,single=false,compact=false}={}){
 const series=single?[D.series[0]]:D.series.slice(0,count),w=single?1400:compact?680:1060,h=single?470:compact?390:520;
 const s=svg(host,w,h,"Линейный график. Условные данные для макета"),a=axis(s,{w,h,max:D.line.yMax,min:D.line.yMin,xLabels:D.labels,xLabel:D.line.xLabel,yLabel:D.line.yLabel,right:single?100:compact?70:112,left:compact?65:78});
 const groups=[];let pick=selected&&series.some(x=>x.id===selected)?selected:null;
 series.forEach(t=>{let g=add(s,"g",{class:"series-group","data-series":t.id,tabindex:single?-1:0,role:"button","aria-label":`Выделить ${t.name}`,"aria-pressed":"false"});add(g,"title",{},t.name+": "+t.values.join(", "));add(g,"path",{d:t.values.map((v,i)=>`${i?"L":"M"}${a.x(i)},${a.y(v)}`).join(" "),stroke:t.color,"stroke-width":3.5,"stroke-dasharray":t.dash,class:"series-line"});t.values.forEach((v,i)=>marker(g,t.marker,a.x(i),a.y(v),t.color,compact?4:5.5));if(!single)add(g,"text",{x:a.R+18,y:a.y(t.values.at(-1))+6,fill:t.color,class:"series-label"},t.name.replace("Серия ",""));g.addEventListener("click",()=>select(pick===t.id?null:t.id));g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();select(pick===t.id?null:t.id)}});groups.push({g,t})});
 const scope=host.closest(".slide"),legend=scope.querySelector(`[data-legend="${host.id}"]`),status=scope.querySelector(`[data-status="${host.id}"]`),buttons=[];
 if(legend){legend.replaceChildren();series.forEach(t=>{let b=document.createElement("button");b.className="legend-item";b.style.setProperty("--series-color",t.color);b.setAttribute("aria-pressed","false");b.append(sample(t),document.createTextNode(t.name));b.addEventListener("click",()=>select(pick===t.id?null:t.id));legend.append(b);buttons.push({b,t})});let reset=document.createElement("button");reset.className="legend-reset";reset.textContent="Показать все серии";reset.addEventListener("click",()=>select(null));legend.append(reset)}
 function select(id){pick=id;groups.forEach(({g,t})=>{g.style.opacity=id&&t.id!==id?".16":"1";g.setAttribute("aria-pressed",String(t.id===id));g.querySelector("path").setAttribute("stroke-width",id===t.id?"5":"3.5")});if(id){const active=groups.find(x=>x.t.id===id);s.append(active.g)}buttons.forEach(({b,t})=>{b.setAttribute("aria-pressed",String(t.id===id));b.style.opacity=id&&t.id!==id?".5":"1"});if(status)status.textContent=id?`Выделена ${series.find(x=>x.id===id).name.toLowerCase()}. Нажмите ещё раз для сброса.`:"Все серии видны. Нажмите название, чтобы выделить кривую.";host.dataset.selected=id||"all"}
 select(pick);host._lineOptions={count,selected,single,compact};
}
function bars(host,{compact=false,set="bars"}={}){
 const b=D[set]||D.bars,w=compact?680:1400,h=compact?390:470,s=svg(host,w,h,"Сравнение групп"),L=compact?65:80,R=w-32,T=42,B=h-76,W=R-L,H=B-T;
 for(let i=0;i<=4;i++){let y=B-i*H/4;add(s,"line",{x1:L,y1:y,x2:R,y2:y,class:i?"chart-grid":"chart-baseline"});add(s,"text",{x:L-15,y:y+6,"text-anchor":"end",class:"chart-axis"},(i*b.yMax/4).toLocaleString("ru-RU"))}add(s,"text",{x:L,y:20,class:"chart-axis-title"},b.yLabel);
 b.labels.forEach((label,i)=>{const cx=L+(i+.5)*W/b.labels.length,bw=compact?24:52,gap=compact?7:12;b.series.forEach((t,j)=>{const v=t.values[i],bh=v*H/b.yMax,x=cx+(j-.5)*(bw+gap)-bw/2;add(s,"rect",{x,y:B-bh,width:bw,height:bh,rx:3,fill:t.color});add(s,"text",{x:x+bw/2,y:B-bh-12,"text-anchor":"middle",class:"chart-axis-title"},v.toLocaleString("ru-RU"))});add(s,"text",{x:cx,y:B+34,"text-anchor":"middle",class:"chart-axis"},label)});
}
function scatter(host){const w=1060,h=520,d=D.scatter,s=svg(host,w,h,"Диаграмма рассеяния. Условные данные"),a=axis(s,{w,h,max:d.yMax,numericX:true,xMax:d.xMax,xLabel:d.xLabel,yLabel:d.yLabel,right:50});d.groups.forEach(t=>{let g=add(s,"g");t.points.forEach(([x,y])=>{let m=marker(g,t.marker,a.L+x/d.xMax*a.W,a.y(y),t.color,8);add(m,"title",{},`${t.name}: ${x}, ${y}`)})})}
function network(host){const d=D.network,s=svg(host,980,530,"Граф связей. Выделен маршрут A, B, D, F"),by=Object.fromEntries(d.nodes.map(n=>[n.id,n])),route=d.route.slice(1).map((v,i)=>d.route[i]+":"+v),radius=36;
 d.edges.forEach(([from,to])=>{let a=by[from],b=by[to],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),active=route.includes(from+":"+to);add(s,"line",{x1:a.x+dx/len*radius,y1:a.y+dy/len*radius,x2:b.x-dx/len*radius,y2:b.y-dy/len*radius,class:"graph-edge"+(active?" graph-edge--active":""),"stroke-dasharray":from==="D"&&to==="E"?"7 7":""})});
 d.nodes.forEach(n=>{const g=add(s,"g");add(g,"circle",{cx:n.x,cy:n.y,r:radius,class:"graph-node"+(d.route.includes(n.id)?" graph-node--active":"")});add(g,"text",{x:n.x,y:n.y+8,"text-anchor":"middle",class:"graph-node-text"},n.id);add(g,"text",{x:n.x,y:n.y+72,"text-anchor":"middle",class:"node-label"},n.label)});
 add(s,"text",{x:28,y:515,class:"graph-note"},"Связи неориентированные. Порядок пути задан отдельно.");
}
function architecture(host){const d=D[host.dataset.graph||"architecture"],s=svg(host,d.width||1510,d.height||510,"Ориентированный граф архитектуры решения"),by=Object.fromEntries(d.nodes.map(n=>[n.id,n]));
 const gid=host.dataset.graph||"architecture",defs=add(s,"defs");for(const [id0,color]of [["arrow-gray","#969fa8"],["arrow-red","#ff0032"]]){const id=id0+"-"+gid;let m=add(defs,"marker",{id,markerWidth:9,markerHeight:9,refX:8,refY:4.5,orient:"auto",markerUnits:"userSpaceOnUse"});add(m,"path",{d:"M0 0 L9 4.5 L0 9 Z",fill:color})}
 if(d.frame){add(s,"rect",{x:d.frame.x,y:d.frame.y,width:d.frame.w,height:d.frame.h,rx:20,fill:"#f9f9fb",stroke:"#e2e5eb","stroke-dasharray":"8 8"});add(s,"text",{x:d.frame.x+26,y:d.frame.y+30,class:"graph-note"},d.frame.label)}
 const cx=n=>n.x+n.w/2,cy=n=>n.y+n.h/2;
 d.edges.forEach(e=>{const a=by[e.from],b=by[e.to];let x1,y1,x2,y2,path,lx,ly;
  if(e.route==="over"){/* из верхней вершины ромба вверх, над промежуточными узлами, и вниз в верх целевого узла */
   x1=cx(a);y1=a.y-2;x2=cx(b);y2=b.y-14;const top=a.y-e.over;path=`M${x1},${y1} V${top} H${x2} V${y2}`;lx=(x1+x2)/2;ly=top-12}
  else{x1=a.x+a.w;y1=cy(a);x2=b.x-14;y2=cy(b);const mx=(x1+x2)/2;path=`M${x1},${y1} H${mx} V${y2} H${x2}`;lx=(x1+x2)/2;ly=y2-14+(e.labelDy||0)}
  add(s,"path",{d:path,class:"graph-edge"+(e.active?" graph-edge--active":""),"stroke-dasharray":e.dashed?"8 7":"","marker-end":`url(#${e.active?"arrow-red":"arrow-gray"}-${gid})`});
  if(e.label)add(s,"text",{x:lx,y:ly,"text-anchor":"middle",class:"graph-note"},e.label)});
 d.nodes.forEach(n=>{const stroke=n.active?"#ff0032":"#bbc1c7",sw=n.active?3:2;
  if(n.shape==="diamond"){const x=cx(n),y=cy(n);add(s,"path",{d:`M${x},${n.y} L${n.x+n.w},${y} L${x},${n.y+n.h} L${n.x},${y} Z`,fill:"#fff",stroke,"stroke-width":sw,"stroke-linejoin":"round"});
   const words=n.title.split(" "),half=Math.ceil(words.length/2),lines=[words.slice(0,half).join(" "),words.slice(half).join(" ")].filter(Boolean);
   lines.forEach((t,i)=>add(s,"text",{x,y:y+8+(i-(lines.length-1)/2)*22,"text-anchor":"middle",class:"diagram-label",style:"font-size:17px"},t))}
  else{add(s,"rect",{x:n.x,y:n.y,width:n.w,height:n.h,rx:12,fill:"#fff",stroke,"stroke-width":sw});add(s,"text",{x:cx(n),y:cy(n)+(n.sub?0:8),"text-anchor":"middle",class:"diagram-label",style:"font-size:19px"},n.title);if(n.sub)add(s,"text",{x:cx(n),y:cy(n)+26,"text-anchor":"middle",class:"graph-note"},n.sub)}});
}

function render(){document.querySelectorAll('[data-chart="lines"]').forEach(h=>lineChart(h,{count:Number(h.dataset.count)||5,selected:h.dataset.focus||null}));document.querySelectorAll('[data-chart="single"]').forEach(h=>lineChart(h,{single:true}));document.querySelectorAll('[data-chart="compact-line"]').forEach(h=>lineChart(h,{count:2,compact:true}));document.querySelectorAll('[data-chart="bars"]').forEach(h=>bars(h,{set:h.dataset.set}));document.querySelectorAll('[data-chart="compact-bars"]').forEach(h=>bars(h,{compact:true,set:h.dataset.set}));document.querySelectorAll('[data-chart="scatter"]').forEach(scatter);document.querySelectorAll('[data-chart="network"]').forEach(network);document.querySelectorAll('[data-chart="architecture"]').forEach(architecture)}
window.MWS_CHARTS={render,lineChart};
})();
