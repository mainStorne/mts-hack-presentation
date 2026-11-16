/* Данные питча CompactFactExtraction. Метрики — val/test, оценщики v1/v2.1 кейса MTS MWS. */
window.MWS_DATA={
  labels:[],
  series:[],
  line:{yMin:0,yMax:1,yLabel:"",xLabel:""},
  barsDay1:{labels:["F1","Precision","Grounding"],series:[{name:"Бейзлайн glm-5.3",color:"#bbc1c7",values:[0.22,0.21,0.68]},{name:"GLiNER + LoRA",color:"#ff0032",values:[0.54,0.71,0.86]}],yMax:1,yLabel:"Значение метрики · оценщик v1"},
  barsDay2:{labels:["F1","Temporal","State"],series:[{name:"Бейзлайн glm-5.3 (v2.1)",color:"#bbc1c7",values:[0.356,0.471,0.535]},{name:"Gemma3 + LoRA",color:"#ff0032",values:[0.576,0.448,0.544]}],yMax:1,yLabel:"Значение метрики · val, оценщик v2.1"},
  scatter:{xMax:1,yMax:1,xLabel:"",yLabel:"",groups:[]},
  network:{nodes:[],edges:[],route:[]},
  architecture:{
    frame:{x:355,y:40,w:310,h:432,label:"Параллельные ветки"},
    nodes:[
      {id:"asr",x:30,y:205,w:205,h:100,title:"ASR-транскрипт"},
      {id:"gliner",x:395,y:85,w:230,h:100,title:"GLiNER2 + LoRA"},
      {id:"gemma",x:395,y:330,w:230,h:100,title:"Gemma3 + LoRA"},
      {id:"gate",x:735,y:205,w:150,h:100,title:"Модели согласны?",shape:"diamond"},
      {id:"lr",x:975,y:205,w:265,h:100,title:"Логистическая регрессия",active:true},
      {id:"out",x:1330,y:205,w:150,h:100,title:"Факты"}
    ],
    edges:[
      {from:"asr",to:"gliner"},
      {from:"asr",to:"gemma"},
      {from:"gliner",to:"gate"},
      {from:"gemma",to:"gate"},
      {from:"gate",to:"lr",label:"разошлись",active:true,labelDy:-16},
      {from:"lr",to:"out",active:true},
      {from:"gate",to:"out",label:"согласны",route:"over",over:140}
    ]
  }
  ,languages:{
    width:760,height:430,
    nodes:[
      {id:"model",x:10,y:165,w:210,h:100,title:"Модель",active:true},
      {id:"a1",x:470,y:20,w:270,h:100,title:"LoRA Adapter",sub:"язык 1"},
      {id:"a2",x:470,y:165,w:270,h:100,title:"LoRA Adapter",sub:"язык 2"},
      {id:"a3",x:470,y:310,w:270,h:100,title:"LoRA Adapter",sub:"язык 3"}
    ],
    edges:[
      {from:"model",to:"a1",active:true},
      {from:"model",to:"a2",active:true},
      {from:"model",to:"a3",active:true}
    ]
  }
  ,batching:{
    width:1460,height:420,
    nodes:[
      {id:"c1",x:0,y:20,w:150,h:76,title:"Звонок A"},
      {id:"c2",x:0,y:172,w:150,h:76,title:"Звонок B"},
      {id:"c3",x:0,y:324,w:150,h:76,title:"Звонок C"},
      {id:"q",x:270,y:155,w:230,h:110,title:"queue",sub:"не блокирует /extract"},
      {id:"w",x:610,y:155,w:290,h:110,title:"Батчер",sub:"копит 5–20 мс",active:true},
      {id:"m",x:1010,y:155,w:230,h:110,title:"batch_extract",sub:"один вызов модели",active:true},
      {id:"f1",x:1310,y:20,w:150,h:76,title:"Факты A"},
      {id:"f2",x:1310,y:172,w:150,h:76,title:"Факты B"},
      {id:"f3",x:1310,y:324,w:150,h:76,title:"Факты C"}
    ],
    edges:[
      {from:"c1",to:"q"},{from:"c2",to:"q"},{from:"c3",to:"q"},
      {from:"q",to:"w",active:true},
      {from:"w",to:"m",active:true},
      {from:"m",to:"f1"},{from:"m",to:"f2"},{from:"m",to:"f3"}
    ]
  
  }
  ,cascade:{
    width:1460,height:360,
    nodes:[
      {id:"call",x:0,y:130,w:170,h:100,title:"Звонок"},
      {id:"feat",x:260,y:130,w:230,h:100,title:"Признаки",sub:"оценка сложности"},
      {id:"gate",x:600,y:115,w:210,h:130,title:"Сложность звонка?",shape:"diamond"},
      {id:"small",x:920,y:20,w:260,h:100,title:"GLiNER",sub:"малая модель",active:true},
      {id:"big",x:920,y:240,w:260,h:100,title:"Gemma",sub:"большая модель"},
      {id:"out",x:1290,y:130,w:170,h:100,title:"Факты"}
    ],
    edges:[
      {from:"call",to:"feat"},
      {from:"feat",to:"gate"},
      {from:"gate",to:"small",label:"лёгкий",active:true,labelDy:-14},
      {from:"gate",to:"big",label:"тяжёлый",labelDy:34},
      {from:"small",to:"out"},
      {from:"big",to:"out"}
    ]
  }
};
