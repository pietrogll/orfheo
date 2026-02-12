# frozen_string_literal: true

shared_examples 'http_methods' do
  let(:login_route) { '/login/login' }
  let(:logout_route) { '/login/logout' }

  let(:register_route) { '/login/register' }

  let(:create_activity_route) { '/users/create_performances' }
  let(:create_profile_route) { '/users/create_profile' }
  let(:create_call_route) { '/users/create_call' }
  let(:create_event_route) { '/users/create_event' }
  let(:create_form_route) { '/forms/create' }

  let(:send_space_proposal_route) { '/users/send_space_proposal' }
  let(:send_artist_proposal_route) { '/users/send_artist_proposal' }

  let(:modify_activity_route) { '/users/modify_performances' }
  let(:modify_artist_proposal_route) { '/users/modify_artist_proposal' }
  let(:modify_space_proposal_route) { '/users/modify_space_proposal' }
  let(:modify_param_proposal_route) { '/users/modify_param_proposal' }
  let(:modify_call_route) { '/users/modify_call' }
  let(:modify_event_route) { '/users/modify_event' }
  let(:modify_form_route) { '/forms/modify' }
  let(:modify_participant_route) { '/participant/modify' }

  let(:amend_space_proposal_route) { '/users/amend_space_proposal' }
  let(:amend_artist_proposal_route) { '/users/amend_artist_proposal' }

  let(:delete_activity_route) { '/users/delete_performances' }
  let(:delete_space_proposal_route) { '/users/delete_space_proposal' }
  let(:delete_artist_proposal_route) { '/users/delete_artist_proposal' }
  let(:delete_production_route) { '/users/delete_production' }
  let(:delete_space_route) { '/users/delete_space' }
  let(:delete_call_route) { '/users/delete_call' }
  let(:delete_form_route) { '/forms/delete' }

  let(:select_deselect_space_route) { '/users/select_space_proposal' }
  let(:select_deselect_artist_route) { '/users/select_artist_proposal' }

  let(:delete_production_route) { '/users/delete_production' }
  let(:delete_space_route) { '/users/delete_space' }
  let(:delete_event_route) { '/users/delete_event' }

  let(:check_name_route) { '/users/checks_participant_name' }
  let(:slug_route) { '/users/create_slug' }
  let(:update_partners_route) { '/users/update_partners' }
  let(:forms_route) { '/forms' }
end

shared_examples 'ids' do
  let(:activity_id) { 'aaaa0000-ecac-4237-9740-c8ae7a586000' }
  let(:admin_id) { '00000000-ecac-4237-9740-c8ae7a586000' }
  let(:call_id) { 'b5bc4203-9379-4de0-856a-55e1e5f3fac6' }
  let(:event_id) { 'a5bc4203-9379-4de0-856a-55e1e5f3fac6' }
  let(:other_user_id) { '8c41cf77-32b0-4df2-9376-0960e64a2222' }
  let(:otter_event_id) { '00bc4203-0079-00e0-006a-00e1e5f3fac6' }
  let(:otter_activity_id) { 'a11000e7-8f02-5542-a1c9-7f7aa18752ce' }
  let(:otter_profile_id) { '8c41cf77-32b0-4df2-9376-0960e64aabcd' }
  let(:otter_proposal_id) { 'b11000e7-8f02-abcd-a1c9-7f7aa18752ce' }
  let(:call_participant_profile_id) { 'fce01c94-4a2b-49ff-b6b6-dfd53e45bb00' }
  let(:call_participant_user_id) { '8c41cf77-32b0-4df2-9376-0960e64a0000' }
  let(:form_id) { '01234567-0000-499c-825c-a7134a3faaaa' }
  let(:host_id) { 'aa5599aa-0000-499c-825c-a7134a3faaaa' }
  let(:participant_id) { 'bbbb5599-0000-499c-cccc-a7134a3faabb' }
  let(:performance_id) { 'fce01c94-aa2b-a9ff-a6b6-dfd53e45bb80' }
  let(:production_id) { 'fce01c94-4a2b-49ff-b6b6-dfd53e45bb80' }
  let(:profile_id) { 'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83' }
  let(:program_id) { 'a0000000-ecac-4237-9740-c8ae7a586000' }
  let(:proposal_id) { 'b11000e7-8f02-4542-a1c9-7f7aa18752ce' }
  let(:space_proposal_id) { 'aaaaaaaa-8f02-4542-a1c9-7f7aa18752ce' }
  let(:space_id) { '00009bdd-ecac-0000-0000-c8ae7a580000' }
  let(:user_id) { '5c41cf77-32b0-4df2-9376-0960e64a654a' }
end

shared_examples 'db_elements' do
  let(:admin) do
    {
      id: admin_id
    }
  end

  let(:admin_user) do
    {
      id: admin_id,
      email: 'admin@test.com',
      password: 'admin_passwd',
      validation: true,
      lang: 'es',
      interests: { event_call: { categories: %w[arts music] } },
      register_date: 1_667_170_800_000,
      last_login: 1_667_170_800_000
    }
  end

  let(:user) do
    {
      id: user_id,
      email: 'email@test.com',
      password: 'password',
      lang: 'es',
      validation: true,
      interests: { event_call: { categories: %w[arts music] } },
      register_date: 1_667_170_800_000,
      last_login: 1_667_170_800_000
    }
  end

  let(:call_participant_user) do
    {
      id: call_participant_user_id,
      email: 'participant@email.email',
      password: 'otter_password',
      lang: 'ca',
      validation: true,
      interests: { event_call: { categories: %w[arts music] } },
      register_date: 1_667_170_800_000,
      last_login: 1_667_170_800_000
    }
  end

  let(:other_user) do
    {
      id: other_user_id,
      email: 'other@other.com',
      password: 'other_user_passwd',
      lang: 'en',
      validation: true,
      interests: { event_call: { categories: %w[arts music] } },
      register_date: 1_667_170_800_000,
      last_login: 1_667_170_800_000
    }
  end

  let(:profile) do
    {
      user_id: user_id,
      id: profile_id,
      facets: 'facet',
      tags: nil,
      name: 'name',
      email: { visible: 'false', value: 'contact_email@test.com' },
      profile_picture: ['profile_picture.jpg'],
      address: { postal_code: '46020', locality: 'city' },
      description: nil,
      short_description: nil,
      personal_web: nil,
      color: 'color',
      phone: { visible: 'false', value: 'phone' },
      buttons: [{ text: 'text_button', links: 'link_button' }],
      menu: %w[
        free_block
        upcoming
        space
        description
        portfolio
        history
      ],
      relations: []
    }
  end

  let(:call_participant_profile) do
    {
      user_id: call_participant_user_id,
      id: call_participant_profile_id,
      facets: 'facet',
      tags: nil,
      name: 'name',
      email: { visible: 'false', value: 'contact_email@test.com' },
      profile_picture: ['profile_picture.jpg'],
      address: { postal_code: '46020', locality: 'city' },
      description: nil,
      short_description: nil,
      personal_web: nil,
      color: 'color',
      phone: { visible: 'false', value: 'phone' },
      buttons: [{ text: 'text_button', links: 'link_button' }],
      menu: %w[
        free_block
        upcoming
        space
        description
        portfolio
        history
      ],
      relations: []

    }
  end

  let(:event) do
    {
      user_id: user_id,
      profile_id: profile_id,
      id: event_id,
      name: 'event_name',
      eventTime: [
        {
          "date": '2019-10-07',
          "time": %w[
            2007363200000
            2007413600000
          ]
        }
      ]
    }
  end

  let(:otter_event) do
    {
      user_id: call_participant_user_id,
      profile_id: profile_id,
      id: otter_event_id,
      name: 'otter_event_name',
      eventTime: [
        {
          "date": '2017-04-25',
          "time": %w[
            1493136000000
            1493157600000
          ]
        },
        {
          "date": '2017-04-26',
          "time": %w[
            1493222400000
            1493244000000
          ]
        }
      ],
      participants: {}
    }
  end

  let(:call) do
    {
      id: call_id,
      user_id: user_id,
      event_id: event_id,
      profile_id: profile_id,
      start: '1461053600000',
      deadline: '1466028000000',
      whitelist: [],
      conditions: 'conditions',
      participants: [],
      forms: %w[form_id_1 form_id_2 form_id_3 form_id_4]
    }
  end

  let(:artist_blocks) do
    {
      es: {
        title: { type: 'mandatory' },
        description: { type: 'mandatory' },
        short_description: { type: 'mandatory' },
        duration: { type: 'mandatory' },
        '1': { type: 'optional', input: 'UploadPhotos' },
        '2': { type: 'mandatory', input: 'Input' },
        '3': { type: 'optional', input: 'LinkUploadPDF' },
        '4': { type: 'optional', input: 'SummableInputs',
               args: { '0': { '0': { type: 'optional', input: 'UploadPDF' } } } },
        category: { type: 'mandatory' },
        subcategory: { type: 'mandatory' },
        photos: { type: 'optional' }
      }
    }
  end

  let(:space_block) do
    {
      es: {
        # subcategory: 'subcategory'
        '1': { type: 'optional', input: 'UploadPhotos' },
        '2': { type: 'mandatory' },
        ambient_info: {
          capacity: { type: 'mandatory' }
        }
      }
    }
  end

  let(:artist_form_1) do
    {
      id: 'form_id_1',
      call_id: call_id,
      type: 'artist',
      blocks: artist_blocks,
      texts: {
        es: 'texts'
      },
      own: 'own'
    }
  end

  let(:artist_form_2) do
    {
      id: 'form_id_2',
      call_id: call_id,
      type: 'artist',
      blocks: artist_blocks,
      texts: {
        es: 'texts'
      }
    }
  end

  let(:space_form_1) do
    {
      id: 'form_id_3',
      call_id: call_id,
      type: 'space',
      blocks: space_block,
      texts: {
        es: 'texts'
      }
    }
  end

  let(:space_form_2) do
    {
      id: 'form_id_4',
      call_id: call_id,
      type: 'space',
      blocks: space_block,
      texts: {
        es: 'texts'
      },
      own: 'private'
    }
  end

  let(:artistproposal) do
    {
      id: proposal_id,
      profile_id: profile_id,
      event_id: event_id,
      call_id: call_id,
      production_id: production_id,
      user_id: user_id,
      form_id: 'form_id_1',
      register_date: 1_667_170_800_000,
      subcategory: 'music',
      selected: true,
      category: 'music',
      format: 'concert',
      title: 'title',
      short_description: 'short_description',
      description: 'description',
      duration: 'duration',
      photos: ['picture.jpg', 'otter_picture.jpg'],
      # '1': nil,
      '2': 'mandatory',
      phone: { 'visible' => 'false', 'value' => 'phone' }
    }
  end

  let(:own_artist_proposal) do
    {
      id: proposal_id,
      profile_id: proposal_id,
      event_id: event_id,
      user_id: user_id,
      call_id: call_id,
      subcategory: 'music',
      form_id: 'form_id_1',
      category: 'music',
      format: 'concert',
      title: 'own_title',
      short_description: 'short_description',
      description: 'own_description',
      duration: 'duration',
      register_date: 6_002_054_000_000,
      own: true,
      selected: true,
      phone: { 'visible' => 'false', 'value' => 'phone' }
    }
  end

  let(:spaceproposal) do
    {
      id: space_proposal_id,
      profile_id: call_participant_profile_id,
      event_id: event_id,
      call_id: call_id,
      space_id: space_id,
      user_id: call_participant_user_id,
      subcategory: 'home',
      form_id: 'form_id_3',
      space_name: 'space_name',
      address: 'address',
      type: 'space_type',
      description: 'space_description',
      plane_picture: ['plane_picture.jpg'],
      register_date: 1_462_054_000,
      selected: true,
      single_ambient: 'true',
      phone: { 'visible' => 'false', 'value' => 'phone' },
      ambients: [{
        name: 'ambient_name',
        description: 'ambient_description',
        allowed_categories: ['music'],
        allowed_formats: ['concert'],
        capacity: '12',
        photos: ['ambient_picture.jpg']
      }],
      # '1': nil,
      '2': 'mandatory'
    }
  end

  let(:own_space_proposal) do
    {
      id: space_proposal_id,
      profile_id: profile_id,
      event_id: event_id,
      call_id: call_id,
      user_id: user_id,
      subcategory: 'home',
      form_id: 'form_id_3',
      own: true,
      space_name: 'space_name',
      address: 'address',
      type: 'home',
      single_ambient: 'false',
      phone: { 'visible' => 'false', 'value' => 'phone' },
      ambients: [{
        name: 'ambient_name',
        description: 'ambient_description',
        allowed_categories: ['music'],
        allowed_formats: ['concert']
      }],
      selected: true
    }
  end

  let(:production) do
    {
      profile_id: profile_id,
      id: production_id,
      format: 'concert',
      category: 'music',
      main_picture: ['picture.jpg'],
      title: 'title',
      tags: nil,
      description: 'description',
      short_description: 'short_description',
      duration: 'duration',
      photos: ['picture.jpg', 'otter_picture.jpg'],
      links: nil,
      children: nil,
      cache: { value: nil, visible: false, comment: nil }
    }
  end

  let(:activity) do
    {
      id: activity_id,
      participant_id: call_participant_profile_id,
      host_id: host_id,
      participant_proposal_id: proposal_id,
      host_proposal_id: space_proposal_id,
      space_id: space_id,
      event_id: event_id,
      program_id: program_id,
      permanent: 'false',
      dateTime: [
        { 'date' => '2016-15-10', 'time' => %w[10 14], :id_time => activity_id },
        { 'date' => '2016-15-10', 'time' => %w[17 23], :id_time => activity_id },
        { 'date' => '2016-16-10', 'time' => %w[11 13], :id_time => activity_id }
      ]
    }
  end

  let(:otter_activity) do
    {
      id: otter_activity_id,
      participant_id: otter_profile_id,
      host_id: host_id,
      participant_proposal_id: otter_proposal_id,
      host_proposal_id: space_proposal_id,
      space_id: space_id,
      event_id: event_id,
      program_id: program_id,
      dateTime: [
        { 'date' => '2016-15-10', 'time' => %w[10 14], id_time: activity_id }
      ],
      permanent: 'false'
    }
  end

  let(:program) do
    {
      id: program_id,
      event_id: event_id,
      user_id: user_id,
      Zactivities: [],
      participants: [],
      order: [],
      published: false,
      price: nil,
      ticket_url: nil
    }
  end
end

shared_examples 'params' do
  let(:user_hash) do
    {
      email: 'email@test.com',
      password: 'password'
    }
  end

  let(:receiver) do
    {
      id: call_participant_user_id,
      email: 'contact_email@test.com',
      password: 'otter_password',
      lang: 'ca',
      validation: true,
      interests: { event_call: { categories: %w[arts music] } },
      register_date: 1_667_170_800_000,
      last_login: 1_667_170_800_000
    }
  end

  let(:phone) do
    {
      visible: 'false',
      value: 'phone'
    }
  end

  let(:activity_params) do
    {
      id: activity_id,
      participant_id: call_participant_profile_id,
      host_id: host_id,
      participant_proposal_id: proposal_id,
      host_proposal_id: space_proposal_id,
      space_id: space_id,
      event_id: event_id,
      program_id: program_id,
      confirmed: nil,
      dateTime: [
        { date: '2016-15-10', time: %w[10 14] },
        { date: '2016-15-10', time: %w[17 23] },
        { date: '2016-16-10', time: %w[11 13] }
      ],
      permanent: 'false',
      price: nil,
      comments: nil,
      ticket_url: nil
    }
  end

  let(:otter_activity_params) do
    {
      id: otter_activity_id,
      participant_id: call_participant_profile_id,
      host_id: host_id,
      participant_proposal_id: proposal_id,
      host_proposal_id: space_proposal_id,
      space_id: space_id,
      event_id: event_id,
      program_id: program_id,
      confirmed: nil,
      dateTime: [
        { date: '2016-15-10', time: %w[10 14] }
      ],
      permanent: false,
      price: nil,
      comments: nil,
      ticket_url: nil
    }
  end

  let(:spaceproposal_params) do
    {
      user_id: call_participant_user_id,
      profile_id: call_participant_profile_id,
      event_id: event_id,
      call_id: call_id,
      space_id: space_id,
      plane_picture: ['plane_picture.jpg'],
      phone: { visible: 'false', value: 'phone' },
      space_name: 'space_name',
      address: 'address',
      category: 'home',
      form_id: 'form_id_3',
      subcategory: 'home',
      '2': 'mandatory',
      conditions: 'true',
      description: 'space_description',
      type: 'space_type',
      single_ambient: 'true',
      ambients: [{
        name: 'ambient_name',
        description: 'ambient_description',
        allowed_categories: ['music'],
        allowed_formats: ['concert'],
        capacity: '12',
        photos: ['ambient_picture.jpg']
      }]
    }
  end

  let(:own_spaceproposal_params) do
    {
      user_id: user_id,
      event_id: event_id,
      call_id: call_id,
      id: space_proposal_id,
      email: 'email@test.com',
      name: 'name',
      space_name: 'space_name',
      address: 'address',
      phone: { 'visible' => 'false', 'value' => 'phone' },
      form_id: 'form_id_3',
      subcategory: 'home',
      type: 'home',
      single_ambient: 'false',
      ambients: [{
        name: 'ambient_name',
        description: 'ambient_description',
        allowed_categories: ['music'],
        allowed_formats: ['concert']
      }],
      own: true
    }
  end

  let(:artistproposal_params) do
    {
      production_id: production_id,
      profile_id: profile_id,
      event_id: event_id,
      call_id: call_id,
      category: 'music',
      format: 'concert',
      title: 'title',
      description: 'description',
      short_description: 'short_description',
      duration: 'duration',
      photos: ['picture.jpg', 'otter_picture.jpg'],
      phone: { 'visible' => 'false', 'value' => 'phone' },
      form_id: 'form_id_1',
      subcategory: 'music',
      '2': 'mandatory',
      conditions: 'true'
    }
  end

  let(:own_artistproposal_params) do
    {
      event_id: event_id,
      call_id: call_id,
      email: 'own_email@test.com',
      name: 'own_artist_name',
      address: 'own_address',
      category: 'music',
      format: 'concert',
      title: 'own_title',
      description: 'own_description',
      short_description: 'short_description',
      duration: 'duration',
      phone: { 'visible' => 'false', 'value' => 'phone' },
      form_id: 'form_id_1',
      subcategory: 'music',
      own: true
    }
  end
end

shared_examples 'models' do
  let(:artist_model) do
    {
      profile_id: profile_id,
      email: 'contact_email@test.com',
      name: 'name',
      address: { postal_code: '46020', locality: 'city' },
      color: 'color',
      phone: phone,
      proposals: [{
        production_id: production_id,
        proposal_id: proposal_id,
        register_date: 1_667_170_800_000,
        selected: true,
        phone: phone,
        category: 'music',
        format: 'concert',
        subcategory: 'music',
        form_id: 'form_id_1',
        title: 'title',
        description: 'description',
        short_description: 'short_description',
        duration: 'duration',
        # '1': nil,
        '2': 'mandatory',
        photos: ['picture.jpg', 'otter_picture.jpg']
      }]
    }
  end

  let(:artist_own_model) do
    {
      profile_id: "#{proposal_id}-own",
      email: 'own_email@test.com',
      name: 'own_artist_name',
      address: 'own_address',
      phone: phone,
      own: true,
      color: nil,
      proposals: [{
        phone: phone,
        proposal_id: proposal_id,
        register_date: 6_002_054_000_000,
        category: 'music',
        subcategory: 'music',
        form_id: 'form_id_1',
        format: 'concert',
        own: true,
        title: 'own_title',
        short_description: 'short_description',
        description: 'own_description',
        duration: 'duration',
        selected: true
      }]
    }
  end

  let(:space_model) do
    {
      proposal_id: space_proposal_id,
      profile_id: call_participant_profile_id,
      space_id: space_id,
      email: 'contact_email@test.com',
      name: 'name',
      subcategory: 'home',
      form_id: 'form_id_3',
      space_name: 'space_name',
      address: 'address',
      type: 'space_type',
      description: 'space_description',
      plane_picture: ['plane_picture.jpg'],
      register_date: 1_462_054_000,
      selected: true,
      single_ambient: 'true',
      color: 'color',
      phone: { 'visible' => 'false', 'value' => 'phone' },
      ambients: [{
        name: 'ambient_name',
        description: 'ambient_description',
        allowed_categories: ['music'],
        allowed_formats: ['concert'],
        capacity: '12',
        photos: ['ambient_picture.jpg']
      }],
      # '1': nil,
      '2': 'mandatory'
    }
  end

  let(:space_own_model) do
    {
      profile_id: "#{profile_id}-own",
      proposal_id: space_proposal_id,
      email: 'email@test.com',
      name: 'name',
      space_name: 'space_name',
      address: 'address',
      phone: Util.stringify_hash(phone),
      subcategory: 'home',
      form_id: 'form_id_3',
      single_ambient: 'false',
      selected: true,
      color: nil,
      ambients: [{
        'name' => 'ambient_name',
        'description' => 'ambient_description',
        'allowed_categories' => ['music'],
        'allowed_formats' => ['concert']
      }],
      type: 'home',
      own: true
    }
  end
end
