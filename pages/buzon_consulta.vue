<template>
	<v-layout>
		<v-flex xs12 sm12 md12 lg12 text-xs-center class="justify-center">
			<v-card>
				<v-toolbar color="primary" dark dense>
					<v-toolbar-title>Certus te escucha - Consulta</v-toolbar-title>
					<v-spacer></v-spacer>
					<v-toolbar-side-icon>
						<v-tooltip bottom>
							<template v-slot:activator=" { on } ">
								<v-btn icon small v-on="on" @click="grabar" :disabled="!valid">
									<v-icon>autorenew</v-icon>
								</v-btn>
							</template>
							<span>Actualizar consulta</span>
						</v-tooltip>	
					</v-toolbar-side-icon>
				</v-toolbar>

				<v-form v-model="valid" ref="form">
					<v-container fluid grid-list-lg>
						<v-tabs
							color="primary"
							slider-color="warning"
							slider-size="4"
							dark
						>
							<v-tab v-model="tabs[0]" ref="tab1">
								Afectado
							</v-tab>
							<v-tab v-model="tabs[1]" ref="tab2">
								Persona que cometió la falta
							</v-tab>
							<v-tab v-model="tabs[2]" ref="tab3">
								Declaración de los hechos
							</v-tab>

							<v-tab-item>
								<v-card flat>
									<v-card-text>
										<!-- Afectado -->
										<v-layout>
											<v-flex xs12 md12>
												<v-text-field
													v-model="nombre_afectado"
													label="Nombre de la persona que presenta la queja (opcional)"
													:counter="60"
													:rules="rules.afectado.nombre"
													:disabled="id_empleado == ''"
													autofocus
												></v-text-field>
											</v-flex>
										</v-layout>
										<v-layout>
											<v-flex xs6 md4>
												<v-text-field
													v-model="puesto_afectado"
													label="Puesto (opcional)"
													:counter="20"
													:rules="rules.afectado.puesto"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
											<v-flex xs6 md4>
												<v-text-field
													v-model="telefono_afectado"
													label="Teléfono (opcional)"
													:counter="20"
													:rules="rules.afectado.telefono"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
											<v-flex xs6 md4>
												<v-text-field
													v-model="area_afectado"
													label="Área (opcional)"
													:counter="20"
													:rules="rules.afectado.telefono"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
										</v-layout>
										<v-layout>
											<v-flex xs12 md8>
												<v-text-field
													v-model="jefe_afectado"
													label="Jefe inmediato (opcional)"
													:counter="40"
													:rules="rules.afectado.jefe"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
										</v-layout>
									</v-card-text>
								</v-card>
							</v-tab-item>

							<v-tab-item>
								<v-card flat>
									<v-card-text>
										<!-- Agresor -->
										<v-layout>
											<v-flex xs12 md12>
												<v-text-field
													v-model="nombre_agresor"
													label="Nombre de la persona que ha realizado el acto"
													:counter="60"
													:rules="rules.agresor.nombre"
													:disabled="id_empleado == ''"
													required
												></v-text-field>
											</v-flex>
										</v-layout>
										<v-layout>
											<v-flex xs6 md4>
												<v-text-field
													v-model="puesto_agresor"
													label="Puesto (opcional)"
													:counter="20"
													:rules="rules.agresor.puesto"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
											<v-flex xs6 md4>
												<v-text-field
													v-model="telefono_agresor"
													label="Teléfono (opcional)"
													:counter="20"
													:rules="rules.agresor.telefono"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
											<v-flex xs6 md4>
												<v-text-field
													v-model="area_agresor"
													label="Área (opcional)"
													:counter="20"
													:rules="rules.agresor.telefono"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
										</v-layout>
										<v-layout>
											<v-flex xs12 md8>
												<v-text-field
													v-model="jefe_agresor"
													label="Jefe inmediato (opcional)"
													:counter="40"
													:rules="rules.agresor.jefe"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
										</v-layout>
									</v-card-text>
								</v-card>
							</v-tab-item>

							<v-tab-item>
								<v-card flat>
									<v-card-text>
										<v-layout>
											<!-- Fecha -->
											<v-flex xs6 md3>
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
															v-model="fecha"
															label="Fecha en que ocurrió"
															prepend-icon="event"
															readonly
															v-on="on"
															:disabled="id_empleado == ''"
														></v-text-field>
													</template>
													<v-date-picker v-model="fecha" @input="menuFecha = false" locale='es-mx'></v-date-picker>
												</v-menu>
											</v-flex>
											<!-- Hora -->
											<v-flex sm6 md2>
												<v-menu
													v-model="show_clock"
													:close-on-content-click="false"
													:nudge-rigth="40"
													lazy
													transaction="scale-transition"
													offset-y
													full-width
													min-width="290px"
												>
													<template v-slot:activator="{ on }">
														<v-text-field
															v-model="hora"
															label="Hora"
															prepend-icon="access_time"
															readonly
															v-on="on"															
															:disabled="id_empleado == ''"
														></v-text-field>														
													</template>
													<v-time-picker v-model="hora" format="24hr" @input="show_clock=false"></v-time-picker>
												</v-menu>
											</v-flex>
											<!-- Lugar -->
											<v-flex sm6 md5>
												<v-text-field
													v-model="lugar"
													label="Lugar"
													:counter="30"
													:rules="rules.lugar"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
											<v-flex sm6 md2>
												<v-text-field
													v-model="frecuencia"
													label="Frecuencia"
													hint="Cant. de veces"
													:counter="3"
													:rules="rules.frecuencia"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
										</v-layout>
										<!-- Detalle -->
										<v-layout>
											<v-flex sm12 md12>
												<v-textarea
													v-model="detalle"													
													label="Detalle de los hechos"
													solo
													hint="¿Cómo se manifestó el hostigamiento o acoso?"
													:rules="rules.detalle"
													:disabled="id_empleado == ''"
													required
												></v-textarea>
											</v-flex>
										</v-layout>
										<v-layout>
											<!-- Actitud del agresor -->
											<v-flex sm12 md12>
												<v-text-field
													v-model="actitud_agresor"
													label="Actitud del agresor"
													:counter="80"
													:rules="rules.actitud_agresor"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
										</v-layout>
										<v-layout>
											<!-- Reacción del ofendido -->
											<v-flex sm12 md12>
												<v-text-field
													v-model="reaccion_afectado"
													label="Reacción"
													hint="¿Cómo reaccionó inmediatamente Usted ante la situación?"
													:counter="80"
													:rules="rules.reaccion_afectado"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
										</v-layout>
										<v-layout>
											<!-- Caso aislado/sabe de otros casos -->
											<v-flex sm12 md6>
												<v-text-field
													v-model="tipo_agresion"
													label="Tipo de agresión"
													hint="Mencione si su caso es aislado o conoce de otros"
													:counter="40"
													:rules="rules.tipo_agresion"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
											<!-- Afectación emocional -->
											<v-flex sm12 md6>
												<v-text-field
													v-model="afectacion"
													label="Afectación"
													hint="¿Cómo le afectó el hostigamiento emocionalmente?"
													:counter="40"
													:rules="rules.afectacion"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
										</v-layout>
										<v-layout>
											<!-- Rendimiento -->
											<v-flex sm12 md6>
												<v-text-field
													v-model="rendimiento"
													label="Rendimiento"
													hint="¿Cómo le afectó en su rendimiento personal durante el hostigamiento?"
													:counter="40"
													:rules="rules.rendimiento"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
											<!-- Causa -->
											<v-flex sm12 md6>
												<v-text-field
													v-model="causa"
													label="Causa"
													hint="¿Cuál considera Usted que fue la causa del hostigamiento?"
													:counter="40"
													:rules="rules.causa"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
										</v-layout>
										<v-layout>
											<!-- Ambiente -->
											<v-flex sm12 md6>
												<v-text-field
													v-model="ambiente"
													label="Ambiente"
													hint="¿Cómo percibió Usted el ambiente laboral durante el hostigamiento?"
													:counter="40"
													:rules="rules.ambiente"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
											<!-- Afectación posterior -->
											<v-flex sm12 md3>
												<v-text-field
													v-model="afectacion_posterior"
													label="Afectación posterior"
													hint="¿Considera que el hostigamiento afectará a largo plazo a nivel personal, emocional, social y laboral?"
													:counter="10"
													:rules="rules.afectacion_posterior"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
											<!-- tratamiento -->
											<v-flex sm12 md3>
												<v-text-field
													v-model="tratamiento"
													label="Necesidad de tratamiento"
													hint="¿Cree necesario acudir con un experto pueda tratar el daño psicológico?"
													:counter="10"
													:rules="rules.tratamiento"
													:disabled="id_empleado == ''"
												></v-text-field>
											</v-flex>
										</v-layout>
									</v-card-text>
								</v-card>
							</v-tab-item>

						</v-tabs>
					</v-container>
				</v-form>

				<!-- Botones flotantes -->
				<v-card-text style="height: 0px; position: relative">
					<v-btn
						absolute
						dark
						fab
						top
						left
						color="indigo"
						small
						@click="accion(-1)"
					>
						<v-icon>chevron_left</v-icon>
					</v-btn>

					<v-btn
						absolute
						dark
						fab
						top
						right
						color="indigo"
						small
						@click="accion(1)"
					>
						<v-icon>chevron_right</v-icon>
					</v-btn>
				</v-card-text>
			</v-card>
		</v-flex>

		<!-- Dialogo de proceso -->
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
				@click="snackbar.snackbar = false"
			>
				Cerrar
			</v-btn>
		</v-snackbar>

	</v-layout>
</template>

<script>
	export default {

		data: () => ({
			valid: false,
			dialog: false,
			snackbar: {
				snackbar: false,
				text: "Mensaje de inicio",
				color: '',
				y: 'top',
				timeout: 6000
			},
			id_empleado: '',
			id_sucursal: '',
			nombre_afectado: '',
			puesto_afectado: '',
			telefono_afectado: '',
			area_afectado: '',
			jefe_afectado: '',
			nombre_agresor: '',
			puesto_agresor: '',
			telefono_agresor: '',
			area_agresor: '',
			jefe_agresor: '',
			fecha: '',
			hora: '',
			lugar: '',
			frecuencia: '',
			detalle: '',
			actitud_agresor: '',
			reaccion_afectado: '',
			tipo_agresion: '',
			afectacion: '',
			rendimiento: '',
			causa: '',
			ambiente: '',
			afectacion_posterior: '',
			tratamiento: '',
			rules: {
				afectado: {
					nombre: [
						(v) => v.length <= 60 || 'El máximo es 60 caractéres'
					],
					puesto: [
						(v) => v.length <= 20 || 'El máximo es 20 caractéres'
					],
					telefono: [
						(v) => v.length <= 20 || 'El máximo es 20 caractéres'
					],
					area: [
						(v) => v.length <= 20 || 'El máximo es 20 caractéres'
					],
					jefe: [
						(v) => v.length <= 40 || 'El máximo es 40 caractéres'
					]
				},
				agresor: {
					nombre: [
						(v) => !!v || 'El nombre es requerido',
						(v) => (v && v.length <= 60) || 'El máximo es 60 caractéres',
						(v) => (v && v.length >= 10) || 'El mínimo es 10 caractéres'
					],
					puesto: [
						(v) => v.length <= 20 || 'El máximo es 20 caractéres'
					],
					telefono: [
						(v) => v.length <= 20 || 'El máximo es 20 caractéres'
					],
					area: [
						(v) => v.length <= 20 || 'El máximo es 20 caractéres'
					],
					jefe: [
						(v) => v.length <= 40 || 'El máximo es 40 caractéres'
					]
				},
				lugar: [
					(v) => v.length <= 30 || 'El máximo es 3 caractéres'
				],
				frecuencia: [
					(v) => v.length <= 3 || 'El máximo es 3 caractéres'
				],
				detalle: [
					(v) => !!v || 'El detalle de los hechos es requerido'
				],
				actitud_agresor: [
					(v) => v.length <= 80 || 'El máximo es de 80 caractéres'
				],
				reaccion_afectado: [
					(v) => v.length <= 80 || 'El máximo es de 80 caractéres'
				],
				tipo_agresion: [
					(v) => v.length <= 40 || 'El máximo es de 40 caractéres'
				],
				afectacion: [
					(v) => v.length <= 40 || 'El máximo es de 40 caractéres'
				],
				rendimiento: [
					(v) => v.length <= 40 || 'El máximo es de 40 caractéres'
				],
				causa: [
					(v) => v.length <= 40 || 'El máximo es de 40 caractéres'
				],
				ambiente: [
					(v) => v.length <= 40 || 'El máximo es de 40 caractéres'
				],
				afectacion_posterior: [
					(v) => v.length <= 10 || 'El máximo es de 10 caractéres'
				],
				tratamiento: [
					(v) => v.length <= 10 || 'El máximo es de 10 caractéres'
				]
			},
			fechaInicial: new Date().toLocaleString('es-MX', 
				{
					timeZone: 'America/Tijuana',
					hour12: true,
					year: "numeric",
					month: "2-digit",
					day: "2-digit"
				}),
			horaInicial: new Date().toLocaleString('es-MX', 
				{
					timeZone: 'America/Tijuana',
					hour12: false,
					hour: 'numeric',
					minute: '2-digit'
				}
			),
			menuFecha: false,
			show_clock: false,
			tabs: [
				"tab1",
				"tab2",
				"tab3"
			],
			tabActual: 1

		}),  // data

		mounted: function () {
			if (this.$route.query.userId == undefined || this.$route.query.userId == '' || this.$route.query.userSucursalId == undefined || this.$route.query.userSucursalId == '') {
				this.snackbar.text = "Favor de utilizar el Buzón dentro de la Intranet"
				this.snackbar.snackbar = true
			} else {
				this.id_empleado = this.$route.query.userId
				this.id_sucursal = this.$route.query.userSucursalId
			}
			this.fecha = this.fechaInicial.substr(6, 4) + '-' + this.fechaInicial.substr(3, 2) + '-' + this.fechaInicial.substr(0, 2)
			this.hora = this.horaInicial
		},  // mounted

		methods: {
			grabar () {
				if (this.$refs.form.validate()) {
					this.dialog = true
					this.valid = false
					// Envío los datos para grabar en el server
					this.$axios({
						method: 'post',
						url: 'http://icertus.com.mx:8686/buzon/server/notificaciones.php?opcion=insert',
						data: {
							fecha: this.fecha + ' ' + this.hora,
							id_empleado: this.id_empleado,
							id_sucursal: this.id_sucursal,
							nombre_afectado: this.nombre_afectado,
							puesto_afectado: this.puesto_afectado,
							telefono_afectado: this.telefono_afectado,
							area_afectado: this.area_afectado,
							jefe_afectado: this.jefe_afectado,
							estatus: 'NUEVO',
							nombre_agresor: this.nombre_agresor,
							puesto_agresor: this.puesto_agresor,
							telefono_agresor: this.telefono_agresor,
							area_agresor: this.area_agresor,
							jefe_agresor: this.jefe_agresor,
							lugar: this.lugar,
							frecuencia: this.frecuencia,
							detalle: this.detalle,
							actitud_agresor: this.actitud_agresor,
							reaccion_afectado: this.reaccion_afectado,
							tipo_agresion: this.tipo_agresion,
							afectacion: this.afectacion,
							rendimiento: this.rendimiento,
							causa: this.causa,
							ambiente: this.ambiente,
							afectacion_posterior: this.afectacion_posterior,
							tratamiento: this.tratamiento
						}
					}).then( response => {
						let resp = response.data
						console.log('response', resp)
						this.snackbar.text = resp.msg
					}).catch( response => {
						console.log('response catch', response)
						this.snackbar.text = response
					}).finally( () => {
						this.dialog = false
						this.snackbar.snackbar = true
					}) // axios

				} else {
					this.snackbar.text = "Favor de revisar los campos obligatorios para poder grabar"
					this.snackbar.snackbar = true
				}
			},  // grabar()

			recupera() {
				this.dialog = true
				this.$axios({
					method: 'get',
					url: 'http://10.200.0.30/buzon/server/notificaciones.php?opcion=select'
				}).then( resp => {
					this.nombre_afectado = resp.data.data.nombre_afectado
					this.puesto_afectado = resp.data.data.puesto_afectado
					this.telefono_afectado = resp.data.data.telefono_afectado
					this.area_afectado = resp.data.data.area_afectado
					this.jefe_afectado = resp.data.data.jefe_afectado
					this.nombre_agresor = resp.data.data.nombre_agresor
					this.puesto_agresor = resp.data.data.puesto_agresor
					this.telefono_agresor = resp.data.data.telefono_agresor
					this.area_agresor = resp.data.data.area_agresor
					this.jefe_agresor = resp.data.data.jefe_agresor
					this.fecha = resp.data.data.fecha
					this.hora = resp.data.data.hora
					this.lugar = resp.data.data.lugar
					this.frecuencia = resp.data.data.frecuencia
					this.detalle = resp.data.data.detalle
					this.actitud_agresor = resp.data.data.actitud_agresor
					this.reaccion_afectado = resp.data.data.reaccion_afectado
					this.tipo_agresion = resp.data.data.tipo_agresion
					this.afectacion = resp.data.data.afectacion
					this.rendimiento = resp.data.data.rendimiento
					this.causa = resp.data.data.causa
					this.ambiente = resp.data.data.ambiente
					this.afectacion_posterior = resp.data.data.afectacion_posterior
					this.tratamiento = resp.data.data.tratamiento
				}).catch( resp => {
					console.log('resp catch', resp)
				}).finally( () => {
					this.dialog = false
				})
			}, // recupera()

			accion(valor) {
				this.tabActual += valor
				if (this.tabActual < 1) {
					this.tabActual = 3
				} else if (this.tabActual > 3) {
					this.tabActual = 1
				}

				if (this.tabActual == 1) {
					this.$refs.tab1.click()					
				} else if (this.tabActual == 2) {
					this.$refs.tab2.click()
				} else {
					this.$refs.tab3.click()
				}

			},

		},  // methods

	}
</script>
