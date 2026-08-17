const SUPABASE_URL =
    "https://mtiiocomeghvdqleyfbp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_mPAtDIxOYDRUtzvByVm2NA_3AKM_Ph7";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// Store current user
let currentUser = null;


// Start app
checkUser();


// ===============================
// CHECK LOGIN
// ===============================

async function checkUser() {

    const {
        data: { session },
        error
    } = await supabaseClient.auth.getSession();


    if (error) {

        console.error("Session error:", error);

        return;
    }


    if (!session) {

        window.location.href = "auth.html";

        return;
    }


    currentUser = session.user;


    document.getElementById("userEmail").textContent =
        currentUser.email;


    loadTasks();
}



// ===============================
// LOAD TASKS
// ===============================

async function loadTasks() {

    const { data, error } =
        await supabaseClient
            .from("tasks")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", {
                ascending: true
            });


    if (error) {

        console.error("Load tasks error:", error);

        alert("Could not load tasks.");

        return;
    }


    displayTasks(data);
}



// ===============================
// ADD TASK
// ===============================

async function addTask() {

    const input =
        document.getElementById("taskInput");


    const title =
        input.value.trim();


    if (title === "") {

        alert("Please enter a task.");

        return;
    }


    const { data, error } =
        await supabaseClient
            .from("tasks")
            .insert([
                {
                    user_id: currentUser.id,
                    title: title,
                    completed: false
                }
            ])
            .select();


    if (error) {

        console.error("Add task error:", error);

        alert("Could not add task.");

        return;
    }


    input.value = "";


    loadTasks();
}



// ===============================
// DISPLAY TASKS
// ===============================

function displayTasks(tasks) {

    const taskList =
        document.getElementById("taskList");


    taskList.innerHTML = "";


    tasks.forEach(function(task) {

        const li =
            document.createElement("li");


        const taskText =
            document.createElement("span");


        taskText.textContent =
            task.title;


        if (task.completed) {

            taskText.classList.add("completed");

        }


        taskText.onclick = function() {

            toggleTask(task);

        };


        const deleteButton =
            document.createElement("button");


        deleteButton.textContent = "🗑️";


        deleteButton.className = "delete";


        deleteButton.onclick = function() {

            deleteTask(task.id);

        };


        li.appendChild(taskText);

        li.appendChild(deleteButton);

        taskList.appendChild(li);

    });

}



// ===============================
// COMPLETE TASK
// ===============================

async function toggleTask(task) {

    const { error } =
        await supabaseClient
            .from("tasks")
            .update({
                completed: !task.completed
            })
            .eq("id", task.id)
            .eq("user_id", currentUser.id);


    if (error) {

        console.error(
            "Update task error:",
            error
        );

        return;
    }


    loadTasks();
}



// ===============================
// DELETE TASK
// ===============================

async function deleteTask(taskId) {

    const { error } =
        await supabaseClient
            .from("tasks")
            .delete()
            .eq("id", taskId)
            .eq("user_id", currentUser.id);


    if (error) {

        console.error(
            "Delete task error:",
            error
        );

        return;
    }


    loadTasks();
}



// ===============================
// LOGOUT
// ===============================

async function logout() {

    const { error } =
        await supabaseClient.auth.signOut();


    if (error) {

        console.error(
            "Logout error:",
            error
        );

        return;
    }


    window.location.href = "auth.html";
}