/* Fictional armed roles. Ordinary vendors/visitors are rescue characters. */
(()=>{'use strict';
const families={tower:'tactical',memorial:'street',temple:'gang',museum:'intruder',square:'street',dome:'crew',night:'vendor',mountain:'hiker'};
const colors={vendor:['#b16438','#e8dfc4','#394f50'],gang:['#502d43','#1c2830','#e7dfce'],street:['#42586a','#6c4a36','#525745'],intruder:['#333b42','#5c6357','#5c433e'],crew:['#a38c40','#40606b','#78483b'],hiker:['#be622c','#3e6776','#6c7440'],tactical:['#554e3b','#303e3e','#71634d']};
function style(theme,index,kind,ally=false){
 const family=ally?(theme==='night'?'vendor':theme==='mountain'?'hiker':'street'):families[theme],variant=index%3;
 return {family,variant,seed:index,skin:['#d2a080','#b98563','#e1b799'][index%3],shirt:colors[family][variant],pants:['#333c40','#50564a','#3d414b'][(index+1)%3],
  height:[1.74,1.83,1.9][variant],width:[.94,1.04,1.12][(index+1)%3],hair:['#211d1b','#45392a','#151617'][variant],
  hat:family==='vendor'?(variant===1?'chef':'cap'):family==='crew'||family==='hiker'?'cap':null,
  apron:family==='vendor',floral:family==='gang'&&variant===0,tank:family==='gang'&&variant===1,chain:family==='gang',glasses:family==='gang'&&variant!==2,
  armed:!ally,armband:!ally?'#a53e31':null,heavy:kind==='heavy'};
}
window.TVCharacterStyles={enemy:(theme,i,kind)=>style(theme,i,kind,false),civilian:(theme,i=0)=>style(theme,i,'civilian',true)};
})();
