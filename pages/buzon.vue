<template>
	<v-layout>
		<v-flex xs12 sm12 md12 lg12 text-xs-center class="justify-center">
			<v-card>
				<v-toolbar color="primary" dark dense>
					<v-toolbar-title>Certus te escucha</v-toolbar-title>
					<v-spacer></v-spacer>
					<v-tooltip bottom v-if="usuarioRH">
						<template v-slot:activator="{ on }">
							<v-btn class="mr-1" icon small v-on="on" @click="dlgComite">
								<v-icon>mdi-account-multiple-plus</v-icon>
							</v-btn>
						</template>
						<span>Comité</span>
					</v-tooltip>

					<v-tooltip bottom v-if="!usuarioRH">
						<template v-slot:activator=" { on } ">
							<v-btn icon small v-on="on" @click="grabar" :disabled="!valid">  <!--"!valid">-->
								<v-icon>mdi-content-save</v-icon>
							</v-btn>
						</template>
						<span>Guardar notificación</span>
					</v-tooltip>

				</v-toolbar>

				<v-container fluid v-if="usuarioRH">
					<v-layout>
						<v-flex>
							<!-- Tabla de consulta -->
							<v-data-table
								:headers="tabla_quejas.headers"
								:items="tabla_quejas.quejas"
								:loading="tabla_quejas.loading"
								class="elevation-1"
								:footer-props="footerProps"
								@click:row="editaQueja"
							>
								<template v-slot:no-data>
									<v-alert
										:value="true"
										color="info"
										icon="warning"
										outline
									>
										No hay quejas/notificaiones para mostrar
									</v-alert>
								</template>
								<template v-slot:items="props">
									<tr style="cursor: pointer;"
										:class="[props.item.detailStatus == 'CANCELADO' ? 'strikeout' : '']"
										@click="editaQueja(props.item)"
									>
										<td class="text-xs-left">{{ props.item.id.substr(5) }}</td>
										<td class="text-xs-left">{{ props.item.fecha_registro }}</td>
										<td class="text-xs-left">{{ props.item.fecha }}</td>
										<td class="text-xs-left">{{ props.item.estatus }}</td>
										<td class="text-xs-left">{{ props.item.fecha_revisado }}</td>
										<td class="text-xs-left">{{ props.item.estatus_junta }}</td>
										<td class="text-xs-left">{{ props.item.junta_comite }}</td>
										<td class="text-xs-left">{{ props.item.fecha_cierre }}</td>
										<td class="text-xs-left">{{ props.item.viaDemanda }}</td>
										<td class="text-xs-left">{{ props.item.procede }}</td>
										<td class="text-xs-left">{{ props.item.formulacion }}</td>
										<td class="text-xs-left">{{ props.item.dictamen }}</td>
                    <td class="text-xs-left">{{ props.item.nombre_cierre }}</td>
									</tr>
								</template>
							</v-data-table>

						</v-flex>
					</v-layout>
				</v-container>

				<v-form v-model="valid" ref="form">
					<v-container fluid grid-list-lg>
						<h3 v-show="expedienteSeleccionado">Número de Expediente: {{ this.id.substr(5) }}</h3>
						<v-tooltip bottom v-if="usuarioRH && btnRevisar">
							<template v-slot:activator="{ on }">
								<v-btn icon v-on="on" small dark fab right color="green" @click="registraQueja">
									<v-icon>mdi-check</v-icon>
								</v-btn>
							</template>
							<span>Registrar queja {{ this.id.substr(5) }} como revisada...</span>
						</v-tooltip>

						<v-tooltip bottom v-if="usuarioRH && id != ''">
							<template v-slot:activator="{ on }">
								<v-btn icon v-on="on" small fab right color="info" @click="dlgCalendar=true; buscaEventos()">
									<v-icon>mdi-calendar</v-icon>
								</v-btn>
							</template>
							<span>Agendar o modificar cita para análisis con el comité</span>
						</v-tooltip>

						<v-tabs
							color="primary"
							slider-color="warning"
							slider-size="4"
							dark
							v-model="active_tab"
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
							<v-tab v-model="tabs[3]" ref="tab4" v-if="usuarioRH">
								Cierre
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
													ref="nombre_afectado"
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
												></v-text-field>
											</v-flex>
											<v-flex xs6 md4>
												<v-text-field
													v-model="telefono_afectado"
													label="Teléfono (opcional)"
													:counter="20"
													:rules="rules.afectado.telefono"
													:disabled="id_empleado == ''"
													:readonly="usuarioRH"
												></v-text-field>
											</v-flex>
											<v-flex xs6 md4>
												<v-text-field
													v-model="area_afectado"
													label="Área (opcional)"
													:counter="20"
													:rules="rules.afectado.telefono"
													:disabled="id_empleado == ''"
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
												></v-text-field>
											</v-flex>
											<v-flex xs6 md4>
												<v-text-field
													v-model="telefono_agresor"
													label="Teléfono (opcional)"
													:counter="20"
													:rules="rules.agresor.telefono"
													:disabled="id_empleado == ''"
													:readonly="usuarioRH"
												></v-text-field>
											</v-flex>
											<v-flex xs6 md4>
												<v-text-field
													v-model="area_agresor"
													label="Área (opcional)"
													:counter="20"
													:rules="rules.agresor.telefono"
													:disabled="id_empleado == ''"
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
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
													transition="scale-transition"
													offset-y
													min-width="290px"
												>
													<template v-slot:activator="{ on }">
														<v-text-field
															v-model="fecha"
															label="Fecha en que ocurrió"
															prepend-icon="mdi-calendar"
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
													transaction="scale-transition"
													offset-y
													min-width="290px"
												>
													<template v-slot:activator="{ on }">
														<v-text-field
															v-model="hora"
															label="Hora"
															prepend-icon="mdi-clock-outline"
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
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
												></v-text-field>
											</v-flex>
										</v-layout>
										<v-layout>
											<!-- Caso aislado/sabe de otros casos -->
											<v-flex sm12 md6>
												<v-text-field
													v-model="tipo_agresion"
													label="Tipo de agresión"
													hint=""
													:counter="40"
													:rules="rules.tipo_agresion"
													:disabled="id_empleado == ''"
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
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
													:readonly="usuarioRH"
												></v-text-field>
											</v-flex>
											<!-- Afectación posterior --
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
											-->
											<!-- tratamiento --
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
											-->
										</v-layout>
									</v-card-text>
								</v-card>
							</v-tab-item>

							<v-tab-item v-if="usuarioRH">
								<v-card>
									<v-card-text>
                    <v-layout row wrap>
                      <!-- Tab de Cierre -->
                      <v-flex xs6 sm6 md3 lg3>
                        <v-select
                          v-model="cierre.viaDemanda"
                          :items="viasDenuncia"
                          label="Vías de Denuncia"
                          :rules="[
                            v => v && v.length > 0 || 'Información requerida'
                          ]"
                        />
                      </v-flex>
                      <v-flex xs6 sm6 md2 lg2>
                        <v-text-field
                          v-model="cierre.fecha_registro"
                          label="Fecha Registro"
                          readonly
                        ></v-text-field>
                      </v-flex>
                      <v-flex xs6 sm6 md3 lg3>
                        <v-checkbox
                          label="Procede"
                          color="primary"
                          v-model="cierre.procede"
                        />
                      </v-flex>
                      <v-flex xs12 sm12 md12 lg12>
                        <v-textarea
                          v-model="cierre.formulacion"
                          label="Formulación del Acta Administrativa"
                          :disabled="id_empleado == ''"
                          dense
                          outline
                          :rules="[
                            v => v && v.length > 0 || 'Información requerida'
                          ]"
                        />
                      </v-flex>
                      <v-flex xs12 sm12 md12 lg12>
                        <v-textarea
                          v-model="cierre.dictamen"
                          label="Dictamen (Cierre)"
                          hint="Dictamen (Cierre)"
                          outline
                          required
                          :rules="[
                            v => v && v.length > 0 || 'Información requerida'
                          ]"
                        ></v-textarea>
                      </v-flex>
                    </v-layout>
									</v-card-text>
                  <v-card-actions>
										<v-spacer></v-spacer>
                    <v-flex>
                      <v-btn
												icon
                        color="primary"
                        :disabled="!cierre.viaDemanda || !cierre.formulacion || !cierre.dictamen || !expedienteSeleccionado"
                        @click="guardaCierre"
                      >
                        <v-icon>mdi-content-save</v-icon>
                        &nbsp;Guardar cierre
                      </v-btn>
                    </v-flex>
                  </v-card-actions>
                  <br>
								</v-card>
                <br>
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
						@click="accion('-')"
					>
						<v-icon>mdi-chevron-left</v-icon>
					</v-btn>

					<v-btn
						absolute
						dark
						fab
						top
						right
						color="indigo"
						small
						@click="accion('+')"
					>
						<v-icon>mdi-chevron-right</v-icon>
					</v-btn>
				</v-card-text>
			</v-card>
		</v-flex>

		<!-- Diálogo para mantenimiento al comité -->
		<v-dialog v-model="comite_dialog" persistent max-width="700px">
			<v-card>
				<v-toolbar color="primary" dark dense>
					<v-toolbar-title>Integración del Comité</v-toolbar-title>
					<v-spacer></v-spacer>
					<v-tooltip top>
						<template v-slot:activator="{ on }">
							<v-btn icon small v-on="on" @click="comite_dialog = false">
								<v-icon>mdi-close</v-icon>
							</v-btn>
						</template>
						<span>Cerrar</span>
					</v-tooltip>
				</v-toolbar>
				<v-card-text>
					<v-container>
						<v-layout>
							<!-- autocomplete de empleados que no están en el comité -->
							<v-flex xs12>
								<v-autocomplete
									v-model="comite_autocomplete"
									:items="empleados"
									item-text="nombre_puesto"
									item-value="id_empleado"
									label="Selecciona colaboradores para integrar el comité"
									clearable
									prepend-icon="mdi-filter-variant"
									@input="seleccion"
									ref="comite_autocomplete"
								></v-autocomplete>
							</v-flex>
						</v-layout>
						<!-- Card para mostrar la integración del comité -->
						<v-layout class="justify-center">
							<v-flex xs12 sm12 md10>
								<v-card>
									<v-toolbar color="indigo darken-2" dark dense>
										<v-toolbar-title>Comité</v-toolbar-title>
									</v-toolbar>
									<!-- List con el personal del comité -->
									<v-list two-line>
										<template >
											<v-list-item
												 v-for="(item, i) in comite" :key="item.nombre"
											>
												<v-list-item-avatar>
													<img :src="item.avatar" class="my-avatar">
												</v-list-item-avatar>
												<v-list-item-content>
													<v-list-item-title v-html="item.nombre"></v-list-item-title>
													<v-list-item-subtitle v-html="item.id_empleado + ' - ' + item.puesto"></v-list-item-subtitle>
												</v-list-item-content>
												<v-spacer></v-spacer>
												<v-list-item-action @click="borraIntegrante(item)">
													<v-icon color="red">mdi-delete</v-icon>
												</v-list-item-action>
											</v-list-item>
										</template>
									</v-list>
								</v-card>
							</v-flex>
						</v-layout>
					</v-container>
				</v-card-text>
			</v-card>
		</v-dialog>

		<!-- Dialogo full screen para abrir calendario -->
		<v-dialog
			v-model="dlgCalendar"
			fullscreen
			hide-overlay
			transition="dialog-bottom-transition"
			scrollable
		>

			<v-card>
				<v-toolbar dense dark color="primary" >
					<v-btn icon dark @click="dlgCalendar = false">
						<v-icon>mdi-close</v-icon>
					</v-btn>
					<v-toolbar-title>Agendar cita con el comité ({{ id }})</v-toolbar-title>
					<v-spacer></v-spacer>

          <v-toolbar-title class="mr-3">{{ ejercicioMes }}</v-toolbar-title>
					<v-tooltip bottom>
						<template v-slot:activator="{ on }">
							<v-btn icon out small v-on="on" @click="cambiaMes('anterior')">
								<v-icon>mdi-chevron-left</v-icon>
							</v-btn>
						</template>
						<span>Mes anterior</span>
					</v-tooltip>
					<v-tooltip bottom>
						<template v-slot:activator="{ on }">
							<v-btn out icon small v-on="on" @click="cambiaMes('siguiente')">
								<v-icon>mdi-chevron-right</v-icon>
							</v-btn>
						</template>
						<span>Siguiente mes</span>
					</v-tooltip>
				</v-toolbar>

				<!-- <v-card-text> -->
					<!-- <v-sheet height="720" class="elevation-6"> -->
						<v-calendar
							:value="today"
							:now="now"
							color="primary"
							locale='es'
							@click:date="editaDia"

						>
							<template v-slot:day="{ date }">
								<template v-for="event in calendarMap[ date ]" >
									<v-menu
										:key="event.juntas"
										v-model="event.open"
										offset-x
									>
										<template v-slot:activator="{ on }">
											<div
												v-if="!event.time"
												v-ripple
												class="my-event"
												v-on="on"
												v-html="event.id + ' - ' + event.horaPM"
												@click="editaJunta(event)"
											></div>
										</template>
										<v-card
											color="grey lighten-4"
											min-width="350px"
										>
											<v-toolbar
												color="primary"
												dark
												dense
											>
												<v-toolbar-title v-html="event.date + ' ' + event.hora"></v-toolbar-title>
												<v-spacer></v-spacer>
												<v-btn icon>
													<v-icon>mdi-close</v-icon>
												</v-btn>
											</v-toolbar>
											<v-card-text>
												<ul>
													<li>Folio de queja: <strong>{{ event.id }}</strong></li>
													<li>Fecha de registro: <strong>{{ event.fecha_registro }}</strong></li>
													<li>Estatus de la queja: <strong>{{ event.estatus }}</strong></li>
													<li>Fecha para reunión: <strong>{{ event.date + ' ' + event.hora }}</strong></li>
													<li>Estatus de la reunión: <strong>{{ event.estatus_junta }}</strong></li>
												</ul>
											</v-card-text>
											<v-card-actions>
												<v-spacer></v-spacer>
												<v-btn
													color="secondary"
												>
													Cerrar
												</v-btn>
											</v-card-actions>
										</v-card>
									</v-menu>
								</template>
							</template>
						</v-calendar>
					<!-- </v-sheet> -->
				<!-- </v-card-text> -->
			</v-card>
		</v-dialog>
		<!-- Fin de dialogo para calendario -->


		<!-- Dialogo para asignar la hora de reunión del comité -->
		<v-dialog
			v-model="horaJuntaPicker"
			max-width="290"
		>
			<v-card>
				<v-time-picker v-model="horaJunta" format="24hr"></v-time-picker>
				<v-toolbar>
					<v-spacer></v-spacer>
					<v-btn fab small color="primary" @click="seleccionaHora">Ok</v-btn>
					<!--
					<v-btn flat fab small color="primary" @click="alert('ok')">
						Ok
					</v-btn>
					-->
				</v-toolbar>
			</v-card>
		</v-dialog>

		<!-- Dialogo de proceso -->
		<v-dialog
			v-model="dialogProcess"
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
			dialogProcess: false,
			snackbar: {
				snackbar: false,
				text: "Mensaje de inicio",
				color: '',
				y: 'top',
				timeout: 6000
			},
			id: '',
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
			estatus: '',
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
					(v) => (!!v && v.length > 15) || 'El detalle de los hechos es requerido'
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
				"tab3",
				"tab4"
			],
			tabActual: 1,
			usuarioRH: false,
			nombreRH: '',
			tabla_quejas: {
				headers: [
					{ text: '# Expediente', value: 'id' },
					{ text: 'F. Registro', value: 'fecha_registro' },
					{ text: 'F. Incidente', value: 'fecha' },
					{ text: 'Estatus Queja', value: 'estatus' },
					{ text: 'F. Revisión', value: 'fecha_revisado' },
					{ text: 'Estatus Reunión', value: 'estatus_junta' },
					{ text: 'F. Reunión', value: 'junta_comite' },
					{ text: 'F. Cierre', value: 'fecha_cierre' },
					{ text: 'Vía de Demanda', value: 'viaDemanda' },
					{ text: 'Procede', value: 'procede' },
//					{ text: 'Formulación del Acta Administrativa', value: 'formulacion' },
//					{ text: 'Dictamen', value: 'dictamen' },
          { text: 'Cerró', value: 'nombre_cierre' },
				],
				quejas: [],
				loading: false,
				pagination: {
					sortBy: 'id',
					descending: true
				}
			},
			comite_dialog: false,
			comite_autocomplete: '',
			comite: [],
			empleados: [],
			btnRevisar: false,
			index: -1,
			websocket: null,
			calendario: false,
			today: '',
			now: null,
			dlgCalendar: false,
      events: [],
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
			ejercicioMes: '',
			mes: '',
			mesAnt: '',
			mesDesp: '',
			horaJuntaPicker: false,
			horaJunta: '',
			junta_comite: '',
      cierre: {
        viaDemanda: '',
        fecha_registro: '',
        procede: true,
        formulacion: '',
        dictamen: ''
      },
      viasDenuncia: [
        'Formato de Denuncia',
        'Correo Electrónico',
        'Teléfono',
        'Varbal'
      ],
      expedienteSeleccionado: false,
			footerProps: {
				'items-per-page-options': [5, 10,15, 30, 50, 100],
				'items-per-page-text': 'Reng. por Pag.'
			},
			active_tab: 0,
      confirmar: null,
		}),  // data

		mounted: function () {

/*
this.$confirm('¿Estás seguro que quieres excluir del comité a <br><strong>Nombre de Prueba</strong>?').then(res => {
  console.log("res", res)
})
*/

			this.id_empleado = (this.$route.query.userId == undefined) ? 'N/A' : this.$route.query.userId;
			this.id_sucursal = (this.$route.query.userSucursalId == undefined) ? 'N/A' : this.$route.query.userSucursalId;
			this.esComite()
			this.fecha = this.fechaInicial = (this.fechaInicial.substr(6, 4) + '-' + this.fechaInicial.substr(3, 2) + '-' + this.fechaInicial.substr(0, 2))
			this.hora = this.horaInicial
			this.today = this.fecha
			this.$nextTick( () => {
				//this.$refs.nombre_afectado.$el.getElementsByTagName('input')[0].focus()
			})
			this.wsConnect()
			this.cambiaMes('')

		},  // mounted

		computed: {
			// convert the list of events into a map of lists keyed by date
			calendarMap () {
				const map = {}
				this.events.forEach(e => (map[e.date] = map[e.date] || []).push(e))
				return map
			},
		},

		methods: {
			wsConnect () {
				this.websocket = new WebSocket('ws://10.200.10.14:8081')
				//console.log('ws', this.websocket)
				this.websocket.onopen = () => {
					this.websocket.send('Mensaje enviado desde el cliente')
					this.websocket.onmessage = (event) => {
						//console.log('Msg recibido...', event.data)
						//this.sendMsg('Gracias...', 'GENERAL')
						if (this.usuarioRH && (event.data == 'INSERT' || event.data == 'REVISION')) {
							this.cargaQuejas()
							if (event.data == 'REVISION') {
								// Cuando se revisa, el botón de revisión se esconde
								this.btnRevisar = false
							}
						}
					}
				}

			}, // wsConnect()

			sendMsg (msg, tipo = 'GENERAL') {
				this.websocket.send(msg)
			},

			grabar () {
				if (this.nombre_agresor.length >= 10 && this.detalle.length > 10) { // (this.$refs.form.validate()) {
					this.dialogProcess = true
					this.valid = false
					// Envío los datos para grabar en el server
          this.$axios.defaults.headers.post['Content-Type'] ='application/x-www-form-urlencoded'
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
						this.snackbar.text = resp.msg
						this.limpiaCampos()
						this.$refs.tab1.click()
						this.sendMsg('INSERT') // Envío mensaje al servidor para actualizar la tabla de quejas
					}).catch( response => {
						console.log('grabar() catch', response)
					}).finally( () => {
						this.dialogProcess = false
						this.snackbar.snackbar = true
					}) // axios
				} else {
					this.snackbar.text = "Favor de revisar los campos obligatorios para poder grabar"
					this.snackbar.snackbar = true
				}
			},  // grabar()

			editaQueja(registro) {
				let index = this.tabla_quejas.quejas.findIndex(v => v.id === registro.id)
        let row = this.tabla_quejas.quejas.find(v => v == registro)

        this.expedienteSeleccionado = true
				this.limpiaCampos()
				this.index = index
				this.dialogProcess = true
				this.$axios({
					method: 'get',
					url: 'http://icertus.com.mx:8686/buzon/server/notificaciones.php?opcion=select&id=' + Number(registro.id)
				}).then( resp => {
					let datos = resp.data.data[0]
					this.id = datos.id
					this.nombre_afectado = datos.nombre_afectado
					this.puesto_afectado = datos.puesto_afectado
					this.telefono_afectado = datos.telefono_afectado
					this.area_afectado = datos.area_afectado
					this.jefe_afectado = datos.jefe_afectado
					this.nombre_agresor = datos.nombre_agresor
					this.puesto_agresor = datos.puesto_agresor
					this.telefono_agresor = datos.telefono_agresor
					this.area_agresor = datos.area_agresor
					this.jefe_agresor = datos.jefe_agresor
					this.fecha = datos.fecha
					this.hora = datos.hora
					this.lugar = datos.lugar
					this.frecuencia = datos.frecuencia
					this.detalle = datos.detalle
					this.actitud_agresor = datos.actitud_agresor
					this.reaccion_afectado = datos.reaccion_afectado
					this.tipo_agresion = datos.tipo_agresion
					this.afectacion = datos.afectacion
					this.rendimiento = datos.rendimiento
					this.causa = datos.causa
					this.ambiente = datos.ambiente
					this.afectacion_posterior = datos.afectacion_posterior
					this.tratamiento = datos.tratamiento
					this.estatus = datos.estatus
					this.btnRevisar = (this.estatus == 'NUEVA')
          this.cierre.viaDemanda = datos.viaDemanda
          this.cierre.fecha_registro = registro.fecha_registro
          this.cierre.procede = (datos.procede && datos.procede == 'Si')
          this.cierre.formulacion = datos.formulacion
          this.cierre.dictamen = datos.dictamen

				}).catch( resp => {
					console.log('editaQueja() resp catch', resp)
				}).finally( () => {
					this.dialogProcess = false
				})
			}, // editaQueja()

			accion(valor) {
				let lastTab = (this.usuarioRH) ? 3 : 2
				if (valor == '+') {
					this.active_tab = (this.active_tab == lastTab) ? 0 : this.active_tab + 1
				} else {
					this.active_tab = (this.active_tab == 0) ? lastTab : this.active_tab - 1
				}
			},  // accion()

			esComite () {
				let autorizado = false
				this.dialogProcess = true
				this.$axios({
					method: 'GET',
					url: 'http://icertus.com.mx:8686/buzon/server/es_comite.php',
					params: {
						id: this.id_empleado
					}
				}).then( resp => {
					this.usuarioRH = (resp.data.autorizado == 'S')
					this.nombreRH = resp.data.nombre
					if (this.usuarioRH) {
						// Solo personal autorizado para ver la tabla
						this.cargaQuejas()
					}
				}).catch( resp => {
					console.log('esComite() catch', resp)
				}).finally( () => {
					this.dialogProcess = false
				})
			}, // esComite()


			cargaQuejas () {
				this.dialogProcess = true
				this.tabla_quejas.loading = true
				this.$axios({
					method: 'GET',
					url: 'http://icertus.com.mx:8686/buzon/server/notificaciones.php?opcion=carga', //'/api/notificaciones/?opcion=carga'
				}).then( resp => {
					this.tabla_quejas.quejas = resp.data.data
				}).catch( resp => {
					console.log('cargaQuejas() catch', resp)
				}).finally( () => {
					this.dialogProcess = false
					this.tabla_quejas.loading = false
				})
			}, // cargaQuejas()

			dlgComite() {
				// Método para cargar modal de las personas que integran el comité, para saber quienes podrán revisar las quejas
				this.dialogProcess = true
				this.$axios({
					method: 'GET',
					url: 'http://icertus.com.mx:8686/buzon/server/comite.php',
					params: {
						op: 'select'
					}
				}).then( response => {
					this.comite = response.data.data.comite
					this.empleados = response.data.data.empleados
					this.comite_dialog = true
					this.$nextTick( () => {
						//this.$refs.comite_autocomplete.$el.getElementsByTagName('input')[0].focus()
					})
				}).catch( response => {
					console.log('dglComite catch', response)
				}).finally( () => {
					this.dialogProcess = false
				})
			}, // comite()


			seleccion () {
				if (this.comite_autocomplete != undefined && this.comite_autocomplete != '') {
					// Rutina para mostrar list
					this.dialogProcess = true
					this.$axios({
						method: 'POST',
						url: 'http://icertus.com.mx:8686/buzon/server/comite.php?op=insert',
						data: {
							id_empleado: this.comite_autocomplete
						},
						headers: {
							'Content-Type': 'multipart/form-data; application/json',
							'Accept' : 'application/json'
						}
					}).then( resp => {
						if (resp.data.result == 200) {
							this.comite_autocomplete =  ''
							this.snackbar.text = resp.data.msg
							this.snackbar.snackbar = true
							this.dlgComite()
						}
					}).catch( resp => {
						console.log('seleccion() catch', resp)
					}).finally( () => {
						this.dialogProcess = false
					})
				}
			}, // seleccion()


			borraIntegrante (item) {
				this.$confirm('¿Estás seguro que quieres excluir del comité a <br><strong>' + item.nombre + '</strong>?').then(res => {
					if (res == true) {
						this.dialogProcess = true
						this.$axios({
							method: 'POST',
							url: 'http://icertus.com.mx:8686/buzon/server/comite.php?op=delete',
							data: {
								id_empleado: item.id_empleado
							},
							headers: {
								'Content-Type': 'multipart/form-data; application/json',
								'Accept' : 'application/json'
							}
						}).then(response => {
							this.snackbar.snackbar = true
							this.snackbar.text = response.data.msg
							this.dlgComite()
						}).catch( resp => {
							console.log('borraIntegrante() catch', resp)
						}).finally( () => {
							this.dialogProcess = false
						})
					}
				})

			}, // borraIntegrante()


			registraQueja () {
				// Sólo cuando la queja es nueva se puede registrar como revisada
				if (this.estatus == 'NUEVA') {
					this.$confirm('¿Deseas registrar la queja ' + this.id.substr(5) + '  como revisada?').then(res => {
						if (res == true) {
							this.dialogProcess = true
							this.$axios({
								method: 'POST',
								url: 'http://icertus.com.mx:8686/buzon/server/comite.php?op=review',
								data: {
									id: Number(this.id),
									id_revisado: this.id_empleado
								},
								headers: {
									'Content-Type': 'multipart/form-data; application/json',
									'Accept' : 'application/json'
								}
							}).then( resp => {
								if (resp.data.result == 200) {
									this.snackbar.text = resp.data.msg
									if (this.usuarioRH) {
										this.sendMsg('REVISION')
									}
								} else {
									this.snackbar.text = "Se detectó un problema con el servidor... intenta de nuevo por favor"
								}
							}).catch( resp => {
								console.log('registraQueja() resp catch', resp)
							}).finally( () => {
								this.dialogProcess = false
								this.snackbar.snackbar = (this.snackbar.text != '')
								this.cargaQuejas()
							}) // axios
						} // confirm.res = true
					}) // confirm
				}
			}, //  registraQueja()

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
				this.ejercicioMes = ejercicio + '-' + this.meses[mes-1]
				this.mes = this.today.substr(0, 7)
				this.mesAnt = ejercicioAnt.toString().padStart(4, '0') + '-' + mesAnt.toString().padStart(2, '0')
				this.mesDesp = ejercicioDesp.toString().padStart(4, '0') + '-' + mesDesp.toString().padStart(2, '0')
				// Actualizo el mes en el calendario y busco las juntas de cada día
				this.buscaEventos()
			}, // cambiaMes()

			buscaEventos() {
				this.dialogProcess = true
				this.$axios({
					method: 'GET',
					url: 'http://icertus.com.mx:8686/buzon/server/comite.php',
					params: {
						op: 'agenda_junta',
						id: Number(this.id)
					}
				}).then( resp => {
					this.events = resp.data.data
					/*
					this.today = this.fechaInicial
					if (this.events[0].date) {
						this.today = this.events[0].date
					}
					*/
				}).catch( resp => {
					console.log('catch buscaEventos()', resp)
				}).finally( () => {
					this.dialogProcess = false
				})

			}, // buscaEventos()


			editaJunta (ev) {
				// ver detalles de la junta y queja
				//console.log('editaJunta() ev', ev)
			},

			editaDia (day) {
				this.horaJunta = new Date().toLocaleTimeString('es-MX', {timeZone: 'America/Tijuana'});
				this.horaJuntaPicker = true
				this.junta_comite = day.date
			},

			seleccionaHora () {
				// Al presionar el botón "Ok" en el date-picker de la hora
				this.horaJuntaPicker = false
				this.horaJunta = this.horaJunta.substr(0, 5)
				this.$confirm('Confirmar la convocatoria al comité para junta:<br><ul><li>Queja <strong>' + this.id + '</strong></li><li>Fecha <strong>' + this.junta_comite + '</strong></li><li>Hora <strong>' + this.horaJunta + '</strong></li></ul>').then(res => {
					if (res == true) {
						this.dialogProcess = true
						this.$axios({
							method: 'post',
							url: 'http://icertus.com.mx:8686/buzon/server/notificaciones.php?opcion=add_meeting',
							data: {
								id: Number(this.id),
								junta_comite: this.junta_comite + ' ' + this.horaJunta,
								id_agenda: this.id_empleado,
								nombre_agenda: this.nombreRH
							}
						}).then( resp => {
							this.snackbar.text = resp.data.msg
							this.snackbar.snackbar = (resp.data.msg != '')
							if (resp.data.result == 200) {
								this.buscaEventos() // si se hizo un cambio o se seleccionó un nuevo día entonces llamo a buscar eventos de la queja
							}
						}).catch( resp => {
							console.log('seleccionarHora() catch', resp)
							this.snackbar.text = 'Se ha detectado un inconveniente :' + resp
							this.snackbar.snackbar = true
						}).finally( () => {
							this.dialogProcess = false
						})
					}
				})
			}, // seleccionaHora ()


			limpiaCampos () {
				this.id = ''
				this.nombre_afectado = ''
				this.puesto_afectado = ''
				this.telefono_afectado = ''
				this.area_afectado = ''
				this.jefe_afectado = ''
				this.nombre_agresor = ''
				this.puesto_agresor = ''
				this.telefono_agresor = ''
				this.area_agresor = ''
				this.jefe_agresor = ''
				this.fecha = this.fechaInicial
				this.hora = this.horaInicial
				this.lugar = ''
				this.frecuencia = ''
				this.detalle = ''
				this.actitud_agresor = ''
				this.reaccion_afectado = ''
				this.tipo_agresion = ''
				this.afectacion = ''
				this.rendimiento = ''
				this.causa = ''
				this.ambiente = ''
				this.afectacion_posterior = ''
				this.tratamiento = ''
				this.estatus = ''
				this.index = -1
				this.calendario = false
				this.dialogProcess = false
				this.horaJuntaPicker = false
				this.horaJunta = ''
				this.junta_comite = '',
        this.cierre.viaDemanda = ''
        this.cierre.fecha_registro = ''
        this.cierre.procede = true
        this.cierre.formulacion = ''
        this.cierre.dictamen = ''
			},

      guardaCierre() {
        let procedeSN = (this.cierre.procede) ? 'Si' : 'No'
        this.dialogProcess = true
        // Envío los datos para grabar el cierre
        this.$axios({
          method: 'post',
          url: 'http://icertus.com.mx:8686/buzon/server/notificaciones.php?opcion=cierre',
          data: {
            id: Number(this.id),
            viaDemanda: this.cierre.viaDemanda,
            procede: procedeSN,
            formulacion: this.cierre.formulacion,
            dictamen: this.cierre.dictamen,
            id_empleado: this.id_empleado
          }
        }).then( response => {
          let resp = response.data
          this.snackbar.text = resp.msg
          this.limpiaCampos()
          this.$refs.tab1.click()
          this.sendMsg('INSERT') // Envío mensaje al servidor para actualizar la tabla de quejas
        }).catch( response => {
          console.log('grabar() catch', response)
        }).finally( () => {
          this.dialogProcess = false
          this.snackbar.snackbar = true
        }) // axios
      }, // guardaCierre()

		},  // methods

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
  .my-avatar {
	margin: 0px;
	padding: 0px;
	vertical-align: middle;
	width: 42px;
	height: 42px;
	border-radius: 50%;
	object-fit: cover;
  }
</style>
