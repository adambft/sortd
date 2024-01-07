import './assets/main.css'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faArrowRight, faHandPointer, faListUl, faMusic, faSpinner } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library (ADD NEW ICONS HERE v) */
library.add(faSpinner, faArrowRight, faMusic, faListUl, faHandPointer, faSpotify)

import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { faSpotify } from '@fortawesome/free-brands-svg-icons'

const app = createApp(App)

app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
