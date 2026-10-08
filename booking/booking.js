/*
    ============================================================
    BRIGHTSIDE HOUSTON DETAILING
    BOOKING PAGE JAVASCRIPT
    ============================================================

    This file handles:

    1. Mapbox map
    2. 20-mile BrightSide service radius
    3. Address autocomplete
    4. Address retrieval
    5. Service-area eligibility
    6. Pricing visibility
    7. Cal.com booking selection
    8. Exterior / Interior / Full Detail / Maintenance booking

    SERVICE CENTER:
    Alief Neighborhood Center
    11903 Bellaire Blvd
    Houston, TX 77072

    SERVICE RADIUS:
    20 miles

    IMPORTANT:
    Keep your existing Mapbox PUBLIC token below.
*/


document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       CONFIGURATION
    ========================================================= */

    /*
        KEEP YOUR EXISTING MAPBOX PUBLIC TOKEN HERE.

        Do NOT use a secret Mapbox token in frontend code.
    */
    const MAPBOX_TOKEN = "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyYWV0In0.Usd3fiKRnMZq1oE6cYy1Jg";


    /*
        BrightSide service center.
    */
    const SERVICE_CENTER = {
        latitude: 29.70254,
        longitude: -95.58891
    };


    /*
        BrightSide service radius.
    */
    const SERVICE_RADIUS_MILES = 20;


    /*
        Exact Cal.com event links.
    */
    const CAL_BOOKING_LINKS = {
        exterior: "brightsidehouston/exterior",
        interior: "brightsidehouston/interior",
        fullDetail: "brightsidehouston/fulldetail",
        maintenance: "brightsidehouston/maintenace"
    };


    /* =========================================================
       PAGE ELEMENTS
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

    const pricingSection =
        document.querySelector("#pricing-section");

    const calBooking =
        document.querySelector("#cal-booking");


    /* =========================================================
       BASIC PAGE CHECK
    ========================================================= */

    if (!bookingPage) {
        console.error(
            "BrightSide Booking: .booking-page was not found."
        );

        return;
    }


    /* =========================================================
       MAPBOX STATE
    ========================================================= */

    let map = null;

    let serviceCenterMarker = null;

    let customerMarker = null;

    let selectedAddress = null;

    let selectedCoordinates = null;

    let selectedDistance = null;

    let searchSessionToken = createSessionToken();

    let suggestionTimeout = null;


    /* =========================================================
       INITIAL PAGE STATE
    ========================================================= */

    hideElement(pricingSection);

    hideElement(calBooking);

    hideElement(availabilityContainer);

    hideElement(suggestionsContainer);


    /* =========================================================
       INITIALIZE MAPBOX
    ========================================================= */

    initializeMap();


    function initializeMap() {

        if (!mapContainer) {
            console.error(
                "BrightSide Booking: #map was not found."
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
            MAPBOX_TOKEN === "YOUR_EXISTING_MAPBOX_PUBLIC_TOKEN"
        ) {
            console.error(
                "BrightSide Booking: Add your existing Mapbox public token."
            );

            setServiceStatus(
                "The map could not connect to Mapbox. Please check the Mapbox token.",
                "error"
            );

            return;
        }


        mapboxgl.accessToken = MAPBOX_TOKEN;


        /*
            Create the map immediately.

            The map is centered around the BrightSide service
            center so the user does not have to wait for an
            address search before seeing the service area.
        */
        map = new mapboxgl.Map({
            container: mapContainer,
            style: "mapbox://styles/mapbox/streets-v12",

            center: [
                SERVICE_CENTER.longitude,
                SERVICE_CENTER.latitude
            ],

            zoom: 10.5,

            attributionControl: true
        });


        /*
            Navigation controls.
        */
        map.addControl(
            new mapboxgl.NavigationControl(),
            "top-right"
        );


        /*
            Once the Mapbox style has completely loaded,
            immediately draw the 20-mile service area.
        */
        map.once("load", () => {

            drawServiceRadius();

            addServiceCenterMarker();

            /*
                Fit the map to the entire 20-mile radius.
            */
            fitMapToServiceRadius();

        });


        /*
            Catch Mapbox loading errors instead of leaving
            the user with an empty map.
        */
        map.on("error", (event) => {

            console.error(
                "BrightSide Booking: Mapbox error:",
                event?.error || event
            );

        });
    }


    /* =========================================================
       CREATE 20-MILE SERVICE RADIUS
    ========================================================= */

    function drawServiceRadius() {

        if (!map) {
            return;
        }


        /*
            Create a GeoJSON polygon approximating a circle.

            96 points gives the radius a smooth appearance
            without unnecessarily increasing the amount of
            geometry rendered by Mapbox.
        */
        const radiusPolygon =
            createCirclePolygon(
                SERVICE_CENTER.longitude,
                SERVICE_CENTER.latitude,
                SERVICE_RADIUS_MILES,
                96
            );


        /*
            If the source already exists, update it.
        */
        if (map.getSource("brightside-service-radius")) {

            map.getSource(
                "brightside-service-radius"
            ).setData(radiusPolygon);

            return;
        }


        /*
            Add the radius as a GeoJSON source.
        */
        map.addSource(
            "brightside-service-radius",
            {
                type: "geojson",
                data: radiusPolygon
            }
        );


        /*
            Transparent blue fill.
        */
        map.addLayer({
            id: "brightside-service-radius-fill",

            type: "fill",

            source: "brightside-service-radius",

            paint: {
                "fill-color": "#1769aa",
                "fill-opacity": 0.10
            }
        });


        /*
            Blue radius outline.
        */
        map.addLayer({
            id: "brightside-service-radius-outline",

            type: "line",

            source: "brightside-service-radius",

            paint: {
                "line-color": "#1769aa",
                "line-width": 2,
                "line-opacity": 0.85
            }
        });
    }


    /* =========================================================
       CREATE CIRCLE POLYGON
    ========================================================= */

    function createCirclePolygon(
        longitude,
        latitude,
        radiusMiles,
        points
    ) {

        const coordinates = [];

        /*
            Approximate Earth radius.
        */
        const earthRadiusMiles = 3958.7613;


        /*
            Convert radius from miles to angular distance.
        */
        const angularDistance =
            radiusMiles / earthRadiusMiles;


        const latitudeRadians =
            latitude * Math.PI / 180;

        const longitudeRadians =
            longitude * Math.PI / 180;


        for (
            let index = 0;
            index <= points;
            index++
        ) {

            const bearing =
                (index / points) *
                2 *
                Math.PI;


            const newLatitude =
                Math.asin(
                    Math.sin(latitudeRadians) *
                    Math.cos(angularDistance) +

                    Math.cos(latitudeRadians) *
                    Math.sin(angularDistance) *
                    Math.cos(bearing)
                );


            const newLongitude =
                longitudeRadians +

                Math.atan2(
                    Math.sin(bearing) *
                    Math.sin(angularDistance) *
                    Math.cos(latitudeRadians),

                    Math.cos(angularDistance) -
                    Math.sin(latitudeRadians) *
                    Math.sin(newLatitude)
                );


            coordinates.push([
                newLongitude * 180 / Math.PI,
                newLatitude * 180 / Math.PI
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
       ADD SERVICE CENTER MARKER
    ========================================================= */

    function addServiceCenterMarker() {

        if (!map) {
            return;
        }


        if (serviceCenterMarker) {
            serviceCenterMarker.remove();
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
       FIT MAP TO 20-MILE RADIUS
    ========================================================= */

    function fitMapToServiceRadius() {

        if (!map) {
            return;
        }


        const radius =
            SERVICE_RADIUS_MILES;


        /*
            Rough latitude conversion.
        */
        const latitudeOffset =
            radius / 69;


        /*
            Longitude conversion depends on latitude.
        */
        const longitudeOffset =
            radius /
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


                /*
                    A new search means the previous
                    eligibility result is no longer valid.
                */
                selectedAddress = null;

                selectedCoordinates = null;

                selectedDistance = null;


                hideElement(pricingSection);

                hideElement(calBooking);

                hideElement(availabilityContainer);


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


                /*
                    Wait briefly before sending a request.

                    This prevents a request on every single
                    keystroke while the user is typing.
                */
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


        /*
            Enter selects the first suggestion.
        */
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
       MAPBOX ADDRESS SUGGESTIONS
    ========================================================= */

    async function fetchSuggestions(
        query
    ) {

        if (
            !MAPBOX_TOKEN ||
            MAPBOX_TOKEN ===
                "YOUR_EXISTING_MAPBOX_PUBLIC_TOKEN"
        ) {
            return;
        }


        try {

            const url =
                "https://api.mapbox.com/search/searchbox/v1/suggest" +

                "?q=" +
                encodeURIComponent(query) +

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
                    `Mapbox suggest request failed: ${response.status}`
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


                const primaryText =
                    suggestion.name ||
                    suggestion.full_address ||
                    "Address";


                const secondaryText =
                    suggestion.place_formatted ||
                    "";


                button.innerHTML = `
                    <span class="address-suggestion-main">
                        ${escapeHtml(primaryText)}
                    </span>

                    ${
                        secondaryText
                            ? `
                                <span class="address-suggestion-secondary">
                                    ${escapeHtml(secondaryText)}
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
            !suggestion ||
            !suggestion.mapbox_id
        ) {
            return;
        }


        hideElement(
            suggestionsContainer
        );


        /*
            Display the selected address immediately.
        */
        addressInput.value =
            suggestion.full_address ||
            suggestion.place_formatted ||
            suggestion.name ||
            "";


        setServiceStatus(
            "Checking your service area...",
            "checking"
        );


        /*
            Clear old booking/pricing state.
        */
        hideElement(pricingSection);

        hideElement(calBooking);

        hideElement(availabilityContainer);


        try {

            const data =
                await retrieveAddress(
                    suggestion.mapbox_id
                );


            const feature =
                data?.features?.[0];


            if (!feature) {

                throw new Error(
                    "No address feature returned."
                );
            }


            const coordinates =
                feature.geometry?.coordinates;


            if (
                !coordinates ||
                coordinates.length < 2
            ) {

                throw new Error(
                    "No coordinates returned for address."
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


            if (
                !Number.isFinite(longitude) ||
                !Number.isFinite(latitude)
            ) {

                throw new Error(
                    "Invalid address coordinates."
                );
            }


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
                Calculate eligibility immediately.
            */
            selectedDistance =
                calculateDistanceMiles(
                    SERVICE_CENTER.latitude,
                    SERVICE_CENTER.longitude,

                    latitude,
                    longitude
                );


            /*
                Put customer's location on map.
            */
            showCustomerLocation(
                longitude,
                latitude
            );


            /*
                Zoom to show both the service center
                and the customer's address.
            */
            fitMapToCustomerAndServiceCenter(
                longitude,
                latitude
            );


            /*
                MOST IMPORTANT PART:

                Determine eligibility immediately after
                coordinates are retrieved.
            */
            evaluateEligibility(
                selectedDistance
            );


        } catch (error) {

            console.error(
                "BrightSide Booking: Address retrieval failed.",
                error
            );


            selectedAddress = null;

            selectedCoordinates = null;

            selectedDistance = null;


            setServiceStatus(
                "We couldn't verify that address. Please select an address from the suggestions.",
                "error"
            );


            hideElement(pricingSection);

            hideElement(calBooking);

            hideElement(availabilityContainer);
        }
    }


    /* =========================================================
       RETRIEVE SELECTED ADDRESS
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
                `Mapbox retrieve request failed: ${response.status}`
            );
        }


        const data =
            await response.json();


        /*
            A completed suggest/retrieve session should
            receive a fresh token for the next search.
        */
        searchSessionToken =
            createSessionToken();


        return data;
    }


    /* =========================================================
       CUSTOMER LOCATION MARKER
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
       FIT MAP TO CUSTOMER + SERVICE CENTER
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

        const roundedDistance =
            distanceMiles.toFixed(1);


        if (
            distanceMiles <=
            SERVICE_RADIUS_MILES
        ) {

            /*
                CUSTOMER IS ELIGIBLE
            */

            setServiceStatus(
                `
                    <div class="service-status-content">
                        <strong>
                            You're in our service area.
                        </strong>

                        <span>
                            Your address is approximately
                            ${roundedDistance} miles
                            from our service center.
                        </span>

                        <span>
                            You can continue below to choose your detail.
                        </span>
                    </div>
                `,
                "eligible"
            );


            showElement(
                availabilityContainer
            );


            showElement(
                pricingSection
            );


            /*
                IMPORTANT:
                Cal.com does NOT automatically open.

                Customer chooses their service first.
            */
            hideElement(
                calBooking
            );


            /*
                Scroll to pricing so the customer immediately
                sees what to do next.
            */
            setTimeout(
                () => {

                    if (pricingSection) {

                        pricingSection.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                },
                250
            );


        } else {

            /*
                CUSTOMER IS OUTSIDE SERVICE AREA
            */

            setServiceStatus(
                `
                    <div class="service-status-content">
                        <strong>
                            Sorry, you're outside our service area.
                        </strong>

                        <span>
                            Your address is approximately
                            ${roundedDistance} miles
                            from our service center.
                        </span>

                        <span>
                            BrightSide currently serves locations
                            within approximately
                            ${SERVICE_RADIUS_MILES} miles.
                        </span>
                    </div>
                `,
                "ineligible"
            );


            hideElement(
                availabilityContainer
            );


            hideElement(
                pricingSection
            );


            hideElement(
                calBooking
            );
        }
    }


    /* =========================================================
       PRICING CARD SELECTION
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


                handlePricingCardClick(
                    card
                );
            }
        );


        /*
            Keyboard support.
        */
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


                handlePricingCardClick(
                    card
                );
            }
        );
    }


    /* =========================================================
       DETERMINE SELECTED SERVICE
    ========================================================= */

    function handlePricingCardClick(
        card
    ) {

        const text =
            card.textContent
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();


        let calLink = null;

        let serviceName = null;


        /*
            FULL DETAIL FIRST.

            This must be checked first because the Full Detail
            description may contain the words "interior" and
            "exterior".
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
            MAINTENANCE
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
            EXTERIOR
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
            INTERIOR
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


        /*
            If this isn't one of the four service cards,
            don't do anything.
        */
        if (
            !calLink ||
            !serviceName
        ) {

            return;
        }


        /*
            Remove previous selection.
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
            Mark current card as selected.
        */
        card.classList.add(
            "is-selected"
        );


        /*
            Load the correct Cal.com form.
        */
        loadCalBooking(
            calLink,
            serviceName
        );
    }


    /* =========================================================
       LOAD CAL.COM
    ========================================================= */

    function loadCalBooking(
        calLink,
        serviceName
    ) {

        if (!calBooking) {

            console.error(
                "BrightSide Booking: #cal-booking was not found."
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


            setServiceStatus(
                "The booking form could not load. Please refresh the page.",
                "error"
            );


            return;
        }


        /*
            Show booking section.
        */
        showElement(
            calBooking
        );


        /*
            Remove the previous Cal.com embed.
        */
        calBooking.innerHTML = "";


        /*
            Load selected Cal.com event.
        */
        try {

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
                Optional heading if the HTML contains it.
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
                Scroll to booking form.
            */
            setTimeout(
                () => {

                    calBooking.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                },
                250
            );


        } catch (error) {

            console.error(
                "BrightSide Booking: Cal.com initialization failed.",
                error
            );

        }
    }


    /* =========================================================
       AVAILABILITY
    ========================================================= */

    /*
        The old availability button should no longer be
        responsible for checking the address.

        Address selection itself now performs the check.
    */

    if (availabilityButton) {

        availabilityButton.addEventListener(
            "click",
            () => {

                if (
                    selectedDistance === null
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
       STATUS DISPLAY
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

            serviceStatus.innerHTML = "";

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
       SHOW / HIDE HELPERS
    ========================================================= */

    function showElement(
        element
    ) {

        if (!element) {
            return;
        }


        element.hidden = false;

        element.removeAttribute(
            "hidden"
        );


        /*
            Only remove an inline display:none.
        */
        if (
            element.style.display ===
            "none"
        ) {

            element.style.display = "";
        }
    }


    function hideElement(
        element
    ) {

        if (!element) {
            return;
        }


        element.hidden = true;
    }


    /* =========================================================
       HAVERSINE DISTANCE
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
       FINAL SETUP
    ========================================================= */

    console.log(
        "BrightSide Booking initialized."
    );

    console.log(
        `Service radius: ${SERVICE_RADIUS_MILES} miles`
    );

});
