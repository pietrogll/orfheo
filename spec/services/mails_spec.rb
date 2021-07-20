describe Services::Mails do

  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:validation_code){'3c61cf77-32b0-4df2-9376-0960e64a654a'}
  let(:event_id){'a5bc4203-9379-4de0-856a-55e1e5f3fac6'}

  let(:user){
    {
      id: user_id,
      email: 'email@test.com',
      password: 'password',
      lang: 'es',
      validation: false,
      validation_code: validation_code   
    }
  }

  let(:event_info){
    {
      event_id: event_id,
      event_name: 'event_name'
    }
  }

  let(:rejection){
    {
      organizer: 'organizer',
      title: 'title',
      event_name: 'event_name'
    }
  }

  let(:artistProposal){
    {
      event_id: event_id,
      event_name: 'event_name',
      title: 'proposal_title',
      organizer_mail: 'email@email.email',
      profile_name: 'profile_name',
      profile_id: 'profile_id'
    }
  }

  let(:spaceProposal){
    {
      event_id: event_id,
      event_name: 'event_name',
      space_name: 'space_name',
      organizer_mail: 'email@email.email',
      profile_name: 'profile_name',
      profile_id: 'profile_id'
    }
  }

  let(:feedback){
    {
      email: 'contacter@contact',
      name: 'contacter',
      message: 'message'
    }
  }

  let(:techSupport){
    {
      email: 'contacter@contact',
      name: 'contacter',
      subject: 'need_help',
      profile: 'my_profile',
      browser: 'firefox',
      message: 'help'
    }
  }

  let(:business){
    {
      email: 'contacter@contact',
      name: 'contacter',
      subject: 'business',
      contact: 'phone',
      phone: '123456789',
      dayAvailability: 'dayAvailability',
      periodAvailability: 'periodAvailability',
      links: 'links',
      message: 'message'
    }
  }

  let(:mailer){Services::Mails.new}
  

  describe 'Delivers mail' do

    let(:welcome_mail){mailer.deliver_mail_to user, :welcome}


    it 'renders the receiver email' do
      expect(welcome_mail.to).to eq(['email@test.com'])
    end
  end




  describe 'Welcome mail' do

    let(:welcome_mail){mailer.deliver_mail_to user, :welcome}

    it 'renders the subject' do
      expect(welcome_mail.subject).to eq('Bienvenido/a a orfheo')
    end

    it 'renders the sender' do
      expect(welcome_mail.from).to eq(["notification@orfheo.org"])
    end

    it 'assigns the validation code to the body' do
      expect(welcome_mail.body).to include(validation_code)
    end


    it 'assigns the footer to the body' do
      expect(welcome_mail.body).to include("Este correo ha sido generado automáticamente.")
    end

  end

  describe 'Event mail' do
    let(:event_mail){ mailer.deliver_mail_to user, :event, event_info}

    it 'renders the subject' do
      expect(event_mail.subject).to eq('Bienvenido/a a orfheo')
    end

    it 'renders the sender' do
      expect(event_mail.from).to eq(["notification@orfheo.org"])
    end

    it 'assigns the validation code and event code to the body' do
      expect(event_mail.body).to include(validation_code + '&event_id=' + event_id)
    end
  end

  describe 'Password mail' do

    let(:password_mail){ mailer.deliver_mail_to user, :forgotten_password}

    it 'renders the subject' do
      expect(password_mail.subject).to eq('Recupera tu cuenta')
    end

    it 'renders the sender' do
      expect(password_mail.from).to eq(["notification@orfheo.org"])
    end

    it 'assigns the validation code to the body' do
      expect(password_mail.body).to include(validation_code)
    end
  end

  describe 'Rejected' do

    let(:rejected_mail){ mailer.deliver_mail_to user, :rejected, rejection}

    it 'renders the subject' do
      expect(rejected_mail.subject).to eq('Propuesta cancelada')
    end

    it 'renders the sender' do
      expect(rejected_mail.from).to eq(["notification@orfheo.org"])
    end

    it 'assigns the message to the body' do
      expect(rejected_mail.body).to include("organizer ha cancelado la propuesta 'title' que enviaste a la convocatoria de event_name. Para más informaciones contacta directamente con la organización del evento.")
    end


  end


  describe 'artist proposal mail' do

    let(:proposal_mail){ mailer.deliver_mail_to user, :artist_proposal, artistProposal}

    it 'renders the subject' do
      expect(proposal_mail.subject).to eq('Propuesta enviada a event_name')
    end

    it 'renders the sender' do
      expect(proposal_mail.from).to eq(["notification@orfheo.org"])
    end

    it 'assigns the message to the body' do
      expect(proposal_mail.body).to include("Tu propuesta 'proposal_title' ha sido inscrita correctamente en la convocatoria de <a href='https://www.orfheo.org/event?id=a5bc4203-9379-4de0-856a-55e1e5f3fac6'>event_name</a>")
    end

    it 'assigns the footer to the body' do
      expect(proposal_mail.body).to include("Este correo ha sido generado automáticamente. Por favor, no respondas directamente a este mensaje, no hay nadie controlando este buzón. En caso")
    end

  end


  describe 'space proposal mail' do

    let(:proposal_mail){ mailer.deliver_mail_to user, :space_proposal, spaceProposal}

    it 'renders the subject' do
      expect(proposal_mail.subject).to eq('Propuesta enviada a event_name')
    end

    it 'renders the sender' do
      expect(proposal_mail.from).to eq(["notification@orfheo.org"])
    end

    it 'assigns the message to the body' do
      expect(proposal_mail.body).to include("Has apuntado correctamente tu espacio 'space_name' en la convocatoria de")
    end

    it 'renders the receiver' do
      expect(proposal_mail.to).to eq(["email@test.com"])
    end

  end

  describe 'Feedback' do

    let(:feedback_mail){ mailer.deliver_mail_to({:email=>'info@orfheo.org'}, :feedback, feedback)}

    it 'renders the subject' do
      expect(feedback_mail.subject).to eq('feedback')
    end

    it 'renders the sender' do
      expect(feedback_mail.from).to eq(['contacter@contact'])
    end

    it 'assigns the message to the body' do
      expect(feedback_mail.body).to include("<p><b>Nombre:</b> contacter</p><p><b>Email:</b> contacter@contact</p><p><p><b>Mensaje:</b> message</p>")
    end

    it 'renders the receiver to be info@orfheo.org' do
      expect(feedback_mail.to).to eq(['info@orfheo.org'])
    end
  
  end

  describe 'TechSupport' do

    let(:tech_mail){ mailer.deliver_mail_to({:email=>'tech@orfheo.org'}, :techSupport, techSupport)}

    it 'renders the subject' do
      expect(tech_mail.subject).to eq('techSupport: need_help')
    end

    it 'renders the sender' do
      expect(tech_mail.from).to eq(['contacter@contact'])
    end

    it 'assigns the message to the body' do
      expect(tech_mail.body).to include("<p><b>Nombre:</b> contacter</p><p><b>Perfil:</b> my_profile</p><p><b>Email:</b> contacter@contact</p><p><b>Navegador:</b> firefox</p><p><b>Mensaje:</b> help</p>")
    end

    it 'renders the receiver to be tech@orfheo.org' do
      expect(tech_mail.to).to eq(['tech@orfheo.org'])
    end

    it 'has the correct from options' do
      options = Services::Mails::MailOptionsGenerator.generate_options_for(:techSupport, {:email=>'tech@orfheo.org'}, techSupport)
      expect(options[:from]).to eq(techSupport[:email])
    end


  end

  describe 'Business' do

    let(:business_mail){ mailer.deliver_mail_to({:email=>'info@orfheo.org'}, :business, business)}

    it 'renders the subject' do
      expect(business_mail.subject).to eq('services: business')
    end

    it 'renders the sender' do
      expect(business_mail.from).to eq(['contacter@contact'])
    end

    it 'assigns the message to the body' do
      expect(business_mail.body).to include('<p><b>Nombre:</b> contacter</p><p><b>Email:</b> contacter@contact</p><p><p><b>Teléfono:</b> 123456789</p><p>Contacto teléfono: </p><p>Contacto Hangout: </p><p><b>Disponibilidad:</b> dayAvailability</p><p><b>Disponibilidad horaria:</b> periodAvailability</p><p><b>Links:</b> links</p><p><b>Mensaje:</b> message</p>')
    end

    it 'renders the receiver to be info@orfheo.org' do
      expect(business_mail.to).to eq(['info@orfheo.org'])
    end

  end

  describe 'Generic Mail' do

    # let(:generic_email){mailer.deliver_mail_to user, :generic_email}
    let(:payload){
      {
        es:{
          body: 'generic_email body',
          subject: 'generic_email subject'
        }
      }
    }

    it 'renders the generic_footer if email_type nil' do
      expect(mailer.deliver_mail_to(user, :generic_email, payload).body).not_to include(user_id)
    end

    it 'renders the event_call footer if email_type is event_call' do
      payload[:email_type] = 'event_call'
      expect(mailer.deliver_mail_to(user, :generic_email, payload).body).to include('Ajustes')
    end


    it 'renders the subject' do
      payload[:email_type] = 'event_call'
      expect(mailer.deliver_mail_to(user, :generic_email, payload).subject).to include('generic_email subject')
    end


    it 'renders the body' do
      payload[:email_type] = 'event_call'
      expect(mailer.deliver_mail_to(user, :generic_email, payload).body).to include('generic_email body')
    end


  end

  describe 'Call deleted mail' do

    it 'renders the event_call footer if email_type is event_call' do
      payload = {}
      payload[:event_name] = 'event_name'
      expect(mailer.deliver_mail_to(user, :deleted_call, payload).body).to include('event_name ha cancelado la correspondiente')
      expect(mailer.deliver_mail_to(user, :deleted_call, payload).body).to include(Dictionary[:es][:foot_note_standard])
    end

  end


  describe 'deliver_to_mailing_list' do
    let(:receiver_1){
      {
        email: "email_1@email.email",
        lang: 'es'
      }
    }
    let(:receiver_2){
      {
        email: "email_2@email.email",
        lang: 'es'
      }
    }
    let(:receiver_3){
      {
        email: "email_3@email.email",
        lang: 'es'
      }
    }
    let(:mailing_list){[receiver_1, receiver_2, receiver_3]}

    it 'delivers one email per time to all receivers of the mailing list' do
      expect(mailer).to receive(:deliver_mail_to).exactly(3).times
      mailer.deliver_to_mailing_list(mailing_list, {})
    end

    it 'execute a given block to each iteration' do
      @count = 0  
      @receivers_done = []
      allow(mailer).to receive(:deliver_mail_to).and_return(true)
      mailer.deliver_to_mailing_list(mailing_list, {}) do |receivers_done|
        @receivers_done = receivers_done
        @count += 1
      end
      expect(@count).to be 3
      expect(@receivers_done).to eq mailing_list
    end

  end



end
