const SUPABASE_URL='https://jchkwsrgdcmqfwcugzgc.supabase.co';
const SUPABASE_KEY='sb_publishable_2tGID4zKyJ2qEkbXbrVeog_GnrhqGUr';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});

let soundOn=true,ctx=null,selected='',currentCode='',teacher=null,failedCodeAttempts=0,codeLockedUntil=0;
function audio(){if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(A)ctx=new A()}if(ctx&&ctx.state==='suspended')ctx.resume();return ctx}
function tone(f,d=.05,v=.012,delay=0){if(!soundOn)return;const c=audio();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=f;o.connect(g);g.connect(c.destination);const t=c.currentTime+delay;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.start(t);o.stop(t+d+.02)}
function clickS(){tone(520,.04)} function openS(){tone(640,.05);tone(860,.06,.01,.05)} function okS(){tone(523,.07);tone(659,.08,.012,.07);tone(784,.1,.012,.14)} function errorS(){tone(180,.09,.014);tone(150,.11,.012,.09)}
function cleanCode(v){return String(v||'').replace(/\D/g,'').slice(0,4)}
function fillTeacher(t){
  teacher=t;
  document.querySelectorAll('[data-salutation]').forEach(e=>e.textContent=t.salutation||t.name||'vážený hoste');
  document.querySelectorAll('[data-subject]').forEach(e=>e.textContent=t.subject?('Předmět: '+t.subject):'');
  document.querySelectorAll('[data-code]').forEach(e=>e.textContent=currentCode);
  selected=t.rsvp_status||'';
  document.getElementById('note').value=t.note||'';
  document.querySelectorAll('[data-status]').forEach(b=>b.classList.toggle('selected',b.dataset.status===selected));
  const box=document.getElementById('replyBox');
  if(t.admin_reply){document.getElementById('adminReply').textContent=t.admin_reply;box.classList.add('show')}else box.classList.remove('show');
}
async function loadCode(code){
  if(Date.now()<codeLockedUntil){
    const wait=Math.ceil((codeLockedUntil-Date.now())/1000);
    const err=document.getElementById('gateError');
    err.textContent='Příliš mnoho rychlých pokusů. Zkuste to znovu za '+wait+' s.';
    err.classList.add('show');
    return false;
  }
  code=cleanCode(code);
  const err=document.getElementById('gateError');
  err.classList.remove('show');
  if(code.length!==4){err.textContent='Kód musí mít přesně 4 číslice.';err.classList.add('show');errorS();return false}
  document.getElementById('codeOpen').classList.add('saving');
  const {data,error}=await db.rpc('get_invitation',{p_code:code});
  document.getElementById('codeOpen').classList.remove('saving');
  const row=Array.isArray(data)?data[0]:data;
  if(error){
    err.textContent='Kód se teď nepodařilo ověřit. Zkuste to prosím za chvíli.';
    err.classList.add('show');errorS();return false
  }
  if(!row||row.active===false){
    failedCodeAttempts++;
    if(failedCodeAttempts>=3){
      const seconds=Math.min(30,Math.pow(2,failedCodeAttempts-3)*2);
      codeLockedUntil=Date.now()+seconds*1000;
    }
    err.textContent='Tento kód není platný.';
    err.classList.add('show');errorS();return false
  }
  failedCodeAttempts=0;
  currentCode=code;fillTeacher(row);
  history.replaceState(null,'','?code='+encodeURIComponent(code));
  document.getElementById('codeGate').classList.add('hidden');
  startExperience();
  return true;
}
document.getElementById('codeInput').addEventListener('input',e=>e.target.value=cleanCode(e.target.value));
document.getElementById('codeInput').addEventListener('keydown',e=>{if(e.key==='Enter')loadCode(e.target.value)});
document.getElementById('codeOpen').onclick=()=>loadCode(document.getElementById('codeInput').value);

const boot=document.getElementById('boot');let bootDone=false,experienceStarted=false;
function endBoot(){if(bootDone)return;bootDone=true;boot.style.display='none';setTimeout(()=>openWin('invite'),100)}
function startExperience(){if(experienceStarted)return;experienceStarted=true;boot.style.display='grid';document.getElementById('skip').onclick=endBoot;boot.onclick=e=>{if(e.target.id!=='skip')endBoot()};setTimeout(endBoot,1500)}
function openWin(id){openS();document.querySelectorAll('.window').forEach(w=>w.style.zIndex=20);const e=document.getElementById(id);e.classList.add('open');e.style.zIndex=40}
document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openWin(b.dataset.open));
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{clickS();document.getElementById(b.dataset.close).classList.remove('open')});
document.querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>{clickS();selected=b.dataset.status;document.querySelectorAll('[data-status]').forEach(x=>x.classList.toggle('selected',x===b))});
document.getElementById('send').onclick=async()=>{
  const st=document.getElementById('status');
  if(!selected){st.textContent='Nejdřív vyberte PŘIJDU nebo NEPŘIJDU.';st.classList.add('show');errorS();return}
  const btn=document.getElementById('send');btn.classList.add('saving');st.classList.remove('show');
  const {data,error}=await db.rpc('submit_rsvp',{p_code:currentCode,p_status:selected,p_note:document.getElementById('note').value});
  btn.classList.remove('saving');
  if(error||data!==true){st.textContent='Odpověď se nepodařilo uložit. Zkuste to prosím znovu.';st.classList.add('show');errorS();return}
  st.innerHTML='<strong>✓ Odpověď byla uložena.</strong><br>Vaše volba: '+selected+'<br><small>Odpověď můžete později změnit otevřením stejného odkazu.</small>';st.classList.add('show');okS();
};
document.getElementById('sound').onclick=()=>{audio();soundOn=!soundOn;document.getElementById('sound').textContent=soundOn?'🔊':'🔇'};
document.addEventListener('pointerdown',()=>{if(soundOn)audio()},{once:true});
function tick(){const d=new Date();document.getElementById('clock').textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}tick();setInterval(tick,1000);

(async()=>{
  let code=cleanCode(new URLSearchParams(location.search).get('code')); if(!code){const last=location.pathname.split('/').filter(Boolean).pop(); if(/^\\d{4}$/.test(last||'')) code=last;}
  if(code){document.getElementById('codeInput').value=code;await loadCode(code)}
})();