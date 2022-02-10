module.exports = {
    important: "#f",
    content: ["./src/**/*.html", "./src/**/*.ts"],
    safelist: [],
    theme: {
        fontFamily: {
            sans: ["Quicksand"],
            mono: ["Anonymous Pro"],
            heading: ["Montserrat"],
        },
        extend: {
            transitionProperty: {
                "opacity-colors":
                    "opacity, background-color, border-color, color, fill, stroke",
            },
            transitionDuration: {
                3000: "3000ms",
            },
        },
    },
    plugins: [],
};
