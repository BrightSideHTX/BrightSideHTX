/*
    ============================================================
    BRIGHTSIDE HOUSTON DETAILING
    BOOKING PAGE JAVASCRIPT
    ============================================================

    Handles:
    - Mapbox map
    - 20-mile service radius
    - Address autocomplete
    - Address retrieval
    - Eligibility checking
    - Service selection
    - Cal.com booking embeds
*/


document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       CONFIGURATION
    ========================================================= */

    /*
        KEEP YOUR EXISTING MAPBOX PUBLIC TOKEN HERE.
    */
    const MAPBOX_TOKEN = "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyYWV0In0.Usd3fiKRnMZq1oE6cYy1Jg";


    const SERVICE_CENTER = {
        latitude: 29.70254,
        longitude: -95.58891
    };


    const SERVICE_RADIUS_MILES = 20;


    const CAL_BOOKING_LINKS = {
        exterior: "brightsidehouston/exterior",
        interior: "brightsidehouston/interior",
        fullDetail: "brightsidehouston/fulldetail",
        maintenance: "brightsidehouston/maintenace"
    };


    /* =========================================================
       ELEMENTS
    ========================================================= */

    const bookingPage =
        document.querySelector(".booking-page");

    const addressInput =
        document.querySelector("#address");

    const suggestionsContainer =
        document.querySelector("#address-suggestions");

    const serviceStatus =
        document.querySelector("#service-status");

    const mapContainer =
        document.querySelector("#map");

    const availabilityContainer =
        document.querySelector("#availability-container");

    const availabilityButton =
        document.querySelector("#availability-button");

    /*
        Try several possible IDs/classes so the service
        selection section is found even if your HTML uses
        a slightly different container name.
    */
    const pricingSection =
        document.querySelector("#pricing-section") ||
        document.querySelector("#pricing") ||
        document.querySelector(".bs-pricing-section") ||
        document.querySelector(".bs-service-selection") ||
        document.querySelector(".service-selection");


    const calBooking =
        document.querySelector("#cal-booking");


    /* =========================================================
       PAGE CHECK
    ========================================================= */

    if (!bookingPage) {
        console.error(
            "BrightSide Booking: .booking-page not found."
        );

        return;
    }


    /* =========================================================
       MAP STATE
    ========================================================= */

    let map = null;

    let serviceCenterMarker = null;

    let customerMarker = null;

    let selectedAddress = null;

    let selectedCoordinates = null;

    let selectedDistance = null;

    let searchSessionToken =
        createSessionToken();

    let suggestionTimeout = null;


    /* =========================================================
       INITIAL STATE
    ========================================================= */

    hideElement(pricingSection);

    hideElement(calBooking);

    hideElement(availabilityContainer);

    hideElement(suggestionsContainer);


    /* =========================================================
       INITIALIZE MAP
    ========================================================= */

    initializeMap();


    function initializeMap() {

        if (!mapContainer) {
            console.error(
                "BrightSide Booking: #map not found."
            );

            return;
        }


        if (
            typeof mapboxgl === "undefined"
        ) {
            console.error(
                "BrightSide Booking: Mapbox GL JS is not loaded."
            );

            setServiceStatus(
                "The map could not load. Please refresh the page.",
                "error"
            );

            return;
        }


        if (
            !MAPBOX_TOKEN ||
            MAPBOX_TOKEN ===
                "YOUR_EXISTING_MAPBOX_PUBLIC_TOKEN"
        ) {
            console.error(
                "BrightSide Booking: Mapbox token is missing."
            );

            setServiceStatus(
                "The map could not connect to Mapbox.",
                "error"
            );

            return;
        }


        mapboxgl.accessToken =
            MAPBOX_TOKEN;


        map = new mapboxgl.Map({
            container: "map",

            style:
                "mapbox://styles/mapbox/streets-v12",

            center: [
                SERVICE_CENTER.longitude,
                SERVICE_CENTER.latitude
            ],

            zoom: 10.5
        });


        map.addControl(
            new mapboxgl.NavigationControl(),
            "top-right"
        );


        map.once(
            "load",
            () => {

                drawServiceRadius();

                addServiceCenterMarker();

                fitMapToServiceRadius();

            }
        );


        map.on(
            "error",
            (event) => {

                console.error(
                    "BrightSide Booking: Mapbox error:",
                    event?.error || event
                );

            }
        );
    }


    /* =========================================================
       DRAW 20-MILE SERVICE RADIUS
    ========================================================= */

    function drawServiceRadius() {

        if (!map) {
            return;
        }


        const radiusPolygon =
            createCirclePolygon(
                SERVICE_CENTER.longitude,
                SERVICE_CENTER.latitude,
                SERVICE_RADIUS_MILES,
                96
            );


        if (
            map.getSource(
                "brightside-service-radius"
            )
        ) {

            map.getSource(
                "brightside-service-radius"
            ).setData(
                radiusPolygon
            );

            return;
        }


        map.addSource(
            "brightside-service-radius",
            {
                type: "geojson",
                data: radiusPolygon
            }
        );


        map.addLayer({
            id:
                "brightside-service-radius-fill",

            type: "fill",

            source:
                "brightside-service-radius",

            paint: {
                "fill-color":
                    "#1769aa",

                "fill-opacity":
                    0.10
            }
        });


        map.addLayer({
            id:
                "brightside-service-radius-outline",

            type: "line",

            source:
                "brightside-service-radius",

            paint: {
                "line-color":
                    "#1769aa",

                "line-width":
                    2,

                "line-opacity":
                    0.85
            }
        });
    }


    /* =========================================================
       CREATE RADIUS CIRCLE
    ========================================================= */

    function createCirclePolygon(
        longitude,
        latitude,
        radiusMiles,
        points
    ) {

        const coordinates = [];

        const earthRadiusMiles =
            3958.7613;

        const angularDistance =
            radiusMiles /
            earthRadiusMiles;

        const latitudeRadians =
            latitude *
            Math.PI /
            180;

        const longitudeRadians =
            longitude *
            Math.PI /
            180;


        for (
            let index = 0;
            index <= points;
            index++
        ) {

            const bearing =
                (
                    index /
                    points
                ) *
                2 *
                Math.PI;


            const newLatitude =
                Math.asin(
                    Math.sin(
                        latitudeRadians
                    ) *
                    Math.cos(
                        angularDistance
                    ) +

                    Math.cos(
                        latitudeRadians
                    ) *
                    Math.sin(
                        angularDistance
                    ) *
                    Math.cos(
                        bearing
                    )
                );


            const newLongitude =
                longitudeRadians +

                Math.atan2(
                    Math.sin(
                        bearing
                    ) *
                    Math.sin(
                        angularDistance
                    ) *
                    Math.cos(
                        latitudeRadians
                    ),

                    Math.cos(
                        angularDistance
                    ) -

                    Math.sin(
                        latitudeRadians
                    ) *
                    Math.sin(
                        newLatitude
                    )
                );


            coordinates.push([
                newLongitude *
                    180 /
                    Math.PI,

                newLatitude *
                    180 /
                    Math.PI
            ]);
        }


        return {
            type: "Feature",

            properties: {},

            geometry: {
                type: "Polygon",

                coordinates: [
                    coordinates
                ]
            }
        };
    }


    /* =========================================================
       SERVICE CENTER MARKER
    ========================================================= */

    function addServiceCenterMarker() {

        if (!map) {
            return;
        }


        serviceCenterMarker =
            new mapboxgl.Marker({
                color: "#1769aa"
            })
                .setLngLat([
                    SERVICE_CENTER.longitude,
                    SERVICE_CENTER.latitude
                ])
                .setPopup(
                    new mapboxgl.Popup({
                        offset: 25
                    }).setHTML(
                        `
                            <strong>
                                BrightSide Houston Detailing
                            </strong>
                            <br>
                            Service Center
                        `
                    )
                )
                .addTo(map);
    }


    /* =========================================================
       FIT MAP TO SERVICE AREA
    ========================================================= */

    function fitMapToServiceRadius() {

        if (!map) {
            return;
        }


        const latitudeOffset =
            SERVICE_RADIUS_MILES /
            69;


        const longitudeOffset =
            SERVICE_RADIUS_MILES /
            (
                69 *
                Math.cos(
                    SERVICE_CENTER.latitude *
                    Math.PI /
                    180
                )
            );


        const bounds =
            new mapboxgl.LngLatBounds();


        bounds.extend([
            SERVICE_CENTER.longitude -
                longitudeOffset,

            SERVICE_CENTER.latitude -
                latitudeOffset
        ]);


        bounds.extend([
            SERVICE_CENTER.longitude +
                longitudeOffset,

            SERVICE_CENTER.latitude +
                latitudeOffset
        ]);


        map.fitBounds(
            bounds,
            {
                padding: 40,
                duration: 600,
                maxZoom: 11
            }
        );
    }


    /* =========================================================
       ADDRESS INPUT
    ========================================================= */

    if (addressInput) {

        addressInput.addEventListener(
            "input",
            () => {

                const query =
                    addressInput.value.trim();


                clearTimeout(
                    suggestionTimeout
                );


                selectedAddress = null;

                selectedCoordinates = null;

                selectedDistance = null;


                hideElement(
                    pricingSection
                );

                hideElement(
                    calBooking
                );

                hideElement(
                    availabilityContainer
                );


                if (suggestionsContainer) {

                    suggestionsContainer.innerHTML = "";

                    hideElement(
                        suggestionsContainer
                    );
                }


                if (query.length < 3) {

                    setServiceStatus(
                        "",
                        "hidden"
                    );

                    return;
                }


                setServiceStatus(
                    "Searching addresses...",
                    "checking"
                );


                suggestionTimeout =
                    setTimeout(
                        () => {

                            fetchSuggestions(
                                query
                            );

                        },
                        250
                    );
            }
        );


        addressInput.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key !== "Enter"
                ) {
                    return;
                }


                const firstSuggestion =
                    suggestionsContainer?.querySelector(
                        "[data-mapbox-id]"
                    );


                if (firstSuggestion) {

                    event.preventDefault();

                    firstSuggestion.click();
                }
            }
        );
    }


    /* =========================================================
       FETCH ADDRESS SUGGESTIONS
    ========================================================= */

    async function fetchSuggestions(
        query
    ) {

        try {

            const url =
                "https://api.mapbox.com/search/searchbox/v1/suggest" +

                "?q=" +
                encodeURIComponent(
                    query
                ) +

                "&limit=6" +

                "&country=US" +

                "&language=en" +

                "&types=address" +

                "&proximity=" +
                encodeURIComponent(
                    `${SERVICE_CENTER.longitude},${SERVICE_CENTER.latitude}`
                ) +

                "&session_token=" +
                encodeURIComponent(
                    searchSessionToken
                ) +

                "&access_token=" +
                encodeURIComponent(
                    MAPBOX_TOKEN
                );


            const response =
                await fetch(url);


            if (!response.ok) {

                throw new Error(
                    `Mapbox request failed: ${response.status}`
                );
            }


            const data =
                await response.json();


            renderSuggestions(
                data.suggestions || []
            );


        } catch (error) {

            console.error(
                "BrightSide Booking: Address search failed.",
                error
            );


            setServiceStatus(
                "We couldn't search for that address. Please try again.",
                "error"
            );
        }
    }


    /* =========================================================
       RENDER SUGGESTIONS
    ========================================================= */

    function renderSuggestions(
        suggestions
    ) {

        if (!suggestionsContainer) {
            return;
        }


        suggestionsContainer.innerHTML = "";


        if (!suggestions.length) {

            hideElement(
                suggestionsContainer
            );

            setServiceStatus(
                "No matching addresses found.",
                "error"
            );

            return;
        }


        suggestions.forEach(
            (suggestion) => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type = "button";

                button.className =
                    "address-suggestion";


                button.dataset.mapboxId =
                    suggestion.mapbox_id;


                button.innerHTML = `
                    <span class="address-suggestion-main">
                        ${escapeHtml(
                            suggestion.name ||
                            suggestion.full_address ||
                            "Address"
                        )}
                    </span>

                    ${
                        suggestion.place_formatted
                            ? `
                                <span class="address-suggestion-secondary">
                                    ${escapeHtml(
                                        suggestion.place_formatted
                                    )}
                                </span>
                            `
                            : ""
                    }
                `;


                button.addEventListener(
                    "click",
                    () => {

                        selectAddress(
                            suggestion
                        );

                    }
                );


                suggestionsContainer.appendChild(
                    button
                );
            }
        );


        showElement(
            suggestionsContainer
        );


        setServiceStatus(
            "Select your address from the list.",
            "checking"
        );
    }


    /* =========================================================
       SELECT ADDRESS
    ========================================================= */

    async function selectAddress(
        suggestion
    ) {

        if (
            !suggestion?.mapbox_id
        ) {
            return;
        }


        hideElement(
            suggestionsContainer
        );


        addressInput.value =
            suggestion.full_address ||
            suggestion.place_formatted ||
            suggestion.name ||
            "";


        setServiceStatus(
            "Checking your service area...",
            "checking"
        );


        try {

            const data =
                await retrieveAddress(
                    suggestion.mapbox_id
                );


            const feature =
                data?.features?.[0];


            if (!feature) {

                throw new Error(
                    "No address was returned."
                );
            }


            const coordinates =
                feature.geometry?.coordinates;


            if (
                !coordinates ||
                coordinates.length < 2
            ) {

                throw new Error(
                    "No address coordinates returned."
                );
            }


            const longitude =
                Number(
                    coordinates[0]
                );


            const latitude =
                Number(
                    coordinates[1]
                );


            selectedCoordinates = {
                longitude,
                latitude
            };


            selectedAddress =
                feature.properties?.full_address ||

                feature.properties?.place_formatted ||

                feature.properties?.name ||

                addressInput.value;


            addressInput.value =
                selectedAddress;


            /*
                Calculate the distance immediately.
            */
            selectedDistance =
                calculateDistanceMiles(
                    SERVICE_CENTER.latitude,
                    SERVICE_CENTER.longitude,

                    latitude,
                    longitude
                );


            /*
                Put customer on map.
            */
            showCustomerLocation(
                longitude,
                latitude
            );


            fitMapToCustomerAndServiceCenter(
                longitude,
                latitude
            );


            /*
                Move to the eligibility step.
            */
            evaluateEligibility(
                selectedDistance
            );


        } catch (error) {

            console.error(
                "BrightSide Booking: Address retrieval failed.",
                error
            );


            setServiceStatus(
                "We couldn't verify that address. Please select the address from the suggestions.",
                "error"
            );
        }
    }


    /* =========================================================
       RETRIEVE ADDRESS
    ========================================================= */

    async function retrieveAddress(
        mapboxId
    ) {

        const url =
            "https://api.mapbox.com/search/searchbox/v1/retrieve/" +

            encodeURIComponent(
                mapboxId
            ) +

            "?session_token=" +

            encodeURIComponent(
                searchSessionToken
            ) +

            "&access_token=" +

            encodeURIComponent(
                MAPBOX_TOKEN
            );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Mapbox retrieve failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        searchSessionToken =
            createSessionToken();


        return data;
    }


    /* =========================================================
       CUSTOMER MARKER
    ========================================================= */

    function showCustomerLocation(
        longitude,
        latitude
    ) {

        if (!map) {
            return;
        }


        if (customerMarker) {
            customerMarker.remove();
        }


        customerMarker =
            new mapboxgl.Marker({
                color: "#102033"
            })
                .setLngLat([
                    longitude,
                    latitude
                ])
                .setPopup(
                    new mapboxgl.Popup({
                        offset: 25
                    }).setHTML(
                        `
                            <strong>
                                Your Location
                            </strong>
                        `
                    )
                )
                .addTo(map);
    }


    /* =========================================================
       FIT MAP TO CUSTOMER
    ========================================================= */

    function fitMapToCustomerAndServiceCenter(
        longitude,
        latitude
    ) {

        if (!map) {
            return;
        }


        const bounds =
            new mapboxgl.LngLatBounds();


        bounds.extend([
            SERVICE_CENTER.longitude,
            SERVICE_CENTER.latitude
        ]);


        bounds.extend([
            longitude,
            latitude
        ]);


        map.fitBounds(
            bounds,
            {
                padding: 70,
                duration: 700,
                maxZoom: 12
            }
        );
    }


    /* =========================================================
       ELIGIBILITY
    ========================================================= */

    function evaluateEligibility(
        distanceMiles
    ) {

        const distance =
            distanceMiles.toFixed(1);


        /*
            ================================================
            ELIGIBLE
            ================================================
        */

        if (
            distanceMiles <=
            SERVICE_RADIUS_MILES
        ) {

            setServiceStatus(
                `
                    <div class="service-status-content">

                        <strong>
                            You're in our service area.
                        </strong>

                        <span>
                            Your address is approximately
                            ${distance} miles from our
                            service center.
                        </span>

                    </div>
                `,
                "eligible"
            );


            /*
                SHOW THE NEXT STEP.

                This is the important fix.

                We explicitly remove:
                - hidden attribute
                - display:none
                - visibility:hidden
                - max-height restrictions
            */
            revealServiceSelection();


            /*
                Make sure Cal.com is still hidden until
                the customer actually chooses a service.
            */
            hideElement(
                calBooking
            );


            /*
                Scroll to the service selection.
            */
            scrollToServiceSelection();


        }

        /*
            ================================================
            NOT ELIGIBLE
            ================================================
        */

        else {

            setServiceStatus(
                `
                    <div class="service-status-content">

                        <strong>
                            Sorry, you're outside our service area.
                        </strong>

                        <span>
                            Your address is approximately
                            ${distance} miles from our
                            service center.
                        </span>

                        <span>
                            BrightSide currently serves
                            locations within approximately
                            ${SERVICE_RADIUS_MILES} miles.
                        </span>

                    </div>
                `,
                "ineligible"
            );


            hideElement(
                pricingSection
            );


            hideElement(
                calBooking
            );


            hideElement(
                availabilityContainer
            );
        }
    }


    /* =========================================================
       REVEAL SERVICE SELECTION
    ========================================================= */

    function revealServiceSelection() {

        if (!pricingSection) {

            console.error(
                "BrightSide Booking: Could not find the service-selection/pricing section."
            );

            return;
        }


        /*
            Remove all common hiding mechanisms.
        */
        pricingSection.hidden =
            false;


        pricingSection.removeAttribute(
            "hidden"
        );


        pricingSection.removeAttribute(
            "aria-hidden"
        );


        pricingSection.classList.remove(
            "hidden"
        );


        pricingSection.classList.remove(
            "is-hidden"
        );


        /*
            If previous JavaScript added display:none,
            clear it.
        */
        if (
            pricingSection.style.display ===
            "none"
        ) {

            pricingSection.style.display =
                "";
        }


        /*
            Reveal availability if it exists.
        */
        if (availabilityContainer) {

            availabilityContainer.hidden =
                false;

            availabilityContainer.removeAttribute(
                "hidden"
            );
        }


        /*
            Force the section to be visible even if the
            existing stylesheet uses a visibility rule.
        */
        pricingSection.style.visibility =
            "visible";


        pricingSection.style.opacity =
            "1";


        /*
            Ensure the service cards themselves are visible.
        */
        const cards =
            pricingSection.querySelectorAll(
                "article, " +
                ".bs-price-card, " +
                ".bs-maintenance-card, " +
                ".pricing-card"
            );


        cards.forEach(
            (card) => {

                card.hidden =
                    false;

                card.removeAttribute(
                    "hidden"
                );

                card.removeAttribute(
                    "aria-hidden"
                );

                card.classList.remove(
                    "hidden"
                );

                card.classList.remove(
                    "is-hidden"
                );
            }
        );
    }


    /* =========================================================
       SCROLL TO SERVICE SELECTION
    ========================================================= */

    function scrollToServiceSelection() {

        if (!pricingSection) {
            return;
        }


        setTimeout(
            () => {

                pricingSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            300
        );
    }


    /* =========================================================
       SERVICE CARD CLICK
    ========================================================= */

    if (pricingSection) {

        pricingSection.addEventListener(
            "click",
            (event) => {

                const card =
                    event.target.closest(
                        "article, " +
                        ".bs-price-card, " +
                        ".bs-maintenance-card, " +
                        ".pricing-card"
                    );


                if (
                    !card ||
                    !pricingSection.contains(card)
                ) {
                    return;
                }


                handleServiceSelection(
                    card
                );
            }
        );


        pricingSection.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key !== "Enter" &&
                    event.key !== " "
                ) {
                    return;
                }


                const card =
                    event.target.closest(
                        "article, " +
                        ".bs-price-card, " +
                        ".bs-maintenance-card, " +
                        ".pricing-card"
                    );


                if (
                    !card ||
                    !pricingSection.contains(card)
                ) {
                    return;
                }


                event.preventDefault();


                handleServiceSelection(
                    card
                );
            }
        );
    }


    /* =========================================================
       DETERMINE SERVICE
    ========================================================= */

    function handleServiceSelection(
        card
    ) {

        const text =
            card.textContent
                .toLowerCase()
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        let calLink = null;

        let serviceName = null;


        /*
            Full Detail first.
        */
        if (
            text.includes(
                "full detail"
            )
        ) {

            calLink =
                CAL_BOOKING_LINKS.fullDetail;

            serviceName =
                "Full Detail";
        }


        /*
            Maintenance.
        */
        else if (
            text.includes(
                "maintenance"
            )
        ) {

            calLink =
                CAL_BOOKING_LINKS.maintenance;

            serviceName =
                "Maintenance Detail";
        }


        /*
            Exterior.
        */
        else if (
            text.includes(
                "exterior"
            )
        ) {

            calLink =
                CAL_BOOKING_LINKS.exterior;

            serviceName =
                "Exterior Detail";
        }


        /*
            Interior.
        */
        else if (
            text.includes(
                "interior"
            )
        ) {

            calLink =
                CAL_BOOKING_LINKS.interior;

            serviceName =
                "Interior Detail";
        }


        if (
            !calLink
        ) {

            return;
        }


        /*
            Remove previous selected state.
        */
        pricingSection
            .querySelectorAll(
                "article, " +
                ".bs-price-card, " +
                ".bs-maintenance-card, " +
                ".pricing-card"
            )
            .forEach(
                (otherCard) => {

                    otherCard.classList.remove(
                        "is-selected"
                    );
                }
            );


        /*
            Select this service.
        */
        card.classList.add(
            "is-selected"
        );


        /*
            Load the correct Cal.com booking.
        */
        loadCalBooking(
            calLink,
            serviceName
        );
    }


    /* =========================================================
       CAL.COM
    ========================================================= */

    function loadCalBooking(
        calLink,
        serviceName
    ) {

        if (!calBooking) {

            console.error(
                "BrightSide Booking: #cal-booking not found."
            );

            return;
        }


        if (
            typeof window.Cal !==
            "function"
        ) {

            console.error(
                "BrightSide Booking: Cal.com embed script is not loaded."
            );

            return;
        }


        /*
            Show Cal.com.
        */
        showElement(
            calBooking
        );


        /*
            Clear previous booking.
        */
        calBooking.innerHTML =
            "";


        /*
            Load new booking.
        */
        window.Cal(
            "inline",
            {
                elementOrSelector:
                    "#cal-booking",

                calLink:
                    calLink,

                config: {
                    layout:
                        "month_view",

                    useSlotsViewOnSmallScreen:
                        true
                }
            }
        );


        /*
            Update heading if present.
        */
        const bookingHeading =
            document.querySelector(
                "#cal-booking-heading"
            );


        if (bookingHeading) {

            bookingHeading.textContent =
                `${serviceName} Booking`;
        }


        /*
            Scroll to Cal.com.
        */
        setTimeout(
            () => {

                calBooking.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            },
            300
        );
    }


    /* =========================================================
       AVAILABILITY BUTTON
    ========================================================= */

    if (availabilityButton) {

        availabilityButton.addEventListener(
            "click",
            () => {

                if (
                    selectedDistance ===
                    null
                ) {

                    setServiceStatus(
                        "Please select your address first.",
                        "error"
                    );

                    return;
                }


                evaluateEligibility(
                    selectedDistance
                );
            }
        );
    }


    /* =========================================================
       STATUS
    ========================================================= */

    function setServiceStatus(
        message,
        state
    ) {

        if (!serviceStatus) {
            return;
        }


        if (
            !message ||
            state === "hidden"
        ) {

            hideElement(
                serviceStatus
            );

            serviceStatus.innerHTML =
                "";

            return;
        }


        serviceStatus.className =
            `service-status ${state}`;


        serviceStatus.innerHTML =
            message;


        showElement(
            serviceStatus
        );
    }


    /* =========================================================
       VISIBILITY HELPERS
    ========================================================= */

    function showElement(
        element
    ) {

        if (!element) {
            return;
        }


        element.hidden =
            false;


        element.removeAttribute(
            "hidden"
        );


        element.removeAttribute(
            "aria-hidden"
        );


        element.classList.remove(
            "hidden"
        );


        element.classList.remove(
            "is-hidden"
        );
    }


    function hideElement(
        element
    ) {

        if (!element) {
            return;
        }


        element.hidden =
            true;
    }


    /* =========================================================
       DISTANCE CALCULATION
    ========================================================= */

    function calculateDistanceMiles(
        latitude1,
        longitude1,
        latitude2,
        longitude2
    ) {

        const earthRadiusMiles =
            3958.7613;


        const latitude1Radians =
            latitude1 *
            Math.PI /
            180;


        const latitude2Radians =
            latitude2 *
            Math.PI /
            180;


        const deltaLatitude =
            (
                latitude2 -
                latitude1
            ) *
            Math.PI /
            180;


        const deltaLongitude =
            (
                longitude2 -
                longitude1
            ) *
            Math.PI /
            180;


        const a =
            Math.sin(
                deltaLatitude / 2
            ) ** 2 +

            Math.cos(
                latitude1Radians
            ) *

            Math.cos(
                latitude2Radians
            ) *

            Math.sin(
                deltaLongitude / 2
            ) ** 2;


        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );


        return (
            earthRadiusMiles *
            c
        );
    }


    /* =========================================================
       SESSION TOKEN
    ========================================================= */

    function createSessionToken() {

        if (
            window.crypto &&
            typeof window.crypto.randomUUID ===
            "function"
        ) {

            return window.crypto.randomUUID();
        }


        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .substring(2)
        );
    }


    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    function escapeHtml(
        value
    ) {

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


    /* =========================================================
       INITIALIZATION COMPLETE
    ========================================================= */

    console.log(
        "BrightSide Booking: initialized successfully."
    );

});
