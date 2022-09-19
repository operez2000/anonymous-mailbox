import Vue from 'vue'
import VuetifyConfirm from 'vuetify-confirm'


export default ({ app }) => {
/*  
  Vue.use(VuetifyConfirm, { 
    vuetify: app.vuetify 
  })
*/
  Vue.use(VuetifyConfirm, {
    vuetify: app.vuetify,
    buttonTrueText: 'Aceptar',
    buttonFalseText: 'Descartar',
    color: 'orange',
    icon: 'mdi-alert',
    title: 'Atención',
    width: 350,
    property: '$confirm'
  })
}
