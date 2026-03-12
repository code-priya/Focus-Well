const ctx = document.getElementById('stressChart');

new Chart(ctx, {
type: 'bar',
data: {
labels: ['Low Stress','Moderate Stress','High Stress'],

datasets: [{
label: 'Number of Students',
data: [300,1200,500],

borderWidth: 1
}]
},

options: {
responsive:true,

plugins:{
legend:{
display:false
}
},

scales:{
y:{
beginAtZero:true
}
}
}
});
