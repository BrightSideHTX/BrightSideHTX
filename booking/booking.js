/*
    BrightSide Houston Detailing
    Booking Page JavaScript

    Handles:
    - Mapbox address search
    - 20-mile service-area eligibility
    - Pricing visibility
    - Cal.com booking embeds
    - Exterior / Interior / Full Detail / Maintenance selection
*/

document.addEventListener("DOMContentLoaded", () => {
    const bookingPage = document.querySelector(".booking-page");

    if (!bookingPage) {
        console.error("BrightSide Booking: Booking page not found.");
        return;
    }

    /* =========================================================
       CONFIGURATION
    ========================================================= */

    const MAPBOX_TOKEN = "pk.eyJ1IjoiYnJpZ2h0c2lkZWRldGFpbGluZyIsImEiOiJjbXQ5bGEzdTAwMGg0Mnlwd2M1MHlyYWV0In0.Usd3fiKRnMZq1oE6cYy1Jg";

    const SERVICE_CENTER = {
        latitude: 29.70254,
        longitude: -95.58891
    };

    const SERVICE_RADIUS_MILES = 20;

    /*
        These are the exact Cal.com booking links currently used
        by BrightSide Houston Detailing.
    */
    const CAL_BOOKING_LINKS = {
        exterior: "brightsidehouston/exterior",
        interior: "brightsidehouston/interior",
        fullDetail: "brightsidehouston/fulldetail",
        maintenance: "brightsidehouston/maintenace"
    };


    /* =========================================================
       ELEMENTS
    ========================================================= */

    const addressInput = document.querySelector("#address");
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
       BASIC VALIDATION
    ========================================================= */

    if (!addressInput) {
        console.error("BrightSide Booking: Address input not found.");
    }

    if (!mapContainer) {
        console.error("BrightSide Booking: Map container not found.");
    }

    if (!pricingSection) {
        console.error("BrightSide Booking: Pricing section not found.");
    }

    if (!calBooking) {
        console.error("BrightSide Booking: Cal.com container not found.");
    }


    /* =========================================================
       MAPBOX VARIABLES
    ========================================================= */

    let map = null;
    let mapMarker = null;

    let selectedAddress = null;
    let selectedCoordinates = null;
    let selectedDistance = null;

    let mapboxSessionToken = null;


    /* =========================================================
       INITIAL PAGE STATE
    ========================================================= */

    hidePricing();
    hideCalBooking();
    hideAvailability();


    /* =========================================================
       MAPBOX INITIALIZATION
    ========================================================= */

    if (
        typeof mapboxgl !== "undefined" &&
        mapContainer &&
        MAPBOX_TOKEN &&
        MAPBOX_TOKEN !== "YOUR_EXISTING_MAPBOX_PUBLIC_TOKEN"
    ) {
        mapboxgl.accessToken = MAPBOX_TOKEN;

        map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/streets-v12",
            center: [
                SERVICE_CENTER.longitude,
                SERVICE_CENTER.latitude
            ],
            zoom: 11
        });

        map.addControl(
            new mapboxgl.NavigationControl(),
            "top-right"
        );

        /*
            Show the BrightSide service center on the map.
        */
        new mapboxgl.Marker({
            color: "#1769aa"
        })
            .setLngLat([
                SERVICE_CENTER.longitude,
                SERVICE_CENTER.latitude
            ])
            .addTo(map);
    } else {
        console.warn(
            "BrightSide Booking: Mapbox could not be initialized. " +
            "Make sure your existing public token is in MAPBOX_TOKEN."
        );
    }


    /* =========================================================
       MAPBOX SESSION
    ========================================================= */

    function createSessionToken() {
        if (window.crypto && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        return (
            Date.now().toString(36) +
            Math.random().toString(36).substring(2)
        );
    }

    mapboxSessionToken = createSessionToken();


    /* =========================================================
       ADDRESS AUTOCOMPLETE
    ========================================================= */

    let suggestionTimeout = null;

    if (addressInput) {
        addressInput.addEventListener("input", () => {
            const query = addressInput.value.trim();

            clearTimeout(suggestionTimeout);

            selectedAddress = null;
            selectedCoordinates = null;
            selectedDistance = null;

            hidePricing();
            hideCalBooking();
            hideAvailability();

            if (suggestionsContainer) {
                suggestionsContainer.innerHTML = "";
                suggestionsContainer.hidden = true;
            }

            resetServiceStatus();

            if (query.length < 3) {
                return;
            }

            suggestionTimeout = setTimeout(() => {
                fetchAddressSuggestions(query);
            }, 250);
        });

        /*
            Pressing Enter selects the first suggestion.
        */
        addressInput.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") {
                return;
            }

            const firstSuggestion =
                suggestionsContainer?.querySelector(
                    "[data-suggestion-index='0']"
                );

            if (firstSuggestion) {
                event.preventDefault();
                firstSuggestion.click();
            }
        });
    }


    /* =========================================================
       FETCH MAPBOX SUGGESTIONS
    ========================================================= */

    async function fetchAddressSuggestions(query) {
        if (
            !MAPBOX_TOKEN ||
            MAPBOX_TOKEN === "YOUR_EXISTING_MAPBOX_PUBLIC_TOKEN"
        ) {
            return;
        }

        try {
            const url =
                "https://api.mapbox.com/search/searchbox/v1/suggest" +
                "?q=" +
                encodeURIComponent(query) +
                "&limit=5" +
                "&country=US" +
                "&language=en" +
                "&session_token=" +
                encodeURIComponent(mapboxSessionToken) +
                "&access_token=" +
                encodeURIComponent(MAPBOX_TOKEN);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Mapbox suggestions request failed: ${response.status}`
                );
            }

            const data = await response.json();

            renderSuggestions(data.suggestions || []);
        } catch (error) {
            console.error(
                "BrightSide Booking: Address suggestions failed.",
                error
            );
        }
    }


    /* =========================================================
       RENDER ADDRESS SUGGESTIONS
    ========================================================= */

    function renderSuggestions(suggestions) {
        if (!suggestionsContainer) {
            return;
        }

        suggestionsContainer.innerHTML = "";

        if (!suggestions.length) {
            suggestionsContainer.hidden = true;
            return;
        }

        suggestions.forEach((suggestion, index) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "address-suggestion";

            button.dataset.suggestionIndex = index;
            button.dataset.mapboxId = suggestion.mapbox_id || "";

            button.innerHTML = `
                <span class="address-suggestion-main">
                    ${escapeHtml(
                        suggestion.name ||
                        suggestion.full_address ||
                        suggestion.place_formatted ||
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

            button.addEventListener("click", () => {
                selectAddressSuggestion(suggestion);
            });

            suggestionsContainer.appendChild(button);
        });

        suggestionsContainer.hidden = false;
    }


    /* =========================================================
       SELECT ADDRESS
    ========================================================= */

    async function selectAddressSuggestion(suggestion) {
        if (!suggestion?.mapbox_id) {
            return;
        }

        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = "";
            suggestionsContainer.hidden = true;
        }

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
            const result = await retrieveAddress(
                suggestion.mapbox_id
            );

            if (!result) {
                throw new Error(
                    "Mapbox did not return an address."
                );
            }

            const feature =
                result.features?.[0] || result;

            const coordinates =
                feature.geometry?.coordinates;

            if (
                !coordinates ||
                coordinates.length < 2
            ) {
                throw new Error(
                    "Address coordinates were not returned."
                );
            }

            selectedAddress =
                feature.properties?.full_address ||
                feature.properties?.name ||
                addressInput.value;

            selectedCoordinates = {
                longitude: Number(coordinates[0]),
                latitude: Number(coordinates[1])
            };

            addressInput.value = selectedAddress;

            updateMap(
                selectedCoordinates.longitude,
                selectedCoordinates.latitude
            );

            selectedDistance = calculateDistanceMiles(
                SERVICE_CENTER.latitude,
                SERVICE_CENTER.longitude,
                selectedCoordinates.latitude,
                selectedCoordinates.longitude
            );

            evaluateServiceArea(selectedDistance);
        } catch (error) {
            console.error(
                "BrightSide Booking: Address retrieval failed.",
                error
            );

            selectedAddress = null;
            selectedCoordinates = null;
            selectedDistance = null;

            setServiceStatus(
                "We couldn't verify that address. Please try selecting the address again.",
                "error"
            );

            hidePricing();
            hideCalBooking();
            hideAvailability();
        }
    }


    /* =========================================================
       RETRIEVE MAPBOX ADDRESS
    ========================================================= */

    async function retrieveAddress(mapboxId) {
        const url =
            "https://api.mapbox.com/search/searchbox/v1/retrieve/" +
            encodeURIComponent(mapboxId) +
            "?session_token=" +
            encodeURIComponent(mapboxSessionToken) +
            "&access_token=" +
            encodeURIComponent(MAPBOX_TOKEN);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Mapbox retrieve request failed: ${response.status}`
            );
        }

        return response.json();
    }


    /* =========================================================
       SERVICE AREA CHECK
    ========================================================= */

    function evaluateServiceArea(distanceMiles) {
        if (distanceMiles <= SERVICE_RADIUS_MILES) {
            setServiceStatus(
                `
                    <strong>You're in our service area.</strong>
                    <span>
                        Your location is approximately
                        ${distanceMiles.toFixed(1)} miles from our service center.
                    </span>
                `,
                "eligible"
            );

            showAvailability();
            showPricing();

            /*
                Do NOT automatically load Cal.com here.

                The customer must first choose:
                - Exterior Detail
                - Interior Detail
                - Full Detail
                - Maintenance Detail

                Then the correct Cal.com booking form loads.
            */
            hideCalBooking();

            scrollToPricing();
        } else {
            setServiceStatus(
                `
                    <strong>Sorry, you're outside our service area.</strong>
                    <span>
                        We currently serve locations within approximately
                        ${SERVICE_RADIUS_MILES} miles of our service center.
                    </span>
                `,
                "ineligible"
            );

            hidePricing();
            hideCalBooking();
            hideAvailability();
        }
    }


    /* =========================================================
       MAP UPDATE
    ========================================================= */

    function updateMap(longitude, latitude) {
        if (!map) {
            return;
        }

        if (mapMarker) {
            mapMarker.remove();
        }

        mapMarker = new mapboxgl.Marker({
            color: "#1769aa"
        })
            .setLngLat([
                longitude,
                latitude
            ])
            .addTo(map);

        map.flyTo({
            center: [
                longitude,
                latitude
            ],
            zoom: 12,
            duration: 1000
        });
    }


    /* =========================================================
       CALCULATE DISTANCE
    ========================================================= */

    function calculateDistanceMiles(
        latitude1,
        longitude1,
        latitude2,
        longitude2
    ) {
        const earthRadiusMiles = 3958.7613;

        const lat1 =
            latitude1 * Math.PI / 180;

        const lat2 =
            latitude2 * Math.PI / 180;

        const deltaLatitude =
            (latitude2 - latitude1) *
            Math.PI / 180;

        const deltaLongitude =
            (longitude2 - longitude1) *
            Math.PI / 180;

        const a =
            Math.sin(deltaLatitude / 2) ** 2 +
            Math.cos(lat1) *
            Math.cos(lat2) *
            Math.sin(deltaLongitude / 2) ** 2;

        const c =
            2 *
            Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
            );

        return earthRadiusMiles * c;
    }


    /* =========================================================
       PRICING
    ========================================================= */

    function showPricing() {
        if (!pricingSection) {
            return;
        }

        pricingSection.hidden = false;
        pricingSection.removeAttribute("hidden");

        pricingSection.style.display = "";

        /*
            Make sure the detail cards are clickable.
        */
        setupPricingCards();
    }

    function hidePricing() {
        if (!pricingSection) {
            return;
        }

        pricingSection.hidden = true;
    }


    /* =========================================================
       AVAILABILITY
    ========================================================= */

    function showAvailability() {
        if (!availabilityContainer) {
            return;
        }

        availabilityContainer.hidden = false;
        availabilityContainer.removeAttribute("hidden");
    }

    function hideAvailability() {
        if (!availabilityContainer) {
            return;
        }

        availabilityContainer.hidden = true;
    }


    /* =========================================================
       CAL.COM BOOKING
    ========================================================= */

    function showCalBooking() {
        if (!calBooking) {
            return;
        }

        const calSection =
            calBooking.closest(
                "section, .booking-section, .bs-cal-section"
            );

        if (calSection) {
            calSection.hidden = false;
            calSection.removeAttribute("hidden");
        }

        calBooking.hidden = false;
        calBooking.removeAttribute("hidden");
    }

    function hideCalBooking() {
        if (!calBooking) {
            return;
        }

        const calSection =
            calBooking.closest(
                "section, .booking-section, .bs-cal-section"
            );

        if (calSection) {
            calSection.hidden = true;
        }

        calBooking.hidden = true;
    }


    /* =========================================================
       LOAD CAL.COM EVENT
    ========================================================= */

    function loadCalBooking(calLink, serviceName) {
        if (!calBooking) {
            console.error(
                "BrightSide Booking: #cal-booking was not found."
            );
            return;
        }

        if (
            typeof window.Cal === "undefined"
        ) {
            console.error(
                "BrightSide Booking: Cal.com embed script is not loaded."
            );

            setServiceStatus(
                "The booking form could not load. Please refresh the page and try again.",
                "error"
            );

            return;
        }

        /*
            Make sure the Cal.com area is visible.
        */
        showCalBooking();

        /*
            Clear the previous Cal.com event completely.
        */
        calBooking.innerHTML = "";

        /*
            Initialize the newly selected event.
        */
        try {
            window.Cal(
                "inline",
                {
                    elementOrSelector: "#cal-booking",
                    calLink: calLink,
                    config: {
                        layout: "month_view",
                        useSlotsViewOnSmallScreen: true
                    }
                }
            );

            /*
                Keep the selected service visible to the user.
            */
            const heading =
                document.querySelector(
                    "#cal-booking-heading"
                );

            if (heading) {
                heading.textContent =
                    `${serviceName} Booking`;
            }

            /*
                Scroll down to the booking form after
                the new Cal.com event is initialized.
            */
            setTimeout(() => {
                calBooking.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }, 150);

        } catch (error) {
            console.error(
                "BrightSide Booking: Cal.com failed to initialize.",
                error
            );
        }
    }


    /* =========================================================
       PRICING CARD CLICK HANDLERS
    ========================================================= */

    let pricingCardsInitialized = false;

    function setupPricingCards() {
        if (
            !pricingSection ||
            pricingCardsInitialized
        ) {
            return;
        }

        pricingCardsInitialized = true;

        /*
            IMPORTANT:

            We intentionally do NOT look for:
                data-cal-link

            This makes the script work with your existing
            pricing cards without requiring HTML changes.
        */

        pricingSection.addEventListener(
            "click",
            (event) => {
                const card =
                    event.target.closest(
                        "article, .bs-price-card, .bs-maintenance-card, .pricing-card"
                    );

                if (
                    !card ||
                    !pricingSection.contains(card)
                ) {
                    return;
                }

                handleDetailCardSelection(card);
            }
        );

        /*
            Also allow keyboard users to select a card.
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
                        "article, .bs-price-card, .bs-maintenance-card, .pricing-card"
                    );

                if (
                    !card ||
                    !pricingSection.contains(card)
                ) {
                    return;
                }

                event.preventDefault();

                handleDetailCardSelection(card);
            }
        );
    }


    /* =========================================================
       DETERMINE WHICH DETAIL WAS CLICKED
    ========================================================= */

    function handleDetailCardSelection(card) {
        const cardText =
            card.textContent
                .toLowerCase()
                .replace(/\s+/g, " ")
                .trim();

        let selectedCalLink = null;
        let selectedServiceName = null;

        /*
            Check Full Detail first because it contains
            the words "interior" and "exterior" in some
            descriptions.
        */
        if (
            cardText.includes("full detail")
        ) {
            selectedCalLink =
                CAL_BOOKING_LINKS.fullDetail;

            selectedServiceName =
                "Full Detail";
        }

        /*
            Maintenance must be checked before
            generic interior/exterior descriptions.
        */
        else if (
            cardText.includes("maintenance")
        ) {
            selectedCalLink =
                CAL_BOOKING_LINKS.maintenance;

            selectedServiceName =
                "Maintenance Detail";
        }

        else if (
            cardText.includes("exterior")
        ) {
            selectedCalLink =
                CAL_BOOKING_LINKS.exterior;

            selectedServiceName =
                "Exterior Detail";
        }

        else if (
            cardText.includes("interior")
        ) {
            selectedCalLink =
                CAL_BOOKING_LINKS.interior;

            selectedServiceName =
                "Interior Detail";
        }

        if (
            !selectedCalLink ||
            !selectedServiceName
        ) {
            console.warn(
                "BrightSide Booking: Could not determine which detail card was selected.",
                card
            );

            return;
        }

        /*
            Highlight the selected card.
        */
        document
            .querySelectorAll(
                "#pricing-section article, " +
                "#pricing-section .bs-price-card, " +
                "#pricing-section .bs-maintenance-card, " +
                "#pricing-section .pricing-card"
            )
            .forEach((otherCard) => {
                otherCard.classList.remove(
                    "is-selected"
                );
            });

        card.classList.add("is-selected");

        /*
            Load the correct Cal.com event.
        */
        loadCalBooking(
            selectedCalLink,
            selectedServiceName
        );
    }


    /* =========================================================
       SCROLL TO PRICING
    ========================================================= */

    function scrollToPricing() {
        if (!pricingSection) {
            return;
        }

        setTimeout(() => {
            pricingSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 200);
    }


    /* =========================================================
       SERVICE STATUS UI
    ========================================================= */

    function setServiceStatus(
        message,
        state
    ) {
        if (!serviceStatus) {
            return;
        }

        serviceStatus.className =
            `service-status ${state}`;

        serviceStatus.innerHTML = message;

        serviceStatus.hidden = false;
        serviceStatus.removeAttribute("hidden");
    }

    function resetServiceStatus() {
        if (!serviceStatus) {
            return;
        }

        serviceStatus.className =
            "service-status";

        serviceStatus.innerHTML = "";

        serviceStatus.hidden = true;
    }


    /* =========================================================
       ESCAPE HTML
    ========================================================= */

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =========================================================
       INITIALIZE PRICING CLICK HANDLERS
    ========================================================= */

    setupPricingCards();


    /* =========================================================
       DEBUGGING INFORMATION
    ========================================================= */

    console.log(
        "BrightSide Booking: Booking page initialized successfully."
    );

    console.log(
        "BrightSide Booking: Cal.com services available:",
        CAL_BOOKING_LINKS
    );
});
