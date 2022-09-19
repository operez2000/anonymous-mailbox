<template>
	<v-layout>
		<v-flex xs12 sm12 md12 lg12 text-xs-center class="justify-center">
			<v-card>
        <v-toolbar color="primary" dark>
          <v-toolbar-title>Microbiología - Captura de Resultados ({{ userId }})</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-side-icon v-if="orderFound">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn icon small v-on="on" @click="informeDeResultados">
                  <v-icon>print</v-icon>
                </v-btn>                
              </template>
              <span>Generar Informe de Resultados</span>
            </v-tooltip>
          </v-toolbar-side-icon>
          <v-toolbar-side-icon>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn icon small v-on="on" @click="clear">
                  <v-icon>replay</v-icon>
                </v-btn>                
              </template>
              <span>Limpiar información y comenzar de nuevo</span>
            </v-tooltip>
          </v-toolbar-side-icon>
        </v-toolbar>

				<v-form>
					<v-container fluid grid-list-lg>
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

            <v-layout>
              <v-flex xs12 md3>
                <v-text-field
                  v-model="ordernumber"
                  :error-messages="ordernumberErrors"
                  :counter="10"
                  :append-icon="searchButton ? 'search' : undefined"
                  label="Orden #"
                  ref="ordernumber"
                  required
                  autofocus
                  @input="$v.ordernumber.$touch()"
                  @blur="$v.ordernumber.$touch()"
                  @click:append="buscaOrden"
                  @keyup.enter="buscaOrden"
                  :disabled="userId == ''"
                ></v-text-field>                
              </v-flex>
              <v-flex xs12 md3>
                <v-text-field
                  v-model="fecha_orden"
                  label="Fecha de la Orden"
                  readonly
                ></v-text-field>
              </v-flex>
              <v-flex xs6 md3>
                <v-text-field
                  v-model="sucursal"
                  label="Sucursal"
                  readonly
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout>
              <v-flex xs12 md6>
                <v-text-field
                  v-model="paciente"
                  label="Paciente"
                  readonly
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md6>
                <v-text-field
                  v-model="cuenta"
                  label="Cuenta (Empresa)"
                  readonly
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout>
              <v-flex xs12 md6>
                <v-text-field
                  v-model="medico"
                  label="Médico"
                  readonly
                ></v-text-field>
              </v-flex>
              <v-flex xs12 md6>
                <v-text-field
                  v-model="estatus"
                  label="Estatus de la Orden"
                  readonly
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout v-show="false">
              <v-flex xs12 md6>
                <v-text-field
                  v-model="extlabelid"
                  label="Temperatura"
                  :counter="30"
                  :disabled="!orderFound"
                  ref="extlabelid"
                ></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout v-if="orderFound">
              <!-- Tabla de estudios de la orden -->
              <v-flex xs12>
                <v-data-table 
                  :headers="tabla_estudios.headers"
                  :items="tabla_estudios.estudios"
                  class="elevation-1"
                  rows-per-page-text="Renglones por página"
                  :loading="table_loading"
                  :expand="false"
                  item-key="testId"
                >
                  <template v-slot:no-data>
                    <v-alert 
                     :value="true" 
                     color="info" 
                     icon="warning" 
                     outline
                    > 
                      No hay estudios para mostrar
                    </v-alert>
                  </template>
                  <template v-slot:items="props">
                    <tr style="cursor: pointer;" 
                      :class="[props.item.detailStatus == 'OID_CANCEL' ? 'strikeout' : '']" 
                      @click="props.expanded = !props.expanded; (props.expanded) ? editaAnalitos(props.item, 'FECHA') : tabla_analitos.analitos = []"
                    >
                      <td class="text-xs-left">{{ props.item.testId }}</td>
                      <td class="text-xs-left">{{ props.item.testName }}</td>
                      <td class="text-xs-left">{{ props.item.estatus }}</td>
                      <td class="text-xs-left">{{ props.item.od_transactiondate }}</td>
                    </tr>
                  </template>
                  <template v-slot:expand="props">
                    <v-card
                      color="info"
                    >
                      <v-container>
                        <v-card-text> <!--- class="white--text">-->
                          Analitos ({{ props.item.testName }})
                        </v-card-text>

                        <v-layout>
                          <v-flex sm4 md5 lg4>
                            <v-select
                              v-model="estatusActual"
                              :items="estatusEstudios"
                              item-text="descripcion"
                              item-value="idEstatus"
                              label="Estatus"
                              :hint="'Estatus'"
                              persistent-hint
                              return-object
                              single-line
                              @change="selectStatus"
                              class="compact-form"
                            ></v-select>
                          </v-flex>

                          <v-flex sm4 md3 lg2>
                            <v-menu
                              v-model="menuFecha"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              lazy
                              transition="scale-transition"
                              offset-y
                              full-width
                              min-width="290px"
                              >
                                <template v-slot:activator="{ on }">
                                  <v-text-field
                                    v-model="estatusActual.fecha"
                                    label="Fecha de captura"
                                    prepend-icon="event"
                                    readonly
                                    v-on="on"
                                    class="compact-form"
                                    >
                                  </v-text-field>
                                </template>
                              <v-date-picker v-model="estatusActual.fecha" @input="menuFecha = false" locale='es-mx' :allowed-dates="allowedDates"></v-date-picker>
                            </v-menu>
                          </v-flex>

                          <v-flex sm4 md2 lg2>
                            <v-menu
                              v-model="show_clock"
                              :close-on-content-click="false"
                              :nudge-right="40"
                              lazy
                              transition="scale-transition"
                              offset-y
                              full-width
                              min-width="290px"
                            >
                              <template v-slot:activator="{ on }">
                                <v-text-field
                                  v-model="estatusActual.hora"
                                  label="Hora"
                                  prepend-icon="access_time"
                                  readonly
                                  v-on="on"
                                  class="compact-form"
                                ></v-text-field>
                              </template>
                              <v-time-picker v-model="estatusActual.hora" format="24hr" @input="show_clock=false"></v-time-picker>
                            </v-menu>
                          </v-flex>

                          <!-- Usuario -->
                          <v-flex sm4 md2 lg1>
                            <v-text-field
                              v-model="estatusActual.userId"
                              :prepend-icon="'person'"
                              label="Usuario"
                              readonly
                              class="compact-form"
                            ></v-text-field>
                          </v-flex>

                          <!-- Boton para grabar el estatus del estudio -->
                          <v-flex sm4 md2 lg1>
                            <v-tooltip top>
                              <template v-slot:activator="{ on }">
                                <v-btn flat icon color="indigo" v-on="on" @click="grabaEstatusEstudio" :disabled="estatusActual.idEstatus == ''">
                                  <v-icon>save</v-icon>
                                </v-btn>                                  
                              </template>
                              <span>Grabar estatus del estudio</span>
                            </v-tooltip>
                          </v-flex>

                        </v-layout>

                        <v-data-table 
                          :headers="tabla_analitos.headers"
                          :items="tabla_analitos.analitos"
                          class="elevation-1"
                          rows-per-page-text="Renglones por página"
                        >
                          <template v-slot:no-data>
                            <v-alert 
                            :value="true" 
                            color="info" 
                            icon="warning" 
                            outline
                            > 
                              No hay analitos para mostrar
                            </v-alert>
                          </template>
                          <template v-slot:items="props">
                            <tr :class="[props.item.color=='grey' ? 'texto_espacio' : '']">
                              <td class="text-xs-left">{{ props.item.keyInOrder }}</td>
                              <td class="text-xs-left">{{ props.item.componentName }}</td>
                              <td class="text-xs-left">{{ props.item.componentTypeID }}</td>
                              <td class="text-xs-left hand" >
                                <v-edit-dialog
                                  :return-value.sync="props.item.textResult"
                                  lazy
                                > {{ props.item.textResult }}
                                  <template v-slot:input>
                                    <v-text-field
                                      v-model="props.item.textResult"
                                      v-if="props.item.color!=='grey'"
                                      label="Resultado"
                                      single-line
                                      @change="cambio_resultado = true"
                                    ></v-text-field>
                                  </template>
                                </v-edit-dialog>
                              </td>
                              <td class="text-xs-left">{{ props.item.unitID }}</td>
                              <td class="text-xs-left hand" @click="editaAnalito(props.item, 'FECHA')">
                                {{ props.item.fcaptura }}
                              </td>
                              <td class="text-xs-left hand" @click="editaAnalito(props.item, 'HORA')">
                                {{ props.item.hcaptura }}
                              </td>
                              <!--
                              <td class="justify-center layout px-0">
                                <v-icon
                                  color="primary"
                                  class="mr-2"
                                  @click="grabaResultado(props.item)"
                                  v-if='props.item.color != "grey"'
                                >
                                  edit
                                </v-icon>
                              </td>
                              -->
                              <td class="text-xs-left hand">
                                <v-edit-dialog
                                  :return-value.sync="props.item.comment"
                                  lazy
                                > {{ props.item.comment }}
                                  <template v-slot:input>
                                    <v-text-field
                                      v-model="props.item.comment"
                                      v-if="props.item.color !== 'grey'"
                                      label="Comentario"
                                      single-line
                                      @change="cambio_resultado = true"
                                    ></v-text-field>
                                  </template>
                                </v-edit-dialog>                                
                              </td>
                              <td class="justify-center layout px-0">
                                <v-icon
                                  color="primary"
                                  class="mr-2"
                                  @click="grabaResultado(props.item)"
                                  v-if='cambio_resultado && props.item.textResult.length > 0'
                                >
                                  save
                                </v-icon>
                              </td>
                            </tr>
                          </template>
                        </v-data-table>
                      </v-container>
                    </v-card>
                  </template>
                </v-data-table>
              </v-flex>
            </v-layout>

					</v-container>
				</v-form>

				<v-card-actions>
          <v-spacer></v-spacer>
				</v-card-actions>

			</v-card>

      <!-- Dialogo para fecha de captura del analito -->
      <v-dialog
        v-model="dialog_fecha"
        max-width="290"
      >
        <v-date-picker v-model="fcaptura_modal" @input="fechaAnalito()" locale='es-mx' :allowed-dates="allowedDates"></v-date-picker>
      </v-dialog>

      <!-- Dialogo para hora de captura del analito -->
      <v-dialog
        v-model="dialog_hora"
        max-width="290"
      >
        <v-card>
          <v-time-picker v-model="hcaptura_modal" format="24hr"></v-time-picker>
          <v-toolbar>
            <v-spacer></v-spacer>
            <v-btn flat fab small color="primary" @click="horaAnalito()">Ok</v-btn>
          </v-toolbar>
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

		</v-flex>
	</v-layout>
  
</template>

<script>

import { validationMixin } from 'vuelidate'
import { required, minLength, maxLength, email } from 'vuelidate/lib/validators'

export default {

	mixins: [validationMixin],

	validations: {
		ordernumber: { required, maxLength: maxLength(10), minLength: minLength(7) }
	},

	data: () => ({
    userId: '',
    orderFound: false,
    oih_oid: '',  // OrderInHeader.oid
    ordernumber: '', 
    paciente: '', 
    patientoid: '',
    cuenta: '',
    medico: '',
    orderstatus: '',  // ID de estatus
    estatus: '',      // Descripción de estatus
    fecha_orden: '',
    orderdate: '',
    sucursal: '',
    oid_oid: '',
    cat_oid: '',
    extlabelid: '',   // utilizado para guardar la temperatura
    searchButton: false,
    dialog: false,
    dialog_fecha: false,
    dialog_hora: false,
    table_loading: false,
    menuFecha: false,
    show_clock: false,
    cambio_resultado: false,
    transactiondate: new Date().toLocaleString('es-MX',
      {
        timeZone: 'America/Tijuana',
        hour12: true,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    ),
    fcaptura_modal: '',
    hora_captura: new Date().toLocaleString('es-MX',
      {
        timeZone: 'America/Tijuana',
        hour12: false,
        hour: "numeric",  
        minute: "2-digit"
      }
    ),
    hcaptura_modal: '',           // Se inicializa en moounted()
    hora: '',
    selected_test: '',
    editedIndex: -1,
    editedItem: {},
    snackbar: {
      snackbar: false,
      text: 'Mensaje inicial',
      color: '',
      y: 'top',
      timeout: 6000
    },
    estudioActual: {
      testoid: '',
      od_oid: ''
    },
    tabla_estudios: {
      headers: [
        {
          text: 'Id Estudio',
          value: 'testId'
        },
        {
          text: 'Nombre del Estudio',
          value: 'testName'
        },
        {
          text: 'Estatus',
          value: 'estatus_estudio'
        },
        {
          text: 'Fecha',
          value: 'od_transactiondate'
        }
      ],
      estudios: []
    },
    tabla_analitos: {
      headers: [
        {
          text: 'Orden',
          value: 'keyInOrder'          
        },
        {
          text: 'Nombre del Analito',
          value: 'componentName'
        },
        {
          text: 'Tipo',
          value: 'componentTypeID'
        },
        {
          text: 'Resultado',
          value: 'textResult'
        },
        {
          text: 'U Medida',
          value: 'unitID'
        },
        {
          text: 'F. captura',
          value: 'fcaptura'
        },
        {
          text: 'Hora',
          value: 'hcaptura'
        }, 
        {
          text: 'Comentario',
          value: 'comment'
        },
        {
          text: 'Grabar',
          value: 'textResult',
          sortable: false
        }        
      ],
      analitos: []
    }, 
    estatusEstudios: [
      { 
        idEstatus: 'OID_W_RES', 
        descripcion: 'ESPERA RESULTADOS'
      },
      { 
        idEstatus: 'OID_R_SAMP', 
        descripcion: 'MUESTRA RECIBIDA'
      },
      { 
        idEstatus: 'OID_W_REV', 
        descripcion: 'ESPERA REVISION'
      },
      { 
        idEstatus: 'OID_W_PRN', 
        descripcion: 'ESPERA IMPRESION'
      },
      { 
        idEstatus: 'OID_RE_INT', 
        descripcion: 'RESULTADOS LIBERADOS A INTERNET'
      },
      {
        idEstatus: 'OIDSENTREL',
        descripcion: 'RESULTADOS ENVIADOS Y LIBERADOS A INTERNET'
      }
    ],
    estatusActual: {}   // v-model = Se toma el primer estatus por default OID_W_RESULTS (EN ESPERA DE RESULTADOS) para el v-select por estudio
  }),
  
  mounted: function () {
    if (this.$route.query.userSil == undefined || this.$route.query.userSil == '') {
      this.userId = ''
      this.snackbar.text = 'Usuario no registrado, es necesario entrar a Intranet'
      this.snackbar.snackbar = true
      this.snackbar.y = 'top'      
    } else {
      this.userId = this.$route.query.userSil
    }
    // Fecha de hoy
    this.transactiondate = this.transactiondate.substr(6, 4) + "-" + this.transactiondate.substr(3, 2) + "-" + this.transactiondate.substr(0, 2)  // YYYY-MM-DD
    this.fcaptura_modal = this.transactiondate
    this.hcaptura_modal = this.hora_captura
    for (let index = 0; index < this.estatusEstudios.length; index++) {
      this.estatusEstudios[index].fecha = this.transactiondate
      this.estatusEstudios[index].hora = this.hora_captura
    }
    // Estatus por default de los estudios
    this.estatusActual = { 
      idEstatus: 'OID_W_RES', 
      descripcion: 'ESPERA RESULTADOS', 
      fecha: null, //this.transactiondate,
      hora: null //this.hora_captura
    }

  },

	methods: {
    clear (orden=true) {
      this.$v.$reset()
      if (orden) {
        this.ordernumber = ''
        this.oih_oid = ''
      }
      this.paciente = ''
      this.patientoid = ''
      this.cuenta = ''
      this.medico = ''
      this.estatus = ''
      this.orderstatus = ''
      this.fecha_orden = ''
      this.orderdate = ''
      this.sucursal = ''
      this.orderFound = false
      this.dialog = false
      this.dialog_fecha = false
      this.dialog_hora = false
      this.oid_oid = ''
      this.cat_oid = ''
      this.extlabelid = ''
      this.estudioActual = {
        testoid: '',
        od_oid: ''
      }
      this.tabla_estudios.estudios = []
      this.tabla_analitos.analitos = []
      this.table_loading = false
      this.selected_test = ''
      this.cambio_resultado = false
      this.editedIndex = -1
      this.editedItem = {}
      this.estatusActual = { 
        idEstatus: 'OID_W_RES', 
        descripcion: 'ESPERA RESULTADOS', 
        fecha: null, //this.transactiondate,
        hora: null, //this.hora_captura
        userId: ''
      }

      //this.$refs.ordernumber.focus()
      this.$nextTick(() => {
          this.$refs.ordernumber.$el.getElementsByTagName('input')[0].focus()
        }
      )
    },  // clear

    buscaOrden () {
      this.orderFound = false
      if (this.ordernumber != "") {
        this.dialog=true
        this.clear( false )
        this.table_loading = true
        // Request para datos de la orden
        this.$axios.$get(
          'http://icertus.com.mx:8686/resultados/servidor/info_orden.php?ordernumber=' + this.ordernumber + '&opcion=ORDEN'
        ).then(response => {
          this.dialog=false
          this.orderFound = (response.result == 200)
          this.table_loading = false
          if (response.result == 200) {
            if (response.micro_san == 0) {  // No tiene estudios que corresponden a MB-SAN
              this.snackbar.snackbar = true
              this.snackbar.text = "La orden " + this.ordernumber + " No tiene estudios de Microbiología Sanitaria"
              this.clear()
            } else if (response.orderstatus == 'OIH_CANCEL') {
              this.snackbar.snackbar = true
              this.snackbar.text = "La orden " + this.ordernumber + " está cancelada"
              this.clear()
            } else {
              this.oih_oid = response.oih_oid
              this.paciente = response.paciente
              this.cuenta = response.cuenta
              this.medico = response.medico
              this.estatus = response.estatus
              this.fecha_orden = response.fecha_orden
              this.orderdate = response.orderdate
              this.sucursal = response.sucursal
              this.extlabelid = response.extlabelid
              this.tabla_estudios.estudios = response.estudios

              // Mensaje
              this.snackbar.snackbar = true
              this.snackbar.text = "Presiona click sobre el Estudio para revisar los Analitos"

              //this.$refs.extlabelid.focus()
              this.$nextTick(() => {
                this.$refs.extlabelid.$el.getElementsByTagName('input')[0].focus()
              })

            }
          } else if (response.result == 400) { // Error en el servidor Exception()
            this.snackbar.snackbar = true
            this.snackbar.text = 'Error en la Base de Datos'
          } else {
            this.snackbar.snackbar = true
            this.snackbar.text = response.msg
          }
        })
      }
    },  // buscaOrden()

    editaAnalitos (item) {

      this.estudioActual.testoid = item.cat_oid
      this.estudioActual.od_oid = item.oid_oid
      this.infoDelEstudio(item)
      this.oid_oid = item.oid_oid
      this.cat_oid = item.cat_oid
      if (item.detailStatus !== 'OID_CANCEL') {
        this.table_loading = true
        this.dialog = true
        this.$axios.$get(
          'http://icertus.com.mx:8686/resultados/servidor/info_orden.php?ordernumber=' + this.ordernumber + '&opcion=ANALITOS&testOID=' + item.cat_oid
        ).then( response => {
          this.table_loading = false
          this.dialog = false
          this.tabla_analitos.analitos = response.analitos
          this.snackbar.snackbar = true
          this.snackbar.text = "Presiona click sobre la celda de Resultados para modificar el valor"
        })
      }
    }, // editaAnalitos()

    infoDelEstudio (item) {
      var historial
      // Valores nulos por default por si no se ha encontrado algun estatus en StatusHistory, de ser así no debe tener fecha ni hora, quedan listos para captura
      this.estatusActual.fecha = null 
      this.estatusActual.hora = null
      this.estatusActual.userId = this.userSil
      // Busco el estatus, la fecha y hora de captura del estudio y lo asigno al objeto this.estatusActual para actualizar el v-select
      for (let index = 0; index < this.tabla_estudios.estudios.length; index++) {
        if (this.tabla_estudios.estudios[index].cat_oid == this.estudioActual.testoid) {
          historial = this.tabla_estudios.estudios[index].historial
          for (let hindex = 0; hindex < historial.length; hindex++) {
            if (historial[hindex].objectStatus == item.detailStatus) {
              this.estatusActual = {
                idEstatus: historial[hindex].objectStatus,
                descripcion: historial[hindex].ItemDescription,
                fecha: historial[hindex].fecha,
                hora: historial[hindex].hora,
                userId: historial[hindex].userId
              }
              break
            }
          }
          break
        }
      }
      // Valido que tenga usuario
      if (this.estatusActual.userId == undefined || this.estatusActual == '') {
        this.estatusActual.userId = this.userId
      }
    }, // infoDelEstudio()

    grabaResultado (item) {

      let dialog = this.dialog
      let snackbar = this.snackbar
      let self = this
     
      self.dialog = true

      this.$axios({
        method: 'post',
        url: 'http://icertus.com.mx:8686/resultados/servidor/info_orden.php?ordernumber=' + this.ordernumber + '&opcion=RESULTADO',
        data:  {
          orderInHeaderOID: self.oih_oid,
          transactiondate: self.transactiondate + " " + self.hora_captura + ":00",
          resultHeaderOID: item.trh_oid,
          resultDetailOID: item.oid,
          orderDetailOID: self.oid_oid,
          testOID: self.cat_oid,
          componentOID: item.componentOID,
          userId: self.userId,
          textResult: item.textResult,
          refValueOID: item.trv_oid,
          extlabelid: self.extlabelid,
          comment: item.comment
        },
        headers: {
          'Content-Type': 'multipart/form-data; application/json',
          'Accept' : 'application/json'
        }

      }).then( response => {
        self.dialog = false
        self.snackbar.snackbar = true
        self.snackbar.text = response.data.msg
      }).catch( response => {
        self.dialog = false
        self.snackbar.snackbar = true
        snackbar.text = response.msg
      })

    }, // grabaResultado()

    informeDeResultados () {
      let ip = ''
      let url = "http://icertus.com.mx:8686/resultados/servidor/viewresult.php?" + 
        "orden=" + this.oih_oid +
        "&idUser=" + this.userId + 
        "&token=itsok" +
        "&estatus=" + this.estatusOrden +
        "&opcion=false" + 
        "&design=true" + 
        "&ip=" + ip +
        "&suc=" + this.sucursal + 
        '&userSil=' + this.userId + 
        '&fuente=MB';
      // Abro un "tab" nuevo para mostrar el reporte
      window.open( url );
    },

    editaAnalito (item, columna) {
      this.editedIndex = this.tabla_analitos.analitos.indexOf(item)
      this.editedItem = item //Object.assign({}, item)
      if (columna == 'FECHA') {
        this.fcaptura_modal = this.editedItem.fcaptura
        this.dialog_fecha = true
      } else {
        this.hcaptura_modal = this.editedItem.hcaptura
        this.dialog_hora = true
      }
    },

    fechaAnalito () {
      if (this.editedIndex > -1) {
        this.tabla_analitos.analitos[this.editedIndex].fcaptura = this.fcaptura_modal
      }
      this.dialog_fecha = false
      this.editedIndex = -1
      this.editedItem = {}
    },

    horaAnalito () {
      if (this.editedIndex > -1) {
        this.tabla_analitos.analitos[this.editedIndex].hcaptura = this.hcaptura_modal
      }
      this.dialog_hora = false
      this.editedIndex = -1
      this.editedItem = {}
    },

    allowedDates (val) {
      return new Date(val) >= new Date(this.orderdate)
    },

    selectStatus (val) {
console.log('val', val)
      // Cuando selecciono el estatus busco la info del estudio para el v-select
      val.detailStatus = val.idEstatus  // Para que tenga el mismo elemento a comprar en infoDelEstudio()
      this.infoDelEstudio(val)


      this.dialog = true
      this.$axios({
        method: "get",
        url: 'http://10.200.0.30/resultados/servidor/info_orden.php?ordernumber=' + this.ordernumber + '&opcion=HISTORIAL_ESTUDIO&objectStatus=' + val.idEstatus + 
             '&od_oid=' + this.estudioActual.od_oid,
        headers: {
          'Content-Type': 'multipart/form-data; application/json',
          'Accept': 'application/json'
        }
      }).then( response => {
        response = response.data
        if (response.result == 200) {
              this.estatusActual = {
                idEstatus: val.idEstatus,
                descripcion: val.descripcion,
                fecha: response.data.transactionDate.substr(0, 10),
                hora: response.data.transactionDate.substr(11, 5),
                userId: response.data.userId
              }
        }



/*
      this.estatusActual = {
        idEstatus: historial[hindex].objectStatus,
        descripcion: historial[hindex].ItemDescription,
        fecha: historial[hindex].fecha,
        hora: historial[hindex].hora,
        userId: historial[hindex].userId
      }
      // Valido que tenga usuario
      if (this.estatusActual.userId == undefined || this.estatusActual == '') {
        this.estatusActual.userId = this.userId
      }
*/


      }).catch( response => {
        console.log('Error', response)
      }).finally( () => {
        this.dialog = false
      })

    },

    grabaEstatusEstudio () {

      let data = {
        oih_oid: this.oih_oid,
        objectOID: this.estudioActual.od_oid,
        objectStatus: this.estatusActual.idEstatus,
        transactionDate: this.estatusActual.fecha + " " + 
          this.estatusActual.hora + ":" +  
          new Date().toLocaleString('es-MX', {
            second: "2-digit"
          }) + '.001',
        userId: this.estatusActual.userId
      }

      this.dialog = true

      this.$axios({
        method: 'post', 
        url: 'http://10.200.0.30/resultados/servidor/info_orden.php?ordernumber=' + this.ordernumber + '&opcion=HISTORIAL', 
        data: data,
        headers: {
          'Content-Type': 'multipart/form-data; application/json',
          'Accept' : 'application/json'
        }        
      }).then( response => {
        if (response.data.result == 200) {
          for (let index = 0; index < this.estatusEstudios.length; index++) {
            if (this.estatusEstudios.idEstatus == this.estatusActual.idEstatus) {
              this.estatusEstudios[index] = this.estatusActual
            }
          }
        }
        this.snackbar.text = response.data.msg
      }).catch( response => {
        console.log('Error (catch)', response)
        console.log('Error (catch) data', response.data)
        this.snackbar.text = "Se ha detectado un inconveniente con la Base de Datos, Favor comunicarse con TI"
      }).finally( () => {
        this.dialog = false
        this.snackbar.snackbar = true
      })

    }, // grabaEstatusEstudio()

    editaComentario (item, columna) {
      this.editedIndex = this.tabla_analitos.analitos.indexOf(item)
      this.editedItem = item //Object.assign({}, item)
      if (columna == 'FECHA') {
        this.fcaptura_modal = this.editedItem.fcaptura
        this.dialog_fecha = true
      } else {
        this.hcaptura_modal = this.editedItem.hcaptura
        this.dialog_hora = true
      }
    }


	}, // methods

	computed: {
		ordernumberErrors () {
			const errors = []
			if (!this.$v.ordernumber.$dirty) return errors
			!this.$v.ordernumber.minLength && errors.push("No puede tener menos de 7 números")
			!this.$v.ordernumber.maxLength && errors.push("No debe tener más de 10 números")
			!this.$v.ordernumber.required && errors.push('Campo oligatorio')
			return errors;
		}
  },  // computed
  
  watch: {
    ordernumber: function() {
      this.searchButton = (this.ordernumber.length > 6)
    }
  }  // watch

}

</script>

<style>
  .strikeout {
    text-decoration: line-through;
    color: red;
  }
  .texto_espacio {
    color: #BDBDBD;
  }
  .hand {
    cursor: pointer;
  }
  .compact-form {
    transform: scale(0.875);
    transform-origin: left;
  }  
</style>