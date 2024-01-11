window.onload = async function () {
    function getSupportedDevices() {
        const userAgent = window.navigator.userAgent.toLowerCase();

        let name = "";
        if (userAgent.includes("iphone")) {
            name = "iphone";
        } else if (userAgent.includes("ipad")) {
            name = "ipad";
        } else if (userAgent.includes("android")) {
            name = "android";
        } else if (userAgent.includes("windows")) {
            name = "windows";
        } else if (userAgent.includes("mac")) {
            name = "mac";
        } else {
            name = "unkown";
        }

        return {
            name,
            agent: window.navigator.userAgent,
        };
    }

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const button = document.getElementById("button");

    const input = document.getElementById("input");

    const notify = localStorage.getItem("notify");

    const addEmail = document.createElement("p");
    addEmail.setAttribute("id", "addEmail");
    addEmail.textContent = "Add another email";

    addEmail.onclick = function () {
        localStorage.clear();
        location.reload();
    };

    if (notify) {
        input.remove();

        const inputContainer = document.getElementById("input-container");
        inputContainer.append(addEmail);

        manageButton({
            text: "Awesome! We'll notify you.",
            time: null,
        });
    } else {
        button.onclick = function () {
            newEmail();
        };
    }

    function manageButton({ text, time }) {
        button.textContent = text;

        if (time) {
            setTimeout(() => {
                button.textContent = "Notify Me!";
            }, time * 1000);
        }
    }

    // Get the users location
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    const { ip } = data;

    // Get the device type
    const device = getSupportedDevices();

    // Get the datetime
    const datetime = new Date();

    // Define the data
    const request = {
        ip,
        device,
        datetime,
    };

    // Send this data to the API
    const trafficRequest = await fetch("/traffic", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    async function newEmail() {
        // Get the users email
        let email = input.value;

        // Validate this email
        if (!validateEmail(email)) {
            manageButton({
                text: "Invalid Email",
                time: 2,
            });

            return;
        }

        email = email.toLowerCase();

        // Update the button text
        manageButton({
            text: "Awesome! We'll notify you.",
            time: null,
        });

        // Get the device type
        const device = getSupportedDevices();

        // Get the datetime
        const datetime = new Date();

        // Define the data
        let request = {
            email,
            ip,
            device,
            datetime,
        };

        // Send this data to the API
        const responseAddEmail = await fetch("/addEmail", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        // Save to localstorage
        localStorage.setItem("notify", true);

        gtag_report_conversion();

        // add this before event code to all pages where PII data postback is expected and appropriate
        ttq.identify({
            email: email, // string. The email of the customer if available. It must be hashed with SHA-256 on the client side.
            external_id: ip, // A unique ID from the advertiser such as user or external cookie IDs. It must be hashed with SHA256 on the client side.
        });

        //   ttq.track('ViewContent', {
        //     "contents": [{
        //       "content_name": "Sign Up", // string. The name of the page or product. Example: "shirt".
        //     }],
        //     "value": "email sign up", // number. Value of the order or items sold. Example: 100.
        //     "currency": "<content_currency>", // string. The 4217 currency code. Example: "USD".
        //   });

        ttq.track("SubmitForm", {
            contents: [
                {
                    content_id: "email", // string. ID of the product. Example: "1077218".
                    content_type: "email", // string. Either product or product_group.
                    content_name: "Sign Up", // string. The name of the page or product. Example: "shirt".
                },
            ],
        });

        setTimeout(function () {
            input.value = "";
            location.reload();
        }, 5000);
    }
};
