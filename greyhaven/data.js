window.GreyData={
stages:['Create your hero','Build your squad','Choose equipment','Get your orders','Team training','Get clearance'],
objectives:['Choose your hero.','Choose an engineer, a medic and a scout.','Choose one weapon and two extra items.','Read your orders.','Choose the right teammate. Give a clear command.','Write your report. Meet your squad at the gate.'],
teamIntro:['Welcome to Greyhaven. You are our new team leader.','Build your team.','Find an engineer, a medic and a scout.','Then meet your team at the gate.'],
order:['We cannot contact the North District.','Your team will go to the relay station.','First, check your team in the training area.'],
heroes:[{id:'hero1',name:'Alex',label:'Steady and ready.'},{id:'hero2',name:'Morgan',label:'Calm under pressure.'},{id:'hero3',name:'Jordan',label:'Ready to lead.'}],
items:[
{id:'rifle',name:'Kestrel R4',type:'light rifle',lines:['This is a light rifle.','It is good for long paths.','It has a slow fire rate.']},
{id:'smg',name:'Morrow C2',type:'compact SMG',lines:['This is a compact SMG.','It is good for small rooms.','It has a fast fire rate.']},
{id:'flashlight',name:'Flashlight',type:'extra',lines:['I can see in dark rooms.']},
{id:'smoke',name:'Smoke grenade',type:'extra',lines:['I can make smoke to hide my team.']},
{id:'ammo',name:'Extra ammo',type:'extra',lines:['I have more ammo for my weapon.']},
{id:'armour',name:'Basic armour',type:'base',lines:['This armour helps protect me.']},
{id:'radio',name:'Radio',type:'base',lines:['I can talk to my team.']},
{id:'sidearm',name:'Spare pistol',type:'base',lines:['This is my spare pistol.']},
{id:'toolkit',name:'Toolkit',type:'kit',lines:['I can fix things.']},
{id:'medkit',name:'Medkit',type:'kit',lines:['I can help a hurt teammate.']},
{id:'map',name:'Map',type:'kit',lines:['I can find the road.']},
{id:'rope',name:'Rope',type:'kit',lines:['I can help my team climb.']},
{id:'water',name:'Water',type:'kit',lines:['I have water for my team.']},
{id:'bandage',name:'Bandage',type:'kit',lines:['I can help a hurt teammate.']}
],
candidates:[
{id:'nova',role:'engineer',trait:'Friendly',items:['toolkit','flashlight'],lines:['I can fix radios.','I have a toolkit and a flashlight.','I like working with a team.']},
{id:'patch',role:'engineer',trait:'Careful',items:['toolkit','rope'],lines:['I can fix radios and doors.','I have a toolkit and a rope.','I check my work twice.']},
{id:'sage',role:'medic',trait:'Calm',items:['medkit','water'],lines:['I can help hurt people.','I have a medkit and some water.','I stay calm and listen.']},
{id:'pulse',role:'medic',trait:'Kind',items:['medkit','bandage'],lines:['I can help a hurt teammate.','I have a medkit and a bandage.','I like helping people.']},
{id:'echo',role:'scout',trait:'Quiet',items:['map','flashlight'],lines:['I can check the road.','I have a map and a flashlight.','I move quietly and watch.']},
{id:'kite',role:'scout',trait:'Patient',items:['map','rope'],lines:['I can find a safe path.','I have a map and a rope.','I wait and watch the road.']}
],
training:[
{role:'engineer',title:'The radio terminal',message:'The terminal is not working. The radio is off. Who can help?',commands:['Fix the radio.','Help our teammate.','Check the road.'],correct:'Fix the radio.',reply:'The radio is working. We can talk to the team.',before:'RADIO OFF',after:'RADIO ONLINE'},
{role:'medic',title:'A training problem',message:'Our teammate has a hurt arm. Who can help?',commands:['Open the door.','Help our teammate.','Wait here.'],correct:'Help our teammate.',reply:'Our teammate is OK. We can train again.',before:'NEEDS HELP',after:'TEAMMATE READY'},
{role:'scout',title:'Beyond the gate',message:'We cannot see the road. We need to check it. Who can help?',commands:['Follow me.','Fix the radio.','Check the road.'],correct:'Check the road.',reply:'The road is safe. Our team can go.',before:'ROAD UNKNOWN',after:'ROAD CHECKED'}
],
commands:['Fix the radio.','Open the door.','Help our teammate.','Check the road.','Follow me.','Wait here.'],
text:['Choose a player.','Enter your name.','Start a new mission.',"I'm the leader.",'My name is Adam.','Call sign: Raven.', 'I have a light rifle.','I have a compact SMG.','I have a flashlight and some extra ammo.','Our team has four people.','Your squad is ready.','The gate is open.','Go to the North District. Find the relay station. Wait for a new order.','Mission complete.','Mission complete. Save your squad for the next chapter.','Choose a hero.','Choose a colour.','Write your name and call sign.','Choose two extra items.','Which weapon has a fast fire rate?','Who has a flashlight?','Who can fix a radio?','Who can help a hurt teammate?','Who can check the road?','Build the command.','Write one command.','Who checks the work twice?','Who has water?','Read your report.','Read the order.','Find the weapons locker.','Find the radio desk.','Find the gate.','Choose your engineer.','Choose your medic.','Choose your scout.','Read the next line.','Listen and read.','Write in your notebook.','Follow me.','Wait here.'],
translations:{leader:'лидер',engineer:'инженер',medic:'медик',scout:'разведчик',team:'команда',rifle:'винтовка',radio:'рация',flashlight:'фонарик',toolkit:'набор инструментов',medkit:'аптечка',ammo:'патроны',armour:'броня',door:'дверь',gate:'ворота',fix:'чинить',help:'помогать',check:'проверять',follow:'следовать за',wait:'ждать',here:'здесь',our:'наш / наша',have:'иметь',can:'мочь / уметь',smoke:'дым',grenade:'граната',extra:'дополнительный',compact:'компактный',light:'лёгкий',weapon:'оружие',teammate:'напарник',hurt:'пострадавший',road:'дорога',path:'путь',safe:'безопасный',calm:'спокойный',quiet:'тихий',friendly:'дружелюбный',careful:'внимательный',kind:'добрый',patient:'терпеливый',rope:'верёвка',map:'карта',water:'вода',bandage:'бинт',choose:'выбери',write:'напиши',read:'прочитай',working:'работает / работающий',slow:'медленный',fast:'быстрый',fire:'огонь',rate:'темп',north:'северный',district:'район',relay:'ретрансляция',station:'станция',clearance:'допуск',squad:'отряд',orders:'приказы',equipment:'снаряжение',people:'люди',four:'четыре',name:'имя',call:'позывной (call sign)',sign:'знак / позывной',spare:'запасной',pistol:'пистолет',dark:'тёмный',long:'длинный',small:'маленький',rooms:'комнаты',protect:'защищать',climb:'взбираться',watch:'наблюдать',twice:'дважды',listen:'слушать',move:'двигаться',quietly:'тихо',more:'больше',hide:'скрыть',meet:'встретить',contact:'связаться',first:'первый',job:'задание',build:'собрать',new:'новый',welcome:'добро пожаловать',terminal:'терминал'}
};
