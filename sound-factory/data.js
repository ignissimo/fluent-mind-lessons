/* Content for Part 8. Future parts can reuse the renderer without changing saved Part 8 work. */
var Factory = (() => {
 const sounds=[['æ','A','cat'],['e','E','bed'],['ɪ','I','fish'],['ʌ','U','sun'],['ɒ','O','dog'],['uː','OO','moon'],['ʊ','OO','book'],['ʃ','SH','ship'],['tʃ','CH','chip'],['θ','TH','thin'],['ð','TH','this'],['f','F','fan'],['v','V','van'],['s','S','sip'],['z','Z','zip'],['p','P','pat'],['b','B','bat'],['k','C / K','cat'],['g','G','gap'],['t','T','tap'],['d','D','dad'],['eɪ','AI / AY / A-E','rain']].map(([ipa,letters,word])=>({ipa,letters,word}));
 const words=[['rain','reɪn','AI'],['train','treɪn','AI'],['wait','weɪt','AI'],['day','deɪ','AY'],['play','pleɪ','AY'],['say','seɪ','AY'],['cake','keɪk','A-E'],['name','neɪm','A-E'],['game','geɪm','A-E'],['late','leɪt','A-E']].map(([word,ipa,code])=>({word,ipa,code}));
 const choice=(id,prompt,cue,options,answer,listen,help,kind='choice')=>({id,kind,prompt,cue,options,answer:Array.isArray(answer)?answer:[answer],listen,help});
 const build=(id,prompt,cue,answer,listen,help,kind='letters')=>({id,kind,prompt,cue,answer:Array.isArray(answer)?answer:answer.split(''),listen,help});
 const scanner=[
 choice('s1','Choose the letter code.','/ʃ/',['CH','SH','TH'],'SH','ship','SH in ship makes this sound.'),
 choice('s2','Choose the sound in chip.','CH',['/ʃ/','/θ/','/tʃ/'],'/tʃ/','chip','CH in chip is /tʃ/.'),
 choice('s3','Choose the letter code.','/θ/ · thin',['F','TH','SH'],'TH','thin','Put your tongue gently between your teeth. No voice.'),
 choice('s4','Choose the sound at the start.','this',['/θ/','/ð/','/d/'],'/ð/','this','TH in this uses your voice. Feel your throat.'),
 choice('s5','Choose the vowel sound.','cat',['/e/','/eɪ/','/æ/'],'/æ/','cat','Short A in cat: /æ/.'),
 choice('s6','Choose ALL three codes for this sound.','/eɪ/',['AI','OO','AY','A-E'],['AI','AY','A-E'],'rain, day, cake','All three can spell /eɪ/: rain, day, cake.','multi'),
 choice('s7','Choose the vowel sounds in order.','bed → fish',['/ɪ/ → /e/','/e/ → /ɪ/','/æ/ → /ɪ/'],'/e/ → /ɪ/','bed, fish','E in bed; I in fish.'),
 choice('s8','Choose the vowel sounds in order.','sun → dog',['/ɒ/ → /ʌ/','/ʌ/ → /ɒ/','/æ/ → /ɒ/'],'/ʌ/ → /ɒ/','sun, dog','U in sun; O in dog. We use British IPA.'),
 choice('s9','Choose the vowel sounds in order.','moon → book',['/ʊ/ → /uː/','/uː/ → /ʊ/','/uː/ → /ɒ/'],'/uː/ → /ʊ/','moon, book','OO has different sounds here: long in moon, short in book.'),
 choice('s10','Choose the first sounds in order.','fan → van',['/v/ → /f/','/f/ → /v/','/θ/ → /ð/'],'/f/ → /v/','fan, van','Your voice is off for F and on for V.'),
 choice('s11','Choose the first sounds in order.','sip → zip',['/s/ → /z/','/z/ → /s/','/ʃ/ → /s/'],'/s/ → /z/','sip, zip','S is quiet air. Z uses your voice.'),
 choice('s12','Choose the first sounds in order.','pat → bat',['/b/ → /p/','/p/ → /b/','/t/ → /d/'],'/p/ → /b/','pat, bat','P: voice off. B: voice on.'),
 choice('s13','Choose the first sounds in order.','cat → gap',['/g/ → /k/','/k/ → /g/','/t/ → /g/'],'/k/ → /g/','cat, gap','C in cat: /k/. G in gap: /g/.'),
 choice('s14','Choose the first sounds in order.','tap → dad',['/d/ → /t/','/p/ → /b/','/t/ → /d/'],'/t/ → /d/','tap, dad','T: voice off. D: voice on.'),
 choice('s15','Listen. Choose the word code.','Press Listen',['/fɪʃ/','/ʃɪp/','/tʃɪp/'],'/fɪʃ/','fish','The word has three sounds: /f/ /ɪ/ /ʃ/.')];
 const builder=[
 build('b1','Build the word.','/reɪn/','rain','rain','Use AI for /eɪ/.'),
 build('b2','Build the sound code.','train',['t','r','eɪ','n'],'train','Keep /eɪ/ together. It is one sound.','ipa'),
 choice('b3','Connect the word to its sound code.','wait',['/wæt/','/weɪt/','/wɪt/'],'/weɪt/','wait','AI is /eɪ/ in wait.'),
 build('b4','Build the word.','/deɪ/','day','day','AY is often at the end.'),
 build('b5','Build the sound code.','play',['p','l','eɪ'],'play','There are three sounds.','ipa'),
 choice('b6','Connect the word to its sound code.','say',['/sæ/','/ʃeɪ/','/seɪ/'],'/seɪ/','say','S + /eɪ/.'),
 build('b7','Build the word.','/keɪk/','cake','cake','A consonant goes between A and the silent E.'),
 build('b8','Build the word.','/neɪm/','name','name','N, A, M, silent E.'),
 choice('b9','Find the shared vowel sound.','rain · day · game',['/æ/','/eɪ/','/e/'],'/eɪ/','rain, day, game','Three spellings. The same sound.'),
 build('b10','Build the word.','/leɪt/','late','late','A-E makes /eɪ/.')];
 const factory=[
 ...[['r__n','rain','AI','rain'],['d__','day','AY','day'],['c_ke','cake','A-E','cake'],['tr__n','train','AI','train'],['pl__','play','AY','play'],['n_me','name','A-E','name']].map(([cue,word,code,art],i)=>({...choice('w'+(i+1),'Choose the code to finish the word.',cue,['AI','AY','A-E'],code,word,'AI: rain. AY: day. A-E: cake.'),word,art,result:word})),
 choice('w7','Choose the word with /eɪ/.','cap /kæp/ → ?',['cap','cape'],'cape','cap, cape','Silent E changes /æ/ to /eɪ/.', 'choice'),
 build('w8','Add silent E. Build the long-A word.','tap /tæp/ → /teɪp/','tape','tap, tape','Keep TAP and add E.'),
 choice('w9','Choose the correct sound code for made.','mad → made',['/mæd/','/meɪd/','/med/'],'/meɪd/','mad, made','Silent E changes the vowel. The E has no sound.')];
 const practiceLines=['Rain on the train.','Day by day, we play.','Cake on a plate.','A cap and a cape.','A tap and some tape.','Read the code.','We can play today.','The train is late.'];
 const song=[...[
 ['Rain on the ___.','train','/treɪn/'],['Day by ___, we play.','day','/deɪ/'],['Day by day, we ___.','play','/pleɪ/'],['___ on a plate.','cake','/keɪk/'],['A cap and a ___.','cape','/keɪp/'],['A tap and some ___.','tape','/teɪp/'],['We can play ___.','today','/təˈdeɪ/'],['The train is ___.','late','/leɪt/']].map(([cue,word,ipa],i)=>({...build('r'+(i+1),'Repair the practice line.',cue,word,practiceLines[[0,1,1,2,3,4,6,7][i]],'Sound clue: '+ipa),clue:ipa})),
 choice('r9','Find ALL the words with /eɪ/.','Choose two words.',['rain','cap','train','cat'],['rain','train'],'rain, cap, train, cat','AI is /eɪ/. Short A is /æ/.','multi'),
 choice('r10','Find ALL the words with /eɪ/.','Choose two words.',['tap','cake','play','mad'],['cake','play'],'tap, cake, play, mad','Look for AY and A-E.','multi')];
 const sentences=['Jake has a cake.','The rain is on the way.','We can play today.','The train is late.','Kate has a game.','The cake is on a plate.','The cat has a cape.','We wait for the train.'];
 const sentenceTasks=sentences.map((s,i)=>({...build('l'+(i+1),'Build the sentence. Then read it aloud.',i===0?'Jake · cake':i===1?'rain · way':i===2?'we · play':i===3?'train · late':i===4?'Kate · game':i===5?'cake · plate':i===6?'cat · cape':'we · wait',s.split(' '),s,'Start with the capital letter. End with the full stop.','sentence'),swap:i===0?{from:'cake.',to:'game.'}:i===4?{from:'game.',to:'cake.'}:null}));
 const story='Jake waits for a train. The train is late. Rain taps on his cap. He sees a box by the gate. A name is on the box: Kate. Jake and Kate play a game. The game has a code: WE CAN PLAY.';
 const vault=[
 choice('v1','Read the story. Find ALL four long-A words.','Choose four words.',['Jake','cap','train','box','rain','gate'],['Jake','train','rain','gate'],story,'Listen to each word. Short A in cap is /æ/.','multi'),
 choice('v2','Connect the word and its sound code.','gate',['/gæt/','/geɪt/','/get/'],'/geɪt/','gate','Gate uses A-E.'),
 choice('v3','Connect the word and its sound code.','name',['/næm/','/nem/','/neɪm/'],'/neɪm/','name','Name uses A-E.'),
 choice('v4','Why does Jake wait?','Read the story.',['The train is late.','He has a cake.','He has no game.'],'The train is late.','Why does Jake wait?','Look at sentence two.'),
 choice('v5','Whose name is on the box?','Read the story.',['Jake','Kate','Ben'],'Kate','Whose name is on the box?','Look at sentence five.'),
 choice('v6','What do Jake and Kate do?','Read the story.',['They make a cake.','They play a game.','They take a train.'],'They play a game.','What do Jake and Kate do?','Look at sentence six.'),
 build('v7','Build the secret message.','Open the sound vault.',['WE','CAN','PLAY'],'We can play.','Look at the code in the last line.','sentence')];
 const modules=[
 {id:'scanner',title:'Sound Scanner',subtitle:'Find the sound signals',badge:'Sound Hunter',mark:'01',minutes:'4',tasks:scanner},
 {id:'builder',title:'Build the Code',subtitle:'Turn sounds into words',badge:'Code Builder',mark:'02',minutes:'6',tasks:builder,notebook:{prompt:'Write three words and their sound codes in your notebook.',answer:'rain /reɪn/\nday /deɪ/\ncake /keɪk/'}},
 {id:'factory',title:'Word Factory',subtitle:'Repair the spelling machine',badge:'Word Engineer',mark:'03',minutes:'6',tasks:factory,notebook:{prompt:'Write cap → cape and tap → tape. Underline the silent E in each long-A word.',answer:'cap /kæp/ → cape /keɪp/\ntap /tæp/ → tape /teɪp/\nUnderline the final E in cape and tape.'}},
 {id:'song',title:'The Broken Song',subtitle:'Listen, then repair the lines',badge:'Beat Decoder',mark:'04',minutes:'8',tasks:song,notebook:{prompt:'Write two lines from the song you heard, or two practice lines. Underline the words with /eɪ/.',answer:'Practice example:\nRain on the train.\nDay by day, we play.\nUnderline: rain, train, day, day, play.'}},
 {id:'sentences',title:'Sentence Lab',subtitle:'Build it. Read it. Change it.',badge:'Sentence Builder',mark:'05',minutes:'8',tasks:sentenceTasks,notebook:{prompt:'Write two sentences from the lab. Read them aloud.',answer:'Jake has a cake.\nThe train is late.'}},
 {id:'vault',title:'Final Sound Vault',subtitle:'Read the story. Open the door.',badge:'Final Decoder',mark:'06',minutes:'7',tasks:vault}
 ];
 const homework={id:'homework',title:'Bonus Mission',subtitle:'Your own sound mission · 10–15 min',tasks:[
 ...words.slice(0,5).map((w,i)=>choice('h'+(i+1),'Match the sound code to the word.','/'+w.ipa+'/',[w.word,...words.filter(x=>x.word!==w.word).slice(i,i+2).map(x=>x.word)],w.word,w.word,'Read one sound at a time.')),
 ...words.slice(5).map((w,i)=>build('h'+(i+6),'Build the word.','/'+w.ipa+'/',w.word,w.word,'Listen, then build the word.')),
 {...build('h11','Read aloud. Then build the sentence.','Jake · cake',['Jake','has','a','cake.'],'Jake has a cake.','Start with Jake.','sentence')},
 {...build('h12','Read aloud. Then build the sentence.','train · late',['The','train','is','late.'],'The train is late.','Start with The.','sentence')},
 build('h13','Repair the practice line.','Rain on the ___.','train','Rain on the train.','Use AI.'),
 choice('h14','Choose ALL the long-A codes.','/eɪ/',['AI','AY','A-E','OO'],['AI','AY','A-E'],'rain, day, cake','Three spellings. One sound.','multi')],notebook:{prompt:'Write these five words in your notebook: rain, day, cake, name, play. Underline AI, AY or A-E.',answer:'r[ai]n · d[ay] · c[a]k[e] · n[a]m[e] · pl[ay]'}};
 return {sounds,words,modules,homework,story,practiceLines,sentences,
 song:{url:'https://suno.com/s/PKQxjlUWHOV1YUM8',title:'Read the Code',localSrc:'',lyrics:'',cues:[]},
 scenes:[['Rain on the train','train'],['Day by day, we play','play'],['Cake on a plate','cake'],['Cap and cape','cape'],['Tap and tape','tape'],['Crack the Code','code'],['System restored','lab']]};
})();
