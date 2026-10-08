// ============================================
// BRIGHTSIDE DETAILING
// SHARED JAVASCRIPT
// ============================================


// ============================================
// MOBILE MENU
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

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
            document.getElementById(
                "menuButton"
            );

        const navLinks =
            document.querySelector(
                ".nav-links"
            );


        if (
            menuButton &&
            navLinks
        ) {

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
             * Close the menu when a normal
             * navigation link is selected.
             */

            navLinks
                .querySelectorAll("a")
                .forEach(
                    link => {

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

                    }
                );


            /*
             * Close the menu with Escape.
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
         * The booking page uses its own custom
         * header and therefore has its own menu.
         *
         * This section ONLY handles navigation.
         *
         * Mapbox and booking functionality are
         * handled exclusively by booking.js.
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
             * Close the booking menu after
             * selecting a navigation link.
             */

            bookingMobileMenu
                .querySelectorAll("a")
                .forEach(
                    link => {

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

                    }
                );


            /*
             * Close the booking menu with Escape.
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

    }
);


// ============================================
// BOOKING PAGE NOTE
// ============================================

/*
 * IMPORTANT
 * ----------
 *
 * There is intentionally NO booking logic in
 * this shared script.
 *
 * The booking page has its own dedicated:
 *
 *     booking.js
 *
 * booking.js is the ONLY file responsible for:
 *
 * - Mapbox
 * - Address autocomplete
 * - Address retrieval
 * - Service-area radius
 * - Eligibility
 * - Service selection
 * - Pricing
 * - Cal.com
 * - Booking-page state
 *
 * Keeping those systems in one file prevents
 * script.js and booking.js from initializing
 * separate Mapbox instances or conflicting with
 * each other's booking logic.
 */


// ============================================
// END OF SHARED JAVASCRIPT
// ============================================
