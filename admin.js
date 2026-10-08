const SUPABASE_URL='https://jchkwsrgdcmqfwcugzgc.supabase.co';
const SUPABASE_KEY='sb_publishable_2tGID4zKyJ2qEkbXbrVeog_GnrhqGUr';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storage:window.sessionStorage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
let teachers=[];
let idleTimer=null;
const IDLE_MS=30*60*1000;
function resetIdle(){
  clearTimeout(idleTimer);
  idleTimer=setTimeout(async()=>{await db.auth.signOut();showLogin();msg($('loginMsg'),'Administrace vás po 30 minutách nečinnosti automaticky odhlásila.');},IDLE_MS);
}
['pointerdown','keydown','touchstart'].forEach(ev=>document.addEventListener(ev,resetIdle,{passive:true}));
resetIdle();

const $=id=>document.getElementById(id);
function msg(el,text){el.textContent=text;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),4500)}
function cleanCode(v){return String(v||'').replace(/\D/g,'').slice(0,4)}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function statusPill(v){if(v==='Přijdu')return '<span class="pill yes">✓ Přijde</span>';if(v==='Nepřijdu')return '<span class="pill no">✕ Nepřijde</span>';return '<span class="pill none">— Bez odpovědi</span>'}
function baseLink(){let b=location.origin+location.pathname.replace(/admin\.html$/,'');if(!b.endsWith('/'))b+='/';return b}
function randomCode(){
  const used=new Set(teachers.map(t=>t.code));
  for(let i=0;i<1000;i++){const c=String(Math.floor(1000+Math.random()*9000));if(!used.has(c))return c}
  return '';
}
async function ensureSession(){
  const {data}=await db.auth.getSession();
  if(data.session){showAdmin(data.session.user);await loadTeachers()}else showLogin();
}
function showLogin(){$('loginBox').classList.remove('hidden');$('adminBox').classList.add('hidden')}
function showAdmin(user){resetIdle();$('loginBox').classList.add('hidden');$('adminBox').classList.remove('hidden');$('who').textContent='Přihlášen: '+user.email}
$('loginBtn').onclick=async()=>{
  $('loginBtn').classList.add('loading');
  const {data,error}=await db.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});
  $('loginBtn').classList.remove('loading');
  if(error){msg($('loginMsg'),'Přihlášení se nepodařilo. Zkontrolujte e-mail a heslo.');return}
  showAdmin(data.user);await loadTeachers();
};
$('logoutBtn').onclick=async()=>{await db.auth.signOut();showLogin()};

async function loadTeachers(){
  const {data,error}=await db.from('invitations').select('*').order('name');
  if(error){msg($('adminMsg'),'Načtení selhalo: '+error.message);return}
  teachers=data||[];render();
}
function render(){
  const q=$('search').value.trim().toLowerCase();
  const list=teachers.filter(t=>!q||[t.name,t.subject,t.code,t.salutation,t.language,t.rsvp_status,t.note].some(v=>String(v||'').toLowerCase().includes(q)));
  $('tbody').innerHTML=list.map(t=>`
    <tr data-id="${t.id}">
      <td><strong>${esc(t.name)}</strong><div class="small">${t.active?'aktivní':'NEAKTIVNÍ'}</div></td>
      <td>${esc(t.subject||'')}</td>
      <td>${t.language==='en'?'🇬🇧 English':'🇨🇿 Čeština'}</td>
      <td class="code">${esc(t.code)}</td>
      <td>${statusPill(t.rsvp_status)}<div class="small">${t.responded_at?new Date(t.responded_at).toLocaleString('cs-CZ'):''}</div></td>
      <td class="note">${esc(t.note||'')}</td>
      <td><textarea class="reply" data-reply="${t.id}" placeholder="Odpověď učiteli...">${esc(t.admin_reply||'')}</textarea><button data-save-reply="${t.id}" style="margin-top:5px">Uložit odpověď</button></td>
      <td><button data-copy="${t.code}">Kopírovat odkaz</button></td>
      <td><button data-edit="${t.id}">Upravit</button> <button data-reset="${t.id}">Reset RSVP</button> <button class="danger" data-delete="${t.id}">Smazat</button></td>
    </tr>`).join('');
  $('sAll').textContent=teachers.length;
  $('sYes').textContent=teachers.filter(t=>t.rsvp_status==='Přijdu').length;
  $('sNo').textContent=teachers.filter(t=>t.rsvp_status==='Nepřijdu').length;
  $('sNone').textContent=teachers.filter(t=>!t.rsvp_status).length;
  $('sNotes').textContent=teachers.filter(t=>(t.note||'').trim()).length;
}
$('search').oninput=render;
$('refreshBtn').onclick=loadTeachers;

$('tbody').onclick=async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.copy){await navigator.clipboard.writeText(baseLink()+b.dataset.copy);msg($('adminMsg'),'Odkaz zkopírován.');return}
  const id=b.dataset.edit||b.dataset.reset||b.dataset.delete||b.dataset.saveReply;
  const t=teachers.find(x=>String(x.id)===String(id));if(!t)return;
  if(b.dataset.edit){openModal(t);return}
  if(b.dataset.saveReply){
    const val=document.querySelector('[data-reply="'+id+'"]').value.trim();
    const {error}=await db.from('invitations').update({admin_reply:val||null,admin_replied_at:val?new Date().toISOString():null}).eq('id',id);
    if(error)msg($('adminMsg'),'Chyba: '+error.message);else{t.admin_reply=val;msg($('adminMsg'),'Odpověď uložena.')}
    return;
  }
  if(b.dataset.reset){
    if(!confirm('Opravdu smazat RSVP odpověď tohoto učitele?'))return;
    const {error}=await db.from('invitations').update({rsvp_status:null,note:null,responded_at:null}).eq('id',id);
    if(error)msg($('adminMsg'),'Chyba: '+error.message);else await loadTeachers();
    return;
  }
  if(b.dataset.delete){
    if(!confirm('Opravdu tohoto učitele úplně smazat?'))return;
    const {error}=await db.from('invitations').delete().eq('id',id);
    if(error)msg($('adminMsg'),'Chyba: '+error.message);else await loadTeachers();
  }
};

function openModal(t=null){
  $('modal').classList.add('show');$('editId').value=t?.id||'';$('modalTitle').textContent=t?'Upravit učitele':'Přidat učitele';
  $('fName').value=t?.name||'';$('fSalutation').value=t?.salutation||'';$('fSubject').value=t?.subject||'';$('fCode').value=t?.code||randomCode();$('fLanguage').value=t?.language||'cs';$('fActive').checked=t?t.active!==false:true;
}
function closeModal(){$('modal').classList.remove('show');$('modalMsg').classList.remove('show')}
$('addBtn').onclick=()=>openModal();$('modalClose').onclick=closeModal;$('cancelTeacher').onclick=closeModal;
$('randomCode').onclick=()=>{$('fCode').value=randomCode()};
$('fCode').oninput=e=>e.target.value=cleanCode(e.target.value);
$('saveTeacher').onclick=async()=>{
  const payload={name:$('fName').value.trim(),salutation:$('fSalutation').value.trim(),subject:$('fSubject').value.trim()||null,language:$('fLanguage').value==='en'?'en':'cs',code:cleanCode($('fCode').value),active:$('fActive').checked};
  if(!payload.name||!payload.salutation||payload.code.length!==4){msg($('modalMsg'),'Vyplňte jméno, oslovení a přesně 4místný kód.');return}
  const id=$('editId').value;
  const q=id?db.from('invitations').update(payload).eq('id',id):db.from('invitations').insert(payload);
  const {error}=await q;
  if(error){msg($('modalMsg'),'Uložení selhalo: '+error.message);return}
  closeModal();await loadTeachers();
};

$('exportBtn').onclick=()=>{
  const cols=['name','salutation','subject','language','code','active','rsvp_status','note','admin_reply','responded_at'];
  const csv=[cols.join(';'),...teachers.map(t=>cols.map(c=>'"'+String(t[c]??'').replace(/"/g,'""')+'"').join(';'))].join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));a.download='stuzkovaci-vecirek-rsvp.csv';a.click();URL.revokeObjectURL(a.href);
};
ensureSession();