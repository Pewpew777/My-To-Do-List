
const firebaseConfig = {
  apiKey: "AIzaSyA5PnZHAdchWD-PUzmVINFXuHNI2ryXa5g",
  authDomain: "todolist-f46e4.firebaseapp.com",
  projectId: "todolist-f46e4",
  storageBucket: "todolist-f46e4.appspot.com",
  messagingSenderId: "508093301081",
  appId: "1:508093301081:web:cf2aef614da737fcf60c48",
  measurementId: "G-V7CSEQVEP8"
}





firebase.initializeApp(firebaseConfig);
var database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
  const teamBtn = document.querySelector('.team');
  const mineBtn = document.querySelector('.mine');

  teamBtn.addEventListener('click', function() {
    teamBtn.classList.add('active');
    mineBtn.classList.remove('active');
    database.ref('/tasks').on('value', function(snapshot) {
      const tasks = snapshot.val();
      const taskList = document.getElementById('task-list');
      taskList.innerHTML = '';
      Object.keys(tasks).forEach(key => {
        const task = tasks[key];
        const li = document.createElement('li');
        li.innerHTML = `<div class="wee"><strong>${task.task}: </strong> ${task.description}</div>
          <div class="buttons"><input type="checkbox" class="complete_checkbox" ${task.status === 'finished' ? 'checked' : ''}><button class="update-btn"><i class="fa-regular fa-pen-to-square"></i></button><button class="delete-btn"><i class="fa-solid fa-x"></i></button></div>`;
        li.dataset.status = task.status;
        li.dataset.key = key;
        if (task.status === 'finished') {
          li.classList.add('completed');
        }
        document.getElementById('task-list').appendChild(li);
      });
    });
  });

  mineBtn.addEventListener('click', function() {
    mineBtn.classList.add('active');
    teamBtn.classList.remove('active');
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `<div class="wee"><strong>${task.task}: </strong> ${task.description}</div>
        <div class="buttons"><input type="checkbox" class="complete_checkbox" ${task.status === 'finished' ? 'checked' : ''}> <button class="update-btn"><i class="fa-regular fa-pen-to-square"></i></button>
        <button class="delete-btn">X</i></button></div>`;
      li.dataset.status = task.status;
      if (task.status === 'finished') {
        li.classList.add('completed');
      }
      document.getElementById('task-list').appendChild(li);
    });
  });

  document.getElementById('task-list').addEventListener('click', function(event) {
    if (event.target.classList.contains('update-btn')) {
      const li = event.target.closest('li');
      const taskName = li.querySelector('.wee strong').textContent.replace(':', '').trim();
      const taskDescription = li.querySelector('.wee').childNodes[1].nodeValue.trim();
      const taskStatus = li.dataset.status;
      const statusSelect = document.getElementById('status');
      const taskInput = document.getElementById('task');
      const descriptionInput = document.getElementById('description');
      statusSelect.value = taskStatus;
      taskInput.value = taskName;
      descriptionInput.value = taskDescription;
      window.UpdatingTask = li;
    } else if (event.target.classList.contains('delete-btn')) {
      const li = event.target.closest('li');
      if (teamBtn.classList.contains('active')) {
        const key = li.dataset.key;
        database.ref('tasks/' + key).remove();
      } else {
        const taskName = li.querySelector('.wee strong').textContent.replace(':', '').trim();
        const taskDescription = li.querySelector('.wee').childNodes[1].nodeValue.trim();
        const taskStatus = li.dataset.status;
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const index = tasks.findIndex(item => item.task === taskName && item.description === taskDescription && item.status === taskStatus);
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
      li.remove();
    }
  });

  document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const statusSelect = document.getElementById('status');
    const taskInput = document.getElementById('task');
    const descriptionInput = document.getElementById('description');
    if (window.UpdatingTask) {
      const li = window.UpdatingTask;
      const newName = taskInput.value;
      const newDescription = descriptionInput.value;
      const newStatus = statusSelect.value;
      li.querySelector('.wee strong').textContent = newName + ":";
      li.querySelector('.wee').childNodes[1].nodeValue = " " + newDescription;
      li.dataset.status = newStatus;
      if (newStatus === 'finished') {
        li.classList.add('completed');
        li.querySelector('.complete_checkbox').checked = true;
      } else {
        li.classList.remove('completed');
        li.querySelector('.complete_checkbox').checked = false;
      }
      if (teamBtn.classList.contains('active')) {
        const key = li.dataset.key;
        database.ref('tasks/' + key).set({
          task: newName,
          description: newDescription,
          status: newStatus
        });
      } else {
        const oldTaskName = li.querySelector('.wee strong').textContent.replace(':', '').trim();
        const oldTaskDescription = li.querySelector('.wee').childNodes[1].nodeValue.trim();
        const oldTaskStatus = li.dataset.status;
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
          if (task.task === oldTaskName && task.description === oldTaskDescription && task.status === oldTaskStatus) {
            task.task = newName;
            task.description = newDescription;
            task.status = newStatus;
          }
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
      window.UpdatingTask = null;
      taskInput.value = '';
      descriptionInput.value = '';
      statusSelect.value = 'open';
    } else {
      const status = statusSelect.value;
      const task = taskInput.value.trim();
      const description = descriptionInput.value.trim();
      const li = document.createElement('li');
      li.innerHTML = `<div class="wee"><strong>${task}: </strong> ${description}</div>
        <div class="buttons"><input type="checkbox" class="complete_checkbox" ${status === 'finished' ? 'checked' : ''}>
        <button class="update-btn"><i class="fa-regular fa-pen-to-square"></i></button>
        <button class="delete-btn"><i the "fa-solid fa-x"></i></button></div>`;
      li.dataset.status = status;
      if (status === 'finished') {
        li.classList.add('completed');
      }
      document.getElementById('task-list').appendChild(li);
      if (teamBtn.classList.contains('active')) {
        const newTaskKey = database.ref().child('tasks').push().key;
        database.ref('tasks/' + newTaskKey).set({
          task: task,
          description: description,
          status: status
        });
      } else {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push({
          task: task,
          description: description,
          status: status
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
      taskInput.value = '';
      descriptionInput.value = '';
      statusSelect.value = 'open';
    }
  });

  document.getElementById('task-list').addEventListener('change', function(event) {
    if (event.target.classList.contains('complete_checkbox')){
      const li = event.target.closest('li');
      const checkbox = event.target;
      if (checkbox.checked) {
        li.dataset.status = 'finished';
        li.classList.add('completed');
      } else {
        li.dataset.status = 'open';
        li.classList.remove('completed');
      }
      if (teamBtn.classList.contains('active')) {
     const key = li.dataset.key;
        const taskName = li.querySelector('.wee strong').textContent.replace(':', '').trim();
        const taskDescription = li.querySelector('.wee').childNodes[1].nodeValue.trim();
        database.ref('tasks/' + key).set({
          task: taskName,
          description: taskDescription,
          status: li.dataset.status
        });
      } else {
        const taskName = li.querySelector('.wee strong').textContent.replace(':', '').trim();
        const taskDescription = li.querySelector('.wee').childNodes[1].nodeValue.trim();
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => {
          if (task.task === taskName && task.description === taskDescription) {
            task.status = li.dataset.status;
          }
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
      }
    }
  });
});


///filtering
document.querySelectorAll('.filter-btn').forEach(button => {
  button.addEventListener('click', function() {
    let isTask = false;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const status = button.dataset.status;
    const taskItems = document.querySelectorAll('#task-list li');
    const taskList = document.getElementById('task-list');
    
    taskItems.forEach(li => {
      if (status === 'all' || li.dataset.status === status) {
        li.style.display = 'flex';
        isTask = true; 
      } else {
        li.style.display = 'none';
      }
    });

    const ourNoItems = document.getElementById('no-items');
    if (ourNoItems) {
      ourNoItems.remove();
    }

    if (!isTask) {
      const noItems = document.createElement('div');
      noItems.textContent = 'No items';
      noItems.id = 'no-items';
      taskList.appendChild(noItems);
    }

    
  });
});
