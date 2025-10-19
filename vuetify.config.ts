// vuetify.config.ts
import { aliases, mdi } from 'vuetify/iconsets/mdi'
// import { md3 } from 'vuetify/blueprints' // optional

export default {
  // blueprint: md3, // optional
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  }
}
