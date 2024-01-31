// Get reference to the input element
const inputTag = document.querySelector("input[type=text]");


// Get references to HTML elements
const suggestions__lists = document.querySelector(".suggestions__lists");
const pills = document.querySelector(".pills");


// Initialize variables

let selectedUsers = [];
let suggestions;
let selectedUsersSet = new Set();
let index = -1;


// Fetch users from the server based on user input
const fetchUsers = async (e) => {
  if (!e.target.value.trim()) return;
  const data = await fetch(
    `https://dummyjson.com/users/search?q=${e.target.value}`
  );
  const res = await data.json();

  suggestions = res.users;
  showSuggestions(suggestions);
};


// Debounce function to limit the rate of execution of a function
const debounce = (cb, delay) => {
  let interval;
  return (...args) => {
    clearInterval(interval);

    interval = setTimeout(() => {
      cb(...args);
    }, delay);
  };
};

// Debounce the fetchUsers function to limit API requests
const debounceSearch = debounce(fetchUsers, 300);



// Event listeners for input element with debounced search
inputTag.addEventListener("input", debounceSearch);
inputTag.addEventListener("keydown", handleArrowNavigation);
inputTag.addEventListener("keyup", handleRemove);


// Display user suggestions
const showSuggestions = (users) => {
  suggestions__lists.innerHTML = "";
  for (let i = 0; i < users.length; i++) {
    if (!selectedUsersSet.has(users[i].email)) {
      const liTag = document.createElement("li");
      const ImgTag = document.createElement("img");
      const spanTag = document.createElement("span");
      if (index === i) {
        liTag.classList.add("highlighted");
      }
      spanTag.textContent = `${users[i].firstName} ${users[i].lastName} `;
      ImgTag.setAttribute("src", users[i].image);
      liTag.appendChild(ImgTag);
      liTag.appendChild(spanTag);

      liTag.onclick = () => generatePill(users[i]);

      suggestions__lists.appendChild(liTag);
    }
  }
};

// Add a selected user to the list and update UI
const generatePill = (user) => {
  selectedUsers.push(user);
  selectedUsersSet = new Set([...selectedUsersSet, user.email]);
  suggestions__lists.innerHTML = "";

  inputTag.value = "";
  handlePills();
  inputTag.focus();
  inputTag.setSelectionRange(1,1)
};


// Display selected users as pills
const handlePills = () => {
  pills.innerHTML = "";
  for (let i = 0; i < selectedUsers.length; i++) {
    const spanTagOuter = document.createElement("span");
    spanTagOuter.classList.add("user__pill");
    const ImgTag = document.createElement("img");
    const spanTagInner = document.createElement("span");
    spanTagInner.textContent = `${selectedUsers[i].firstName} ${selectedUsers[i].lastName} x`;
    spanTagInner.onclick = () => handleRemoveUser(selectedUsers[i]);
    ImgTag.setAttribute("src", selectedUsers[i].image);
    spanTagOuter.appendChild(ImgTag);
    spanTagOuter.appendChild(spanTagInner);
    pills.appendChild(spanTagOuter);
  }
};


// Remove a selected user and update UI
const handleRemoveUser = (user) => {
  if (selectedUsers.length > 0) {
    const indexOfUser = selectedUsers.findIndex((u) => u.email === user.email);
    selectedUsers.splice(indexOfUser, 1);
    const updateSelectedUsersSet = new Set(selectedUsersSet);
    updateSelectedUsersSet.delete(user.email);
    selectedUsersSet = updateSelectedUsersSet;
    handlePills();
  }
};


// Handle arrow key navigation in the suggestion list
function handleArrowNavigation(e) {
  if (e.key === "ArrowDown" && inputTag.value) {
    index = index < suggestions.length - 1 ? index + 1 : 0;
    console.log(index);
    showSuggestions(suggestions);
  }
  if (e.key === "ArrowUp" && inputTag.value) {
    index = index > 0 ? index - 1 : suggestions.length - 1;

    showSuggestions(suggestions);
  }
  if (e.key === "ArrowBack" && inputTag.value) {
    index = index > 0 ? index - 1 : suggestions.length - 1;
  }
  if (e.key === "Enter" && index !== -1) {
    generatePill(suggestions[index]);
  }
}



// Handle backspace key to remove the last selected user
function handleRemove(e) {
  if (e.key === "Backspace" && !inputTag.value && selectedUsers.length > 0) {
    selectedUsers = selectedUsers.filter(
      (u) => u !== selectedUsers[selectedUsers.length - 1]
    );

    handlePills();
  }
}
