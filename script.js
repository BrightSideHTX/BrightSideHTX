// ============================================
// BRIGHTSIDE DETAILING
// SHARED JAVASCRIPT
// ============================================


// ============================================
// MOBILE MENU
// ============================================

document.addEventListener("DOMContentLoaded", () => {

    /*
     * STANDARD SITE NAVIGATION
     *
     * Used by:
     * - Homepage
     * - Packages
     * - Results
     * - How It Works
     * - About
     */

    const menuButton =
        document.getElementById("menuButton");

    const navLinks =
        document.querySelector(".nav-links");


    if (menuButton && navLinks) {

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );


        menuButton.addEventListener(
            "click",
            () => {

                const isOpen =
                    navLinks.classList.toggle(
                        "mobile-open"
                    );


                menuButton.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );


                menuButton.classList.toggle(
                    "is-open",
                    isOpen
                );


                document.body.classList.toggle(
                    "mobile-menu-open",
                    isOpen
                );

            }
        );


        /*
         * Close menu when a navigation link
         * is selected.
         */

        navLinks
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        navLinks.classList.remove(
                            "mobile-open"
                        );

                        menuButton.classList.remove(
                            "is-open"
                        );

                        menuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        document.body.classList.remove(
                            "mobile-menu-open"
                        );

                    }
                );

            });


        /*
         * Close menu with Escape.
         */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape" &&
                    navLinks.classList.contains(
                        "mobile-open"
                    )
                ) {

                    navLinks.classList.remove(
                        "mobile-open"
                    );

                    menuButton.classList.remove(
                        "is-open"
                    );

                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    document.body.classList.remove(
                        "mobile-menu-open"
                    );

                    menuButton.focus();

                }

            }
        );

    }


    // ========================================
    // BOOKING PAGE MOBILE MENU
    // ========================================

    /*
     * The booking page has its own custom header,
     * so it uses a separate mobile menu.
     */

    const bookingMenuButton =
        document.getElementById(
            "bookingMenuButton"
        );

    const bookingMobileMenu =
        document.getElementById(
            "bookingMobileMenu"
        );


    if (
        bookingMenuButton &&
        bookingMobileMenu
    ) {

        bookingMenuButton.setAttribute(
            "aria-expanded",
            "false"
        );


        bookingMenuButton.addEventListener(
            "click",
            () => {

                const isOpen =
                    bookingMobileMenu.classList.toggle(
                        "mobile-open"
                    );


                bookingMenuButton.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );


                bookingMenuButton.classList.toggle(
                    "is-open",
                    isOpen
                );


                document.body.classList.toggle(
                    "mobile-menu-open",
                    isOpen
                );

            }
        );


        /*
         * Close after selecting a booking
         * navigation link.
         */

        bookingMobileMenu
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    () => {

                        bookingMobileMenu.classList.remove(
                            "mobile-open"
                        );

                        bookingMenuButton.classList.remove(
                            "is-open"
                        );

                        bookingMenuButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                        document.body.classList.remove(
                            "mobile-menu-open"
                        );

                    }
                );

            });


        /*
         * Close booking menu with Escape.
         */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape" &&
                    bookingMobileMenu.classList.contains(
                        "mobile-open"
                    )
                ) {

                    bookingMobileMenu.classList.remove(
                        "mobile-open"
                    );

                    bookingMenuButton.classList.remove(
                        "is-open"
                    );

                    bookingMenuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    document.body.classList.remove(
                        "mobile-menu-open"
                    );

                    bookingMenuButton.focus();

                }

            }
        );

    }

});


// ============================================
// BOOKING PAGE
// ============================================

const bookingPage =
    document.getElementById(
        "booking-page"
    );


if (bookingPage) {

    // ========================================
    // MAPBOX
    // ========================================


    const MAPBOX_TOKEN =
        "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyYWV0In0.Usd3fiKRnMZq1oE6cYy1Jg";


    // Alief Community Center
    const SERVICE_LAT =
        29.70254;

    const SERVICE_LNG =
        -95.58891;


    const SERVICE_RADIUS =
        30;


    // ========================================
    // ELEMENTS
    // ========================================

    const addressInput =
        document.getElementById("address");

    const suggestionsBox =
        document.getElementById(
            "address-suggestions"
        );

    const serviceStatus =
        document.getElementById(
            "service-status"
        );

    const availability =
        document.getElementById(
            "availability-container"
        );

    const availabilityButton =
        document.getElementById(
            "availability-button"
        );

    const mapElement =
        document.getElementById("map");

    const vehicleSize =
        document.getElementById(
            "vehicle-size"
        );

    const vehiclePrice =
        document.getElementById(
            "vehicle-price"
        );

    const vehicleMake =
        document.getElementById(
            "vehicle-make"
        );

    const vehicleModel =
        document.getElementById(
            "vehicle-model"
        );

    const vehicleYear =
        document.getElementById(
            "vehicle-year"
        );


    // ========================================
    // CALENDLY LINKS
    // ========================================

    const calendlyLinks = {

        express:
            "https://calendly.com/brightsidemdetails/express-exterior",

        interior:
            "https://calendly.com/brightsidemdetails/full-interior",

        "full-detail":
            "https://calendly.com/brightsidemdetails/30min"

    };


    // ========================================
    // PRICING
    // ========================================

    const prices = {

        sedan: {
            express: 75,
            interior: 100,
            full: 150
        },

        suv: {
            express: 95,
            interior: 120,
            full: 180
        },

        truck: {
            express: 110,
            interior: 140,
            full: 200
        }

    };


    // ========================================
    // BOOKING STATE
    // ========================================

    let selectedAddress =
        false;

    let locationEligible =
        false;


    // ========================================
    // UPDATE PRICES
    // ========================================

    function updatePrices() {

        const vehicle =
            vehicleSize?.value;


        const priceElements =
            document.querySelectorAll(
                ".service-price"
            );


        if (!vehicle) {

            if (vehiclePrice) {

                vehiclePrice.textContent =
                    "Choose your vehicle type to see your price.";

            }


            priceElements.forEach(
                element => {

                    element.textContent =
                        "Select Vehicle";

                }
            );


            lockAvailability();

            return;

        }


        const selected =
            prices[vehicle];


        if (!selected) {
            return;
        }


        if (vehiclePrice) {

            vehiclePrice.innerHTML = `
                <strong>Estimated pricing:</strong>
                Express $${selected.express}
                • Interior $${selected.interior}
                • Full Detail $${selected.full}
            `;

        }


        priceElements.forEach(
            element => {

                const card =
                    element.closest(
                        ".service-card"
                    );

                const radio =
                    card?.querySelector(
                        "input[name='service']"
                    );


                if (!radio) {
                    return;
                }


                if (
                    radio.value ===
                    "express"
                ) {

                    element.textContent =
                        `$${selected.express}`;

                }


                if (
                    radio.value ===
                    "interior"
                ) {

                    element.textContent =
                        `$${selected.interior}`;

                }


                if (
                    radio.value ===
                    "full-detail"
                ) {

                    element.textContent =
                        `$${selected.full}`;

                }

            }
        );


        validateBooking();

    }


    if (vehicleSize) {

        vehicleSize.addEventListener(
            "change",
            () => {

                updatePrices();


                if (!vehicleSize.value) {

                    lockAvailability();

                }

            }
        );

    }


    // ========================================
    // MAPBOX VARIABLES
    // ========================================

    let map = null;
    let marker = null;


    // ========================================
    // START MAP
    // ========================================

    function startMap() {

        if (!mapElement) {
            console.error(
                "Map element #map was not found."
            );
            return;
        }


        if (
            !MAPBOX_TOKEN ||
            MAPBOX_TOKEN.includes(
                "PASTE_YOUR_EXISTING"
            )
        ) {

            console.error(
                "Mapbox public token is missing."
            );

            return;

        }


        if (
            typeof mapboxgl ===
            "undefined"
        ) {

            console.error(
                "Mapbox GL JS did not load."
            );

            return;

        }


        mapboxgl.accessToken =
            MAPBOX_TOKEN;


        try {

            map =
                new mapboxgl.Map({

                    container:
                        "map",

                    style:
                        "mapbox://styles/mapbox/streets-v12",

                    center: [
                        SERVICE_LNG,
                        SERVICE_LAT
                    ],

                    zoom: 11

                });


            map.on(
                "load",
                () => {

                    console.log(
                        "Mapbox map loaded successfully."
                    );

                }
            );


            map.on(
                "error",
                event => {

                    console.error(
                        "Mapbox map error:",
                        event
                    );

                }
            );


            map.addControl(
                new mapboxgl.NavigationControl()
            );


        } catch (error) {

            console.error(
                "Mapbox initialization error:",
                error
            );

        }

    }


    startMap();


    // ========================================
    // SEARCH SESSION
    // ========================================

    let sessionToken =
        null;


    function createSessionToken() {

        if (
            window.crypto &&
            typeof crypto.randomUUID ===
                "function"
        ) {

            return crypto.randomUUID();

        }


        return (
            Date.now().toString() +
            Math.random().toString(36)
        );

    }


    sessionToken =
        createSessionToken();


    let searchTimer;


    // ========================================
    // ADDRESS INPUT
    // ========================================

    if (addressInput) {

        addressInput.addEventListener(
            "input",
            () => {

                clearTimeout(
                    searchTimer
                );


                selectedAddress =
                    false;

                locationEligible =
                    false;


                lockAvailability();


                if (serviceStatus) {

                    serviceStatus.className =
                        "service-status";

                    serviceStatus.innerHTML =
                        "";

                }


                const query =
                    addressInput.value.trim();


                if (query.length < 3) {

                    hideSuggestions();

                    return;

                }


                searchTimer =
                    setTimeout(
                        () => {

                            getSuggestions(
                                query
                            );

                        },
                        300
                    );

            }
        );

    }


    // ========================================
    // MAPBOX ADDRESS SUGGESTIONS
    // ========================================

    async function getSuggestions(
        query
    ) {

        try {

            const url =
                "https://api.mapbox.com/search/searchbox/v1/suggest" +
                "?q=" +
                encodeURIComponent(query) +
                "&country=US" +
                "&language=en" +
                "&limit=6" +
                "&session_token=" +
                sessionToken +
                "&proximity=" +
                SERVICE_LNG +
                "," +
                SERVICE_LAT +
                "&access_token=" +
                MAPBOX_TOKEN;


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    "Mapbox suggestion request failed: " +
                    response.status
                );

            }


            const data =
                await response.json();


            showSuggestions(
                data.suggestions ||
                []
            );


        } catch (error) {

            console.error(
                "Mapbox suggestion error:",
                error
            );

            hideSuggestions();

        }

    }


    // ========================================
    // SHOW SUGGESTIONS
    // ========================================

    function showSuggestions(
        suggestions
    ) {

        if (!suggestionsBox) {
            return;
        }


        suggestionsBox.innerHTML =
            "";


        if (!suggestions.length) {

            hideSuggestions();

            return;

        }


        suggestions.forEach(
            suggestion => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "address-suggestion";


                button.innerHTML = `

                    <strong>
                        ${escapeHTML(
                            suggestion.name ||
                            ""
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            suggestion.full_address ||
                            suggestion.place_formatted ||
                            ""
                        )}
                    </span>

                `;


                button.addEventListener(
                    "click",
                    () => {

                        retrieveAddress(
                            suggestion
                        );

                    }
                );


                suggestionsBox.appendChild(
                    button
                );

            }
        );


        suggestionsBox.style.display =
            "block";

    }


    // ========================================
    // RETRIEVE ADDRESS
    // ========================================

    async function retrieveAddress(
        suggestion
    ) {

        if (
            !suggestion ||
            !suggestion.mapbox_id
        ) {

            return;

        }


        try {

            const url =
                "https://api.mapbox.com/search/searchbox/v1/retrieve/" +
                encodeURIComponent(
                    suggestion.mapbox_id
                ) +
                "?session_token=" +
                sessionToken +
                "&access_token=" +
                MAPBOX_TOKEN;


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    "Mapbox retrieve failed: " +
                    response.status
                );

            }


            const data =
                await response.json();


            const feature =
                data.features?.[0];


            if (!feature) {

                throw new Error(
                    "No address feature returned."
                );

            }


            const coordinates =
                feature.geometry.coordinates;


            const longitude =
                Number(
                    coordinates[0]
                );

            const latitude =
                Number(
                    coordinates[1]
                );


            if (
                !Number.isFinite(
                    longitude
                ) ||
                !Number.isFinite(
                    latitude
                )
            ) {

                throw new Error(
                    "Invalid coordinates."
                );

            }


            const address =
                feature.properties?.full_address ||
                feature.properties?.place_formatted ||
                suggestion.full_address ||
                suggestion.name ||
                "";


            addressInput.value =
                address;


            selectedAddress =
                true;


            hideSuggestions();


            updateMap(
                longitude,
                latitude,
                address
            );


            checkServiceArea(
                latitude,
                longitude
            );


            sessionToken =
                createSessionToken();


        } catch (error) {

            console.error(
                "Address retrieval error:",
                error
            );

        }

    }


    // ========================================
    // UPDATE MAP
    // ========================================

    function updateMap(
        longitude,
        latitude,
        address
    ) {

        if (!map) {

            console.warn(
                "Map is not ready yet."
            );

            return;

        }


        map.flyTo({

            center: [
                longitude,
                latitude
            ],

            zoom: 14,

            essential: true

        });


        if (marker) {

            marker.remove();

        }


        marker =
            new mapboxgl.Marker()
                .setLngLat([
                    longitude,
                    latitude
                ])
                .setPopup(
                    new mapboxgl.Popup({
                        offset: 25
                    }).setText(
                        address
                    )
                )
                .addTo(map);


        marker.togglePopup();

    }


    // ========================================
    // DISTANCE CALCULATION
    // ========================================

    function calculateDistance(
        lat1,
        lon1,
        lat2,
        lon2
    ) {

        const radius =
            3958.8;


        const latDifference =
            (lat2 - lat1) *
            Math.PI /
            180;


        const lonDifference =
            (lon2 - lon1) *
            Math.PI /
            180;


        const a =
            Math.sin(
                latDifference / 2
            ) ** 2 +

            Math.cos(
                lat1 *
                Math.PI /
                180
            ) *

            Math.cos(
                lat2 *
                Math.PI /
                180
            ) *

            Math.sin(
                lonDifference / 2
            ) ** 2;


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        return radius * c;

    }


    // ========================================
    // CHECK SERVICE AREA
    // ========================================

    function checkServiceArea(
        latitude,
        longitude
    ) {

        if (!serviceStatus) {
            return;
        }


        const distance =
            calculateDistance(
                SERVICE_LAT,
                SERVICE_LNG,
                latitude,
                longitude
            );


        const miles =
            Math.round(
                distance * 10
            ) / 10;


        if (
            distance <=
            SERVICE_RADIUS
        ) {

            locationEligible =
                true;


            serviceStatus.className =
                "service-status eligible";


            serviceStatus.innerHTML = `

                <strong>
                    ✓ You're within our service area
                </strong>

                <span>
                    Approximately ${miles}
                    miles from the Alief Community Center.
                </span>

            `;


        } else {

            locationEligible =
                false;


            serviceStatus.className =
                "service-status not-eligible";


            serviceStatus.innerHTML = `

                <strong>
                    ✕ Outside our current service area
                </strong>

                <span>
                    This address is approximately
                    ${miles} miles from the
                    Alief Community Center.
                    Our service radius is 30 miles.
                </span>

            `;

        }


        validateBooking();

    }


    // ========================================
    // GET SELECTED SERVICE
    // ========================================

    function getSelectedService() {

        const selected =
            document.querySelector(
                "input[name='service']:checked"
            );


        return selected
            ? selected.value
            : null;

    }


    // ========================================
    // VALIDATE BOOKING
    // ========================================

    function validateBooking() {

        const service =
            getSelectedService();


        const make =
            vehicleMake?.value.trim();

        const model =
            vehicleModel?.value.trim();

        const year =
            vehicleYear?.value.trim();

        const vehicle =
            vehicleSize?.value;


        const complete =
            make &&
            model &&
            year &&
            vehicle &&
            service &&
            selectedAddress &&
            locationEligible;


        if (complete) {

            unlockAvailability();

        } else {

            lockAvailability();

        }

    }


    // ========================================
    // REQUIRED FIELD CHECK
    // ========================================

    function firstMissingField() {

        if (
            !vehicleMake?.value.trim()
        ) {

            return vehicleMake;

        }


        if (
            !vehicleModel?.value.trim()
        ) {

            return vehicleModel;

        }


        if (
            !vehicleYear?.value.trim()
        ) {

            return vehicleYear;

        }


        if (!vehicleSize?.value) {

            return vehicleSize;

        }


        if (!getSelectedService()) {

            return document.querySelector(
                "input[name='service']"
            );

        }


        if (
            !selectedAddress ||
            !locationEligible
        ) {

            return addressInput;

        }


        return null;

    }


    // ========================================
    // SCROLL TO MISSING INFORMATION
    // ========================================

    function scrollToMissingField() {

        const field =
            firstMissingField();


        if (!field) {
            return;
        }


        field.scrollIntoView({

            behavior:
                "smooth",

            block:
                "center"

        });


        setTimeout(
            () => {

                try {

                    field.focus();

                } catch (error) {

                    // Intentionally ignored.

                }

            },
            500
        );

    }


    // ========================================
    // UNLOCK AVAILABILITY
    // ========================================

    function unlockAvailability() {

        if (
            !availability ||
            !availabilityButton
        ) {

            return;

        }


        const service =
            getSelectedService();


        const calendlyURL =
            calendlyLinks[
                service
            ];


        if (!calendlyURL) {

            lockAvailability();

            return;

        }


        availability.className =
            "availability-unlocked";


        availabilityButton.classList.remove(
            "disabled-button"
        );


        availabilityButton.style.pointerEvents =
            "auto";


        availabilityButton.setAttribute(
            "aria-disabled",
            "false"
        );


        availabilityButton.href =
            calendlyURL;


        const message =
            availability.querySelector(
                ".availability-message"
            );


        if (message) {

            message.innerHTML = `

                <strong>
                    ✓ You're ready to book
                </strong>

                <p>
                    Your vehicle, service, and
                    service area have been confirmed.
                    Continue to Calendly to choose
                    your available appointment.
                </p>

            `;

        }

    }


    // ========================================
    // LOCK AVAILABILITY
    // ========================================

    function lockAvailability() {

        if (
            !availability ||
            !availabilityButton
        ) {

            return;

        }


        availability.className =
            "availability-locked";


        availabilityButton.classList.add(
            "disabled-button"
        );


        availabilityButton.style.pointerEvents =
            "none";


        availabilityButton.setAttribute(
            "aria-disabled",
            "true"
        );


        const message =
            availability.querySelector(
                ".availability-message"
            );


        if (message) {

            message.innerHTML = `

                <strong>
                    Check Availability
                </strong>

                <p>
                    Complete the required
                    information above first.
                </p>

            `;

        }

    }


    // ========================================
    // SERVICE SELECTION
    // ========================================

    document
        .querySelectorAll(
            "input[name='service']"
        )
        .forEach(
            radio => {

                radio.addEventListener(
                    "change",
                    () => {

                        validateBooking();

                    }
                );

            }
        );


    // ========================================
    // VEHICLE INPUT VALIDATION
    // ========================================

    [
        vehicleMake,
        vehicleModel,
        vehicleYear
    ].forEach(
        field => {

            if (!field) {
                return;
            }


            field.addEventListener(
                "input",
                () => {

                    validateBooking();

                }
            );

        }
    );


    // ========================================
    // AVAILABILITY BUTTON PROTECTION
    // ========================================

    if (availabilityButton) {

        availabilityButton.addEventListener(
            "click",
            event => {

                if (
                    firstMissingField()
                ) {

                    event.preventDefault();

                    scrollToMissingField();

                }

            }
        );

    }


    // ========================================
    // HIDE SUGGESTIONS
    // ========================================

    function hideSuggestions() {

        if (!suggestionsBox) {
            return;
        }


        suggestionsBox.innerHTML =
            "";

        suggestionsBox.style.display =
            "none";

    }


    // ========================================
    // ESCAPE HTML
    // ========================================

    function escapeHTML(value) {

        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    // ========================================
    // CLICK OUTSIDE ADDRESS SUGGESTIONS
    // ========================================

    document.addEventListener(
        "click",
        event => {

            if (
                addressInput &&
                suggestionsBox &&
                !addressInput.contains(
                    event.target
                ) &&
                !suggestionsBox.contains(
                    event.target
                )
            ) {

                hideSuggestions();

            }

        }
    );


    // ========================================
    // INITIAL STATE
    // ========================================

    updatePrices();

    lockAvailability();

}
