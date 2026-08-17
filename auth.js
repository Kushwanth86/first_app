// ============================================================
// AUTH.JS
// MY TASKS - SUPABASE AUTHENTICATION
// ============================================================


// ============================================================
// SUPABASE CONFIGURATION
// ============================================================

window.supabaseClient = window.supabase.createClient(
    "https://mtiiocomeghvdqleyfbp.supabase.co",
    "sb_publishable_mPAtDIxOYDRUtzvByVm2NA_3AKM_Ph7"
);

console.log("AUTH.JS LOADED");


// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getAuthElements() {

    return {
        email: document.getElementById("email"),
        password: document.getElementById("password"),
        message: document.getElementById("authMessage"),
        signupButton: document.querySelector(".signup-btn"),
        loginButton: document.querySelector(".login-btn")
    };

}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(text, type = "normal") {

    const message =
        document.getElementById("authMessage");

    if (!message) return;

    message.textContent = text;

    // Remove previous message classes
    message.classList.remove(
        "success",
        "error",
        "loading"
    );

    if (type === "success") {

        message.classList.add("success");

    }

    if (type === "error") {

        message.classList.add("error");

    }

    if (type === "loading") {

        message.classList.add("loading");

    }

}


// ============================================================
// BUTTON LOADING STATE
// ============================================================

function setLoading(button, loading, loadingText, normalText) {

    if (!button) return;

    button.disabled = loading;

    if (loading) {

        button.dataset.originalText =
            button.textContent;

        button.textContent = loadingText;

        button.style.opacity = "0.7";

        button.style.cursor = "not-allowed";

    } else {

        button.textContent =
            normalText ||
            button.dataset.originalText ||
            button.textContent;

        button.style.opacity = "1";

        button.style.cursor = "pointer";

    }

}


// ============================================================
// VALIDATE INPUT
// ============================================================

function validateAuthInput() {

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    if (email === "") {

        showMessage(
            "Please enter your email address.",
            "error"
        );

        document.getElementById("email").focus();

        return false;

    }


    if (password === "") {

        showMessage(
            "Please enter your password.",
            "error"
        );

        document.getElementById("password").focus();

        return false;

    }


    if (password.length < 6) {

        showMessage(
            "Password must be at least 6 characters.",
            "error"
        );

        document.getElementById("password").focus();

        return false;

    }


    return true;

}


// ============================================================
// SIGN UP
// ============================================================

async function signUp() {

    const elements =
        getAuthElements();

    const email =
        elements.email.value.trim();

    const password =
        elements.password.value;


    // Validate

    if (!validateAuthInput()) {

        return;

    }


    // Prevent duplicate clicks

    if (
        elements.signupButton &&
        elements.signupButton.disabled
    ) {

        return;

    }


    console.log("Signup button clicked");


    // Loading state

    setLoading(
        elements.signupButton,
        true,
        "Creating Account...",
        "Create Account"
    );


    showMessage(
        "Creating your account...",
        "loading"
    );


    try {

        const {
            data,
            error
        } =
            await window.supabaseClient.auth.signUp({

                email: email,

                password: password

            });


        // Error

        if (error) {

            console.error(
                "Signup error:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

            return;

        }


        console.log(
            "Signup successful:",
            data
        );


        // Success

        showMessage(
            "Account created! Check your email to verify your account.",
            "success"
        );


        // Clear password

        elements.password.value = "";


    } catch (error) {

        console.error(
            "Unexpected signup error:",
            error
        );

        showMessage(
            "Something went wrong. Please try again.",
            "error"
        );


    } finally {

        setLoading(
            elements.signupButton,
            false,
            "",
            "Create Account"
        );

    }

}


// ============================================================
// LOGIN
// ============================================================

async function login() {

    const elements =
        getAuthElements();

    const email =
        elements.email.value.trim();

    const password =
        elements.password.value;


    // Validate

    if (!validateAuthInput()) {

        return;

    }


    // Prevent duplicate clicks

    if (
        elements.loginButton &&
        elements.loginButton.disabled
    ) {

        return;

    }


    console.log("Login button clicked");


    // Loading state

    setLoading(
        elements.loginButton,
        true,
        "Logging in...",
        "Login"
    );


    showMessage(
        "Signing you in...",
        "loading"
    );


    try {

        const {
            data,
            error
        } =
            await window.supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        // Login error

        if (error) {

            console.error(
                "Login error:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

            return;

        }


        console.log(
            "Login successful:",
            data
        );


        // Success

        showMessage(
            "Login successful! Opening dashboard...",
            "success"
        );


        // Small delay so user sees success

        setTimeout(function () {

            window.location.href =
                "dashboard.html";

        }, 700);


    } catch (error) {

        console.error(
            "Unexpected login error:",
            error
        );

        showMessage(
            "Something went wrong. Please try again.",
            "error"
        );


    } finally {

        /*
         * Keep the login button disabled if
         * authentication succeeded because
         * we're redirecting to dashboard.
         */

        if (
            !window.location.href.includes(
                "dashboard.html"
            )
        ) {

            setLoading(
                elements.loginButton,
                false,
                "",
                "Login"
            );

        }

    }

}


// ============================================================
// FORGOT PASSWORD
// ============================================================

async function forgotPassword() {

    const emailInput =
        document.getElementById("email");

    const email =
        emailInput.value.trim();


    if (email === "") {

        showMessage(
            "Enter your email address first.",
            "error"
        );

        emailInput.focus();

        return;

    }


    console.log(
        "Password reset requested for:",
        email
    );


    showMessage(
        "Sending password reset email...",
        "loading"
    );


    try {

        const {
            error
        } =
            await window.supabaseClient.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo:
                        window.location.origin +
                        "/auth.html"
                }
            );


        if (error) {

            console.error(
                "Password reset error:",
                error
            );

            showMessage(
                error.message,
                "error"
            );

            return;

        }


        showMessage(
            "Password reset email sent. Check your inbox.",
            "success"
        );


    } catch (error) {

        console.error(
            "Unexpected password reset error:",
            error
        );

        showMessage(
            "Unable to send reset email. Please try again.",
            "error"
        );

    }

}


// ============================================================
// ENTER KEY LOGIN
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const email =
            document.getElementById("email");

        const password =
            document.getElementById("password");


        if (email) {

            email.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        login();

                    }

                }
            );

        }


        if (password) {

            password.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        event.preventDefault();

                        login();

                    }

                }
            );

        }

    }
);


// ============================================================
// CHECK EXISTING SESSION
// ============================================================

async function checkExistingSession() {

    try {

        const {
            data,
            error
        } =
            await window.supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session check error:",
                error
            );

            return;

        }


        if (
            data &&
            data.session &&
            window.location.pathname.endsWith(
                "auth.html"
            )
        ) {

            console.log(
                "Existing session found."
            );

            /*
             * We don't automatically redirect here.
             * This allows the user to see the login
             * page and choose what they want to do.
             */

        }

    } catch (error) {

        console.error(
            "Session check failed:",
            error
        );

    }

}


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Authentication system initialized."
        );

        checkExistingSession();

    }
);