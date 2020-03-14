let urlTable = document.getElementById('eventInfo');
let modal = document.getElementById('modal');
let modalContent = document.getElementById('modalContent');

let dbObject = {};
let reporterInfo = {};
let user = "";

document.addEventListener("DOMContentLoaded", refreshData);

function refreshData() {
    fetch('/query')
        .then(response => {
            return response.json();
        })
        .then(json => {
            render(json);
        });
}

function render(json) {
    dbObject = json;
    let userList = document.getElementById('user-list');
    userList.innerHTML = '';
    for (const user in dbObject) {
        userList.innerHTML += `
        <li>
          <a href="#" class="" onclick="renderUser('${user}')">
            ${user}
          </a>
        </li>`;
    }
    renderUser(null);
}

function renderUser(userLocal) {
    user = userLocal;
    reporterInfo = dbObject[user];
    // Set the data for the static table
//    let staticHTML = '';
    //   let performanceHTML = '';
    let urlTableHTML = '';
    //   let resourceTableHTML = '';

    for (const url in reporterInfo) {
        let data = reporterInfo[url];
        console.log()
        urlTableHTML += `
      <li style="display: flex; justify-content: space-between;">
        <span>${url}</span>
      </li>
    `;
    }
    urlTable.innerHTML = urlTableHTML;
}
function expandList(e) {

    let newHTML = `<div onclick="closeList(event)">${e.target.innerText}</div>
  <div id="eventLog">
  `;
    let data = reporterInfo[e.target.innerHTML];
    if (!data) return;


    newHTML += `<ul onclick="(event) => event.stopPropagation()" class="content idle-time">
                <li>Idle Time: ${data.idleCount / 1000} s</li>
              </ul>
              `;
    newHTML += ` <ul class="content click-event">`;
    for (const d of data.mouseClickEvents) {
        newHTML += `
    <li onclick="openModal(event)" data-event=${JSON.stringify(
            d
        )}>${d.timeStamp.toFixed(4)} - Mouse Click</li>
    `;
    }
    newHTML += `</ul>`;
    newHTML += `<ul class="content move-event">`;
    for (const d of data.mouseMoveEvents) {
        newHTML += `
    <li onclick="openModal(event)" data-event=${JSON.stringify(
            d
        )}>${d.timeStamp.toFixed(4)} - Mouse Move</li>
    `;
    }
    newHTML += `</ul>`;
    newHTML += `<ul class="content keystroke-event">`;
    for (const d of data.keyEvents) {
        newHTML += `
    <li onclick="openModal(event)" data-event=${JSON.stringify(
            d
        )}>${d.timeStamp.toFixed(4)} - Keystroke</li>
    `;
    }
    newHTML += `</ul>`;
    newHTML += `<ul class="content scroll-event">`;
    for (const d of data.scrollEvents) {
        newHTML += `
    <li onclick="openModal(event)" data-event=${JSON.stringify(
            d
        )}>${d.timeStamp.toFixed(4)} - Scroll</li>
    `;
    }
    newHTML += `</ul>`;
    newHTML += `
        <ul class="content beforeunload-event">
          <li onclick="openModal(event)" data-event=${JSON.stringify(
        data.beforeunload
    )}>${data.beforeunload.timeStamp.toFixed(4)} - Before Unload</li>
        </ul>
      </div>
  `;


    e.target.innerHTML = newHTML;
}

function closeList(e) {
    e.stopPropagation();
    e.target.parentNode.innerHTML = `${e.target.innerText}`;
}

function openModal(e) {
    e.stopPropagation();
    modal.classList.add('is-active');
    var eventData = JSON.parse(e.target.dataset.event);
    let modalHTML = '';
    modalHTML += `<ul class="content modal-data-list">`;
    for (const d in eventData) {
        modalHTML += `<li>${d}: ${eventData[d]}</li>`;
    }
    modalHTML += `</ul>`;
    modalContent.innerHTML = modalHTML;
}

function closeModal(e) {
    modal.classList.remove('is-active');
}