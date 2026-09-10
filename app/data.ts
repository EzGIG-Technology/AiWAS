export const schools = ['SMK Tunku Ampuan Durah','SK Seremban Jaya'];
export const roles = ['Internal Ops','School Admin','Discipline Teacher','System Admin'] as const;
export type Role = typeof roles[number];
export const categories = ['Person detection & tracking','Vehicles at drop-off / pick-up','Crowd counting','Entry / exit counting','Unusual dwell time','Restricted area intrusion','Fence climbing','Smoking / vaping','Vandalism','Bullying','Fighting','Violent behaviour','Littering'];
export type Incident = {acknowledged?:boolean;id:string;category:string;school:string;zone:string;block:string;camera:string;severity:string;confidence:number;time:string;date:string;status:string;validation:string;description:string;assigned:string;history:{text:string;actor:string;time:string}[]};
const seeds = [
['Fighting','Block A corridor','Block A','High',86,'10:42','Open','Pending'],
['Restricted area intrusion','East perimeter','Boundary','High',92,'10:38','Under Review','Pending'],
['Crowd counting','Canteen','Block A','Medium',89,'10:34','Open','Pending'],
['Unusual dwell time','Main gate','Entrance','Medium',83,'10:21','Open','Pending'],
['Bullying','Courtyard','Block B','High',78,'10:13','Under Review','Pending'],
['Littering','Canteen','Block A','Low',81,'09:56','Closed','Confirmed'],
['Vehicles at drop-off / pick-up','Main gate','Entrance','Medium',90,'09:42','Closed','False alarm'],
['Smoking / vaping','East perimeter','Boundary','Medium',76,'09:30','Closed','False alarm'],
['Crowd counting','Courtyard','Block B','Medium',91,'09:10','Closed','Confirmed'],
['Entry / exit counting','Assembly hall','Block C','High',88,'08:55','Closed','Confirmed'],
['Vandalism','Block A corridor','Block A','High',82,'08:38','Open','Confirmed'],
['Fence climbing','East perimeter','Boundary','High',87,'08:22','Open','Confirmed'],
['Littering','Courtyard','Block B','Low',85,'08:04','Closed','Confirmed'],
['Violent behaviour','Assembly hall','Block C','High',84,'07:55','Open','Confirmed'],
['Unusual dwell time','Main gate','Entrance','Low',86,'07:41','Closed','False alarm'],
['Crowd counting','Canteen','Block A','Medium',93,'07:32','Closed','Confirmed'],
['Fighting','Courtyard','Block B','High',81,'10:20','Open','Pending'],
['Littering','Main gate','Entrance','Low',83,'09:20','Closed','Confirmed'],
] as const;
export const initialIncidents:Incident[]=seeds.map((s,i)=>({id:`AIW-${String(1048-i).padStart(4,'0')}`,category:s[0],zone:s[1],block:s[2],severity:s[3],confidence:s[4],time:s[5],date:i>11?'2026-09-09':'2026-09-10',school:schools[i>15?1:0],camera:`CAM-${String(['Main gate','Canteen','Block A corridor','East perimeter','Courtyard','Assembly hall'].indexOf(s[1])+1).padStart(2,'0')}`,status:s[6],validation:s[7],assigned:['Nur Aisyah','Ahmad Firdaus','Nadia Ahmad'][i%3],description:({'Fighting':'Rapid movement and possible physical contact between anonymous tracks triggered a review. Staff should assess the context before confirming.','Crowd counting':'The zone count reached 24 people, exceeding the configured limit of 20.','Restricted area intrusion':'An anonymous track entered the restricted boundary zone during a restricted period.','Unusual dwell time':'An anonymous track remained in the zone for 12 minutes, above the 10-minute limit.'} as Record<string,string>)[s[0]]||`The ${s[0].toLowerCase()} detector flagged activity in ${s[1]}. Review the evidence and context before confirming.`,history:[{text:'Detection flagged; incident evidence reserved',actor:'Detection engine · Demo',time:s[5]},...(s[7]!=='Pending'?[{text:`Marked ${s[7].toLowerCase()}`,actor:'Nur Aisyah',time:s[5]}]:[])]}));
export type Camera={id:string;zone:string;block:string;school:string;online:boolean;fps:number;latency:number};
export const cameras:Camera[]=schools.flatMap((school,j)=>['Main gate','Canteen','Block A corridor','East perimeter','Courtyard','Assembly hall'].map((zone,i)=>({id:`CAM-${String(i+1).padStart(2,'0')}`,zone,block:['Entrance','Block A','Block A','Boundary','Block B','Block C'][i],school,online:!(i===5&&j===0),fps:25,latency:[180,230,195,260,210,0][i]})));
export type User={name:string;email:string;role:Role;school:string;active:boolean};
export const initialUsers:User[]=[{name:'Nadia Ahmad',email:'nadia@example.com',role:'Internal Ops',school:'All PoC schools',active:true},{name:'Nur Aisyah',email:'aisyah@example.com',role:'Discipline Teacher',school:schools[0],active:true},{name:'Ahmad Firdaus',email:'firdaus@example.com',role:'School Admin',school:schools[0],active:true},{name:'Daniel Tan',email:'daniel@example.com',role:'System Admin',school:'All PoC schools',active:true}];
export function severityClass(s:string){return s==='Critical'?'critical':s==='High'?'red':s==='Medium'?'amber':s==='Low'?'blue':s==='Confirmed'?'green':s==='False alarm'?'red':'amber'}
