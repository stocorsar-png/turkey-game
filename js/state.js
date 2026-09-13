export const S={
  day:null,
  morning:new Set(),
  afternoon:new Set(),
  laundry:new Set(),
  gym:new Set(),
  fox:null,
  rest:false,
  sleep:new Set()
};

export function resetState(){
  S.day=null; S.morning=new Set(); S.afternoon=new Set(); S.laundry=new Set();
  S.gym=new Set(); S.fox=null; S.rest=false; S.sleep=new Set();
}
