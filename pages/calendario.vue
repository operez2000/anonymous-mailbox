<template>

  <v-layout>
    <v-flex>
      <v-sheet height="500">
        <v-toolbar color="primary" dark flat>
          <v-toolbar-title>Calendarización de Órdenes - (Fecha prometida)</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-title>{{ mesEjercicio }}</v-toolbar-title>
          <v-toolbar-side-icon>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn out icon small v-on="on" @click="cambiaMes('anterior')">
                  <v-icon>keyboard_arrow_left</v-icon>
                </v-btn>                
              </template>
              <span>Mes anterior</span>
            </v-tooltip>
          </v-toolbar-side-icon>
          <v-toolbar-side-icon>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn out icon small v-on="on" @click="cambiaMes('siguiente')">
                  <v-icon>keyboard_arrow_right</v-icon>
                </v-btn>                
              </template>
              <span>Mes siguiente</span>
            </v-tooltip>
          </v-toolbar-side-icon>
        </v-toolbar>

        <br>

        <v-calendar
          :value="today"
          :now="now"
          color="primary"
        >
          <template v-slot:day="{ date }">
            <template v-for="event in ordenesMap[date]">
              <v-menu
                :key="event.ordenes"
                v-model="event.open"
                full-width
                offset-x
              >
                <template v-slot:activator="{ on }">
                  <div
                    v-if="!event.time"
                    v-ripple
                    class="my-event"
                    v-on="on"
                    v-html="event.ordenes + ((parseInt(event.ordenes) > 1) ? ' Ordenes ' : ' Orden')"
                    @click="editaDia(event)"
                  ></div>
                </template>
<!--                
                <v-card
                  color="grey lighten-4"
                  min-width="350px"
                  flat
                >
                  <v-toolbar
                    color="primary"
                    dark
                  >
                    <v-btn icon>
                      <v-icon>edit</v-icon>
                    </v-btn>
                    <v-toolbar-title v-html="event.ordenes"></v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn icon>
                      <v-icon>home</v-icon>
                    </v-btn>
                    <v-btn icon>
                      <v-icon>more_vert</v-icon>
                    </v-btn>
                  </v-toolbar>
                  <v-card-title primary-title>
                    <span v-html="event.details"></span>
                  </v-card-title>
                  <v-card-actions>
                    <v-btn
                      flat
                      color="secondary"
                    >
                      Cancel
                    </v-btn>
                  </v-card-actions>
                </v-card>
-->                
              </v-menu>
            </template>
          </template>
        </v-calendar>
      </v-sheet>
    </v-flex>

    <!-- Dialogo con detalles de las ordenes en el dia seleccionado -->
    <v-dialog
      v-model="dialogDetails"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      scrollable
    >
      <v-card tile>
        <v-toolbar card dark color="primary">
          <v-tooltip right>
            <template v-slot:activator="{ on }" >
              <v-btn icon dark v-on="on" @click="dialogDetails = false">
                <v-icon>close</v-icon>
              </v-btn>                
            </template>
            <span>Regresar al Calendario</span>
          </v-tooltip>
          <v-toolbar-title>Ordenes {{ fechaSeleccionada }}</v-toolbar-title>
          <v-spacer></v-spacer>

          <v-toolbar-title style="margin-top: 20px;">
            <v-radio-group v-model="filtro" row @change="opcion">
              <v-radio label="Órdenes diferentes del día" value="dif_hoy" color="white"></v-radio>
              <v-radio label="Todas las Órdenes" value="todas" color="white"></v-radio>
            </v-radio-group>
          </v-toolbar-title>

        </v-toolbar>
        <!-- Tabla de ordenes del día seleccionado -->
        <v-subheader>
          <v-spacer></v-spacer>
          <v-text-field
            v-model="buscar"
            append-icon="search"
            label="Buscar"
            single-line
          ></v-text-field>
        </v-subheader>
        <v-data-table 
          :headers="tabla_ordenes.headers"
          :items="tabla_ordenes.ordenes"
          class="elevation-1"
          rows-per-page-text="Renglones por página"
          :loading="tabla_ordenes.loading"
          :expand="false"
          hide-actions
          item-key="estimateddeliverydate"
          :search="buscar"
        >
          <template v-slot:no-data>
            <v-alert 
              :value="true" 
              color="info" 
              icon="warning" 
              outline
            > 
              No hay ordenes para mostrar
            </v-alert>
          </template>
          <template v-slot:items="props">
            <tr 
              :class="[props.item.clase == 'default' ? '' : props.item.clase]" 
            >
              <td class="text-xs-left">{{ props.item.estimateddeliverydate }}</td>
              <td class="text-xs-left">{{ props.item.ordernumber }}</td>
              <td class="text-xs-left">{{ props.item.transactiondate }}</td>
              <td class="text-xs-left">{{ props.item.emergency }}</td>
              <td class="text-xs-left">{{ props.item.ItemDescription }}</td>
              <td class="text-xs-left">{{ props.item.paciente }}</td>
              <td class="text-xs-left">{{ props.item.doctor }}</td>
              <td class="text-xs-left">{{ props.item.cuenta }}</td>
              <td class="text-xs-left">{{ props.item.userName }}</td>
            </tr>
          </template>
        </v-data-table>
        <div style="flex: 1 1 auto;"></div>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.snackbar"
      :color="snackbar.color"
      :multi-line="true"
      :timeout="snackbar.timeout"
      :vertical="false"
      :top="snackbar.y === 'top'"
      :bottom="snackbar.y === 'bottom'"
    >
      {{ snackbar.text }}
      <v-btn
        dark
        flat
        color="info"
        @click = "snackbar.snackbar = false"
      >
        Cerrar
      </v-btn>
    </v-snackbar>

    <!-- Dialogo para mensaje de proceso -->
    <v-dialog
      v-model="dialog"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        dark
      >
        <v-card-text>
          Un momento por favor...                  
          <v-progress-linear
            indeterminate
            color="white"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>
    
  </v-layout>  
</template>


<script>

export default {

  data: () => ({
    userId: '',
    userSucIdSil: '',
    hoy: new Date().toLocaleString('es-MX',
      {
        timeZone: 'America/Tijuana',
        hour12: true,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    ),
    mes: '',
    mesAnt: '',
    mesDesp: '',
    today: '', 
    now: null,
    type: 'month',
    events: [],
    snackbar: {
      snackbar: false,
      text: 'Mensaje inicial',
      color: '',
      y: 'top',
      timeout: 6000
    },
    dialog: false,
    dialogDetails: false,
    meses: [
      'Ene', 
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic'
    ],
    mesEjercicio: '',
    fechaSeleccionada: '',
    selectedDate: '',
    tabla_ordenes: {
      headers: [
        {
          text: 'Fecha prometida',
          value: 'estimateddeliverydate',
          sortable: true
        },
        {
          text: 'Orden',
          value: 'ordernumber'
        },
        {
          text: 'Fecha Orden',
          value: 'transactiondate'
        },
        {
          text: 'Urgente',
          value: 'emergency'
        },
        {
          text: 'Estatus',
          value: 'ItemDescription'
        },
        {
          text: 'Paciente',
          value: 'paciente'
        },
        {
          text: 'Médico',
          value: 'doctor'
        },
        {
          text: 'Cuenta',
          value: 'cuenta'
        },
        {
          text: 'Alta por...',
          value: 'userName'
        }
      ],
      ordenes: [],
      loading: false
    },
    buscar: '',
    diferentesDeHoy: false,
    filtro: "dif_hoy"

  }),

  mounted: function() {
    if (this.$route.query.userSil == undefined || this.$route.query.userSil == '' || this.$route.query.userSucIdSil == undefined || this.$route.query.userSucIdSil == '') {
      this.userId = ''
      this.snackbar.text = 'Usuario no registrado, es necesario ingresar desde Intranet'
      this.snackbar.snackbar = true
      this.snackbar.y = 'top'
      return
    } 
    // Usuario SIL
    this.userId = this.$route.query.userSil
    this.userSucIdSil = this.$route.query.userSucIdSil
    // Hoy
    this.hoy = this.hoy.substr(6, 4) + "-" + this.hoy.substr(3, 2) + "-" + this.hoy.substr(0, 2)  // YYYY-MM-DD
    this.today = this.hoy
    this.mes = this.hoy.substr(0, 4) + "-" + this.hoy.substr(5, 2)   // YYYY-MM
    this.cambiaMes('')
    this.buscaOrdenes()
  },

  computed: {
    // convert the list of events into a map of lists keyed by date
    ordenesMap () {
      const map = {}
      this.events.forEach(e => (map[e.date] = map[e.date] || []).push(e))
      return map
    },

  },

  methods: {
    open (event) {
      alert(event.title)
    },   // open() Control calendario

    buscaOrdenes () {
      this.dialog = true
      // this.mes = 'YYYY-MM'
      this.$axios.$get(
        'http://icertus.com.mx:8686/resultados/servidor/info_orden.php?ordernumber=todas&mesIni=' + this.mesAnt + '&mesFin=' + this.mesDesp + '&requesterlabid=' + this.userSucIdSil + '&opcion=ORDENES'
      ).then(response => {
        this.events = response.data
      }).catch(response => {
        console.log('Error', response)
        this.snackbar.text = response
        this.snackbar.snackbar = true
      }).finally( () => {
        this.dialog = false
      })

    }, // buscaOrdenes()

    cambiaMes(direccion) {
      let ejercicio = parseInt(this.today.substr(0,4))
      let ejercicioAnt = ejercicio
      let ejercicioDesp = ejercicio
      let mes = parseInt(this.today.substr(5, 2))
      let mesAnt = mes
      let mesDesp = mes

      if (direccion == 'anterior') {
        if (--mes < 1) {
          mes = 12
          --ejercicio
        }
      } else if (direccion == 'siguiente') {
        if (++mes > 12) {
          mes = 1
          ++ejercicio
        }
      }

      // Calculo un mes anterior 
      mesAnt = mes - 1
      if (mesAnt < 1) {
        mesAnt = 12
        --ejercicioAnt
      }

      // Mes posterior
      mesDesp = mes + 1
      if (mesDesp > 12) {
        mesDesp = 1
        ++ejercicioDesp
      }

      this.today = ejercicio.toString().padStart(4, '0') + '-' + mes.toString().padStart(2, '0') + '-01'
      this.mesEjercicio = this.meses[mes-1] + '-' + ejercicio
      this.mes = this.today.substr(0, 7)
      this.mesAnt = ejercicioAnt.toString().padStart(4, '0') + '-' + mesAnt.toString().padStart(2, '0')
      this.mesDesp = ejercicioDesp.toString().padStart(4, '0') + '-' + mesDesp.toString().padStart(2, '0')      
      // Actualizo el mes en el calendario y busco ordenes de cada día 
      this.buscaOrdenes()
    }, // cambiaMes()

    editaDia(evento, filtro = 'dif_hoy') {

console.log('evento', evento, 'filtro', filtro)

      this.fechaSeleccionada = evento.date.substr(8, 2) + '-'+ this.meses[parseInt(evento.date.substr(5, 2)) - 1] + '-' + evento.date.substr(0, 4)
      this.selectedDate = evento.date
      this.dialogDetails = true
      this.dialog = true
      this.tabla_ordenes.loading = true
      this.$axios.$get(
        'http://icertus.com.mx:8686/resultados/servidor/info_orden.php?ordernumber=todas&dia=' + evento.date + '&requesterlabid=' + this.userSucIdSil + '&opcion=ORDENES_DIA&filtro='  + filtro
      ).then(response => {
        this.tabla_ordenes.ordenes = response.data
      }).catch(response => {
        this.snackbar.text = response
        this.snackbar.snackbar = true
        console.log('Error editaDia()', response)
      }).finally( () => {
        this.dialog = false
        this.tabla_ordenes.loading = false
      })
    },

    opcion() {
      this.editaDia({date: this.selectedDate}, this.filtro)
    }

  } // methods:
}

</script>

<style>
  .my-event {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border-radius: 2px;
    background-color: #1867c0;
    color: #ffffff;
    border: 1px solid #1867c0;
    width: 100%;
    font-size: 12px;
    padding: 3px;
    cursor: pointer;
    margin-bottom: 1px;
  }
  .strikeout {
    text-decoration: line-through;
    color: red;
  }
  .verde {
    color: #0C8000;
  }

</style>