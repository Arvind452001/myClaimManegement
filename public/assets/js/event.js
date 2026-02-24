// Event create/edit logic
let editEvent=null;

type.onchange=function(){
deptFields.style.display=(type.value=="Department Order – Deadline")?"block":"none";
outcomeDiv.style.display=(type.value.includes("Appointment")||type.value.includes("Call"))?"block":"none";
}

saveBtn.onclick=function(){
let t=title.value||type.value;
let c=caseId.value;
let ty=type.value;
let s=status.value||"Active";
let notes=outcomeNotes.value||"";

if(!c){alert("Case required");return;}
if(!ty){alert("Type required");return;}
if((ty.includes("Appointment")||ty.includes("Call")) && !notes){alert("Outcome Notes required"); return;}

let obj={title:t,start:date.value,extendedProps:{caseId:c,type:ty,status:s,notes:notes}};
if(ty=="Department Order – Deadline"){
if(!orderDate.value||!deadlineDate.value||!orderType.value){alert("All Department fields required");return;}
obj.allDay=true;
obj.extendedProps.orderDate=orderDate.value;
obj.extendedProps.deadlineDate=deadlineDate.value;
obj.extendedProps.orderType=orderType.value;
tasks.push({caseId:c,title:"Dept Order: "+orderType.value,due:deadlineDate.value,status:"Pending"});
}

bootstrap.Modal.getInstance(document.body.querySelector('#eventForm') || document.body).hide();
}
