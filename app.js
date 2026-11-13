
// Fixed lists and sample data
const CATEGORIES = ["Network", "Hardware", "Software", "Account/Access", "Email"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["Open", "Assigned", "In Progress", "Resolved", "Closed"];
const TECHNICIANS = ["Sana Malik", "Omar Farooq", "Hina Raza"];

// date/time string for "h hours ago"
function hoursAgo(h) {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

// All tickets
let tickets = [
  {
    id: 101,
    title: "Campus Wi-Fi drops every hour",
    description: "Library floor 2 loses connection roughly hourly.",
    requester: "Ayesha Khan",
    email: "ayesha@uni.edu",
    category: "Network",
    priority: "High",
    assignee: "Sana Malik",
    status: "In Progress",
    created: hoursAgo(50),
    comments: [
      { author: "Sana Malik", text: "Access point firmware is outdated. Updating tonight.", time: hoursAgo(20) },
      { author: "Ayesha Khan", text: "Thanks, still happening this morning.", time: hoursAgo(5) }
    ],
    history: [
      { status: "Open", time: hoursAgo(50), by: "Ayesha Khan" },
      { status: "Assigned", time: hoursAgo(46), by: "Hina Raza" },
      { status: "In Progress", time: hoursAgo(20), by: "Sana Malik" }
    ]
  },
  {
    id: 102,
    title: "Cannot log in to student portal",
    description: "Password reset email never arrives.",
    requester: "Bilal Ahmed",
    email: "bilal@uni.edu",
    category: "Account/Access",
    priority: "Urgent",
    assignee: "",
    status: "Open",
    created: hoursAgo(2),
    comments: [],
    history: [
      { status: "Open", time: hoursAgo(2), by: "Bilal Ahmed" }
    ]
  },
  {
    id: 103,
    title: "Projector in Room B14 has no signal",
    description: "HDMI input shows nothing, tried two laptops.",
    requester: "Dr. Nadia Iqbal",
    email: "nadia@uni.edu",
    category: "Hardware",
    priority: "Medium",
    assignee: "Omar Farooq",
    status: "Resolved",
    created: hoursAgo(72),
    comments: [
      { author: "Omar Farooq", text: "Replaced the HDMI cable. Please confirm it works.", time: hoursAgo(10) }
    ],
    history: [
      { status: "Open", time: hoursAgo(72), by: "Dr. Nadia Iqbal" },
      { status: "Assigned", time: hoursAgo(70), by: "Hina Raza" },
      { status: "In Progress", time: hoursAgo(30), by: "Omar Farooq" },
      { status: "Resolved", time: hoursAgo(10), by: "Omar Farooq" }
    ]
  },
  {
    id: 104,
    title: "Install MATLAB on lab PCs",
    description: "Need MATLAB 2025 on lab 3 machines for next week.",
    requester: "Usman Tariq",
    email: "usman@uni.edu",
    category: "Software",
    priority: "Low",
    assignee: "Hina Raza",
    status: "Assigned",
    created: hoursAgo(26),
    comments: [],
    history: [
      { status: "Open", time: hoursAgo(26), by: "Usman Tariq" },
      { status: "Assigned", time: hoursAgo(24), by: "Hina Raza" }
    ]
  },
  {
    id: 105,
    title: "Shared mailbox not syncing",
    description: "Admissions mailbox stopped updating on phones.",
    requester: "Fatima Zahra",
    email: "fatima@uni.edu",
    category: "Email",
    priority: "Urgent",
    assignee: "",
    status: "Open",
    created: hoursAgo(1),
    comments: [],
    history: [
      { status: "Open", time: hoursAgo(1), by: "Fatima Zahra" }
    ]
  },
  {
    id: 106,
    title: "Printer jams on 3rd floor",
    description: "Paper jam every few pages since Monday.",
    requester: "Hamza Ali",
    email: "hamza@uni.edu",
    category: "Hardware",
    priority: "Low",
    assignee: "Omar Farooq",
    status: "Closed",
    created: hoursAgo(120),
    comments: [
      { author: "Hamza Ali", text: "Works now, thank you.", time: hoursAgo(80) }
    ],
    history: [
      { status: "Open", time: hoursAgo(120), by: "Hamza Ali" },
      { status: "Assigned", time: hoursAgo(118), by: "Hina Raza" },
      { status: "In Progress", time: hoursAgo(100), by: "Omar Farooq" },
      { status: "Resolved", time: hoursAgo(90), by: "Omar Farooq" },
      { status: "Closed", time: hoursAgo(80), by: "Hamza Ali" }
    ]
  }
];

let nextId = 107;

// "Requester" or "Technician".
let role = "Requester";

// Ids of tickets whose "History and comments" box is open.
let openTickets = [];

// Message shown above the list after an action.
let notice = "";


// Ticket logic (no page code in this section)

// Return only the tickets that match every filter.
function filterTickets(list, filters) {
  const search = filters.search.trim().toLowerCase();

  return list.filter(function (ticket) {
    if (filters.category && ticket.category !== filters.category) return false;
    if (filters.priority && ticket.priority !== filters.priority) return false;
    if (filters.status && ticket.status !== filters.status) return false;

    if (search !== "") {
      const text = (ticket.title + " " + ticket.description + " " + ticket.requester).toLowerCase();
      if (text.includes(search) === false) return false;
    }

    return true;
  });
}

// How far along the status list is this ticket (0 to 100).
function progressPercent(status) {
  const index = STATUSES.indexOf(status);
  return (index / (STATUSES.length - 1)) * 100;
}

// Create a new ticket and put it at the top of the list.
function addTicket(data) {
  const now = new Date().toISOString();

  const ticket = {
    id: nextId,
    title: data.title,
    description: data.description,
    requester: data.requester,
    email: data.email,
    category: data.category,
    priority: data.priority,
    assignee: "",
    status: "Open",
    created: now,
    comments: [],
    history: [{ status: "Open", time: now, by: data.requester }]
  };

  nextId = nextId + 1;
  tickets.unshift(ticket);
  return ticket;
}

// Move a ticket one step forward. Returns "" when it worked.
function moveToNextStatus(ticket, by) {
  const index = STATUSES.indexOf(ticket.status);

  if (index === STATUSES.length - 1) {
    return "Closed tickets cannot be reopened.";
  }

  if (ticket.status === "Open" && ticket.assignee === "") {
    return "Assign a technician before moving this ticket.";
  }

  ticket.status = STATUSES[index + 1];
  ticket.history.push({ status: ticket.status, time: new Date().toISOString(), by: by });
  return "";
}

// Give a ticket to a technician. Returns "" when it worked.
function assignTicket(ticket, technician, by) {
  if (ticket.status === "Closed") {
    return "Closed tickets cannot be reassigned.";
  }

  if (technician === "") {
    return "Choose a technician.";
  }

  ticket.assignee = technician;

  if (ticket.status === "Open") {
    ticket.status = "Assigned";
    ticket.history.push({ status: "Assigned", time: new Date().toISOString(), by: by });
  }

  return "";
}

// Add a comment. Returns "" when it worked.
function addComment(ticket, author, text) {
  const cleanText = text.trim();

  if (cleanText === "") {
    return "Write a comment first.";
  }

  ticket.comments.push({
    author: author,
    text: cleanText,
    time: new Date().toISOString()
  });

  return "";
}


// Small helpers

function findTicket(id) {
  return tickets.find(function (ticket) {
    return ticket.id === id;
  });
}

// The name that goes into the history log.
function currentUserName() {
  if (role === "Technician") {
    return "Hina Raza";
  }
  return "You (requester)";
}

// Make user text safe before putting it into HTML.
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

// Build <option> tags. The first label is optional and has an empty value.
function makeOptions(values, firstLabel) {
  let html = "";

  if (firstLabel) {
    html += '<option value="">' + firstLabel + "</option>";
  }

  for (const value of values) {
    html += "<option>" + value + "</option>";
  }

  return html;
}


// Drawing the page

function render() {
  const list = filterTickets(tickets, getFilters());

  // Summary chips
  let active = 0;
  let unassigned = 0;
  let urgentUnassigned = 0;

  for (const ticket of tickets) {
    if (ticket.status !== "Closed" && ticket.status !== "Resolved") {
      active = active + 1;
    }
    if (ticket.assignee === "") {
      unassigned = unassigned + 1;
    }
    if (ticket.priority === "Urgent" && ticket.assignee === "" && ticket.status !== "Closed") {
      urgentUnassigned = urgentUnassigned + 1;
    }
  }

  let summaryHtml = "";
  summaryHtml += '<span class="chip">' + active + " active</span>";
  summaryHtml += '<span class="chip">' + unassigned + " unassigned</span>";
  summaryHtml += '<span class="chip ' + (urgentUnassigned > 0 ? "alert" : "") + '">';
  summaryHtml += urgentUnassigned + " urgent unassigned</span>";
  document.querySelector("#summary").innerHTML = summaryHtml;

  // The "Showing X of Y" line
  const countElement = document.querySelector("#count");

  if (notice !== "") {
    countElement.textContent = notice;
    notice = "";
  } else {
    countElement.textContent = "Showing " + list.length + " of " + tickets.length + " tickets";
  }

  // The cards
  const listElement = document.querySelector("#list");

  if (list.length === 0) {
    listElement.innerHTML =
      '<div class="empty">No tickets match your filters. Clear them or report a new issue.</div>';
  } else {
    let cardsHtml = "";
    for (const ticket of list) {
      cardsHtml += createCard(ticket);
    }
    listElement.innerHTML = cardsHtml;
  }
}

function getFilters() {
  return {
    search: document.querySelector("#q").value,
    category: document.querySelector("#c-cat").value,
    priority: document.querySelector("#c-pri").value,
    status: document.querySelector("#c-st").value
  };
}

// Build the HTML for one ticket card.
function createCard(ticket) {
  const statusIndex = STATUSES.indexOf(ticket.status);
  const percent = progressPercent(ticket.status);

  // The small "Open / Assigned / In Progress ..." strip.
  let stagesHtml = "";
  for (let i = 0; i < STATUSES.length; i++) {
    const className = i <= statusIndex ? ' class="on"' : "";
    stagesHtml += "<span" + className + ">" + STATUSES[i] + "</span>";
  }

  // Only technicians see the buttons.
  let staffHtml = "";
  if (role === "Technician") {
    staffHtml =
      '<div class="staff">' +
        '<select data-assign="' + ticket.id + '" aria-label="Assign ticket ' + ticket.id + '">' +
          makeOptions(TECHNICIANS, "Assign to...") +
        "</select>" +
        '<button data-act="assign" data-id="' + ticket.id + '">Assign</button>' +
        '<button data-act="advance" data-id="' + ticket.id + '">Move to next status</button>' +
      "</div>";
  }

  // History list.
  let historyHtml = "";
  for (const entry of ticket.history) {
    historyHtml +=
      "<li>" + escapeHtml(entry.status) +
      " by " + escapeHtml(entry.by) +
      ", " + formatDate(entry.time) + "</li>";
  }

  // Comments list.
  let commentsHtml = "";
  if (ticket.comments.length === 0) {
    commentsHtml = "<li>No comments yet.</li>";
  } else {
    for (const comment of ticket.comments) {
      commentsHtml +=
        "<li><strong>" + escapeHtml(comment.author) + "</strong>: " +
        escapeHtml(comment.text) + "</li>";
    }
  }

  const assigneeText = ticket.assignee === "" ? "nobody yet" : escapeHtml(ticket.assignee);
  const openAttribute = openTickets.includes(ticket.id) ? " open" : "";

  return (
    '<article class="card" id="t' + ticket.id + '">' +

      "<header>" +
        "<div>" +
          "<h3>#" + ticket.id + " " + escapeHtml(ticket.title) + "</h3>" +
          '<p class="meta">' + escapeHtml(ticket.requester) +
            " &middot; " + escapeHtml(ticket.category) +
            " &middot; " + formatDate(ticket.created) + "</p>" +
        "</div>" +
        '<span class="badge p-' + ticket.priority + '">' + ticket.priority + "</span>" +
      "</header>" +

      "<p>" + escapeHtml(ticket.description) + "</p>" +
      '<p class="meta">Assigned to: ' + assigneeText + "</p>" +

      '<div class="bar" role="progressbar" aria-label="Progress: ' + ticket.status +
        '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + percent + '">' +
        '<span style="width:' + percent + '%"></span>' +
      "</div>" +

      '<div class="stages" aria-hidden="true">' + stagesHtml + "</div>" +

      staffHtml +

      '<details data-id="' + ticket.id + '"' + openAttribute + ">" +
        "<summary>History and comments (" + ticket.comments.length + ")</summary>" +
        '<ul class="log">' + historyHtml + "</ul>" +
        '<ul class="log">' + commentsHtml + "</ul>" +
        '<form class="cform" data-id="' + ticket.id + '">' +
          '<input type="text" placeholder="Add a comment" maxlength="300" required ' +
            'aria-label="Comment for ticket ' + ticket.id + '">' +
          "<button>Post</button>" +
        "</form>" +
      "</details>" +

    "</article>"
  );
}


// Event handlers

// New ticket form.
function handleNewTicket(event) {
  event.preventDefault();

  const form = event.target;
  const message = document.querySelector("#form-msg");

  const name = document.querySelector("#f-name").value.trim();
  const email = document.querySelector("#f-email").value.trim();
  const title = document.querySelector("#f-title").value.trim();
  const category = document.querySelector("#f-cat").value;
  const priority = document.querySelector("#f-pri").value;
  const description = document.querySelector("#f-desc").value.trim();

  if (form.checkValidity() === false || title.length < 5 || description.length < 15) {
    message.className = "msg err";
    message.textContent =
      "Check the form: title needs 5+ characters and the description 15+ (spaces alone don't count).";
    form.reportValidity();
    return;
  }

  const ticket = addTicket({
    requester: name,
    email: email,
    title: title,
    category: category,
    priority: priority,
    description: description
  });

  form.reset();
  document.querySelector("#f-pri").value = "Medium";

  message.className = "msg ok";
  message.textContent = "Ticket #" + ticket.id + " submitted. Track it in the list.";

  notice = "Ticket #" + ticket.id + " added.";
  render();
}

// Clicking Assign or Move to next status.
function handleListClick(event) {
  const button = event.target.closest("button[data-act]");
  if (!button) return;

  const ticket = findTicket(Number(button.dataset.id));
  let error = "";

  if (button.dataset.act === "advance") {
    error = moveToNextStatus(ticket, currentUserName());
  } else {
    const select = document.querySelector('[data-assign="' + ticket.id + '"]');
    error = assignTicket(ticket, select.value, currentUserName());
  }

  if (error !== "") {
    notice = error;
  } else {
    notice = "Ticket #" + ticket.id + " updated.";
  }

  render();
}

// Posting a comment.
function handleCommentSubmit(event) {
  if (event.target.matches(".cform") === false) return;

  event.preventDefault();

  const id = Number(event.target.dataset.id);
  const ticket = findTicket(id);
  const input = event.target.querySelector("input");

  const error = addComment(ticket, currentUserName(), input.value);

  if (openTickets.includes(id) === false) {
    openTickets.push(id);
  }

  if (error !== "") {
    notice = error;
  } else {
    notice = "Comment added to #" + id + ".";
  }

  render();
}

// Remember which "History and comments" boxes are open.
function handleDetailsToggle(event) {
  const id = Number(event.target.dataset.id);
  if (!id) return;

  if (event.target.open) {
    if (openTickets.includes(id) === false) {
      openTickets.push(id);
    }
  } else {
    const index = openTickets.indexOf(id);
    if (index !== -1) {
      openTickets.splice(index, 1);
    }
  }
}


// Wire everything up and start

document.querySelector("#ticket-form").addEventListener("submit", handleNewTicket);

document.querySelector("#filters").addEventListener("input", render);

document.querySelector("#filters").addEventListener("submit", function (event) {
  event.preventDefault();
});

document.querySelector("#filters").addEventListener("reset", function () {
  // Wait a moment so the browser clears the fields first.
  setTimeout(render, 0);
});

const roleRadios = document.querySelectorAll("input[name=role]");
for (const radio of roleRadios) {
  radio.addEventListener("change", function (event) {
    role = event.target.value;
    render();
  });
}

document.querySelector("#list").addEventListener("click", handleListClick);
document.querySelector("#list").addEventListener("submit", handleCommentSubmit);
document.querySelector("#list").addEventListener("toggle", handleDetailsToggle, true);

function start() {
  document.querySelector("#f-cat").innerHTML = makeOptions(CATEGORIES);
  document.querySelector("#f-pri").innerHTML = makeOptions(PRIORITIES);
  document.querySelector("#f-pri").value = "Medium";

  document.querySelector("#c-cat").innerHTML = makeOptions(CATEGORIES, "All categories");
  document.querySelector("#c-pri").innerHTML = makeOptions(PRIORITIES, "All priorities");
  document.querySelector("#c-st").innerHTML = makeOptions(STATUSES, "All statuses");

  render();
}

start();
