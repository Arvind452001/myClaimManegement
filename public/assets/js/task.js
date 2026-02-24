let tasksList=document.getElementById('tasksList');
tasksList.innerHTML=""; // reset

tasks.forEach(task=>{
  let li=document.createElement('li');
  li.className="list-group-item d-flex justify-content-between align-items-center";

  let today=new Date(); 
  let due=new Date(task.due); 
  due.setHours(0,0,0,0);
  today.setHours(0,0,0,0);

  let diff=(due-today)/(1000*60*60*24);
  let statusBadge="";

  if(task.status=="Completed") statusBadge='<span class="badge bg-success">Completed</span>';
  else if(task.status=="Cancelled") statusBadge='<span class="badge bg-secondary">Cancelled</span>';
  else if(diff<0) statusBadge='<span class="badge bg-danger">OVERDUE</span>';
  else if(diff==0) statusBadge='<span class="badge bg-danger">Today</span>';
  else if(diff<=3) statusBadge='<span class="badge bg-warning text-dark">Soon</span>';
  else statusBadge='<span class="badge bg-info text-dark">Upcoming</span>';

  li.innerHTML=`${task.title} - ${task.caseId} - Due: ${task.due} ${statusBadge}`;
  tasksList.appendChild(li);
});
