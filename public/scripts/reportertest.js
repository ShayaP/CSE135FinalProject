// let reporterInfo = JSON.parse(localStorage.getItem('reporter'));

let staticTable = document.getElementById('staticInfoTable');
let performanceTable = document.getElementById('performanceTimingTable');
let urlTable = document.getElementById('eventInfo');
let resourceTable = document.getElementById('resourceInfo');
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
  let staticHTML = '';
  let performanceHTML = '';
  let urlTableHTML = '';
  let resourceTableHTML = '';

  for (const url in reporterInfo) {
    let data = reporterInfo[url];
    let timing = data.navTiming;
    urlTableHTML += `
      <li style="display: flex; justify-content: space-between;">
        <span>${url}</span>
        <button
          class="button is-danger"
          type="button"
          onclick="purge(event)"
          data-url="${url}"
        >
          Purge
        </button>
      </li>
    `;

    resourceTableHTML += `
      <li style="display: flex; justify-content: space-between;">
        <span>${url}</span>
        <button
          class="button is-danger"
          type="button"
          onclick="purge(event)"
          data-url="${url}"
        >
          Purge
        </button>
      </li>
    `;

    // Set the data for static table
    staticHTML += `
            <tr>
              <th>${url} 
              <button
                class="button is-danger"
                type="button"
                style="display: block; margin: 5% 0; text-align: left;"
                onclick="purge(event)"
                data-url="${url}"
              >
                Purge
              </button></th>
              <td>${data.language}</td>
              <td>${data.userAgent}</td>
              <td>${data.maxScreenWidth}</td>
              <td>${data.maxScreenHeight}</td>
              <td>${data.currScreenWidth}</td>
              <td>${data.currScreenHeight}</td>
              <td>${data.effectiveConnectionType}</td>
              <td>${data.cookieEnabled}</td>
              <td>${data.JSEnabled}</td>
              <td>${data.cssEnabled}</td>
              <td>${data.imagesEnabled}</td>
            </tr>
  `;

  // if data object is empty (noscript option), then avoid toFixed calls which
  // give error with empty object
  performanceHTML += `
              <tr>
                <th>${url} 
                <button
                  class="button is-danger"
                  type="button"
                  style="display: block; margin: 5% 0; text-align: left;"
                  onclick="purge(event)"
                  data-url="${url}"
                >
                  Purge
                </button></th>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                </td>
                <td>
                </td>
                <td></td>
                <td>
                </td>
                <td>
                </td>
                <td></td>
              </tr>
      `;
  if (timing !== undefined) {
      // Set the data for performance stuff
      performanceHTML += `
              <tr>
                <th>${url} 
                <button
                  class="button is-danger"
                  type="button"
                  style="display: block; margin: 5% 0; text-align: left;"
                  onclick="purge(event)"
                  data-url="${url}"
                >
                  Purge
                </button></th>
                <td>${data.totalTime.toFixed(4)}</td>
                <td>${timing.requestStart.toFixed(4)}</td>
                <td>${timing.responseStart.toFixed(4)}</td>
                <td>${timing.responseEnd.toFixed(4)}</td>
                <td>${(timing.domainLookupEnd - timing.domainLookupStart).toFixed(
                  4
                )}</td>
                <td>${(
                  timing.domContentLoadedEventEnd -
                  timing.domContentLoadedEventStart
                ).toFixed(4)}</td>
                <td>${timing.domInteractive.toFixed(4)}</td>
                <td>${(timing.loadEventEnd - timing.loadEventStart).toFixed(
                  4
                )}</td>
                <td>${(timing.unloadEventEnd - timing.unloadEventStart).toFixed(
                  4
                )}</td>
                <td>${timing.transferSize.toFixed(4)}</td>
              </tr>
      `;
    }
  }
  staticTable.innerHTML = staticHTML;
  performanceTable.innerHTML = performanceHTML;
  urlTable.innerHTML = urlTableHTML;
  resourceTable.innerHTML = resourceTableHTML;
}

function expandResourceList(e) {
  let newHTML = `<div onclick="closeList(event)">${e.target.innerText}</div>
  <div id="resourceLog">
  `;
  let data = reporterInfo[e.target.innerHTML];
  if (!data) return;
  newHTML += `<table class="table is-striped is-narrow is-hoverable is-fullwidth">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Initiator Type</th>
                    <th>Start Time</th>
                    <th>Duration</th>
                    <th>Response Start</th>
                    <th>Response End</th>
                    <th>Transfer Size</th>
                  </tr>
                </thead>
                <tbody>`;
  for (const d of data.resourceTiming) {
    newHTML += `
      <tr>
        <th>${d.name}</th>
        <td>${d.initiatorType}</td>
        <td>${d.startTime.toFixed(4)}</td>
        <td>${d.duration.toFixed(4)}</td>
        <td>${d.responseStart.toFixed(4)}</td>
        <td>${d.responseEnd.toFixed(4)}</td>
        <td>${d.transferSize.toFixed(4)}</td>
      </tr>
    `;
  }
  newHTML += `</tbody>
  </table>`;

  e.target.innerHTML = newHTML;
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

function purgeAll() {
  let confirmed = confirm('Are you sure you want to purge all?');
  if (confirmed) {
    fetch('/purgeAll')
      .then(() => {
        refreshData();
      })
      .catch(error => {
        console.log(error);
      });
  }
}

function purge(e) {
  let url = e.target.dataset.url;
  let confirmed = confirm('Are you sure you want to purge?');
  if (confirmed) {
    fetch('/purge', {
            method: 'post',
            body: JSON.stringify({user: user, url: url})
          })
      .then(() => {
        delete dbObject[user][url];
        renderUser(user);
      })
      .catch(error => {
        console.log(error);
      });
  }
}
