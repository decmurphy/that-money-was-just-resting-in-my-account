module.exports = {
    important: "#f",
    content: [
        './src/**/*.html',
        './src/**/*.ts'
    ],
    safelist: [
        // these classes are generated dynamically so JIT won't notice they're there
        {
            pattern: /text-(lox|lh2|ch4|srb|rp1|vehicle)-(flight-club)/,
        }
    ],
    theme: {
        fontFamily: {
            'sans': ['Josefin Sans'],
            'mono': ['Anonymous Pro'],
            'heading': ['Montserrat']
        },
        extend: {
            colors: {

                accent: '#f5b65b',

                noche: {
                    50: '#e4e7eb',
                    100: '#bcc4cc',
                    200: '#909cab',
                    300: '#637489',
                    400: '#41576f',
                    500: '#203956',
                    600: '#1c334f',
                    700: '#182c45',
                    800: '#13243c',
                    900: '#0b172b'
                },

                lox: {
                    'flight-club': '#45A0FF'
                },
                lh2: {
                    'flight-club': '#FF9A00'
                },
                ch4: {
                    'flight-club': '#A462FF'
                },
                srb: {
                    'flight-club': '#F6E05E'
                },
                rp1: {
                    'flight-club': '#71B844'
                },
                vehicle: {
                    'flight-club': '#ffffff'
                },

                google: '#4285F4',
                patreon: '#f96854',

            },
            fill: theme => ({
                'white': theme('colors.white'),
                'accent-500': theme('colors.accent')
            }),
            transitionProperty: {
                'opacity-transform': 'opacity, transform',
                'opacity-colors': 'opacity, background-color, border-color, color, fill, stroke'
            },
            transitionDuration: {
                '3000': '3000ms'
            }
        },
    },
    plugins: [
    ]
}
