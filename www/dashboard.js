// ============================================================
// DASHBOARD.JS
// MY TASKS - SUPABASE TASK MANAGER
// COMPLETE VERSION
// ============================================================


// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

const SUPABASE_URL =
    "https://mtiiocomeghvdqleyfbp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_mPAtDIxOYDRUtzvByVm2NA_3AKM_Ph7";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let currentUser = null;

let allTasks = [];

let currentFilter = "all";

let currentSort = "newest";

let searchText = "";

let calendarDate = new Date();

let selectedCalendarDate = null;


// ============================================================
// START APPLICATION
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkUser();

        setupEnterKey();

        setupSearch();

    }
);


// ============================================================
// CHECK USER
// ============================================================

async function checkUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getSession();


    if (error) {

        console.error(
            "Session error:",
            error
        );

        alert(
            "Could not check login session."
        );

        return;
    }


    const session =
        data.session;


    if (!session) {

        window.location.href =
            "auth.html";

        return;
    }


    currentUser =
        session.user;


    const emailElement =
        document.getElementById(
            "userEmail"
        );


    if (emailElement) {

        emailElement.textContent =
            currentUser.email;

    }


    await loadTasks();
}


// ============================================================
// LOAD TASKS
// ============================================================

async function loadTasks() {

    if (!currentUser) {
        return;
    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("tasks")
            .select("*")
            .eq(
                "user_id",
                currentUser.id
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Load tasks error:",
            error
        );

        alert(
            "Could not load tasks:\n\n" +
            error.message
        );

        return;
    }


    allTasks =
        data || [];


    updateStatistics();

    displayTasks();


    // Refresh calendar if open

    const calendarSection =
        document.getElementById(
            "calendarSection"
        );


    if (
        calendarSection &&
        getComputedStyle(
            calendarSection
        ).display !== "none"
    ) {

        renderCalendar();

    }
}


// ============================================================
// ADD TASK
// ============================================================

async function addTask() {

    if (!currentUser) {

        alert(
            "You are not logged in."
        );

        return;
    }


    const input =
        document.getElementById(
            "taskInput"
        );

    const priorityInput =
        document.getElementById(
            "priorityInput"
        );

    const dueDateInput =
        document.getElementById(
            "dueDateInput"
        );


    if (!input) {
        return;
    }


    const title =
        input.value.trim();


    const priority =
        priorityInput
            ? priorityInput.value
            : "medium";


    const dueDate =
        dueDateInput &&
        dueDateInput.value
            ? dueDateInput.value
            : null;


    if (!title) {

        alert(
            "Please enter a task."
        );

        input.focus();

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("tasks")
            .insert([
                {
                    user_id:
                        currentUser.id,

                    title:
                        title,

                    completed:
                        false,

                    priority:
                        priority,

                    due_date:
                        dueDate
                }
            ]);


    if (error) {

        console.error(
            "Add task error:",
            error
        );

        alert(
            "Could not add task:\n\n" +
            error.message
        );

        return;
    }


    input.value = "";


    if (priorityInput) {

        priorityInput.value =
            "medium";

    }


    if (dueDateInput) {

        dueDateInput.value =
            "";

    }


    await loadTasks();

    input.focus();
}


// ============================================================
// FILTER
// ============================================================

function setFilter(
    filter,
    button
) {

    currentFilter =
        filter;


    const buttons =
        document.querySelectorAll(
            ".filter-btn"
        );


    buttons.forEach(
        function (btn) {

            btn.classList.remove(
                "active"
            );

        }
    );


    if (button) {

        button.classList.add(
            "active"
        );

    }


    displayTasks();
}


// ============================================================
// SORT
// ============================================================

function changeSort() {

    const sortSelect =
        document.getElementById(
            "sortSelect"
        );


    if (!sortSelect) {
        return;
    }


    currentSort =
        sortSelect.value;


    displayTasks();
}


// ============================================================
// SEARCH
// ============================================================

function searchTasks() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {
        return;
    }


    searchText =
        searchInput.value
            .trim()
            .toLowerCase();


    displayTasks();
}


// ============================================================
// SEARCH SETUP
// ============================================================

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        searchTasks
    );
}


// ============================================================
// ENTER KEY
// ============================================================

function setupEnterKey() {

    const input =
        document.getElementById(
            "taskInput"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                addTask();

            }

        }
    );
}


// ============================================================
// GET FILTERED TASKS
// ============================================================

function getFilteredTasks() {

    let tasks =
        [...allTasks];


    // --------------------------------------------------------
    // FILTER
    // --------------------------------------------------------

    if (
        currentFilter ===
        "pending"
    ) {

        tasks =
            tasks.filter(
                function (task) {

                    return !task.completed;

                }
            );

    }


    else if (
        currentFilter ===
        "completed"
    ) {

        tasks =
            tasks.filter(
                function (task) {

                    return task.completed;

                }
            );

    }


    else if (
        currentFilter ===
        "high"
    ) {

        tasks =
            tasks.filter(
                function (task) {

                    return (
                        task.priority ===
                        "high"
                    );

                }
            );

    }


    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (searchText) {

        tasks =
            tasks.filter(
                function (task) {

                    return (
                        String(
                            task.title || ""
                        )
                            .toLowerCase()
                            .includes(
                                searchText
                            )
                    );

                }
            );

    }


    // --------------------------------------------------------
    // SORT
    // --------------------------------------------------------

    if (
        currentSort ===
        "newest"
    ) {

        tasks.sort(
            function (a, b) {

                return (
                    new Date(
                        b.created_at
                    ) -
                    new Date(
                        a.created_at
                    )
                );

            }
        );

    }


    else if (
        currentSort ===
        "due"
    ) {

        tasks.sort(
            function (a, b) {

                if (
                    !a.due_date &&
                    !b.due_date
                ) {
                    return 0;
                }


                if (!a.due_date) {
                    return 1;
                }


                if (!b.due_date) {
                    return -1;
                }


                return (
                    new Date(
                        a.due_date +
                        "T00:00:00"
                    ) -
                    new Date(
                        b.due_date +
                        "T00:00:00"
                    )
                );

            }
        );

    }


    else if (
        currentSort ===
        "priority"
    ) {

        const priorityOrder = {

            high: 1,

            medium: 2,

            low: 3

        };


        tasks.sort(
            function (a, b) {

                const aPriority =
                    priorityOrder[
                        a.priority
                    ] || 2;


                const bPriority =
                    priorityOrder[
                        b.priority
                    ] || 2;


                return (
                    aPriority -
                    bPriority
                );

            }
        );

    }


    return tasks;
}


// ============================================================
// DISPLAY TASKS
// ============================================================

function displayTasks() {

    const taskList =
        document.getElementById(
            "taskList"
        );


    if (!taskList) {
        return;
    }


    taskList.innerHTML =
        "";


    const tasks =
        getFilteredTasks();


    if (
        tasks.length ===
        0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "empty-message";


        if (searchText) {

            empty.textContent =
                "No matching tasks found.";

        }

        else {

            empty.textContent =
                "No tasks found. Add a new task! 🚀";

        }


        taskList.appendChild(
            empty
        );


        return;
    }


    tasks.forEach(
        function (task) {

            const taskItem =
                document.createElement(
                    "div"
                );


            taskItem.className =
                "task-item";


            if (task.completed) {

                taskItem.classList.add(
                    "completed"
                );

            }


            // ------------------------------------------------
            // CONTENT
            // ------------------------------------------------

            const taskContent =
                document.createElement(
                    "div"
                );


            taskContent.className =
                "task-content";


            // TITLE

            const taskTitle =
                document.createElement(
                    "div"
                );


            taskTitle.className =
                "task-title";


            taskTitle.textContent =
                task.title;


            taskContent.appendChild(
                taskTitle
            );


            // DETAILS

            const taskDetails =
                document.createElement(
                    "div"
                );


            taskDetails.className =
                "task-details";


            // PRIORITY

            const priority =
                document.createElement(
                    "span"
                );


            const taskPriority =
                task.priority ||
                "medium";


            if (
                taskPriority ===
                "high"
            ) {

                priority.textContent =
                    "🔴 High";

                priority.className =
                    "priority-high";

            }


            else if (
                taskPriority ===
                "low"
            ) {

                priority.textContent =
                    "🟢 Low";

                priority.className =
                    "priority-low";

            }


            else {

                priority.textContent =
                    "🟡 Medium";

                priority.className =
                    "priority-medium";

            }


            taskDetails.appendChild(
                priority
            );


            // DUE DATE

            const dueDate =
                document.createElement(
                    "span"
                );


            if (task.due_date) {

                const status =
                    getDueDateStatus(
                        task.due_date,
                        task.completed
                    );


                dueDate.textContent =
                    status.text;


                dueDate.className =
                    status.className;

            }

            else {

                dueDate.textContent =
                    "📅 No due date";

                dueDate.className =
                    "no-due-date";

            }


            taskDetails.appendChild(
                dueDate
            );


            taskContent.appendChild(
                taskDetails
            );


            // ------------------------------------------------
            // ACTIONS
            // ------------------------------------------------

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "task-actions";


            // COMPLETE BUTTON

            const completeButton =
                document.createElement(
                    "button"
                );


            completeButton.className =
                "complete-btn";


            completeButton.textContent =
                task.completed
                    ? "Undo"
                    : "Complete";


            completeButton.type =
                "button";


            completeButton.onclick =
                function (event) {

                    event.stopPropagation();

                    toggleTask(
                        task
                    );

                };


            // DELETE BUTTON

            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.className =
                "delete-btn";


            deleteButton.textContent =
                "🗑️";


            deleteButton.title =
                "Delete task";


            deleteButton.type =
                "button";


            deleteButton.onclick =
                function (event) {

                    event.stopPropagation();

                    showDeleteConfirmation(
                        task.id
                    );

                };


            actions.appendChild(
                completeButton
            );


            actions.appendChild(
                deleteButton
            );


            // BUILD CARD

            taskItem.appendChild(
                taskContent
            );


            taskItem.appendChild(
                actions
            );


            taskList.appendChild(
                taskItem
            );

        }
    );
}


// ============================================================
// DUE DATE STATUS
// ============================================================

function getDueDateStatus(
    dueDate,
    completed
) {

    if (completed) {

        return {

            text:
                "📅 " +
                formatDate(
                    dueDate
                ),

            className:
                "due-completed"

        };

    }


    const today =
        new Date();


    today.setHours(
        0,
        0,
        0,
        0
    );


    const due =
        new Date(
            dueDate +
            "T00:00:00"
        );


    if (
        due <
        today
    ) {

        return {

            text:
                "⚠️ Overdue · " +
                formatDate(
                    dueDate
                ),

            className:
                "overdue"

        };

    }


    if (
        due.getTime() ===
        today.getTime()
    ) {

        return {

            text:
                "📅 Due Today",

            className:
                "due-today"

        };

    }


    return {

        text:
            "📅 " +
            formatDate(
                dueDate
            ),

        className:
            "due-future"

    };
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(
    dateString
) {

    if (!dateString) {

        return "No due date";

    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day:
                "numeric",

            month:
                "short",

            year:
                "numeric"
        }
    );
}


// ============================================================
// STATISTICS
// ============================================================

function updateStatistics() {

    const total =
        allTasks.length;


    const completed =
        allTasks.filter(
            function (task) {

                return task.completed;

            }
        ).length;


    const pending =
        total -
        completed;


    const totalElement =
        document.getElementById(
            "totalTasks"
        );


    const completedElement =
        document.getElementById(
            "completedTasks"
        );


    const pendingElement =
        document.getElementById(
            "pendingTasks"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (completedElement) {

        completedElement.textContent =
            completed;

    }


    if (pendingElement) {

        pendingElement.textContent =
            pending;

    }


    let percentage =
        0;


    if (total > 0) {

        percentage =
            Math.round(
                (
                    completed /
                    total
                ) *
                100
            );

    }


    const percentElement =
        document.getElementById(
            "progressPercent"
        );


    const fillElement =
        document.getElementById(
            "progressFill"
        );


    if (percentElement) {

        percentElement.textContent =
            percentage +
            "%";

    }


    if (fillElement) {

        fillElement.style.width =
            percentage +
            "%";

    }
}


// ============================================================
// COMPLETE / UNDO TASK
// ============================================================

async function toggleTask(
    task
) {

    if (!currentUser) {
        return;
    }


    let taskObject =
        task;


    // Allow task ID too

    if (
        typeof task ===
        "string"
    ) {

        taskObject =
            allTasks.find(
                function (item) {

                    return (
                        item.id ===
                        task
                    );

                }
            );

    }


    if (!taskObject) {

        console.error(
            "Task not found."
        );

        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("tasks")
            .update({

                completed:
                    !taskObject.completed

            })
            .eq(
                "id",
                taskObject.id
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(
            "Update task error:",
            error
        );

        alert(
            "Could not update task:\n\n" +
            error.message
        );

        return;
    }


    closeCalendarTaskDetails();


    await loadTasks();
}


// ============================================================
// DELETE TASK
// ============================================================
// ============================================================
// PROFESSIONAL DELETE CONFIRMATION
// ============================================================

function showDeleteConfirmation(taskId) {

    // Remove existing confirmation modal
    const existing =
        document.getElementById("deleteConfirmModal");

    if (existing) {
        existing.remove();
    }


    // Find task
    const task =
        allTasks.find(function (item) {

            return item.id === taskId;

        });


    if (!task) {

        console.error(
            "Task not found for deletion."
        );

        return;
    }


    // Create modal
    const modal =
        document.createElement("div");

    modal.id =
        "deleteConfirmModal";

    modal.className =
        "delete-confirm-modal";


    modal.innerHTML = `

        <div class="delete-confirm-content">

            <!-- ICON -->

            <div class="delete-confirm-icon">
                🗑️
            </div>


            <!-- TITLE -->

            <h2>
                Delete this task?
            </h2>


            <!-- MESSAGE -->

            <p class="delete-confirm-message">

                Are you sure you want to delete

                <strong>
                    ${escapeHtml(task.title)}
                </strong>

                ?

                <br>

                This action cannot be undone.

            </p>


            <!-- BUTTONS -->

            <div class="delete-confirm-actions">

                <button
                    type="button"
                    class="delete-cancel-btn"
                    id="deleteCancelButton"
                >
                    Cancel
                </button>


                <button
                    type="button"
                    class="delete-confirm-btn"
                    id="deleteConfirmButton"
                >
                    🗑️ Delete Task
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(modal);


    // ========================================================
    // CANCEL
    // ========================================================

    const cancelButton =
        document.getElementById(
            "deleteCancelButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                modal.remove();

            }
        );

    }


    // ========================================================
    // CONFIRM DELETE
    // ========================================================

    const confirmButton =
        document.getElementById(
            "deleteConfirmButton"
        );


    if (confirmButton) {

        confirmButton.addEventListener(
            "click",
            async function () {

                await performDeleteTask(
                    taskId
                );

            }
        );

    }


    // ========================================================
    // CLICK OUTSIDE
    // ========================================================

    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === modal
            ) {

                modal.remove();

            }

        }
    );


    // ========================================================
    // ESC KEY
    // ========================================================

    document.addEventListener(
        "keydown",
        function deleteEscapeHandler(event) {

            if (
                event.key === "Escape"
            ) {

                const activeModal =
                    document.getElementById(
                        "deleteConfirmModal"
                    );

                if (activeModal) {

                    activeModal.remove();

                }

                document.removeEventListener(
                    "keydown",
                    deleteEscapeHandler
                );

            }

        }
    );

}


// ============================================================
// ACTUAL DELETE OPERATION
// ============================================================

async function performDeleteTask(
    taskId
) {

    if (!currentUser) {

        console.error(
            "No logged-in user."
        );

        return;
    }


    const confirmButton =
        document.getElementById(
            "deleteConfirmButton"
        );


    // Prevent double clicking
    if (confirmButton) {

        confirmButton.disabled =
            true;

        confirmButton.textContent =
            "Deleting...";

    }


    // ========================================================
    // DELETE FROM SUPABASE
    // ========================================================

    const {
        error
    } =
        await supabaseClient
            .from("tasks")
            .delete()
            .eq(
                "id",
                taskId
            )
            .eq(
                "user_id",
                currentUser.id
            );


    // ========================================================
    // ERROR
    // ========================================================

    if (error) {

        console.error(
            "Delete task error:",
            error
        );


        alert(
            "Could not delete task:\n\n" +
            error.message
        );


        if (confirmButton) {

            confirmButton.disabled =
                false;

            confirmButton.textContent =
                "🗑️ Delete Task";

        }

        return;
    }


    // ========================================================
    // CLOSE DELETE MODAL
    // ========================================================

    const deleteModal =
        document.getElementById(
            "deleteConfirmModal"
        );


    if (deleteModal) {

        deleteModal.remove();

    }


    // ========================================================
    // CLOSE TASK DETAILS MODAL
    // ========================================================

    closeCalendarTaskDetails();


    // ========================================================
    // RELOAD TASKS
    // ========================================================

    await loadTasks();


    console.log(
        "Task deleted successfully."
    );

}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "Logout error:",
            error
        );

        alert(
            "Could not logout."
        );

        return;
    }


    window.location.href =
        "auth.html";
}


// ============================================================
// OPEN / CLOSE CALENDAR
// ============================================================

function openCalendar() {

    const calendarSection =
        document.getElementById(
            "calendarSection"
        );


    if (!calendarSection) {

        console.error(
            "Calendar section not found."
        );

        return;
    }


    const isHidden =
        getComputedStyle(
            calendarSection
        ).display ===
        "none";


    if (isHidden) {

        calendarSection.style.display =
            "block";


        renderCalendar();


        calendarSection.scrollIntoView({
            behavior:
                "smooth",

            block:
                "start"
        });

    }

    else {

        calendarSection.style.display =
            "none";


        closeCalendarTaskPanel();

    }
}


// ============================================================
// CHANGE MONTH
// ============================================================

function changeMonth(
    direction
) {

    calendarDate.setMonth(
        calendarDate.getMonth() +
        direction
    );


    selectedCalendarDate =
        null;


    closeCalendarTaskPanel();


    renderCalendar();
}


// ============================================================
// FORMAT CALENDAR DATE
// ============================================================

function formatCalendarDate(
    year,
    month,
    day
) {

    return (
        year +
        "-" +
        String(
            month + 1
        ).padStart(
            2,
            "0"
        ) +
        "-" +
        String(
            day
        ).padStart(
            2,
            "0"
        )
    );
}


// ============================================================
// GET TASKS FOR CALENDAR DATE
// ============================================================

function getTasksForDate(
    dateString
) {

    if (
        !Array.isArray(
            allTasks
        )
    ) {

        return [];

    }


    return allTasks.filter(
        function (task) {

            if (!task.due_date) {
                return false;
            }


            const taskDate =
                String(
                    task.due_date
                ).substring(
                    0,
                    10
                );


            return (
                taskDate ===
                dateString
            );

        }
    );
}


// ============================================================
// RENDER CALENDAR
// ============================================================
// ============================================================
// STEP 2 — ADVANCED CALENDAR
// ============================================================

function renderCalendar() {

    const calendarGrid =
        document.getElementById("calendarGrid");

    const calendarMonth =
        document.getElementById("calendarMonth");

    if (!calendarGrid || !calendarMonth) {
        console.error("Calendar elements not found.");
        return;
    }

    // Clear old calendar
    calendarGrid.innerHTML = "";

    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();

    // ========================================================
    // MONTH TITLE
    // ========================================================

    calendarMonth.textContent =
        new Intl.DateTimeFormat("en-US", {
            month: "long",
            year: "numeric"
        }).format(calendarDate);


    // ========================================================
    // FIRST DAY
    // ========================================================

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    // ========================================================
    // DAYS IN MONTH
    // ========================================================

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    // ========================================================
    // TODAY
    // ========================================================

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const todayString =
        formatCalendarDate(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );


    // ========================================================
    // EMPTY CELLS
    // ========================================================

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "calendar-day empty";

        calendarGrid.appendChild(
            emptyDay
        );
    }


    // ========================================================
    // CREATE DAYS
    // ========================================================

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dateString =
            formatCalendarDate(
                year,
                month,
                day
            );


        const dayElement =
            document.createElement("div");

        dayElement.className =
            "calendar-day";


        // ====================================================
        // TODAY
        // ====================================================

        if (
            dateString ===
            todayString
        ) {

            dayElement.classList.add(
                "today"
            );
        }


        // ====================================================
        // SELECTED DATE
        // ====================================================

        if (
            dateString ===
            selectedCalendarDate
        ) {

            dayElement.classList.add(
                "selected"
            );
        }


        // ====================================================
        // DATE NUMBER
        // ====================================================

        const dateText =
            document.createElement("div");

        dateText.className =
            "calendar-date";

        dateText.textContent =
            day;

        dayElement.appendChild(
            dateText
        );


        // ====================================================
        // GET TASKS
        // ====================================================

        const dayTasks =
            getTasksForDate(
                dateString
            );


        if (
            dayTasks.length > 0
        ) {

            // ==================================================
            // TASK COUNT
            // ==================================================

            const taskCount =
                document.createElement("div");

            taskCount.className =
                "calendar-task-count";

            taskCount.textContent =
                dayTasks.length === 1
                    ? "1 task"
                    : dayTasks.length + " tasks";

            dayElement.appendChild(
                taskCount
            );


            // ==================================================
            // TASK STATUS SUMMARY
            // ==================================================

            const statusRow =
                document.createElement("div");

            statusRow.className =
                "calendar-status-row";


            const completedCount =
                dayTasks.filter(
                    function (task) {
                        return task.completed;
                    }
                ).length;


            const pendingCount =
                dayTasks.length -
                completedCount;


            if (
                completedCount > 0
            ) {

                const completedBadge =
                    document.createElement("span");

                completedBadge.className =
                    "calendar-completed-count";

                completedBadge.textContent =
                    "✓ " +
                    completedCount;

                statusRow.appendChild(
                    completedBadge
                );
            }


            if (
                pendingCount > 0
            ) {

                const pendingBadge =
                    document.createElement("span");

                pendingBadge.className =
                    "calendar-pending-count";

                pendingBadge.textContent =
                    "○ " +
                    pendingCount;

                statusRow.appendChild(
                    pendingBadge
                );
            }


            dayElement.appendChild(
                statusRow
            );


            // ==================================================
            // TASK PREVIEW
            // ==================================================

            const maxTasks = 3;

            dayTasks
                .slice(
                    0,
                    maxTasks
                )
                .forEach(
                    function (task) {

                        const taskElement =
                            document.createElement("div");


                        taskElement.className =
                            "calendar-task";


                        // --------------------------------------
                        // PRIORITY
                        // --------------------------------------

                        const priority =
                            task.priority ||
                            "medium";

                        taskElement.classList.add(
                            "priority-" +
                            priority
                        );


                        // --------------------------------------
                        // COMPLETED
                        // --------------------------------------

                        if (
                            task.completed
                        ) {

                            taskElement.classList.add(
                                "completed"
                            );
                        }


                        // --------------------------------------
                        // OVERDUE
                        // --------------------------------------

                        if (
                            !task.completed &&
                            task.due_date
                        ) {

                            const due =
                                new Date(
                                    task.due_date +
                                    "T00:00:00"
                                );

                            if (
                                due < today
                            ) {

                                taskElement.classList.add(
                                    "overdue"
                                );
                            }
                        }


                        // --------------------------------------
                        // PRIORITY ICON
                        // --------------------------------------

                        let priorityIcon =
                            "🟡";

                        if (
                            priority === "high"
                        ) {

                            priorityIcon =
                                "🔴";
                        }

                        else if (
                            priority === "low"
                        ) {

                            priorityIcon =
                                "🟢";
                        }


                        // --------------------------------------
                        // TASK TEXT
                        // --------------------------------------

                        taskElement.textContent =
                            priorityIcon +
                            " " +
                            task.title;


                        taskElement.title =
                            task.title;


                        // --------------------------------------
                        // CLICK TASK
                        // --------------------------------------

                        taskElement.addEventListener(
                            "click",
                            function (event) {

                                event.stopPropagation();

                                showCalendarTaskDetails(
                                    task
                                );
                            }
                        );


                        dayElement.appendChild(
                            taskElement
                        );
                    }
                );


            // ==================================================
            // MORE TASKS
            // ==================================================

            if (
                dayTasks.length >
                maxTasks
            ) {

                const moreElement =
                    document.createElement("div");

                moreElement.className =
                    "calendar-more";

                moreElement.textContent =
                    "+" +
                    (
                        dayTasks.length -
                        maxTasks
                    ) +
                    " more";

                dayElement.appendChild(
                    moreElement
                );
            }
        }


        // ====================================================
        // CLICK DATE
        // ====================================================

        dayElement.addEventListener(
            "click",
            function () {

                selectedCalendarDate =
                    dateString;

                renderCalendar();

                showCalendarDateTasks(
                    dateString
                );
            }
        );


        // ====================================================
        // ADD DAY
        // ====================================================

        calendarGrid.appendChild(
            dayElement
        );
    }
}

// ============================================================
// SHOW TASKS FOR SELECTED DATE
// ============================================================

function showCalendarDateTasks(
    dateString
) {

    const dayTasks =
        getTasksForDate(
            dateString
        );


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    const formattedDate =
        new Intl.DateTimeFormat(
            "en-US",
            {
                weekday:
                    "long",

                month:
                    "long",

                day:
                    "numeric",

                year:
                    "numeric"
            }
        ).format(
            date
        );


    const panel =
        document.getElementById(
            "calendarTaskPanel"
        );


    const panelTitle =
        document.getElementById(
            "calendarTaskPanelTitle"
        );


    const panelContent =
        document.getElementById(
            "calendarTaskPanelContent"
        );


    if (
        !panel ||
        !panelTitle ||
        !panelContent
    ) {

        if (
            dayTasks.length ===
            0
        ) {

            alert(
                "No tasks scheduled for " +
                formattedDate +
                "."
            );

            return;

        }


        let message =
            "Tasks for " +
            formattedDate +
            ":\n\n";


        dayTasks.forEach(
            function (
                task,
                index
            ) {

                message +=
                    (
                        index + 1
                    ) +
                    ". " +
                    task.title +
                    "\n";


                message +=
                    task.completed
                        ? "   ✅ Completed\n"
                        : "   ⏳ Pending\n";


                message +=
                    "   Priority: " +
                    (
                        task.priority ||
                        "medium"
                    ) +
                    "\n\n";

            }
        );


        alert(
            message
        );


        return;
    }


    panelTitle.textContent =
        formattedDate;


    panelContent.innerHTML =
        "";


    // NO TASKS

    if (
        dayTasks.length ===
        0
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "calendar-no-tasks";


        empty.innerHTML = `
            <div class="calendar-empty-icon">
                📅
            </div>

            <h3>
                No tasks scheduled
            </h3>

            <p>
                There are no tasks for
                ${escapeHtml(formattedDate)}.
            </p>
        `;


        panelContent.appendChild(
            empty
        );


        panel.classList.add(
            "visible"
        );


        return;
    }


    // TASK CARDS

    dayTasks.forEach(
        function (task) {

            const taskCard =
                document.createElement(
                    "div"
                );


            taskCard.className =
                "calendar-task-card";


            if (
                task.completed
            ) {

                taskCard.classList.add(
                    "completed"
                );

            }


            // TITLE

            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "calendar-task-card-title";


            title.textContent =
                task.title;


            // DETAILS

            const details =
                document.createElement(
                    "div"
                );


            details.className =
                "calendar-task-card-details";


            // STATUS

            const status =
                document.createElement(
                    "span"
                );


            status.className =
                task.completed
                    ? "task-status completed-status"
                    : "task-status pending-status";


            status.textContent =
                task.completed
                    ? "✓ Completed"
                    : "⏳ Pending";


            // PRIORITY

            const priority =
                document.createElement(
                    "span"
                );


            priority.className =
                "task-priority";


            const priorityValue =
                task.priority ||
                "medium";


            priority.textContent =
                "● " +
                priorityValue
                    .charAt(0)
                    .toUpperCase() +
                priorityValue.slice(1);


            // DATE

            const due =
                document.createElement(
                    "span"
                );


            due.className =
                "task-calendar-date";


            due.textContent =
                "📅 " +
                formatDate(
                    task.due_date
                );


            details.appendChild(
                status
            );


            details.appendChild(
                priority
            );


            details.appendChild(
                due
            );


            taskCard.appendChild(
                title
            );


            taskCard.appendChild(
                details
            );


            // CLICK CARD

            taskCard.addEventListener(
                "click",
                function () {

                    showCalendarTaskDetails(
                        task
                    );

                }
            );


            panelContent.appendChild(
                taskCard
            );

        }
    );


    panel.classList.add(
        "visible"
    );
}


// ============================================================
// CLOSE CALENDAR TASK PANEL
// ============================================================

function closeCalendarTaskPanel() {

    const panel =
        document.getElementById(
            "calendarTaskPanel"
        );


    if (!panel) {
        return;
    }


    panel.classList.remove(
        "visible"
    );


    selectedCalendarDate =
        null;


    renderCalendar();
}


// ============================================================
// REFRESH CALENDAR
// ============================================================

function refreshCalendar() {

    const calendarSection =
        document.getElementById(
            "calendarSection"
        );


    if (
        calendarSection &&
        getComputedStyle(
            calendarSection
        ).display !== "none"
    ) {

        renderCalendar();

    }
}


// ============================================================
// CALENDAR TASK DETAILS MODAL
// ============================================================

function showCalendarTaskDetails(
    task
) {

    if (!task) {
        return;
    }


    const existing =
        document.getElementById(
            "calendarTaskModal"
        );


    if (existing) {
        existing.remove();
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "calendarTaskModal";


    modal.className =
        "calendar-task-modal";


    const priority =
        task.priority ||
        "medium";


    modal.innerHTML = `

        <div class="calendar-task-modal-content">

            <button
                type="button"
                class="calendar-task-modal-close"
                id="calendarModalClose"
            >
                ×
            </button>


            <h2>
                ${escapeHtml(task.title)}
            </h2>


            <div class="calendar-task-info">

                <p>
                    <strong>Status:</strong>
                    ${
                        task.completed
                            ? "✓ Completed"
                            : "⏳ Pending"
                    }
                </p>


                <p>
                    <strong>Priority:</strong>
                    ${escapeHtml(priority)}
                </p>


                <p>
                    <strong>Due date:</strong>
                    ${
                        task.due_date
                            ? formatDate(
                                task.due_date
                            )
                            : "No due date"
                    }
                </p>

            </div>


            <div class="calendar-task-modal-actions">


                <button
                    type="button"
                    class="modal-edit-btn"
                    id="modalEditButton"
                >
                    ✏️ Edit Task
                </button>


                <button
                    type="button"
                    class="modal-complete-btn"
                    id="modalCompleteButton"
                >
                    ${
                        task.completed
                            ? "↩ Mark Pending"
                            : "✓ Mark Complete"
                    }
                </button>


                <button
                    type="button"
                    class="modal-delete-btn"
                    id="modalDeleteButton"
                >
                    🗑 Delete
                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // CLOSE BUTTON

    const closeButton =
        document.getElementById(
            "calendarModalClose"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeCalendarTaskDetails
        );

    }


    // EDIT BUTTON

    const editButton =
        document.getElementById(
            "modalEditButton"
        );


    if (editButton) {

        editButton.addEventListener(
            "click",
            function () {

                openEditTaskForm(
                    task.id
                );

            }
        );

    }


    // COMPLETE BUTTON

    const completeButton =
        document.getElementById(
            "modalCompleteButton"
        );


    if (completeButton) {

        completeButton.addEventListener(
            "click",
            async function () {

                await toggleTask(
                    task
                );

            }
        );

    }


    // DELETE BUTTON

    const deleteButton =
        document.getElementById(
            "modalDeleteButton"
        );


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            function () {

        showDeleteConfirmation(
                    task.id
                );

            }
        );

    }


    // CLICK OUTSIDE

    modal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modal
            ) {

                closeCalendarTaskDetails();

            }

        }
    );
}


// ============================================================
// OPEN EDIT TASK FORM
// ============================================================

function openEditTaskForm(
    taskId
) {

    const task =
        allTasks.find(
            function (item) {

                return (
                    item.id ===
                    taskId
                );

            }
        );


    if (!task) {

        alert(
            "Task not found."
        );

        return;
    }


    const modal =
        document.getElementById(
            "calendarTaskModal"
        );


    if (!modal) {
        return;
    }


    modal.innerHTML = `

        <div class="calendar-task-modal-content">

            <button
                type="button"
                class="calendar-task-modal-close"
                id="editModalClose"
            >
                ×
            </button>


            <h2>
                ✏️ Edit Task
            </h2>


            <div class="calendar-edit-form">


                <label
                    for="editTaskTitle"
                >
                    Task title
                </label>


                <input
                    type="text"
                    id="editTaskTitle"
                    maxlength="200"
                    autocomplete="off"
                />


                <label
                    for="editTaskPriority"
                >
                    Priority
                </label>


                <select
                    id="editTaskPriority"
                >

                    <option value="low">
                        🟢 Low
                    </option>

                    <option value="medium">
                        🟡 Medium
                    </option>

                    <option value="high">
                        🔴 High
                    </option>

                </select>


                <label
                    for="editTaskDueDate"
                >
                    Due date
                </label>


                <input
                    type="date"
                    id="editTaskDueDate"
                />


                <div
                    class="edit-form-actions"
                >

                    <button
                        type="button"
                        class="edit-cancel-btn"
                        id="editCancelButton"
                    >
                        Cancel
                    </button>


                    <button
                        type="button"
                        class="edit-save-btn"
                        id="editSaveButton"
                    >
                        💾 Save Changes
                    </button>

                </div>

            </div>

        </div>

    `;


    // PUT CURRENT VALUES INTO FORM

    const titleInput =
        document.getElementById(
            "editTaskTitle"
        );


    const priorityInput =
        document.getElementById(
            "editTaskPriority"
        );


    const dueDateInput =
        document.getElementById(
            "editTaskDueDate"
        );


    if (titleInput) {

        titleInput.value =
            task.title || "";

    }


    if (priorityInput) {

        priorityInput.value =
            task.priority ||
            "medium";

    }


    if (dueDateInput) {

        dueDateInput.value =
            task.due_date || "";

    }


    // CLOSE

    const closeButton =
        document.getElementById(
            "editModalClose"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function () {

                showCalendarTaskDetails(
                    task
                );

            }
        );

    }


    // CANCEL

    const cancelButton =
        document.getElementById(
            "editCancelButton"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            function () {

                showCalendarTaskDetails(
                    task
                );

            }
        );

    }


    // SAVE

    const saveButton =
        document.getElementById(
            "editSaveButton"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            async function () {

                await saveEditedTask(
                    task.id
                );

            }
        );

    }


    // FOCUS TITLE

    if (titleInput) {

        titleInput.focus();

        titleInput.select();

    }
}


// ============================================================
// SAVE EDITED TASK
// ============================================================

async function saveEditedTask(
    taskId
) {

    if (!currentUser) {

        alert(
            "You are not logged in."
        );

        return;
    }


    const titleInput =
        document.getElementById(
            "editTaskTitle"
        );


    const priorityInput =
        document.getElementById(
            "editTaskPriority"
        );


    const dueDateInput =
        document.getElementById(
            "editTaskDueDate"
        );


    if (
        !titleInput ||
        !priorityInput ||
        !dueDateInput
    ) {

        alert(
            "Edit form not found."
        );

        return;
    }


    const title =
        titleInput.value.trim();


    const priority =
        priorityInput.value;


    const dueDate =
        dueDateInput.value
            ? dueDateInput.value
            : null;


    // VALIDATION

    if (!title) {

        alert(
            "Task title cannot be empty."
        );

        titleInput.focus();

        return;
    }


    // DISABLE BUTTON WHILE SAVING

    const saveButton =
        document.getElementById(
            "editSaveButton"
        );


    if (saveButton) {

        saveButton.disabled =
            true;

        saveButton.textContent =
            "Saving...";

    }


    // UPDATE SUPABASE

    const {
        error
    } =
        await supabaseClient
            .from("tasks")
            .update({

                title:
                    title,

                priority:
                    priority,

                due_date:
                    dueDate

            })
            .eq(
                "id",
                taskId
            )
            .eq(
                "user_id",
                currentUser.id
            );


    if (error) {

        console.error(
            "Edit task error:",
            error
        );


        alert(
            "Could not update task:\n\n" +
            error.message
        );


        if (saveButton) {

            saveButton.disabled =
                false;

            saveButton.textContent =
                "💾 Save Changes";

        }


        return;
    }


    // CLOSE MODAL

    closeCalendarTaskDetails();


    // RELOAD FROM SUPABASE

    await loadTasks();


    console.log(
        "Task updated successfully."
    );
}


// ============================================================
// DELETE CALENDAR TASK
// ============================================================

async function deleteCalendarTask(
    taskId
) {

    closeCalendarTaskDetails();


    await deleteTask(
        taskId
    );
}


// ============================================================
// CLOSE CALENDAR TASK DETAILS
// ============================================================

function closeCalendarTaskDetails() {

    const modal =
        document.getElementById(
            "calendarTaskModal"
        );


    if (modal) {

        modal.remove();

    }
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value || "";


    return div.innerHTML;
}
// ============================================================
// STEP 8 — BROWSER NOTIFICATIONS
// ============================================================

async function requestNotificationPermission() {

    if (!("Notification" in window)) {

        console.log(
            "This browser does not support notifications."
        );

        return false;
    }

    if (Notification.permission === "granted") {

        return true;
    }

    if (Notification.permission === "default") {

        const permission =
            await Notification.requestPermission();

        return permission === "granted";
    }

    return false;
}

// ============================================================
// STEP 8 — BROWSER NOTIFICATIONS
// ============================================================

async function requestNotificationPermission() {

    if (!("Notification" in window)) {

        console.log(
            "This browser does not support notifications."
        );

        return false;
    }

    if (
        Notification.permission ===
        "granted"
    ) {

        return true;
    }

    if (
        Notification.permission ===
        "default"
    ) {

        const permission =
            await Notification.requestPermission();

        return (
            permission ===
            "granted"
        );
    }

    return false;
}
// ============================================================
// STEP 8.2 — SHOW TASK NOTIFICATION
// ============================================================

function showTaskNotification(title, message) {

    if (!("Notification" in window)) {
        return;
    }

    if (Notification.permission !== "granted") {
        return;
    }

    new Notification(title, {
        body: message,
        icon: "🚀"
    });
}
window.showTaskNotification = showTaskNotification;


// ============================================================
// COMPLETE TASK COMPATIBILITY FUNCTION
// ============================================================

async function completeTask(
    taskId
) {

    const task =
        allTasks.find(
            function (item) {

                return (
                    item.id ===
                    taskId
                );

            }
        );

    if (!task) {

        console.error(
            "Task not found:",
            taskId
        );

        return;
    }

        await toggleTask(
        task
    );

    // STEP 8.3 — NOTIFY WHEN TASK IS COMPLETED
    showTaskNotification(
        "Task Completed 🚀",
        `"${task.title}" has been completed.`
    );
}

// ============================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ============================================================

window.addTask =
    addTask;

window.setFilter =
    setFilter;

window.changeSort =
    changeSort;

window.searchTasks =
    searchTasks;

window.toggleTask =
    toggleTask;

window.completeTask =
    completeTask;
// ============================================================
// DELETE TASK
// ============================================================

function deleteTask(taskId) {
    if (!taskId) {
        console.error("deleteTask: taskId is missing");
        return;
    }

    showDeleteConfirmation(taskId);
}
window.deleteTask =
    deleteTask;

window.logout =
    logout;

window.openCalendar =
    openCalendar;

window.changeMonth =
    changeMonth;

window.closeCalendarTaskPanel =
    closeCalendarTaskPanel;

window.refreshCalendar =
    refreshCalendar;

window.showCalendarTaskDetails =
    showCalendarTaskDetails;

window.closeCalendarTaskDetails =
    closeCalendarTaskDetails;

window.openEditTaskForm =
    openEditTaskForm;

window.saveEditedTask =
    saveEditedTask;

window.deleteCalendarTask =
    deleteCalendarTask;

window.showDeleteConfirmation =
    showDeleteConfirmation;

window.requestNotificationPermission =
    requestNotificationPermission;  
// ============================================================
// STEP 8.2 — SHOW TASK NOTIFICATION
// ============================================================

function showTaskNotification(title, message) {

    // Browser does not support notifications
    if (!("Notification" in window)) {
        console.log("This browser does not support notifications.");
        return;
    }

    // Permission not granted
    if (Notification.permission !== "granted") {
        console.log("Notification permission is not granted.");
        return;
    }

    // Show notification
    const notification = new Notification(title, {
        body: message,
        icon: "🚀"
    });

    // Optional: when notification is clicked
    notification.onclick = function () {
        window.focus();
        notification.close();
    };
}

// Make available to HTML / other functions
window.showTaskNotification =
    showTaskNotification;
document.addEventListener("DOMContentLoaded", async () => {
    await requestNotificationPermission();
});
