module Services
	class Translator 

		def initialize  lang = Dictionary.default_language, dictionary = Dictionary
			@dictionary = dictionary[lang] || dictionary
		end

		def translate key
			translation = key.to_s.split('.').inject(@dictionary) do |text_translated, key_token|
				if text_translated.is_a? Hash 
					text_translated = text_translated[key_token.to_sym] 
				else 
					text_translated = text_translated[key.to_sym] 
				end
				text_translated
			end

		end

	end


end


class Dictionary

	class << self	

		def languages
			[:es, :ca, :en]
		end

		def default_language
			:es
		end
  	

		def load payload = {}
			@payload = payload
		end

		def [] lang
			Dictionary.send(lang) || {}
		end

		def payload 
			@payload || {}
		end

		
		private
		

		def es 

			{ 
				foot_note_SL: "La información contenida en este email y en sus anexos es confidencial y dirigida exclusivamente para el uso del destinatario. Si usted no es el destinatario, notifíquelo al remitente devolviendo el email y borre el mensaje de su sistema. Cualquier distribución, difusión, copia u otro uso de esta información sin nuestro consentimiento esta estrictamente prohibida. Orfheo.org no es responsable de los contenidos de este email, ni de los daños que pudiera sufrir su ordenador causados por virus informáticos contenidos en los anexos del mismo.",
				foot_note_generic: "Este correo ha sido generado automáticamente y te ha sido enviado porque eres parte de la comunidad de orfheo.org. Puedes dejar de recibir notificaciones, haciendo el login y borrando tu cuenta desde el desplegable en tu página de inicio. Por favor, no respondas directamente a este mensaje, no hay nadie controlando este buzón. En caso de necesidad, contacta con tech@orfheo.org. ",
				foot_note_event_call: "Este correo ha sido generado automáticamente y te ha sido enviado porque eres parte de la comunidad de orfheo.org. Puedes decidir que anuncios de convocatorias recibir, modificando tus intereses en el panel de 'Ajustes', accesible después del login desde el menú desplegable de la barra de navegación. Desde el mismo desplegable, en cualquier momento, puedes también decidir eliminar tu cuenta y con ella tu información en orfheo.  Por favor, no respondas directamente a este mensaje, no hay nadie controlando este buzón. En caso de necesidad, contacta con tech@orfheo.org. ",
				foot_note_standard: "Este correo ha sido generado automáticamente. Por favor, no respondas directamente a este mensaje, no hay nadie controlando este buzón. En caso de necesidad, contacta con tech@orfheo.org. ",
				email: {
					welcome: {
						subject: 'Bienvenido/a a orfheo',
						body: "<p> Bienvenido/a a orfheo.</p><p> Activa tu cuenta con el siguiente enlace</p> <p><a href=\"https://www.orfheo.org/login/validate?id=#{payload[:validation_code]}\">Activa tu cuenta</a> </p>"
					},
					event:{
						subject:'Bienvenido/a a orfheo',
						body:"<p> Bienvenido/a a orfheo.</p> <p> Para activar tu cuenta y poder continuar con la inscripción en la convocatoria de  #{payload[:event_name]}, pincha en el siguiente enlace: <p> <a href=\"https://www.orfheo.org/login/validate?id=#{payload[:validation_code]}&event_id=#{payload[:event_id]}\">Activa tu cuenta</a> </p><p> El enlace te redirigirá a la página del evento. Pinchando al botón '¡Apúntate!', podrás ahora seguir con la inscripción en la convocatoria. Al finalizar el proceso, te saldrá un aviso de confirmación y recibirás un mensaje a tu buzón de correo electrónico.</p>"
					},
					forgotten_password:{
						subject: 'Recupera tu cuenta',
          	body: "<p> Puedes acceder a tu página de usuario a través del siguiente enlace </p> <p> <a href=\"https://www.orfheo.org/login/validate?id=#{payload[:validation_code]}\">Accede a tu página</a></p> <p> Este enlace sólo es válido una vez. Si no recuerdas tu contraseña, no olvides definir una nueva una vez dentro. </p>"
					},
					artist_proposal:{
						subject: "Propuesta enviada a #{payload[:event_name]}",
            body: "<p>Tu propuesta '#{payload[:title]}' ha sido inscrita correctamente en la convocatoria de <a href='https://www.orfheo.org/event?id=#{payload[:event_id]}'>#{payload[:event_name]}</a>.</p><p>La propuesta enviada puede ser modificada sólo por los organizadores del evento. Puedes acceder a ella, y eventualmente adjuntarle una enmienda antes del cierre de la convocatoria, desde el historial en tu página de perfil <a href='https://www.orfheo.org/profile?id=#{payload[:profile_id]}'>#{payload[:profile_name]}</a> después de haber hecho el login.<p></p>Para dudas o preguntas sobre la convocatoria y su gestión, contacta directamente con la organización al correo <a href='mailto:#{payload[:organizer_mail]}'>#{payload[:organizer_mail]}<a>.</p>"
					},
					space_proposal:{
            subject: "Propuesta enviada a #{payload[:event_name]}",
          	body: "<p>Has apuntado correctamente tu espacio '#{payload[:space_name]}' en la convocatoria de <a href='https://www.orfheo.org/event?id=#{payload[:event_id]}'>#{payload[:event_name]}</a>. Puedes comprobarlo desde el historial en tu página de perfil <a href='https://www.orfheo.org/profile?id=#{payload[:profile_id]}'>#{payload[:profile_name]}</a>. La propuesta enviada puede ser modificada sólo por los organizadores del evento. Sin embargo, puedes añadir una enmienda antes del cierre de la convocatoria.<p></p>Para dudas o preguntas sobre la convocatoria y su gestión, contacta directamente con la organización al correo <a href='mailto:#{payload[:organizer_mail]}'>#{payload[:organizer_mail]}<a>.</p>"
					},
					rejected:{
						subject: 'Propuesta cancelada',
            body: "<p> #{payload[:organizer]} ha cancelado la propuesta '#{payload[:title]}' que enviaste a la convocatoria de #{payload[:event_name]}. Para más informaciones contacta directamente con la organización del evento.</p>"
					},
					deleted_call:{
						subject: 'Convocatoria de #{payload[:event_name]} cancelada',
              body: "<p>La organización de #{payload[:event_name]} ha cancelado la correspondiente convocatoria y con ella todas las propuestas recibidas. Para más información, por favor, contacta directamente con los responsables. </p>"
					},
					open_call:{
						subject: "Convocatoria #{payload[:name]}",
          	body: "<p><strong>#{payload[:name]}</strong> abre su convocatoria en orfheo.</p><p>Envía tu propuesta antes del día #{payload[:deadline]}.</p><p> Puedes acceder a la convocatoria a través del siguiente link:</p><p><a href=\"http://www.orfheo.org/event?id=#{payload[:event_id]}\">orfheo/#{payload[:name]}</a></p><p>Para cualquier duda relacionada con la convocatoria y su gestión, contacta con <a href='mailto:#{payload[:organizer_email]}'>#{payload[:organizer_email]}</a>. En caso de problemas técnicos relacionados con la plataforma orfheo.org, contacta con <a href='mailto:tech@orfheo.org'>tech@orfheo.org</a>.</p>"
					},
					feedback:{
						subject:'feedback',
						body: "<p><b>Nombre:</b> #{payload[:name]}</p><p><b>Email:</b> #{payload[:email]}</p><p><p><b>Mensaje:</b> #{payload[:message]}</p>"
					},
					techSupport: {
						subject: "techSupport: #{payload[:subject]}",
            body: "<p><b>Nombre:</b> #{payload[:name]}</p><p><b>Perfil:</b> #{payload[:profile]}</p><p><b>Email:</b> #{payload[:email]}</p><p><b>Navegador:</b> #{payload[:browser]}</p><p><b>Mensaje:</b> #{payload[:message]}</p>"
					},
					business:{
						subject: "services: #{payload[:subject]}",
            body: "<p><b>Nombre:</b> #{payload[:name]}</p><p><b>Email:</b> #{payload[:email]}</p><p><p><b>Teléfono:</b> #{payload[:phone]}</p><p>Contacto teléfono: #{payload[:contactPhone]}</p><p>Contacto Hangout: #{payload[:contactHangout]}</p><p><b>Disponibilidad:</b> #{payload[:dayAvailability]}</p><p><b>Disponibilidad horaria:</b> #{payload[:periodAvailability]}</p><p><b>Links:</b> #{payload[:links]}</p><p><b>Mensaje:</b> #{payload[:message]}</p>"
					}
				}
			}

		end		

		def ca
			{
				foot_note_SL: "La informació continguda en aquest email i en els seus annexos és confidencial i dirigida exclusivament per a l'ús del destinatari. Si vostè no és el destinatari, notifiqui-al remitent retornant el correu electrònic i esborri el missatge del seu sistema. Qualsevol distribució, difusió, còpia o un altre ús d'aquesta informació sense el nostre consentiment està estrictament prohibit. Orfheo.org no és responsable dels continguts d'aquest email, ni dels danys que pogués patir el seu ordinador causats per virus informàtics continguts en els annexos d'aquest.",
				foot_note_generic: "Aquest correu ha sigut generat automàticament i t'ha sigut enviat perquè eres part de la comunitat d'orfheo.org. Pots deixar de rebre notificacions, eliminant el teu usuari després del login i esborrant el teu compte des del desplegable en la teua pàgina d'inici. Per favor, no respongues directament a aquest missatge, no hi ha ningú controlant aquesta bústia. En cas de necessitat, contacta amb tech@orfheo.org.",
				foot_note_event_call:"Aquest correu ha sigut generat automàticament i t'ha sigut enviat perquè eres part de la comunitat d'orfheo.org. Pots decidir que anuncis de convocatòries rebre, modificant els teus interessos en el panell de 'Configuració', accessible després del login des del menú desplegable de la barra de navegació. Des del mateix desplegable, en qualsevol moment, pots també decidir eliminar el teu compte i amb ella la teua informació en orfheo. Per favor, no respongues directament a aquest missatge, no hi ha ningú controlant aquesta bústia. En cas de necessitat, contacta amb tech@orfheo.org.",
				foot_note_standard: "Aquest correu ha sigut generat automàticament. Per favor, no respongues directament a aquest missatge, no hi ha ningú controlant aquesta bústia. En cas de necessitat, contacta amb tech@orfheo.org.",
					email: {
						welcome: {
							subject: 'Benvingut/da a orfheo',
							body: "<p> Benvingut/da a orfheo.</p><p> Activa el teu compte amb el següent enllaç</p> <p><a href=\"https://www.orfheo.org/login/validate?id=#{payload[:validation_code]}\">Activa el teu compte</a> </p>"
						},
						event:{
							subject:'Benvingut/da a orfheo',
							body: "<p> Benvingut/da a orfheo.</p><p> Per continuar amb la inscripció en la convocatòria de #{payload[:event_name]} activa el teu compte amb el següent enllaç</p> <p><a href=\"https://www.orfheo.org/login/validate?id=#{payload[:validation_code]}&event_id=#{payload[:event_id]}\">Activa el teu compte</a> </p><p>L'enllaç et redirigirà a la pàgina de l'esdeveniment. Punxant al botó 'Apunta't!', podràs ara seguir amb la inscripció en la convocatòria. Finalitzat el procés, t'eixirà un avís de confirmació i rebràs un missatge al teu correu electrònic.</p>"
						},
						forgotten_password:{
							subject: 'Recupera el teu compte',
              body: "<p> Pots accedir a la teva pàgina d'usuari mitjançant el següent enllaç </p> <p> <a href=\"https://www.orfheo.org/login/validate?id=#{payload[:validation_code]}\">Accedeix a la teva pàgina</a></p> <p> Aquest enllaç només és vàlid un cop. Si no recordes la contrasenya, no oblidis definir una nova un cop dins. </p>"
						},
						artist_proposal:{
							 subject: "Proposta enviada a #{payload[:event_name]}",
              body: "<p>La teua proposta '#{payload[:title]}' s'ha inscrit correctament en la convocatòria de  <a href='https://www.orfheo.org/event?id=#{payload[:event_id]}'>#{payload[:event_name]}</a>.</p><p> Pots accedir a ella y pots enviar una esmena abans del tancament de la convocatòria des de l'historial en la teua pàgina de perfil <a href='https://www.orfheo.org/profile?id=#{payload[:profile_id]}'>#{payload[:profile_name]}</a> després d'haver fet el login. La proposta enviada pot ser modificada només pels organitzadors de l'esdeveniment.<p></p>Per a dubtes o preguntes sobre la convocatòria i la seua gestió, contacta directament amb l'organització al correu <a href='mailto:#{payload[:organizer_mail]}'>#{payload[:organizer_mail]}<a>.</p>"
						},
						space_proposal: {
              subject: "Proposta enviada a #{payload[:event_name]}",
              body: "<p>Has apuntat correctament el teu espai '#{payload[:space_name]}' en la convocatòria de  <a href='https://www.orfheo.org/event?id=#{payload[:event_id]}'>#{payload[:event_name]}</a>. Pots comprovar-ho des de l'historial en la teua pàgina de perfil <a href='https://www.orfheo.org/profile?id=#{payload[:profile_id]}'>#{payload[:profile_name]}</a>. La proposta enviada pot ser modificada només pels organitzadors de l'esdeveniment. No obstant açò, pots afegir una esmena abans del tancament de la convocatòria.<p></p>Per a dubtes o preguntes sobre la convocatòria i la seua gestió, contacta directament amb l'organització al correu <a href='mailto:#{payload[:organizer_mail]}'>#{payload[:organizer_mail]}<a>.</p>"
            },
            rejected:{
              subject: 'Proposta cancel·lada',
              body: "<p> #{payload[:organizer]} ha cancel·lat la proposta '#{payload[:title]}' que vas enviar per al #{payload[:event_name]}. Per a més informacions contacta directament amb l'organització de l'esdeveniment.</p>"
            },
            deleted_call:{
            	subject: 'Convocatòria de #{payload[:event_name]} cancel·lada',
              body: "<p>L'organització de #{payload[:event_name]} ha cancel·lat la corresponent convocatòria i amb ella totes les propostes rebudes. Per a més informació, per favor, contacta directament amb els responsables.</p>"
            },
            open_call: {
            	subject: "Convocatòria #{payload[:name]}",
          		body: "<p> <strong>#{payload[:name]}</strong> obri la seua convocatòria en orfheo.</p><p>Envia la teua proposta abans del dia #{payload[:deadline]}.</p><p>Pots accedir a la convocatòria a través del següent link:</p><p><a href=\"http://www.orfheo.org/event?id=#{payload[:event_id]}&lang=ca\">orfheo/#{payload[:name]}</a></p><p>Per a qualsevol dubte relacionat amb la convocatòria i la seua gestió, contacta amb <a href='mailto:#{payload[:organizer_email]}'>#{payload[:organizer_email]}</a>. En cas de problemes tècnics relacionats amb la plataforma orfheo.org, contacta amb <a href='mailto:tech@orfheo.org'>tech@orfheo.org</a>.</p>"
            }
					}
			}

		end


		def en 
			{
				foot_note_SL: "The information contained in this email and in its annexes is confidential and directed exclusively for the use of the addressee. If you are not the addressee, notify the sender by returning the email and delete the message from your system. Any distribution, dissemination, copying or other use of this information without our consent is strictly prohibited. Orfheo.org is not responsible for the contents of this email, nor for the damages that your computer may suffer caused by computer viruses contained in the annexes of the same.",
				foot_note_generic: "This email was automatically sent. You received it because you are part of the community orfheo.org. You can stop receiving notifications by logging in and deleting your account from the dropdown in your home. Please, do not reply to this message. If you need, you can contact with tech@orfheo.org.   ",
				foot_note_event_call: "This email was automatically sent. You received it because you are part of the community orfheo.org. You can decide which notifications receive by logging in and modifying your interests from the 'Settings' of the header dropdown menu. Similarly you can also decide to delete your account and with it all the information related with it. Please, do not reply to this message. If you need, you can contact with tech@orfheo.org.",
				foot_note_standard: "This email was automatically sent. Please, do not reply to this message. If you need, you can contact with tech@orfheo.org.",
				email: {
						welcome: {
							subject: 'Welcome to orfheo',
							body: "<p> Welcome to orfheo.</p><p> Activate your account with the following link</p> <p><a href=\"https://www.orfheo.org/login/validate?id=#{payload[:validation_code]}\">Activate your account</a> </p>"
						},
						event:{
							subject:'Welcome to orfheo',
							body: "<p> Welcome to orfheo.</p><p> In order to continue with the call of #{payload[:event_name]}, activate your account with the following link</p> <p><a href=\"https://www.orfheo.org/login/validate?id=#{payload[:validation_code]}&event_id=#{payload[:event_id]}\">Activate your account</a> </p><p> You will be redirected to the page of the event in orfheo. Clicking on the button 'Sign up!', you can now begin the process to send you proposal. After finishing, you will received a confirmation message.<p>"
						},
						forgotten_password:{
							subject: 'Recover your account',
              body: "<p> You can access your user page through the following link </p> <p> <a href=\"https://www.orfheo.org/login/validate?id=#{payload[:validation_code]}\">Access your page</a></p> <p> This link is only valid once. If you do not remember your password, do not forget to define a new one once inside. </p>"
						},
						artist_proposal:{
							 subject: "You sent a proposal to #{payload[:event_name]}",
              body: "<p>Your proposal '#{payload[:title]}' has been correctly submitted to the call of <a href='https://www.orfheo.org/event?id=#{payload[:event_id]}'>#{payload[:event_name]}</a>.</p><p>Only the organizers of the call can modify the proposal. You can check it, and eventually amend it before the call deadline, from the history block in the page of your profile  <a href='https://www.orfheo.org/profile?id=#{payload[:profile_id]}'>#{payload[:profile_name]}</a> after logging in.  </p><p>For information about the call and its management, please contact directly with the organization by <a href='mailto:#{payload[:organizer_mail]}'>#{payload[:organizer_mail]}<a>.</p>"
						},
						space_proposal:{
							subject: "You sent a proposal to #{payload[:event_name]}",
              body: "<p>Your space '#{payload[:space_name]}' has been correctly inscribed in the call of <a href='https://www.orfheo.org/event?id=#{payload[:event_id]}'>#{payload[:event_name]}</a>. You can check it in the page of your profile <a href='https://www.orfheo.org/profile?id=#{payload[:profile_id]}'>#{payload[:profile_name]}</a>. Only the organizers of the event can modify the proposal. At most you can amend it before the closing date of the call. </p><p>For information about the call and its management, please contact directly with the organization by <a href='mailto:#{payload[:organizer_mail]}'>#{payload[:organizer_mail]}<a>.</p>"
						},
						rejected:{
              subject: 'Proposal deleted',
              body: "<p> #{payload[:organizer]} has deleted your proposal '#{payload[:title]}' for the #{payload[:event_name]}. For more information, please contact directly with the organizers of the event.</p>"
            },
            deleted_call:{
            	subject: '#{payload[:event_name]} has deleted its call',
              body: "<p>The organizers of #{payload[:event_name]} has deleted the correponding call and with it all the proposals received. For more information, please contact directly with them.</p>"
            },
            open_call: {
            	subject: "Open Call #{payload[:name]}",
          		body: "<p> <strong>#{payload[:name]}</strong> launches its call in orfheo.</p><p>Submit your proposal before #{payload[:deadline]}.</p><p>You can access the call through the following link:</p><p><a href=\"http://www.orfheo.org/event?id=#{payload[:event_id]}&lang=en\">orfheo/#{payload[:name]}</a></p><p>For any question about the call, please contact with <a href='mailto:#{payload[:organizer_email]}'>#{payload[:organizer_email]}</a>. In case of technical problems, write to <a href='mailto:tech@orfheo.org'>tech@orfheo.org</a>.</p>"
            }
					}

			}
		end

	end

end

