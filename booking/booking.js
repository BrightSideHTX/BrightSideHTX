// ============================================
// BRIGHTSIDE DETAILING
// BOOKING PAGE JAVASCRIPT
// ============================================
//
// Handles ONLY:
// - Mapbox
// - Address autocomplete
// - Address retrieval
// - Service-area radius
// - Eligibility
// - Step 2 service selection
// - Cal.com booking
//
// Shared navigation is handled by script.js.
// ============================================


document.addEventListener(
    "DOMContentLoaded",
    () => {


        // ========================================
        // BOOKING PAGE CHECK
        // ========================================

        const bookingPage =
            document.querySelector(
                ".booking-page"
            );


        if (!bookingPage) {
            return;
        }


        // ========================================
        // MAPBOX CONFIGURATION
        // ========================================

        const MAPBOX_PUBLIC_TOKEN =
            "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyYWV0In0.Usd3fiKRnMZq1oE6cYy1Jg";


        const SERVICE_LAT =
            29.70254;

        const SERVICE_LNG =
            -95.58891;

        const SERVICE_RADIUS_MILES =
            20;


        // ========================================
        // CAL.COM LINKS
        // ========================================

        const CAL_BOOKING_LINKS = {

            exterior:
                "https://cal.com/brightsidehouston/exterior",

            interior:
                "https://cal.com/brightsidehouston/interior",

            full:
                "https://cal.com/brightsidehouston/fulldetail",

            maintenance:
                "https://cal.com/brightsidehouston/maintenace"

        };


        // ========================================
        // ELEMENT REFERENCES
        // ========================================

        const addressInput =
            document.getElementById(
                "address"
            );


        const suggestionsContainer =
            document.getElementById(
                "address-suggestions"
            );


        const serviceStatus =
            document.getElementById(
                "service-status"
            );


        const serviceAreaStatus =
            document.getElementById(
                "service-area-status"
            );


        const distanceInformation =
            document.getElementById(
                "distance-information"
            );


        const distanceFromAlief =
            document.getElementById(
                "distance-from-alief"
            );


        const mapContainer =
            document.getElementById(
                "map"
            );


        const pricingSection =
            document.getElementById(
                "pricing-section"
            );


        const calBookingSection =
            document.getElementById(
                "cal-booking-section"
            );


        const calBooking =
            document.getElementById(
                "cal-booking"
            );


        const calBookingTitle =
            document.getElementById(
                "cal-booking-title"
            );


        const calBookingDescription =
            document.getElementById(
                "cal-booking-description"
            );


        // ========================================
        // STATE
        // ========================================

        let map = null;

        let selectedAddress =
            null;

        let selectedService =
            null;

        let sessionToken =
            null;


        // ========================================
        // BASIC VALIDATION
        // ========================================

        if (!addressInput) {

            console.error(
                "BrightSide Booking: Address input was not found."
            );

            return;

        }


        if (!suggestionsContainer) {

            console.error(
                "BrightSide Booking: Address suggestions container was not found."
            );

            return;

        }


        // ========================================
        // MAPBOX TOKEN CHECK
        // ========================================

        if (
            !MAPBOX_PUBLIC_TOKEN ||
            MAPBOX_PUBLIC_TOKEN ===
                "YOUR_EXISTING_PUBLIC_MAPBOX_TOKEN"
        ) {

            console.error(
                "BrightSide Booking: Add your existing public Mapbox token to booking.js."
            );

        }


        // ========================================
        // SESSION TOKEN
        // ========================================

        function createSessionToken() {

            if (
                window.crypto &&
                typeof window.crypto.randomUUID ===
                    "function"
            ) {

                return window.crypto.randomUUID();

            }


            return (
                "bs-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .substring(2, 12)
            );

        }


        sessionToken =
            createSessionToken();


        // ========================================
        // MAP INITIALIZATION
        // ========================================

        function initializeMap() {

            if (
                typeof mapboxgl ===
                "undefined"
            ) {

                console.error(
                    "BrightSide Booking: Mapbox GL JS is not loaded."
                );

                return;

            }


            if (!mapContainer) {

                console.error(
                    "BrightSide Booking: Map container was not found."
                );

                return;

            }


            mapboxgl.accessToken =
                MAPBOX_PUBLIC_TOKEN;


            map =
                new mapboxgl.Map({

                    container:
                        mapContainer,

                    style:
                        "mapbox://styles/mapbox/streets-v12",

                    center: [
                        SERVICE_LNG,
                        SERVICE_LAT
                    ],

                    zoom: 9.7

                });


            map.addControl(
                new mapboxgl.NavigationControl(),
                "top-right"
            );


            map.on(
                "load",
                () => {

                    drawServiceArea();

                    addServiceCenterMarker();

                }
            );


            map.on(
                "error",
                event => {

                    console.error(
                        "BrightSide Booking: Mapbox map error.",
                        event
                    );

                }
            );

        }


        // ========================================
        // DRAW SERVICE AREA
        // ========================================

        function drawServiceArea() {

            if (!map) {
                return;
            }


            /*
             * Approximate 20-mile circle.
             *
             * The actual eligibility calculation
             * below uses the Haversine formula.
             */

            const coordinates = [];

            const earthRadiusMiles =
                3958.8;


            const radiusRadians =
                SERVICE_RADIUS_MILES /
                earthRadiusMiles;


            for (
                let i = 0;
                i <= 128;
                i++
            ) {

                const angle =
                    (
                        i / 128
                    ) *
                    Math.PI *
                    2;


                const latitude =
                    Math.asin(
                        Math.sin(
                            SERVICE_LAT *
                            Math.PI /
                            180
                        ) *
                        Math.cos(
                            radiusRadians
                        ) +
                        Math.cos(
                            SERVICE_LAT *
                            Math.PI /
                            180
                        ) *
                        Math.sin(
                            radiusRadians
                        ) *
                        Math.cos(
                            angle
                        )
                    ) *
                    180 /
                    Math.PI;


                const longitude =
                    SERVICE_LNG +
                    (
                        Math.atan2(
                            Math.sin(
                                angle
                            ) *
                            Math.sin(
                                radiusRadians
                            ) *
                            Math.cos(
                                SERVICE_LAT *
                                Math.PI /
                                180
                            ),
                            Math.cos(
                                radiusRadians
                            ) -
                            Math.sin(
                                SERVICE_LAT *
                                Math.PI /
                                180
                            ) *
                            Math.sin(
                                latitude *
                                Math.PI /
                                180
                            )
                        ) *
                        180 /
                        Math.PI
                    );


                coordinates.push(
                    [
                        longitude,
                        latitude
                    ]
                );

            }


            const serviceAreaData = {

                type:
                    "Feature",

                geometry: {

                    type:
                        "Polygon",

                    coordinates: [
                        coordinates
                    ]

                },

                properties: {}

            };


            if (
                map.getSource(
                    "brightside-service-area"
                )
            ) {

                map.getSource(
                    "brightside-service-area"
                ).setData(
                    serviceAreaData
                );

                return;

            }


            map.addSource(
                "brightside-service-area",
                {

                    type:
                        "geojson",

                    data:
                        serviceAreaData

                }
            );


            map.addLayer({

                id:
                    "brightside-service-area-fill",

                type:
                    "fill",

                source:
                    "brightside-service-area",

                paint: {

                    "fill-color":
                        "#1769aa",

                    "fill-opacity":
                        0.08

                }

            });


            map.addLayer({

                id:
                    "brightside-service-area-outline",

                type:
                    "line",

                source:
                    "brightside-service-area",

                paint: {

                    "line-color":
                        "#1769aa",

                    "line-width":
                        2,

                    "line-opacity":
                        0.65

                }

            });

        }


        // ========================================
        // SERVICE CENTER MARKER
        // ========================================

        function addServiceCenterMarker() {

            if (!map) {
                return;
            }


            const markerElement =
                document.createElement(
                    "div"
                );


            markerElement.style.width =
                "18px";


            markerElement.style.height =
                "18px";


            markerElement.style.borderRadius =
                "50%";


            markerElement.style.background =
                "#1769aa";


            markerElement.style.border =
                "3px solid white";


            markerElement.style.boxShadow =
                "0 2px 8px rgba(0,0,0,0.25)";


            new mapboxgl.Marker(
                markerElement
            )
                .setLngLat([
                    SERVICE_LNG,
                    SERVICE_LAT
                ])
                .addTo(map);

        }


        // ========================================
        // MAPBOX SEARCH
        // ========================================

        async function searchAddresses(
            query
        ) {

            const cleanQuery =
                query.trim();


            if (
                cleanQuery.length <
                3
            ) {

                hideSuggestions();

                return;

            }


            if (
                !MAPBOX_PUBLIC_TOKEN ||
                MAPBOX_PUBLIC_TOKEN ===
                    "YOUR_EXISTING_PUBLIC_MAPBOX_TOKEN"
            ) {

                console.error(
                    "BrightSide Booking: Mapbox token is missing."
                );

                return;

            }


            /*
             * Search Box API endpoint.
             *
             * We explicitly request addresses
             * and places around Houston.
             */

            const endpoint =
                "https://api.mapbox.com/search/searchbox/v1/suggest" +
                "?q=" +
                encodeURIComponent(
                    cleanQuery
                ) +
                "&types=address" +
                "&country=US" +
                "&language=en" +
                "&limit=6" +
                "&session_token=" +
                encodeURIComponent(
                    sessionToken
                ) +
                "&access_token=" +
                encodeURIComponent(
                    MAPBOX_PUBLIC_TOKEN
                );


            try {

                const response =
                    await fetch(
                        endpoint
                    );


                if (!response.ok) {

                    throw new Error(
                        "Mapbox request failed with status " +
                        response.status
                    );

                }


                const data =
                    await response.json();


                const suggestions =
                    Array.isArray(
                        data.suggestions
                    )
                        ? data.suggestions
                        : [];


                /*
                 * Mapbox can sometimes return no
                 * address suggestions if the query
                 * is too short or too broad.
                 */

                if (
                    suggestions.length ===
                    0
                ) {

                    hideSuggestions();

                    return;

                }


                showSuggestions(
                    suggestions
                );

            } catch (error) {

                console.error(
                    "BrightSide Booking: Address search failed.",
                    error
                );


                hideSuggestions();

            }

        }


        // ========================================
        // SHOW ADDRESS SUGGESTIONS
        // ========================================

        function showSuggestions(
            suggestions
        ) {

            suggestionsContainer.innerHTML =
                "";


            suggestions.forEach(
                suggestion => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "bs-address-suggestion";


                    /*
                     * Search Box API generally uses
                     * name + place_formatted.
                     *
                     * We also support address/
                     * full_address as fallbacks.
                     */

                    const mainText =
                        suggestion.name ||
                        suggestion.address ||
                        "Address";


                    const secondaryText =
                        suggestion.place_formatted ||
                        suggestion.full_address ||
                        "";


                    const main =
                        document.createElement(
                            "span"
                        );


                    main.className =
                        "bs-suggestion-main";


                    main.textContent =
                        mainText;


                    const secondary =
                        document.createElement(
                            "span"
                        );


                    secondary.className =
                        "bs-suggestion-secondary";


                    secondary.textContent =
                        secondaryText;


                    button.appendChild(
                        main
                    );


                    if (
                        secondaryText
                    ) {

                        button.appendChild(
                            secondary
                        );

                    }


                    button.addEventListener(
                        "click",
                        () => {

                            retrieveAddress(
                                suggestion
                            );

                        }
                    );


                    suggestionsContainer.appendChild(
                        button
                    );

                }
            );


            suggestionsContainer.classList.add(
                "visible"
            );

        }


        // ========================================
        // RETRIEVE SELECTED ADDRESS
        // ========================================

        async function retrieveAddress(
            suggestion
        ) {

            hideSuggestions();


            const mapboxId =
                suggestion.mapbox_id;


            if (!mapboxId) {

                console.error(
                    "BrightSide Booking: Selected address did not contain a Mapbox ID.",
                    suggestion
                );

                return;

            }


            const endpoint =
                "https://api.mapbox.com/search/searchbox/v1/retrieve/" +
                encodeURIComponent(
                    mapboxId
                ) +
                "?session_token=" +
                encodeURIComponent(
                    sessionToken
                ) +
                "&access_token=" +
                encodeURIComponent(
                    MAPBOX_PUBLIC_TOKEN
                );


            try {

                const response =
                    await fetch(
                        endpoint
                    );


                if (!response.ok) {

                    throw new Error(
                        "Mapbox retrieve request failed with status " +
                        response.status
                    );

                }


                const data =
                    await response.json();


                const feature =
                    data &&
                    Array.isArray(
                        data.features
                    )
                        ? data.features[0]
                        : null;


                if (
                    !feature ||
                    !feature.geometry ||
                    !Array.isArray(
                        feature.geometry.coordinates
                    )
                ) {

                    throw new Error(
                        "Mapbox did not return valid coordinates."
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
                        "Mapbox returned invalid coordinates."
                    );

                }


                const placeName =
                    feature.properties &&
                    (
                        feature.properties.full_address ||
                        feature.properties.name
                    );


                selectedAddress = {

                    latitude:
                        latitude,

                    longitude:
                        longitude,

                    text:
                        placeName ||
                        suggestion.name ||
                        addressInput.value

                };


                addressInput.value =
                    selectedAddress.text;


                updateMap(
                    longitude,
                    latitude
                );


                checkServiceArea(
                    latitude,
                    longitude
                );


                /*
                 * A new session token should be
                 * used after retrieving an address.
                 */

                sessionToken =
                    createSessionToken();

            } catch (error) {

                console.error(
                    "BrightSide Booking: Address retrieval failed.",
                    error
                );


                setStatus(
                    "error",
                    "Address could not be verified",
                    "Please select an address directly from the suggestions and try again."
                );

            }

        }


        // ========================================
        // UPDATE MAP
        // ========================================

        function updateMap(
            longitude,
            latitude
        ) {

            if (!map) {
                return;
            }


            map.flyTo({

                center: [
                    longitude,
                    latitude
                ],

                zoom: 13,

                speed: 1.1,

                essential: true

            });


            new mapboxgl.Marker()
                .setLngLat([
                    longitude,
                    latitude
                ])
                .addTo(map);

        }


        // ========================================
        // HAVERSINE DISTANCE
        // ========================================

        function calculateDistanceMiles(
            latitude1,
            longitude1,
            latitude2,
            longitude2
        ) {

            const earthRadiusMiles =
                3958.8;


            const lat1 =
                latitude1 *
                Math.PI /
                180;


            const lat2 =
                latitude2 *
                Math.PI /
                180;


            const deltaLat =
                (
                    latitude2 -
                    latitude1
                ) *
                Math.PI /
                180;


            const deltaLng =
                (
                    longitude2 -
                    longitude1
                ) *
                Math.PI /
                180;


            const a =
                Math.sin(
                    deltaLat / 2
                ) ** 2 +
                Math.cos(
                    lat1
                ) *
                Math.cos(
                    lat2
                ) *
                Math.sin(
                    deltaLng / 2
                ) ** 2;


            const c =
                2 *
                Math.atan2(
                    Math.sqrt(a),
                    Math.sqrt(
                        1 - a
                    )
                );


            return (
                earthRadiusMiles *
                c
            );

        }


        // ========================================
        // CHECK SERVICE AREA
        // ========================================

        function checkServiceArea(
            latitude,
            longitude
        ) {

            const distance =
                calculateDistanceMiles(
                    SERVICE_LAT,
                    SERVICE_LNG,
                    latitude,
                    longitude
                );


            const eligible =
                distance <=
                SERVICE_RADIUS_MILES;


            if (
                serviceAreaStatus
            ) {

                serviceAreaStatus.value =
                    eligible
                        ? "eligible"
                        : "outside";

            }


            if (
                distanceInformation
            ) {

                distanceInformation.hidden =
                    false;

            }


            if (
                distanceFromAlief
            ) {

                distanceFromAlief.textContent =
                    distance.toFixed(
                        1
                    ) +
                    " miles";

            }


            if (eligible) {

                setStatus(
                    "eligible",
                    "You're in our service area",
                    "Great! Your address is within approximately 20 miles of our service area."
                );


                revealPricing();

            } else {

                setStatus(
                    "outside",
                    "Outside our current service area",
                    "We're currently serving locations within approximately 20 miles of the Alief Neighborhood Center."
                );


                hidePricing();

                hideCalBooking();

            }


            return eligible;

        }


        // ========================================
        // STATUS DISPLAY
        // ========================================

        function setStatus(
            type,
            title,
            message
        ) {

            if (!serviceStatus) {
                return;
            }


            serviceStatus.classList.remove(
                "eligible",
                "outside",
                "error"
            );


            if (type) {

                serviceStatus.classList.add(
                    type
                );

            }


            const icon =
                serviceStatus.querySelector(
                    ".bs-status-icon"
                );


            const content =
                serviceStatus.querySelector(
                    ".bs-status-content"
                );


            if (icon) {

                if (
                    type ===
                    "eligible"
                ) {

                    icon.textContent =
                        "✓";

                } else if (
                    type ===
                    "outside"
                ) {

                    icon.textContent =
                        "!";

                } else if (
                    type ===
                    "error"
                ) {

                    icon.textContent =
                        "!";

                } else {

                    icon.textContent =
                        "?";

                }

            }


            if (content) {

                content.innerHTML =
                    "";


                const strong =
                    document.createElement(
                        "strong"
                    );


                strong.textContent =
                    title;


                const paragraph =
                    document.createElement(
                        "p"
                    );


                paragraph.textContent =
                    message;


                content.appendChild(
                    strong
                );


                content.appendChild(
                    paragraph
                );

            }

        }


        // ========================================
        // REVEAL PRICING / STEP 2
        // ========================================

        function revealPricing() {

            if (!pricingSection) {

                console.error(
                    "BrightSide Booking: #pricing-section was not found."
                );

                return;

            }


            pricingSection.hidden =
                false;


            /*
             * Make sure Step 2 is actually
             * visible after eligibility.
             */

            pricingSection.style.display =
                "";


            /*
             * Only scroll automatically if
             * the pricing section is below
             * the current viewport.
             */

            setTimeout(
                () => {

                    pricingSection.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });

                },
                150
            );

        }


        function hidePricing() {

            if (!pricingSection) {
                return;
            }


            pricingSection.hidden =
                true;

        }


        // ========================================
        // SERVICE CARD SELECTION
        // ========================================

        /*
         * Event delegation is intentional here.
         *
         * Instead of relying on a NodeList that
         * might be created before the pricing
         * section is revealed, we listen on the
         * document and detect the actual card
         * that was clicked.
         */

        document.addEventListener(
            "click",
            event => {

                const serviceCard =
                    event.target.closest(
                        "[data-service]"
                    );


                if (!serviceCard) {
                    return;
                }


                if (
                    !pricingSection ||
                    !pricingSection.contains(
                        serviceCard
                    )
                ) {

                    return;

                }


                const service =
                    serviceCard.getAttribute(
                        "data-service"
                    );


                if (
                    !CAL_BOOKING_LINKS[
                        service
                    ]
                ) {

                    console.error(
                        "BrightSide Booking: No Cal.com link exists for service:",
                        service
                    );

                    return;

                }


                selectService(
                    service,
                    serviceCard
                );

            }
        );


        // ========================================
        // KEYBOARD SERVICE SELECTION
        // ========================================

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                        "Enter" &&
                    event.key !==
                        " "
                ) {

                    return;

                }


                const serviceCard =
                    event.target.closest(
                        "[data-service]"
                    );


                if (!serviceCard) {
                    return;
                }


                if (
                    !pricingSection ||
                    !pricingSection.contains(
                        serviceCard
                    )
                ) {

                    return;

                }


                event.preventDefault();


                const service =
                    serviceCard.getAttribute(
                        "data-service"
                    );


                if (
                    !CAL_BOOKING_LINKS[
                        service
                    ]
                ) {

                    return;

                }


                selectService(
                    service,
                    serviceCard
                );

            }
        );


        // ========================================
        // SELECT SERVICE
        // ========================================

        function selectService(
            service,
            selectedCard
        ) {

            if (!isEligible()) {

                return;

            }


            selectedService =
                service;


            /*
             * Remove selected state from all
             * service cards.
             */

            document
                .querySelectorAll(
                    "#pricing-section [data-service]"
                )
                .forEach(
                    card => {

                        card.classList.remove(
                            "selected"
                        );


                        card.setAttribute(
                            "aria-pressed",
                            "false"
                        );

                    }
                );


            /*
             * Highlight the selected card.
             */

            if (selectedCard) {

                selectedCard.classList.add(
                    "selected"
                );


                selectedCard.setAttribute(
                    "aria-pressed",
                    "true"
                );

            }


            renderCalBooking();

        }


        // ========================================
        // ELIGIBILITY STATE
        // ========================================

        function isEligible() {

            return (
                serviceAreaStatus &&
                serviceAreaStatus.value ===
                    "eligible"
            );

        }


        // ========================================
        // CAL.COM BOOKING
        // ========================================

        function renderCalBooking() {

            if (
                !calBookingSection ||
                !calBooking
            ) {

                console.error(
                    "BrightSide Booking: Cal.com booking container was not found."
                );

                return;

            }


            if (!selectedService) {
                return;
            }


            const bookingLink =
                CAL_BOOKING_LINKS[
                    selectedService
                ];


            if (!bookingLink) {
                return;
            }


            /*
             * Clear the previous Cal.com
             * embed before loading another
             * service.
             */

            calBooking.innerHTML =
                "";


            /*
             * Update Step 3 heading.
             */

            const serviceNames = {

                exterior:
                    "Exterior Detail",

                interior:
                    "Interior Detail",

                full:
                    "Full Detail",

                maintenance:
                    "Maintenance Detail"

            };


            const serviceName =
                serviceNames[
                    selectedService
                ] ||
                "Detail";


            if (
                calBookingTitle
            ) {

                calBookingTitle.textContent =
                    "Book Your " +
                    serviceName;

            }


            if (
                calBookingDescription
            ) {

                calBookingDescription.textContent =
                    "Complete your booking below. Choose your vehicle, add-ons, and available weekend appointment through Cal.com.";

            }


            /*
             * Create the Cal.com embed
             * container.
             */

            const embed =
                document.createElement(
                    "div"
                );


            embed.style.width =
                "100%";


            embed.style.minHeight =
                "700px";


            embed.setAttribute(
                "data-cal-link",
                bookingLink.replace(
                    "https://cal.com/",
                    ""
                )
            );


            embed.setAttribute(
                "data-cal-origin",
                "https://cal.com"
            );


            embed.setAttribute(
                "data-cal-config",
                JSON.stringify({
                    layout: "month_view"
                })
            );


            calBooking.appendChild(
                embed
            );


            /*
             * Show Step 3.
             */

            calBookingSection.hidden =
                false;


            calBookingSection.style.display =
                "";


            /*
             * Initialize Cal.com.
             *
             * The embed script is already loaded
             * in booking.html. If it is ready,
             * refresh the embed. Otherwise load
             * it once.
             */

            initializeCalEmbed(
                embed
            );


            setTimeout(
                () => {

                    calBookingSection.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });

                },
                150
            );

        }


        // ========================================
        // INITIALIZE CAL.COM EMBED
        // ========================================

        function initializeCalEmbed(
            embed
        ) {

            if (
                typeof window.Cal ===
                "function"
            ) {

                try {

                    window.Cal(
                        "inline",
                        {
                            elementOrSelector:
                                embed,

                            calLink:
                                embed.getAttribute(
                                    "data-cal-link"
                                ),

                            config:
                                {
                                    layout:
                                        "month_view"
                                }

                        }
                    );

                    return;

                } catch (error) {

                    console.warn(
                        "BrightSide Booking: Cal.com inline initialization failed. Retrying with embed reload.",
                        error
                    );

                }

            }


            /*
             * If Cal.com isn't ready yet, wait
             * briefly and try again.
             */

            let attempts =
                0;


            const retry =
                setInterval(
                    () => {

                        attempts++;


                        if (
                            typeof window.Cal ===
                            "function"
                        ) {

                            clearInterval(
                                retry
                            );


                            try {

                                window.Cal(
                                    "inline",
                                    {

                                        elementOrSelector:
                                            embed,

                                        calLink:
                                            embed.getAttribute(
                                                "data-cal-link"
                                            ),

                                        config:
                                            {
                                                layout:
                                                    "month_view"
                                            }

                                    }
                                );

                            } catch (
                                error
                            ) {

                                console.error(
                                    "BrightSide Booking: Cal.com could not be initialized.",
                                    error
                                );

                            }

                        }


                        if (
                            attempts >=
                            20
                        ) {

                            clearInterval(
                                retry
                            );


                            console.error(
                                "BrightSide Booking: Cal.com embed script was not ready."
                            );

                        }

                    },
                    250
                );

        }


        // ========================================
        // HIDE CAL.COM
        // ========================================

        function hideCalBooking() {

            selectedService =
                null;


            if (
                calBookingSection
            ) {

                calBookingSection.hidden =
                    true;

            }


            if (
                calBooking
            ) {

                calBooking.innerHTML =
                    "";

            }


            document
                .querySelectorAll(
                    "#pricing-section [data-service]"
                )
                .forEach(
                    card => {

                        card.classList.remove(
                            "selected"
                        );


                        card.setAttribute(
                            "aria-pressed",
                            "false"
                        );

                    }
                );

        }


        // ========================================
        // HIDE SUGGESTIONS
        // ========================================

        function hideSuggestions() {

            suggestionsContainer.classList.remove(
                "visible"
            );


            suggestionsContainer.innerHTML =
                "";

        }


        // ========================================
        // ADDRESS INPUT
        // ========================================

        let searchTimer =
            null;


        addressInput.addEventListener(
            "input",
            () => {

                const value =
                    addressInput.value.trim();


                /*
                 * Typing a new address invalidates
                 * the previously selected address.
                 */

                selectedAddress =
                    null;


                if (
                    serviceAreaStatus
                ) {

                    serviceAreaStatus.value =
                        "unchecked";

                }


                hidePricing();

                hideCalBooking();


                setStatus(
                    "",
                    "Enter your address",
                    "Select your address from the suggestions and we'll check your service eligibility."
                );


                clearTimeout(
                    searchTimer
                );


                if (
                    value.length <
                    3
                ) {

                    hideSuggestions();

                    return;

                }


                searchTimer =
                    setTimeout(
                        () => {

                            searchAddresses(
                                value
                            );

                        },
                        300
                    );

            }
        );


        // ========================================
        // ADDRESS KEYBOARD HANDLING
        // ========================================

        addressInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    hideSuggestions();

                }

            }
        );


        // ========================================
        // CLICK OUTSIDE SUGGESTIONS
        // ========================================

        document.addEventListener(
            "click",
            event => {

                if (
                    !event.target.closest(
                        ".bs-address-input-wrapper"
                    )
                ) {

                    hideSuggestions();

                }

            }
        );


        // ========================================
        // RESET LOCATION
        // ========================================

        function resetLocation() {

            selectedAddress =
                null;

            selectedService =
                null;


            if (
                serviceAreaStatus
            ) {

                serviceAreaStatus.value =
                    "unchecked";

            }


            if (
                distanceInformation
            ) {

                distanceInformation.hidden =
                    true;

            }


            if (
                distanceFromAlief
            ) {

                distanceFromAlief.textContent =
                    "—";

            }


            if (
                pricingSection
            ) {

                pricingSection.hidden =
                    true;

            }


            if (
                calBookingSection
            ) {

                calBookingSection.hidden =
                    true;

            }


            if (
                calBooking
            ) {

                calBooking.innerHTML =
                    "";

            }


            setStatus(
                "",
                "Enter your address",
                "Select your address from the suggestions and we'll check your service eligibility."
            );

        }


        // ========================================
        // INITIALIZE
        // ========================================

        resetLocation();


        /*
         * Start Mapbox after the DOM is ready.
         */

        initializeMap();


        console.log(
            "BrightSide Booking: initialized successfully."
        );

    }
);
