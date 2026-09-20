/* =============================================================
   BRIGHTSIDE HOUSTON DETAILING
   BOOKING PAGE
   =============================================================

   WEBSITE RESPONSIBILITIES:

   1. Search for customer's service address
   2. Retrieve the selected address through Mapbox
   3. Calculate distance from Alief Neighborhood Center
   4. Check the 20-mile service radius
   5. Show the selected location on the map
   6. Show pricing after eligibility is confirmed
   7. Load the Cal.com booking page

   CAL.COM RESPONSIBILITIES:

   - Service selection
   - Vehicle selection
   - Add-ons
   - Customer information
   - Appointment availability
   - Appointment booking
   - Confirmation

   ============================================================= */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =========================================================
           PAGE CHECK
           ========================================================= */

        const bookingPage =
            document.querySelector(
                ".booking-page"
            );


        if (!bookingPage) {
            return;
        }



        /* =========================================================
           MAPBOX CONFIGURATION
           ========================================================= */

        const MAPBOX_TOKEN =
            "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyYWV0In0.Usd3fiKRnMZq1oE6cYy1Jg";



        /* =========================================================
           SERVICE AREA CENTER
           =========================================================

           Alief Neighborhood Center
           11903 Bellaire Blvd
           Houston, TX 77072

           This is the center used for the service-area check.
        */

        const SERVICE_CENTER = {

            latitude:
                29.70254,

            longitude:
                -95.58891

        };



        /* =========================================================
           SERVICE RADIUS
           ========================================================= */

        const SERVICE_RADIUS_MILES =
            20;



        /* =========================================================
           CAL.COM BOOKING PAGE
           =========================================================*/

        const CAL_BOOKING_LINK =
            "brightsidehouston/booking";



        /* =========================================================
           ELEMENT REFERENCES
           ========================================================= */

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


        const mapContainer =
            document.getElementById(
                "map"
            );


        const serviceAreaStatus =
            document.getElementById(
                "service-area-status"
            );


        const distanceInformation =
            document.getElementById(
                "distance-information"
            );


        const distanceDisplay =
            document.getElementById(
                "distance-from-alief"
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



        /* =========================================================
           STATE
           ========================================================= */

        let map = null;

        let marker = null;

        let selectedCoordinates = null;

        let searchTimeout = null;

        let sessionToken = null;



        /* =========================================================
           REQUIRED ELEMENT CHECK
           ========================================================= */

        if (!addressInput) {

            console.error(
                "BrightSide Booking: Address input not found."
            );

            return;
        }


        if (!mapContainer) {

            console.error(
                "BrightSide Booking: Map container not found."
            );

            return;
        }



        /* =========================================================
           WAIT FOR MAPBOX
           ========================================================= */

        function waitForMapbox(
            callback
        ) {

            if (
                typeof mapboxgl !==
                "undefined"
            ) {

                callback();

                return;
            }


            setTimeout(
                () => {

                    waitForMapbox(
                        callback
                    );

                },
                100
            );

        }



        /* =========================================================
           INITIALIZE MAP
           ========================================================= */

        function initializeMap() {

            if (
                typeof mapboxgl ===
                "undefined"
            ) {

                console.error(
                    "BrightSide Booking: Mapbox GL JS did not load."
                );

                return;
            }


            if (
                !MAPBOX_TOKEN ||
                MAPBOX_TOKEN ===
                "YOUR_EXISTING_MAPBOX_PUBLIC_TOKEN"
            ) {

                console.error(
                    "BrightSide Booking: Add your Mapbox public token to booking.js."
                );

                return;
            }


            mapboxgl.accessToken =
                MAPBOX_TOKEN;


            map =
                new mapboxgl.Map({

                    container:
                        mapContainer,

                    style:
                        "mapbox://styles/mapbox/streets-v12",

                    center: [

                        SERVICE_CENTER.longitude,

                        SERVICE_CENTER.latitude

                    ],

                    zoom: 9

                });



            /* =====================================================
               MAP CONTROLS
               ===================================================== */

            map.addControl(
                new mapboxgl.NavigationControl(),
                "top-right"
            );



            /* =====================================================
               SERVICE CENTER MARKER
               ===================================================== */

            new mapboxgl.Marker()

                .setLngLat([

                    SERVICE_CENTER.longitude,

                    SERVICE_CENTER.latitude

                ])

                .addTo(map);



            /* =====================================================
               SERVICE RADIUS
               ===================================================== */

            map.on(
                "load",
                () => {

                    drawServiceRadius();

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


            const points = 96;

            const earthRadiusMiles =
                3958.8;

            const radius =
                SERVICE_RADIUS_MILES /
                earthRadiusMiles;


            const centerLatitude =
                SERVICE_CENTER.latitude *
                Math.PI /
                180;


            const centerLongitude =
                SERVICE_CENTER.longitude *
                Math.PI /
                180;


            const coordinates = [];


            for (
                let i = 0;
                i <= points;
                i++
            ) {

                const bearing =
                    (
                        2 *
                        Math.PI *
                        i
                    ) /
                    points;


                const latitude =
                    Math.asin(

                        Math.sin(
                            centerLatitude
                        ) *
                        Math.cos(
                            radius
                        )

                        +

                        Math.cos(
                            centerLatitude
                        ) *
                        Math.sin(
                            radius
                        ) *
                        Math.cos(
                            bearing
                        )

                    );


                const longitude =

                    centerLongitude +

                    Math.atan2(

                        Math.sin(
                            bearing
                        ) *
                        Math.sin(
                            radius
                        ) *
                        Math.cos(
                            centerLatitude
                        ),

                        Math.cos(
                            radius
                        )

                        -

                        Math.sin(
                            centerLatitude
                        ) *
                        Math.sin(
                            latitude
                        )

                    );


                coordinates.push([

                    longitude *
                        180 /
                        Math.PI,

                    latitude *
                        180 /
                        Math.PI

                ]);

            }


            const geojson = {

                type:
                    "Feature",

                geometry: {

                    type:
                        "Polygon",

                    coordinates: [
                        coordinates
                    ]

                }

            };



            if (
                map.getSource(
                    "service-radius"
                )
            ) {

                map.getSource(
                    "service-radius"
                ).setData(
                    geojson
                );

                return;
            }



            map.addSource(
                "service-radius",
                {

                    type:
                        "geojson",

                    data:
                        geojson

                }
            );



            map.addLayer({

                id:
                    "service-radius-fill",

                type:
                    "fill",

                source:
                    "service-radius",

                paint: {

                    "fill-opacity":
                        0.08

                }

            });



            map.addLayer({

                id:
                    "service-radius-line",

                type:
                    "line",

                source:
                    "service-radius",

                paint: {

                    "line-width":
                        2,

                    "line-opacity":
                        0.5

                }

            });

        }



        /* =========================================================
           SESSION TOKEN
           ========================================================= */

        function createSessionToken() {

            if (
                typeof crypto !==
                    "undefined" &&
                crypto.randomUUID
            ) {

                return crypto.randomUUID();

            }


            return (

                Date.now()
                    .toString(36)

                +

                Math.random()
                    .toString(36)
                    .substring(2)

            );

        }



        /* =========================================================
           ADDRESS SEARCH
           ========================================================= */

        async function getAddressSuggestions(
            query
        ) {

            if (
                !query ||
                query.trim().length < 3
            ) {

                clearSuggestions();

                return;
            }


            if (!sessionToken) {

                sessionToken =
                    createSessionToken();

            }


            const url =

                "https://api.mapbox.com/search/searchbox/v1/suggest" +

                "?q=" +
                encodeURIComponent(
                    query
                ) +

                "&language=en" +

                "&country=US" +

                "&limit=6" +

                "&session_token=" +
                encodeURIComponent(
                    sessionToken
                ) +

                "&access_token=" +
                encodeURIComponent(
                    MAPBOX_TOKEN
                );



            try {

                const response =
                    await fetch(
                        url
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        "Mapbox suggestion request failed."
                    );

                }


                const data =
                    await response.json();


                displaySuggestions(
                    data.suggestions ||
                    []
                );

            }

            catch (error) {

                console.error(
                    "BrightSide Booking: Address search error:",
                    error
                );

                clearSuggestions();

            }

        }



        /* =========================================================
           DISPLAY ADDRESS SUGGESTIONS
           ========================================================= */

        function displaySuggestions(
            suggestions
        ) {

            if (
                !suggestionsContainer
            ) {
                return;
            }


            suggestionsContainer.innerHTML =
                "";


            if (
                !suggestions.length
            ) {

                suggestionsContainer.classList.remove(
                    "visible"
                );

                return;
            }



            suggestions.forEach(
                (suggestion) => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "address-suggestion";


                    const primaryText =
                        suggestion.name ||
                        suggestion.place_formatted ||
                        "Address";


                    const secondaryText =
                        suggestion.place_formatted ||
                        "";



                    button.innerHTML = `

                        <span class="suggestion-main">

                            ${escapeHTML(
                                primaryText
                            )}

                        </span>

                        ${
                            secondaryText

                                ? `

                                    <span class="suggestion-secondary">

                                        ${escapeHTML(
                                            secondaryText
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



            suggestionsContainer.classList.add(
                "visible"
            );

        }



        /* =========================================================
           SELECT ADDRESS
           ========================================================= */

        async function selectAddress(
            suggestion
        ) {

            clearSuggestions();


            addressInput.value =
                suggestion.full_address ||
                suggestion.place_formatted ||
                suggestion.name ||
                "";


            /*
               A new address starts a fresh
               eligibility check.
            */

            resetBookingState();


            const mapboxId =
                suggestion.mapbox_id;


            if (!mapboxId) {

                setStatus(

                    "error",

                    "We couldn't verify that address.",

                    "Please try selecting one of the suggested addresses."

                );

                return;
            }


            if (!sessionToken) {

                sessionToken =
                    createSessionToken();

            }


            const url =

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
                    MAPBOX_TOKEN
                );



            try {

                const response =
                    await fetch(
                        url
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        "Mapbox retrieve request failed."
                    );

                }


                const data =
                    await response.json();


                const feature =
                    data.features &&
                    data.features[0];


                if (!feature) {

                    setStatus(

                        "error",

                        "We couldn't verify that address.",

                        "Please select another suggested address."

                    );

                    return;
                }


                const coordinates =
                    feature.geometry.coordinates;


                selectedCoordinates = {

                    longitude:
                        coordinates[0],

                    latitude:
                        coordinates[1]

                };


                const distance =
                    calculateDistanceMiles(

                        SERVICE_CENTER.latitude,

                        SERVICE_CENTER.longitude,

                        selectedCoordinates.latitude,

                        selectedCoordinates.longitude

                    );


                showSelectedLocation(
                    selectedCoordinates,
                    distance
                );


                evaluateServiceArea(
                    distance
                );


                sessionToken =
                    null;

            }

            catch (error) {

                console.error(
                    "BrightSide Booking: Address retrieval error:",
                    error
                );


                setStatus(

                    "error",

                    "We couldn't verify that address.",

                    "Please try selecting the address again."

                );

            }

        }



        /* =========================================================
           CHECK SERVICE AREA
           ========================================================= */

        function evaluateServiceArea(
            distance
        ) {

            const isEligible =
                distance <=
                SERVICE_RADIUS_MILES;



            if (isEligible) {

                serviceAreaStatus.value =
                    "eligible";


                setStatus(

                    "eligible",

                    "You're within our service area.",

                    `Your address is approximately ${distance.toFixed(
                        1
                    )} miles from our service-area center.`

                );


                if (
                    distanceInformation
                ) {

                    distanceInformation.hidden =
                        false;

                }


                if (
                    distanceDisplay
                ) {

                    distanceDisplay.textContent =
                        `${distance.toFixed(
                            1
                        )} miles`;

                }


                showPricing();


                showCalBooking();

            }

            else {

                serviceAreaStatus.value =
                    "outside";


                setStatus(

                    "outside",

                    "This address is outside our service area.",

                    `Your address is approximately ${distance.toFixed(
                        1
                    )} miles away. BrightSide currently serves locations within approximately 20 miles.`

                );


                if (
                    distanceInformation
                ) {

                    distanceInformation.hidden =
                        false;

                }


                if (
                    distanceDisplay
                ) {

                    distanceDisplay.textContent =
                        `${distance.toFixed(
                            1
                        )} miles`;

                }


                hidePricing();


                hideCalBooking();

            }

        }



        /* =========================================================
           SHOW PRICING
           ========================================================= */

        function showPricing() {

            if (!pricingSection) {
                return;
            }


            pricingSection.hidden =
                false;


            setTimeout(
                () => {

                    pricingSection.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });

                },
                250
            );

        }



        /* =========================================================
           HIDE PRICING
           ========================================================= */

        function hidePricing() {

            if (!pricingSection) {
                return;
            }


            pricingSection.hidden =
                true;

        }



        /* =========================================================
           SHOW CAL.COM
           ========================================================= */

        function showCalBooking() {

            if (!calBookingSection) {
                return;
            }


            calBookingSection.hidden =
                false;


            if (
                calBooking &&
                calBooking.dataset.loaded ===
                    "true"
            ) {

                return;

            }


            initializeCalBooking();

        }



        /* =========================================================
           HIDE CAL.COM
           ========================================================= */

        function hideCalBooking() {

            if (!calBookingSection) {
                return;
            }


            calBookingSection.hidden =
                true;


            if (calBooking) {

                calBooking.innerHTML =
                    `
                        <div class="cal-loading">
                            Booking options will appear
                            after your address is verified.
                        </div>
                    `;

                calBooking.dataset.loaded =
                    "false";

            }

        }



        /* =========================================================
           INITIALIZE CAL.COM
           ========================================================= */

        function initializeCalBooking() {

            if (!calBooking) {
                return;
            }


            if (
                calBooking.dataset.loaded ===
                    "true"
            ) {

                return;

            }



            if (
                typeof window.Cal ===
                    "undefined"
            ) {

                calBooking.innerHTML = `

                    <div class="cal-error">

                        <strong>
                            Booking system is loading...
                        </strong>

                        <p>
                            Please wait a moment.
                        </p>

                    </div>

                `;


                setTimeout(
                    initializeCalBooking,
                    1000
                );


                return;
            }



            /*
               Embed the customer's single Cal.com
               booking page.

               https://cal.com/brightsidehouston/booking
            */

            Cal(
                "inline",
                {

                    elementOrSelector:
                        "#cal-booking",

                    calLink:
                        CAL_BOOKING_LINK,

                    config: {

                        layout:
                            "month_view"

                    }

                }
            );


            calBooking.dataset.loaded =
                "true";

        }



        /* =========================================================
           RESET BOOKING STATE
           ========================================================= */

        function resetBookingState() {

            selectedCoordinates =
                null;


            serviceAreaStatus.value =
                "unchecked";


            hidePricing();


            hideCalBooking();


            if (
                distanceInformation
            ) {

                distanceInformation.hidden =
                    true;

            }


            setStatus(

                "unchecked",

                "Checking your address...",

                "Please select an address from the suggestions."

            );

        }



        /* =========================================================
           MAP MARKER
           ========================================================= */

        function showSelectedLocation(
            coordinates,
            distance
        ) {

            if (!map) {
                return;
            }


            const lngLat = [

                coordinates.longitude,

                coordinates.latitude

            ];



            if (marker) {

                marker.setLngLat(
                    lngLat
                );

            }

            else {

                marker =
                    new mapboxgl.Marker()
                        .setLngLat(
                            lngLat
                        )
                        .addTo(map);

            }



            map.flyTo({

                center:
                    lngLat,

                zoom:
                    distance <=
                    SERVICE_RADIUS_MILES
                        ? 10
                        : 9,

                duration:
                    900

            });

        }



        /* =========================================================
           STATUS DISPLAY
           ========================================================= */

        function setStatus(
            statusType,
            heading,
            message
        ) {

            if (!serviceStatus) {
                return;
            }


            let icon = "?";


            if (
                statusType ===
                "eligible"
            ) {

                icon = "✓";

            }

            else if (
                statusType ===
                "outside"
            ) {

                icon = "!";

            }

            else if (
                statusType ===
                "error"
            ) {

                icon = "!";

            }



            serviceStatus.className =
                `service-status ${statusType}`;


            serviceStatus.innerHTML = `

                <div class="status-icon">

                    ${icon}

                </div>

                <div class="status-content">

                    <strong>

                        ${escapeHTML(
                            heading
                        )}

                    </strong>

                    <p>

                        ${escapeHTML(
                            message
                        )}

                    </p>

                </div>

            `;

        }



        /* =========================================================
           ADDRESS INPUT
           ========================================================= */

        addressInput.addEventListener(
            "input",
            () => {

                resetBookingState();


                clearTimeout(
                    searchTimeout
                );


                const query =
                    addressInput.value.trim();


                if (
                    query.length < 3
                ) {

                    setStatus(

                        "unchecked",

                        "Enter your address",

                        "We'll check whether your location is within our 20-mile service area."

                    );

                }


                searchTimeout =
                    setTimeout(
                        () => {

                            getAddressSuggestions(
                                query
                            );

                        },
                        250
                    );

            }
        );



        /* =========================================================
           CLOSE SUGGESTIONS
           ========================================================= */

        document.addEventListener(
            "click",
            (event) => {

                if (

                    !addressInput.contains(
                        event.target
                    )

                    &&

                    !suggestionsContainer?.contains(
                        event.target
                    )

                ) {

                    clearSuggestions();

                }

            }
        );



        /* =========================================================
           CLEAR SUGGESTIONS
           ========================================================= */

        function clearSuggestions() {

            if (
                !suggestionsContainer
            ) {
                return;
            }


            suggestionsContainer.innerHTML =
                "";


            suggestionsContainer.classList.remove(
                "visible"
            );

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
                3958.8;


            const latitudeDifference =
                toRadians(
                    latitude2 -
                    latitude1
                );


            const longitudeDifference =
                toRadians(
                    longitude2 -
                    longitude1
                );


            const a =

                Math.sin(
                    latitudeDifference /
                    2
                ) ** 2

                +

                Math.cos(
                    toRadians(
                        latitude1
                    )
                )

                *

                Math.cos(
                    toRadians(
                        latitude2
                    )
                )

                *

                Math.sin(
                    longitudeDifference /
                    2
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



        /* =========================================================
           DEGREES → RADIANS
           ========================================================= */

        function toRadians(
            degrees
        ) {

            return (

                degrees *
                Math.PI /
                180

            );

        }



        /* =========================================================
           HTML ESCAPING
           ========================================================= */

        function escapeHTML(
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
           START MAP
           ========================================================= */

        waitForMapbox(
            initializeMap
        );

    }
);
