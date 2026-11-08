const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let origin="karasuma-oike",destination="osaka",manualTime=null;
const HOLIDAYS_2026=new Set(["2026-01-01","2026-01-12","2026-02-11","2026-02-23","2026-03-20","2026-04-29","2026-05-03","2026-05-04","2026-05-05","2026-07-20","2026-08-11","2026-09-21","2026-09-22","2026-09-23","2026-10-12","2026-11-03","2026-11-23"]);
function vernalEquinoxDay(y){return Math.floor(20.8431+0.242194*(y-1980)-Math.floor((y-1980)/4))}
function autumnEquinoxDay(y){return Math.floor(23.2488+0.242194*(y-1980)-Math.floor((y-1980)/4))}
function isHoliday(d){
 const y=d.getFullYear(), key=`${y}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
 if(y===2026 && HOLIDAYS_2026.has(key)) return true;
 const fixed=new Set([`${y}-01-01`,`${y}-02-11`,`${y}-02-23`,`${y}-04-29`,`${y}-05-03`,`${y}-05-04`,`${y}-05-05`,`${y}-07-20`,`${y}-08-11`,`${y}-11-03`,`${y}-11-23`]);
 if(fixed.has(key)) return true;
 if(d.getMonth()===2 && d.getDate()===vernalEquinoxDay(y)) return true;
 if(d.getMonth()===8 && d.getDate()===autumnEquinoxDay(y)) return true;
 // Happy Monday holidays: 2nd Monday Jan, 3rd Monday Jul, 3rd Monday Sep, 2nd Monday Oct
 if(d.getDay()===1){
   const nth=Math.ceil(d.getDate()/7);
   if((d.getMonth()===0&&nth===2)||(d.getMonth()===6&&nth===3)||(d.getMonth()===8&&nth===3)||(d.getMonth()===9&&nth===2)) return true;
 }
 return false;
}
function pad(n){return String(n).padStart(2,"0")} function now(){const d=new Date();return{d,m:d.getHours()*60+d.getMinutes()}}
function fmt(m){m=(m+1440)%1440;return`${pad(Math.floor(m/60))}:${pad(m%60)}`}
function stationName(id){return{"karasuma-oike":"烏丸御池","kyoto":"京都","osaka":"大阪"}[id]}
function dayType(d){return(isHoliday(d)||d.getDay()===0||d.getDay()===6)?"holiday":"weekday"}
function setTime(){$("#timeLabel").textContent=fmt(manualTime??now().m)}
function selectGroup(g,v){g.querySelectorAll(".station").forEach(b=>b.classList.toggle("active",b.dataset.value===v))}
$$(".station").forEach(btn=>btn.onclick=()=>{const g=btn.parentElement;if(g.id==="origin"){origin=btn.dataset.value;selectGroup(g,origin)}else{destination=btn.dataset.value;selectGroup(g,destination)}})
$("#changeTime").onclick=()=>{const v=prompt("検索する時刻を HH:MM で入力",fmt(manualTime??now().m));if(!v)return;const m=v.match(/^([01]\d|2[0-3]):([0-5]\d)$/);if(!m){alert("HH:MM 形式で入れてな。");return}manualTime=+m[1]*60+ +m[2];setTime()}
function mode(){if(origin==="karasuma-oike"&&destination==="osaka")return"KO";if(origin==="osaka"&&destination==="karasuma-oike")return"OK";if(origin==="karasuma-oike"&&destination==="kyoto")return"K";if(origin==="kyoto"&&destination==="karasuma-oike")return"KR";if(origin==="kyoto"&&destination==="osaka")return"J";if(origin==="osaka"&&destination==="kyoto")return"JR";return null}
function next(list,t){return list.find(x=>x.depart>=t)} function top3(a){return a.sort((a,b)=>a.arrival-b.arrival).slice(0,3)}
function render(rs){const box=$("#results");box.innerHTML="";if(!rs.length){box.innerHTML=`<div class="empty">条件に合う列車が見つからへんかったで。<div class="note">時刻表データの範囲外か、終電後の可能性があります。</div></div>`;return}rs.forEach(r=>{const e=document.createElement("article");e.className="result";e.innerHTML=`<div class="arrival"><span class="big">${fmt(r.arrival)}</span><span class="small">到着 ${stationName(destination)}</span></div>${r.legs.map((l,i)=>`${i?`<div class="transfer">乗換 ${l.transfer}分</div>`:""}<div class="leg"><div class="icon">${l.type==="jr"?"🚄":"🚇"}</div><div><b>${l.type==="jr"?"新快速":"地下鉄"}　${stationName(l.from)} ${fmt(l.depart)}発</b><span>${stationName(l.to)} ${fmt(l.arrive)}着</span></div></div>`).join("")}`;box.appendChild(e)})}
function search(){const d=new Date(),type=dayType(d),t=(manualTime??now().m)+1;$("#status").textContent=`${stationName(origin)} → ${stationName(destination)}　${fmt(t)}以降`;const md=mode(),data=TIMETABLE[type];let rs=[];
if(md==="K"||md==="KR"||md==="J"||md==="JR"){const list=data[md==="K"?"K":md==="KR"?"KREV":md==="J"?"J":"JREV"];rs=top3(list.filter(x=>x.depart>=t).map(x=>({arrival:x.arrival,legs:[{type:md.startsWith("J")?"jr":"subway",from:origin,to:destination,depart:x.depart,arrive:x.arrival}]})));}
else if(md==="KO"){for(const s of data.K.filter(x=>x.depart>=t)){const j=next(data.J,s.arrival+1);if(j)rs.push({arrival:j.arrival,legs:[{type:"subway",from:"karasuma-oike",to:"kyoto",depart:s.depart,arrive:s.arrival},{type:"jr",from:"kyoto",to:"osaka",depart:j.depart,arrive:j.arrival,transfer:j.depart-s.arrival}]})}rs=top3(rs)}
else if(md==="OK"){for(const j of data.JREV.filter(x=>x.depart>=t)){const s=next(data.KREV,j.arrival+1);if(s)rs.push({arrival:s.arrival,legs:[{type:"jr",from:"osaka",to:"kyoto",depart:j.depart,arrive:j.arrival},{type:"subway",from:"kyoto",to:"karasuma-oike",depart:s.depart,arrive:s.arrival,transfer:s.depart-j.arrival}]})}rs=top3(rs)}
render(rs)}
const override=localStorage.getItem("tsuto_timetable_override");
if(override){try{new Function(override)()}catch(e){}}
$("#searchBtn").onclick=search;setTime();checkForUpdate();const d=new Date();$("#dateLabel").textContent=`${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${["日","月","火","水","木","金","土"][d.getDay()]}曜日`;$("#dataVersion").textContent=`時刻表データ: ${TIMETABLE_VERSION}`;
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));

async function checkForUpdate(){
  // If the PWA is hosted, update.json can point to a newer timetable.js.
  // If offline or unavailable, the bundled timetable remains in use.
  try{
    const r=await fetch("./update.json?ts="+Date.now(),{cache:"no-store"});
    if(!r.ok)return;
    const meta=await r.json();
    if(meta.version && meta.version!==TIMETABLE_VERSION && meta.timetableUrl){
      const js=await fetch(meta.timetableUrl,{cache:"no-store"}).then(x=>x.text());
      if(js.includes("window.TIMETABLE=")){
        localStorage.setItem("tsuto_timetable_override",js);
        location.reload();
      }
    }
  }catch(e){}
}
