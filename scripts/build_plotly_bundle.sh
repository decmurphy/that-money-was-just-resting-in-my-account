#!/bin/bash

#   https://github.com/plotly/plotly.js/blob/master/CUSTOM_BUNDLE.md

#   This is great! Could probably go even better by having one file for scatter and another for contour
#   Then would need to extend plotly.service and have a
#       * plotly.scatter.service
#       * plotly.contour.service
#   each one importing the appropriate plotly dist. Then I'd also need to have separate components for
#       * contour-plot
#       * scatter-plot
#   instead of just chart-2d

cd node_modules/plotly.js
npm i
npm run custom-bundle -- --out tmwjrima --traces scatter --transforms none
npm run custom-bundle -- --out tmwjrima --traces scatter --transforms none --unminified
