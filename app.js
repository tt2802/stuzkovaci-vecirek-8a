const SUPABASE_URL='https://jchkwsrgdcmqfwcugzgc.supabase.co';
const SUPABASE_KEY='sb_publishable_2tGID4zKyJ2qEkbXbrVeog_GnrhqGUr';
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});

let soundOn=true,ctx=null,selected='',currentCode='',teacher=null,failedCodeAttempts=0,codeLockedUntil=0;
let currentLang=(navigator.language||'cs').toLowerCase().startsWith('en')?'en':'cs';

const I18N={
cs:{
pageTitle:'Stužkovací večírek 8.A — Discopříběh',gateTitle:'Vstup do STUŽKOVÁNÍ 95',gateHeading:'Zadejte čtyřmístný kód',gateText:'Kód získáte vyřešením šifry na fyzické pozvánce.',gateOpen:'OTEVŘÍT',
bootLogo:'STUŽKOVÁNÍ <span>95</span>',bootText:'Starting 8.A Party System...\nLoading invitation......... OK\nLoading Sladovna........... OK\nLoading 90s mode........... OK\nLoading maturity.exe....... WARNING',skip:'Přeskočit načítání',
wallSubtitle:'Stužkovací večírek 8.A · Gymnázium Kroměříž',help:'<b>Jak na to?</b>1. Přečíst pozvánku. 2. Přečíst <strong>DRESSCODE.TXT</strong>. 3. Kliknout na <strong>POTVRDIT ÚČAST</strong>. Ostatní ikony jsou jen bonus.',
iconInvite:'POZVÁNKA.TXT',iconRsvp:'POTVRDIT ÚČAST',iconMap:'KDE TO JE?',iconTrash:'KOŠ',inviteWindowTitle:'Pozvánka na stužkovací večírek 8.A',inviteMega:'STUŽKOVACÍ<br>VEČÍREK',inviteTheme:'★ TÉMA: DISCOPŘÍBĚH ★',
welcomePrefix:'Vítejte, ',personalText:'Tato pozvánka je určena právě Vám.',subjectPrefix:'Předmět: ',inviteLead:'<strong>Třída 8.A Gymnázia Kroměříž Vás srdečně zve na svůj stužkovací večírek.</strong> Přijďte s námi na jeden večer zpět do devadesátek — retro atmosféra, hudba, barvy a společný večer před maturitou.',
dateLabel:'Datum:',date:'13. listopadu 2026',timeLabel:'Čas:',time:'od 18:00',placeLabel:'Místo:',themeLabel:'Téma:',codeLabel:'Vstupní kód:',replyHeading:'📨 Zpráva od 8.A',easyInvite:'1 ✓ Pozvánka',easyRsvp:'3 Potvrdit účast',inviteRsvp:'POTVRDIT ÚČAST →',close:'Zavřít',
confirmWindowTitle:'Potvrzení účasti — Stužkovací večírek',confirmHeading:'Potvrdíte účast?',confirmLead:', stačí vybrat jednu možnost. Odpověď se uloží přímo třídě 8.A.',yes:'✓ PŘIJDU',no:'✕ NEPŘIJDU',noteLabel:'Poznámka nebo dotaz:',notePlaceholder:'Nepovinné...',send:'ODESLAT ODPOVĚĎ',
mapWindowTitle:'Kde to je? — Sladovna.map',mapDate:'13. 11. 2026 · od 18:00',mapText:'Po kliknutí se otevře vyhledání Sladovny v mapách.',mapOpen:'OTEVŘÍT V MAPÁCH',
dressLead:'Pro nechtěnou mystifikaci s pojmem <strong>RETRO</strong> (široký to pojem, my víme) upřesňujeme dress code:',dressStyle:'80s–90s · pestré barvy · ikonické módní kousky',dressInspiration:'Pro inspiraci doporučujeme zhlédnutí filmu <strong>Discopříběh</strong>.',dressRequired:'<strong>Povinný prvek:</strong> element z céček, které jste dostali společně se šifrou.',dressWarning:'<strong>Porušení se nepromíjí.</strong> 😎',dressOk:'ROZUMÍM',
trashWindowTitle:'Koš',trashHeading:'Obsah koše',trashList:['pisemka_final_FINAL2.doc','uceni_prubezne.txt','absence.xls','motivace.zip','spanek.exe','maturita_final_FINAL.exe'],musicHint:'🎵 Hudbu můžete spustit tlačítkem vpravo dole.',musicEmpty:'Playlist je připravený.',musicSeek:'Posun ve skladbě',taskLabel:'Stužkovací večírek 8.A',musicTitle:'Hudba / přehrávač',soundTitle:'Vypnout systémové zvuky',
rateWait:s=>'Příliš mnoho rychlých pokusů. Zkuste to znovu za '+s+' s.',codeLength:'Kód musí mít přesně 4 číslice.',verifyError:'Kód se teď nepodařilo ověřit. Zkuste to prosím za chvíli.',invalidCode:'Tento kód není platný.',chooseStatus:'Nejdřív vyberte PŘIJDU nebo NEPŘIJDU.',saveError:'Odpověď se nepodařilo uložit. Zkuste to prosím znovu.',saved:'Odpověď byla uložena.',yourChoice:'Vaše volba:',changeLater:'Odpověď můžete později změnit otevřením stejného odkazu.',musicError:'CHYBA // soubor skladby se nepodařilo načíst',statusYes:'Přijdu',statusNo:'Nepřijdu'
},
en:{
pageTitle:'8.A Ribbon Ceremony — Discopříběh',gateTitle:'Enter STUŽKOVÁNÍ 95',gateHeading:'Enter your four-digit code',gateText:'You received the code by solving the puzzle on your physical invitation.',gateOpen:'OPEN',
bootLogo:'STUŽKOVÁNÍ <span>95</span>',bootText:'Starting 8.A Party System...\nLoading invitation......... OK\nLoading Sladovna........... OK\nLoading 90s mode........... OK\nLoading graduation.exe..... WARNING',skip:'Skip loading',
wallSubtitle:'8.A Ribbon Ceremony Evening · Gymnázium Kroměříž',help:'<b>What to do?</b>1. Read the invitation. 2. Read <strong>DRESSCODE.TXT</strong>. 3. Click <strong>CONFIRM ATTENDANCE</strong>. Everything else is just a bonus.',
iconInvite:'INVITATION.TXT',iconRsvp:'CONFIRM ATTENDANCE',iconMap:'WHERE IS IT?',iconTrash:'RECYCLE BIN',inviteWindowTitle:'Invitation to the 8.A Ribbon Ceremony',inviteMega:'RIBBON CEREMONY<br>EVENING',inviteTheme:'★ THEME: DISCOPŘÍBĚH ★',
welcomePrefix:'Welcome, ',personalText:'This invitation is intended especially for you.',subjectPrefix:'Subject: ',inviteLead:'<strong>Class 8.A of Gymnázium Kroměříž would like to invite you to our ribbon ceremony evening.</strong> Join us for one night back in the 80s and 90s — retro atmosphere, music, colour and one shared evening before our final exams.',
dateLabel:'Date:',date:'13 November 2026',timeLabel:'Time:',time:'from 6:00 PM',placeLabel:'Venue:',themeLabel:'Theme:',codeLabel:'Invitation code:',replyHeading:'📨 Message from 8.A',easyInvite:'1 ✓ Invitation',easyRsvp:'3 Confirm attendance',inviteRsvp:'CONFIRM ATTENDANCE →',close:'Close',
confirmWindowTitle:'RSVP — 8.A Ribbon Ceremony',confirmHeading:'Will you be joining us?',confirmLead:', simply choose one option below. Your response will be saved directly for class 8.A.',yes:"✓ I'M COMING",no:"✕ I CAN'T COME",noteLabel:'Note or question:',notePlaceholder:'Optional...',send:'SEND RESPONSE',
mapWindowTitle:'Where is it? — Sladovna.map',mapDate:'13 November 2026 · from 6:00 PM',mapText:'Click below to open Sladovna Kroměříž in Google Maps.',mapOpen:'OPEN IN MAPS',
dressLead:'To avoid any unintended confusion about the word <strong>RETRO</strong> (a broad term, we know), here is our dress code:',dressStyle:'80s–90s · bright colours · iconic fashion pieces',dressInspiration:'For inspiration, we recommend watching the Czech film <strong>Discopříběh</strong>.',dressRequired:'<strong>Mandatory element:</strong> an item made from the plastic C-shaped links you received together with the puzzle.',dressWarning:'<strong>Violations will not be forgiven.</strong> 😎',dressOk:'GOT IT',
trashWindowTitle:'Recycle Bin',trashHeading:'Recycle Bin contents',trashList:['test_final_FINAL2.doc','continuous_study.txt','absence.xls','motivation.zip','sleep.exe','graduation_final_FINAL.exe'],musicHint:'🎵 You can start the music using the button in the bottom-right corner.',musicEmpty:'The playlist is ready.',musicSeek:'Seek through track',taskLabel:'8.A Ribbon Ceremony',musicTitle:'Music / player',soundTitle:'Mute system sounds',
rateWait:s=>'Too many quick attempts. Please try again in '+s+' seconds.',codeLength:'The code must contain exactly 4 digits.',verifyError:'We could not verify the code right now. Please try again in a moment.',invalidCode:'This code is not valid.',chooseStatus:"Please choose I'M COMING or I CAN'T COME first.",saveError:'Your response could not be saved. Please try again.',saved:'Your response has been saved.',yourChoice:'Your choice:',changeLater:'You can change your response later by opening the same link.',musicError:'ERROR // the audio file could not be loaded',statusYes:"I'm coming",statusNo:"I can't come"
}};
function t(key){return I18N[currentLang]?.[key]??I18N.cs[key]??key}
function setText(id,v){const e=document.getElementById(id);if(e)e.textContent=v}
function setHtml(id,v){const e=document.getElementById(id);if(e)e.innerHTML=v}
function applyLanguage(lang){
 currentLang=lang==='en'?'en':'cs';document.documentElement.lang=currentLang;document.title=t('pageTitle');
 setText('gateTitle',t('gateTitle'));setText('gateHeading',t('gateHeading'));setText('gateText',t('gateText'));setText('codeOpen',t('gateOpen'));setHtml('bootLogo',t('bootLogo'));setText('bootText',t('bootText'));setText('skip',t('skip'));
 setText('wallSubtitle',t('wallSubtitle'));setHtml('desktopHelp',t('help'));setText('iconInvite',t('iconInvite'));setText('iconRsvp',t('iconRsvp'));setText('iconMap',t('iconMap'));setText('iconTrash',t('iconTrash'));
 setText('inviteWindowTitle',t('inviteWindowTitle'));setHtml('inviteMega',t('inviteMega'));setText('inviteTheme',t('inviteTheme'));setText('welcomePrefix',t('welcomePrefix'));setText('personalText',t('personalText'));setHtml('inviteLead',t('inviteLead'));
 setText('metaDateLabel',t('dateLabel'));setText('metaDate',t('date'));setText('metaTimeLabel',t('timeLabel'));setText('metaTime',t('time'));setText('metaPlaceLabel',t('placeLabel'));setText('metaThemeLabel',t('themeLabel'));setText('metaCodeLabel',t('codeLabel'));
 setText('replyHeading',t('replyHeading'));setText('easyInvite',t('easyInvite'));setText('easyRsvp',t('easyRsvp'));setText('inviteRsvpBtn',t('inviteRsvp'));setText('inviteCloseBtn',t('close'));setText('confirmWindowTitle',t('confirmWindowTitle'));setText('confirmHeading',t('confirmHeading'));setText('confirmLead',t('confirmLead'));setText('yesBtn',t('yes'));setText('noBtn',t('no'));setText('noteLabel',t('noteLabel'));document.getElementById('note').placeholder=t('notePlaceholder');setText('send',t('send'));
 setText('mapWindowTitle',t('mapWindowTitle'));setText('mapDate',t('mapDate'));setText('mapText',t('mapText'));setText('mapOpenBtn',t('mapOpen'));setHtml('dressLead',t('dressLead'));setText('dressStyle',t('dressStyle'));setHtml('dressInspiration',t('dressInspiration'));setHtml('dressRequired',t('dressRequired'));setHtml('dressWarning',t('dressWarning'));setText('dressOk',t('dressOk'));
 setText('trashWindowTitle',t('trashWindowTitle'));setText('trashHeading',t('trashHeading'));setText('trashClose',t('close'));const tl=document.getElementById('trashList');if(tl)tl.innerHTML=t('trashList').map(x=>'<li>'+x+'</li>').join('');
 setText('musicHint',t('musicHint'));setText('musicEmpty',t('musicEmpty'));document.getElementById('musicProgress').title=t('musicSeek');setText('taskLabel',t('taskLabel'));document.getElementById('musicTask').title=t('musicTitle');document.getElementById('sound').title=t('soundTitle');
 if(teacher)document.querySelectorAll('[data-subject]').forEach(e=>e.textContent=teacher.subject?(t('subjectPrefix')+teacher.subject):'');
}

// Sem potom jen doplníme vybrané skladby. Soubory budou v /music/.
// Příklad: {title:'Název skladby', src:'./music/01.mp3'}
const MUSIC_PLAYLIST = [
  {title:'Kool & The Gang – Celebration', src:'./music/Kool & The Gang - Celebration.mp3'},
  {title:'War – Low Rider', src:'./music/Low Rider.mp3'},
  {title:'Cyndi Lauper – Girls Just Want to Have Fun', src:'./music/Girls Just Want To Have Fun — Cyndi Lauper.mp3'}
];
let musicIndex=0,musicShuffle=false,musicWasUnlocked=false,musicStarted=false;
const musicAudio=document.getElementById('musicAudio');
musicAudio.volume=.22;
function audio(){if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(A)ctx=new A()}if(ctx&&ctx.state==='suspended')ctx.resume();return ctx}
function tone(f,d=.05,v=.012,delay=0){if(!soundOn)return;const c=audio();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=f;o.connect(g);g.connect(c.destination);const t=c.currentTime+delay;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.start(t);o.stop(t+d+.02)}
function clickS(){tone(520,.04)} function openS(){tone(640,.05);tone(860,.06,.01,.05)} function okS(){tone(523,.07);tone(659,.08,.012,.07);tone(784,.1,.012,.14)} function errorS(){tone(180,.09,.014);tone(150,.11,.012,.09)}
function cleanCode(v){return String(v||'').replace(/\D/g,'').slice(0,4)}
function fillTeacher(t){
  teacher=t;
  applyLanguage(t.language||'cs');
  const fallback=currentLang==='en'?'dear guest':'vážený hoste';
  document.querySelectorAll('[data-salutation]').forEach(e=>e.textContent=t.salutation||t.name||fallback);
  document.querySelectorAll('[data-subject]').forEach(e=>e.textContent=t.subject?(t('subjectPrefix')+t.subject):'');
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
    err.textContent=t('rateWait')(wait);
    err.classList.add('show');
    return false;
  }
  code=cleanCode(code);
  const err=document.getElementById('gateError');
  err.classList.remove('show');
  if(code.length!==4){err.textContent=t('codeLength');err.classList.add('show');errorS();return false}
  document.getElementById('codeOpen').classList.add('saving');
  const {data,error}=await db.rpc('get_invitation',{p_code:code});
  document.getElementById('codeOpen').classList.remove('saving');
  const row=Array.isArray(data)?data[0]:data;
  if(error){
    err.textContent=t('verifyError');
    err.classList.add('show');errorS();return false
  }
  if(!row||row.active===false){
    failedCodeAttempts++;
    if(failedCodeAttempts>=3){
      const seconds=Math.min(30,Math.pow(2,failedCodeAttempts-3)*2);
      codeLockedUntil=Date.now()+seconds*1000;
    }
    err.textContent=t('invalidCode');
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
document.getElementById('codeOpen').onclick=()=>{
  unlockMusicFromGesture();
  loadCode(document.getElementById('codeInput').value);
};

const boot=document.getElementById('boot');let bootDone=false,experienceStarted=false;
function endBoot(){if(bootDone)return;bootDone=true;boot.style.display='none'}
function startExperience(){
  if(experienceStarted)return;
  experienceStarted=true;
  boot.style.display='grid';
  document.getElementById('skip').onclick=endBoot;
  boot.onclick=e=>{if(e.target.id!=='skip')endBoot()};
  setTimeout(endBoot,1500);
  setTimeout(()=>attemptMusicStart(),250);
}
function openWin(id){openS();document.querySelectorAll('.window').forEach(w=>w.style.zIndex=20);const e=document.getElementById(id);e.classList.add('open');e.style.zIndex=40}
document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openWin(b.dataset.open));
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{clickS();document.getElementById(b.dataset.close).classList.remove('open')});
document.querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>{clickS();selected=b.dataset.status;document.querySelectorAll('[data-status]').forEach(x=>x.classList.toggle('selected',x===b))});

function fmtTime(sec){
  if(!Number.isFinite(sec)||sec<0)return '00:00';
  const m=Math.floor(sec/60),s=Math.floor(sec%60);
  return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}
function renderMusicList(){
  const list=document.getElementById('musicList');
  const empty=document.getElementById('musicEmpty');
  list.innerHTML='';
  if(!MUSIC_PLAYLIST.length){empty.style.display='block';return}
  empty.style.display='none';
  MUSIC_PLAYLIST.forEach((track,i)=>{
    const li=document.createElement('li');
    li.textContent=String(i+1).padStart(2,'0')+' · '+track.title;
    li.classList.toggle('active',i===musicIndex);
    li.onclick=()=>{musicIndex=i;loadMusicTrack(true)};
    list.appendChild(li);
  });
}
function loadMusicTrack(autoplay=false){
  if(!MUSIC_PLAYLIST.length)return;
  const track=MUSIC_PLAYLIST[musicIndex];
  if(musicAudio.src!==new URL(track.src,location.href).href)musicAudio.src=track.src;
  document.getElementById('musicTitle').textContent=String(musicIndex+1).padStart(2,'0')+' // '+track.title;
  renderMusicList();
  if(autoplay){
    musicAudio.play().then(()=>{musicStarted=true;updateMusicButton()}).catch(()=>showMusicHint());
  }
}
function unlockMusicFromGesture(){
  if(musicWasUnlocked||!MUSIC_PLAYLIST.length)return;
  musicWasUnlocked=true;
  if(!musicAudio.src)loadMusicTrack(false);
  const oldVol=musicAudio.volume;
  musicAudio.volume=0;
  const p=musicAudio.play();
  if(p&&p.then)p.then(()=>{musicAudio.pause();musicAudio.currentTime=0;musicAudio.volume=oldVol}).catch(()=>{musicAudio.volume=oldVol});
}
function attemptMusicStart(){
  if(!MUSIC_PLAYLIST.length){renderMusicList();return}
  if(!musicAudio.src)loadMusicTrack(false);
  musicAudio.play().then(()=>{
    musicStarted=true;updateMusicButton();
  }).catch(()=>showMusicHint());
}
function showMusicHint(){
  const h=document.getElementById('musicHint');
  h.classList.add('show');
  setTimeout(()=>h.classList.remove('show'),5000);
}
function updateMusicButton(){
  document.getElementById('musicPlay').textContent=musicAudio.paused?'▶':'Ⅱ';
  document.getElementById('musicTask').textContent=musicAudio.paused?'🎵':'♫';
}
function nextMusic(){
  if(!MUSIC_PLAYLIST.length)return;
  if(musicShuffle&&MUSIC_PLAYLIST.length>1){
    let n=musicIndex;
    while(n===musicIndex)n=Math.floor(Math.random()*MUSIC_PLAYLIST.length);
    musicIndex=n;
  }else musicIndex=(musicIndex+1)%MUSIC_PLAYLIST.length;
  loadMusicTrack(true);
}
function prevMusic(){
  if(!MUSIC_PLAYLIST.length)return;
  musicIndex=(musicIndex-1+MUSIC_PLAYLIST.length)%MUSIC_PLAYLIST.length;
  loadMusicTrack(true);
}
document.getElementById('musicTask').onclick=()=>{
  openWin('musicwin');
  if(MUSIC_PLAYLIST.length&&musicAudio.paused&&!musicStarted)attemptMusicStart();
};
document.getElementById('musicPlay').onclick=()=>{
  if(!MUSIC_PLAYLIST.length)return;
  if(musicAudio.paused){
    if(!musicAudio.src)loadMusicTrack(false);
    musicAudio.play().then(()=>{musicStarted=true;updateMusicButton()}).catch(()=>showMusicHint());
  }else{musicAudio.pause();updateMusicButton()}
};
document.getElementById('musicNext').onclick=nextMusic;
document.getElementById('musicPrev').onclick=prevMusic;
document.getElementById('musicShuffle').onclick=()=>{
  musicShuffle=!musicShuffle;
  document.getElementById('musicShuffle').textContent=musicShuffle?'SHUF ✓':'SHUF';
};
document.getElementById('musicVolume').oninput=e=>{
  const v=Math.max(0,Math.min(100,Number(e.target.value)));
  musicAudio.volume=v/100;
  document.getElementById('musicVolumeValue').textContent=v+'%';
};
document.getElementById('musicProgress').onclick=e=>{
  if(!Number.isFinite(musicAudio.duration)||musicAudio.duration<=0)return;
  const r=e.currentTarget.getBoundingClientRect();
  const p=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
  musicAudio.currentTime=p*musicAudio.duration;
};
musicAudio.addEventListener('timeupdate',()=>{
  document.getElementById('musicCurrent').textContent=fmtTime(musicAudio.currentTime);
  const p=musicAudio.duration?musicAudio.currentTime/musicAudio.duration*100:0;
  document.getElementById('musicProgressFill').style.width=p+'%';
});
musicAudio.addEventListener('loadedmetadata',()=>{
  document.getElementById('musicDuration').textContent=fmtTime(musicAudio.duration);
});
musicAudio.addEventListener('play',updateMusicButton);
musicAudio.addEventListener('pause',updateMusicButton);
musicAudio.addEventListener('ended',nextMusic);
musicAudio.addEventListener('error',()=>{
  if(MUSIC_PLAYLIST.length){
    document.getElementById('musicTitle').textContent=t('musicError');
  }
});
renderMusicList();
updateMusicButton();

document.getElementById('send').onclick=async()=>{
  const st=document.getElementById('status');
  if(!selected){st.textContent=t('chooseStatus');st.classList.add('show');errorS();return}
  const btn=document.getElementById('send');btn.classList.add('saving');st.classList.remove('show');
  const {data,error}=await db.rpc('submit_rsvp',{p_code:currentCode,p_status:selected,p_note:document.getElementById('note').value});
  btn.classList.remove('saving');
  if(error||data!==true){st.textContent=t('saveError');st.classList.add('show');errorS();return}
  const choice=selected==='Přijdu'?t('statusYes'):t('statusNo');
  st.innerHTML='<strong>✓ '+t('saved')+'</strong><br>'+t('yourChoice')+' '+choice+'<br><small>'+t('changeLater')+'</small>';st.classList.add('show');okS();
};
document.getElementById('sound').onclick=()=>{audio();soundOn=!soundOn;document.getElementById('sound').textContent=soundOn?'🔊':'🔇'};
document.addEventListener('pointerdown',()=>{if(soundOn)audio()},{once:true});
function tick(){const d=new Date();document.getElementById('clock').textContent=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}tick();setInterval(tick,1000);

applyLanguage(currentLang);

(async()=>{
  let code=cleanCode(new URLSearchParams(location.search).get('code')); if(!code){const last=location.pathname.split('/').filter(Boolean).pop(); if(/^\\d{4}$/.test(last||'')) code=last;}
  if(code){document.getElementById('codeInput').value=code;await loadCode(code)}
})();