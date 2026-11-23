/* R5: open ground with actual building footprints. No filled maze/void walls.
   Features: kind,x1,z1,x2,z2,height,label. All coordinates are fictional game units. */
(()=>{'use strict';
window.TVSitePlans={
 tower:{name:'XINYI · XIANGTI SHOPPING PROMENADE',theme:'tower',initialPitch:.07,landmark:{x:145,z:-32,scale:1.25},
  features:[['departmentStore',5,10,25,37,18,'新光三越 A11'],['departmentStore',6,43,24,57,15,'信義新天地'],['departmentStore',72,36,91,61,19,'新光三越 A9'],['planter',29,37,31,40,.7],['planter',58,45,61,47,.7],['kiosk',74,21,77,24,3,'旅客服務'],['car',36,65,40,66,1.4],['car',49,65,53,66,1.4],['van',64,65,69,67,2.5],['scooter',26,54,27,55,1.15],['scooter',26,50,27,51,1.15],['scooter',68,52,69,53,1.15]],
  nodes:[[32,63],[40,52],[51,41],[62,31],[77,27]],alternate:[[32,63],[29,48],[32,36],[43,28],[56,24],[66,24]],start:[32,63],hostage:[66,24],bombs:[[77,27],[36,18]],exit:[32,63],alternateExit:[92,25],siteStart:[51,41],
  teams:[['A11 SERVICE CORNER',[32,45],[[4,22],[4,23]],[29,35],['rush','flank'],[[32,41],[36,39]]],['A9 SIDE ENTRANCE',[51,44],[[92,47],[92,48]],[70,40],['anchor','crossfire']],['VISITOR KIOSK',[63,30],[[78,20],[78,21]],[78,27],['anchor','rush']]],
  alternateTeams:[['SOUTH SHOP FRONT',[30,51],[[5,49],[5,50]],[28,47],['rush','anchor']],['A11 DISPLAY CORNER',[32,37],[[4,19],[4,20]],[29,32],['flank','crossfire'],[[36,29],[44,29]]],['A9 LOADING ENTRANCE',[48,30],[[92,49],[92,50]],[70,34],['anchor','rush']],['KIOSK REAR',[62,25],[[78,20],[78,21]],[73,26],['anchor','flank'],[[68,29],[62,32]]]]},
 observatory:{name:'101 · 89F SKYLINE WINDOWS',theme:'tower',
  features:[['core',41,27,54,43,5.5,'EXPRESS LIFTS'],['glass',16,8,80,8,5.8],['glass',16,64,80,64,5.8],['glass',16,9,16,63,5.8],['glass',80,9,80,63,5.8],['display',24,18,28,21,1.1],['screen',64,20,66,23,2.4],['screen',24,41,27,44,2.4]],
  nodes:[[24,54],[34,49],[62,49],[72,36],[72,16],[60,16]],start:[24,54],hostage:[60,16],bombs:[[63,17],[28,32]],exit:[24,54],siteStart:[34,49],
  teams:[['SOUTH CORE RETURN',[36,48],[[55,29],[55,30]],[60,45],['rush','anchor']],['EAST WINDOW EXHIBIT',[68,34],[[65,18],[66,18]],[68,24],['anchor','flank'],[[72,25],[72,42]]],['WEST LIFT BAY',[31,42],[[28,41],[28,42]],[31,40],['crossfire','rush']],['NORTH LIFT CORNER',[59,19],[[43,25],[44,25]],[56,23],['anchor','flank'],[[34,23],[34,33]]]]},
 memorial:{name:'MEMORIAL · OPEN FORECOURT',theme:'memorial',
  features:[['memorial',67,17,85,39,14,'中正紀念堂'],['pond',16,12,30,23,0],['pond',20,47,36,57,0],['grove',36,15,40,19,3],['grove',39,47,43,51,3],['pavilion',50,8,56,13,3.5],['screen',60,39,62,42,2.6],['planter',46,23,49,26,.7],['planter',47,36,50,39,.7]],
  nodes:[[12,46],[31,39],[47,31],[58,29],[64,23],[64,37]],alternate:[[12,46],[14,27],[32,12],[46,10],[59,17],[61,31]],start:[12,46],hostage:[61,31],bombs:[[64,23],[64,37]],exit:[12,46],alternateExit:[85,50],siteStart:[47,31],
  teams:[['GARDEN PAVILION',[34,26],[[57,9],[57,10]],[53,17],['patrol','flank'],[[59,14],[59,22]]],['SOUTH TREE GROVE',[35,40],[[44,47],[44,48]],[48,42],['crossfire','anchor']],['TERRACE SIDE WALL',[55,30],[[86,24],[86,25]],[64,40],['anchor','rush']],['STONE SCREEN',[58,38],[[63,40],[63,41]],[60,36],['anchor','flank'],[[55,43],[50,44]]]],
  alternateTeams:[['NORTH GARDEN',[27,24],[[41,15],[41,16]],[43,21],['rush','anchor']],['PAVILION RETURN',[46,14],[[57,11],[57,12]],[59,16],['flank','crossfire'],[[61,21],[61,30]]],['EAST TERRACE',[60,23],[[86,29],[86,30]],[65,37],['anchor','rush']],['GARDEN EXIT',[67,44],[[69,16],[70,16]],[51,44],['anchor','flank'],[[52,49],[67,49]]]]},
 temple:{name:'LONGSHAN · TEMPLE FORECOURT',theme:'temple',
  features:[['templeHall',28,39,44,44,4.2,'三川殿'],['templeHall',52,39,68,44,4.2],['templeHall',36,23,60,29,5,'正殿'],['templeHall',28,6,68,12,4.8,'後殿'],['incense',46,33,49,35,1.2],['pond',12,50,23,57,0],['screen',68,18,70,22,2.6],['screen',26,14,28,18,2.6],['pillar',22,27,22,27,3.5],['pillar',74,29,74,29,3.5]],
  nodes:[[48,61],[48,47],[48,37],[65,34],[66,20],[48,17],[33,16]],start:[48,61],hostage:[33,16],bombs:[[34,34],[63,16]],exit:[73,53],siteStart:[48,47],
  teams:[['FRONT HALL DRAGON DOOR',[49,47],[[69,40],[69,41]],[65,37],['rush','anchor']],['CENTRAL HALL CORNER',[62,34],[[61,24],[61,25]],[64,31],['crossfire','flank'],[[72,23],[72,36]]],['REAR COURT SCREEN',[60,19],[[27,19],[28,19]],[32,19],['anchor','rush']],['EAST HU-LONG',[67,22],[[71,18],[71,19]],[67,24],['anchor','flank'],[[73,25],[73,38]]]]},
 museum:{name:'PALACE · GARDEN / OPEN GALLERIES',theme:'museum',
  features:[['galleryWall',30,9,82,9,5.8],['galleryWall',30,10,30,34,5.8],['galleryWall',82,10,82,34,5.8],['galleryWall',31,34,48,34,5.8],['galleryWall',56,34,81,34,5.8],['partition',52,10,52,22,3.3],['partition',50,22,57,23,3.3],['display',39,15,42,18,1.2,'青花瓷瓶'],['display',68,16,71,19,1.2,'玉器'],['display',39,26,42,28,1.2,'青銅鼎'],['display',34,20,36,22,1.2,'文獻'],['display',45,14,47,16,1.2,'青銅鼎'],['display',62,15,64,17,1.2,'青花瓷瓶'],['display',74,26,76,28,1.2,'玉器'],['reception',34,29,39,31,1.05,'服務台'],['bench',58,28,62,28,.5],['pond',8,20,23,35,0],['pavilion',10,12,17,17,3.6],['grove',21,42,25,46,3],['van',73,45,76,48,2.6]],
  entrance:[52,30],nodes:[[52,63],[52,51],[52,48],[52,37],[52,29],[46,23],[39,21],[45,24],[59,24],[70,22]],start:[52,63],hostage:[74,23],bombs:[[39,21],[70,22]],exit:[52,63],siteStart:[52,29],
  teams:[['GARDEN VEHICLE',[39,48],[[77,46],[77,47]],[69,43],['rush','flank'],[[62,43],[57,37]]],['WEST GALLERY DOOR',[49,36],[[32,14],[32,15]],[39,24],['anchor','crossfire']],['PARTITION RETURN',[47,23],[[53,13],[53,14]],[59,24],['anchor','flank'],[[68,24],[72,27]]],['EAST GALLERY DOOR',[65,23],[[78,12],[77,12]],[73,23],['crossfire','rush']]]},
 square:{name:'LIBERTY · CIVIC SQUARE',theme:'square',
  features:[['theatre',31,2,65,14,10,'國家音樂廳'],['theatre',31,58,65,70,10,'國家戲劇院'],['planter',24,23,27,26,.7],['planter',24,46,27,49,.7],['grove',18,13,21,17,3],['grove',19,56,22,60,3],['van',72,49,75,52,2.6]],
  nodes:[[12,36],[28,36],[42,24],[67,22],[73,36],[68,52],[53,53]],start:[12,36],hostage:[52,52],bombs:[[67,22],[53,53]],exit:[12,36],siteStart:[45,36],
  teams:[['CONCERT HALL SIDE',[38,25],[[66,7],[66,8]],[67,20],['anchor','crossfire']],['THEATRE SIDE',[42,48],[[66,64],[66,65]],[68,53],['flank','patrol'],[[79,62],[79,48]]],['SERVICE VAN',[67,43],[[76,49],[76,50]],[70,46],['rush','anchor']]]},
 dome:{name:'DOME · BASEBALL BOWL',theme:'dome',
  features:[['dugout',31,51,40,55,2.8,'DUGOUT'],['dugout',62,51,71,55,2.8,'BULLPEN'],['screen',74,24,76,27,2.6],['screen',22,23,24,26,2.6]],
  nodes:[[48,66],[48,55],[48,44],[37,48],[45,43],[69,43],[77,33]],start:[48,66],hostage:[39,48],bombs:[[37,48],[77,33]],exit:[48,66],siteStart:[48,43],
  teams:[['WEST DUGOUT',[43,51],[[30,53],[30,54]],[34,49],['rush','anchor']],['EAST DUGOUT',[54,49],[[72,51],[72,52]],[68,49],['crossfire','flank'],[[68,43],[58,37]]],['BULLPEN SCREEN',[69,36],[[77,24],[77,25]],[78,31],['anchor','rush']],['FIELD ACCESS',[37,35],[[21,23],[21,24]],[26,31],['anchor','flank'],[[29,39],[38,43]]]]},
 night:{name:'RAOHE · LIVING MARKET STREET',theme:'night',
  features:[['shopRow',8,10,37,23,14,'饒河街'],['shopRow',44,10,84,23,17],['shopRow',8,49,37,63,13],['shopRow',44,49,84,63,15],['stall',16,34,21,37,1,'胡椒餅'],['stall',27,34,32,37,1,'藥燉排骨'],['stall',38,34,43,37,1,'蚵仔煎'],['stall',49,34,54,37,1,'珍珠奶茶'],['stall',60,34,65,37,1,'水果鮮切'],['stall',71,34,76,37,1,'豆花甜品'],['stall',14,27,18,29,1,'服飾包包'],['stall',63,43,67,45,1,'玩具雜貨'],['van',25,42,28,45,2.6],['screen',40,18,42,21,2.5]],
  nodes:[[85,31],[70,31],[54,30],[40,29],[40,43],[40,56],[42,60]],alternate:[[10,43],[22,40],[39,40],[56,43],[77,43],[77,30],[40,30],[40,53],[42,60]],start:[85,31],alternateStart:[10,43],hostage:[42,60],bombs:[[77,43],[40,25]],exit:[10,43],alternateExit:[85,31],siteStart:[54,30],
  teams:[['FOOD DELIVERY VAN',[66,32],[[24,44],[24,45]],[30,41],['rush','anchor']],['NORTH ARCADE',[43,30],[[43,15],[43,16]],[43,26],['crossfire','rush']],['EAST SHOP CORNER',[70,42],[[83,64],[82,64]],[83,44],['flank','anchor'],[[71,45],[58,45]]],['VENDOR ALLEY',[40,48],[[38,57],[38,58]],[40,54],['anchor','rush']]],
  alternateTeams:[['DELIVERY REAR',[24,40],[[29,43],[29,44]],[32,41],['rush','crossfire']],['NORTH AWNING',[47,29],[[38,16],[38,17]],[40,26],['flank','anchor'],[[40,31],[57,31]]],['TEMPLE END',[76,41],[[85,56],[85,57]],[85,44],['anchor','rush']],['REAR SHOP DOOR',[40,52],[[43,61],[43,62]],[40,58],['anchor','rush']]]},
 mountain:{name:'YANGMINGSHAN · OPEN VOLCANIC TRAIL',theme:'mountain',
  features:[['hut',7,54,15,60,3.3,'小油坑遊客服務站'],['rock',26,43,31,47,3.2],['rock',48,29,53,33,3.7],['rock',68,12,73,17,3.4],['bamboo',24,19,29,24,3.2],['bamboo',39,49,44,53,3.1],['rock',79,31,84,36,3.6]],
  nodes:[[18,60],[28,53],[38,38],[56,37],[64,26],[77,22],[82,18]],alternate:[[18,60],[21,39],[34,26],[45,17],[59,18],[77,22],[82,18]],start:[18,60],hostage:[82,18],bombs:[[64,26],[82,18]],exit:[18,60],siteStart:[56,37],
  teams:[['LOWER ROCK BANK',[32,49],[[32,44],[32,45]],[36,45],['rush','anchor']],['MIDDLE ROCK SPUR',[39,39],[[53,28],[54,28]],[45,45],['patrol','flank'],[[48,37],[58,34]]],['VOLCANIC OUTCROP',[60,32],[[54,29],[54,30]],[58,31],['anchor','crossfire']],['LOOKOUT ROCK',[75,23],[[74,13],[74,14]],[78,18],['anchor','flank'],[[82,19],[87,24]]]],
  alternateTeams:[['BAMBOO BRANCH',[24,35],[[32,43],[32,44]],[33,24],['rush','patrol']],['RIDGE SHELTER',[44,21],[[54,29],[54,30]],[56,24],['anchor','flank'],[[60,19],[65,23]]],['VIEWING SPUR',[70,24],[[74,14],[74,15]],[77,20],['crossfire','rush']],['LOOKOUT BACK ROCK',[81,23],[[85,32],[85,33]],[85,26],['anchor','flank'],[[87,24],[87,18]]]]}
};
const extraVehicles={
 memorial:[['car',8,61,12,62,1.4],['van',23,61,28,63,2.5],['scooter',5,54,6,55,1.15]],
 temple:[['car',30,65,34,66,1.4],['car',56,65,60,66,1.4],['scooter',78,51,79,52,1.15],['scooter',78,55,79,56,1.15],['scooter',18,62,19,63,1.15]],
 museum:[['car',9,64,13,65,1.4],['car',22,64,26,65,1.4],['van',79,60,84,62,2.5],['scooter',88,53,89,54,1.15]],
 square:[['car',82,61,86,62,1.4],['car',6,64,10,65,1.4],['scooter',85,53,86,54,1.15]],
 dome:[['car',5,65,9,66,1.4],['van',81,65,86,67,2.5],['scooter',9,59,10,60,1.15]],
 night:[['car',4,65,8,66,1.4],['van',87,66,92,68,2.5],...Array.from({length:12},(_,i)=>['scooter',12+i*6, i%2?46:25,13+i*6,i%2?47:26,1.15])],
 mountain:[['car',4,64,8,65,1.4],['van',11,65,16,67,2.5],['scooter',20,65,21,66,1.15]]
};
for(const [theme,vehicles] of Object.entries(extraVehicles))window.TVSitePlans[theme].features.push(...vehicles);
})();
