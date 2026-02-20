'use strict';

(function(ns){
  ns.langs = ns.langs || {}

  ns.langs.en = {
    dictionary: {
      accept: 'accept',
      address: 'address',
      amend: 'amendment',
      artist: "artist",
      artists: "artists",
      audience: 'audience',
      audios: 'audios',
      availability: 'availability',
      back: 'back',
      cache: 'cache',
      cancel: 'cancel',
      category: 'category',
      format: 'formato',
      categories: 'categories',
      formats: 'formats',
      close: 'close',
      comments: 'comments',
      comment: 'comment',
      confirm: 'confirm',
      confirmed: 'confirmed',
      copy: 'copy',
      create:'create',
      date: 'date',
      day: 'day',
      delete: 'delete',
      description: 'description',
      duration: 'duration',
      email: 'email',
      first: "first",
      help: "help",
      images: 'images',
      info: 'information',
      latitude: 'latitude',
      last: "last",
      longitude: 'longitude',
      modify: 'modify',
      name: 'name',
      next: "next",
      no: 'no',
      organization: "organization",
      organizations: "organizations",
      other_categories: 'other categories',
      permanent: 'permanent',
      phone: 'phone',
      previous: "previous",
      profile: 'profile',
      program: 'program',
      save: 'save',
      schedule: 'schedule',
      search: 'search',
      selected:'selected',
      send: 'send',
      short_description: 'short description',
      space: "space",
      spaces:'spaces',
      table: 'table',
      title: 'title',
      type: 'type',
      videos: 'videos',
      yes: 'yes',
      space_name: "space name",
      space_type: "space type",
      price: "price",
      attention: "Attention!"
    },
    facets:{
      cultural_ass: "Cultural Space",
      commercial: "Business",
      home: "Private Space",
      open_air: "Open Air",
      artist: 'Artist',
      creative: 'Creative',
      craftsman: 'Craftsman',
      manager: 'Manager',
      commissar: 'Commissar',
      politician: 'Politician',
      researcher: 'Researcher',
      critic: 'Critic',
      producer: 'Producer',
      collector: 'Collector',
      teacher: 'Professor',
      inventor: 'Inventor',
      arquitect: 'Arquitect', 
      association:'Association',
      ngo:"NGO",
      collective:"Collective",
      interprise:"Enterprise",
      institution:"Institution",
      federation: "Federation",
      foundation:"Foundation",
      other: 'Other',
      space: 'Space',
      agent: 'Agent',
      organization: 'Organization'
    },
    categories:{
      cultural_ass: "Cultural Space",
      commercial: "Business",
      home: "Private Home",
      open_air: "Open Air",
      festival:"Festival",
      association:'Association',
      ngo:"NGO",
      collective:"Collective",
      interprise:"Enterprise",
      institution:"Institution",
      federation: "Federation",
      foundation:"Foundation",
      arts: 'Performing Arts',
      audiovisual: 'Audiovisual',
      craftwork: 'Craftwork',
      gastronomy: 'Gastronomy',
      health: 'Health & Wellness',
      literature: 'Literature',
      music: 'Music',
      other: 'Other',
      street_art: 'Street Art',
      visual: 'Visual Arts',
      none: 'None'
    },
    formats:{
      stand: "stand",
      show: "show", 
      expo: "exposition",
      workshop: "workshop",
      talk: "talk", 
      visit:"visit", 
      tasting: "tasting",
      recital: "recital", 
      projection: "projection", 
      concert: "concert", 
      intervention:"intervention",
      other: "other",
      none: 'None'
    },
    space_type:{
      title:"Tipus d'espai",
      residential: "apartment",
      theater: "theater", 
      museum: "museum", 
      concert_hall: "concert hall", 
      dance_hall: "dance hall", 
      party_hall: "party hall", 
      laboratory: "laboratory", 
      cinema: "cinema", 
      health_center:"healt center", 
      social_center: "social centre", 
      gym: "gym", 
      sport_center: "sprt centre", 
      bar: "bar / cafè / pub", 
      restaurant: "restaurant", 
      gallery:"gallery", 
      office: "office", 
      shop: "shop", 
      university: "university", 
      school:"school", 
      garage: "garage", 
      lot: "lot", 
      rooftop: "rooftop", 
      multispace: "multispace", 
      other:"other"
    },
    event_type:{
      festival: "festival",
      conference: 'conference',
      fair: 'fair',
      gala: 'contest'
      // other: 'other'
    },
    partner_type:{
      collaborators:"collaborators",
      collaborator: "collaborator",
      sponsors:"sponsors",
      sponsor: "sponsor",
      promotors: 'promoters',
      promotor: "promoter"
    },
    human_resources:{
      block_title: 'Recursos humanos disponibles', 
      title: 'Recursos humanos disponibles',
      room_chief: 'Jefe de sala',
      tech_chief: 'Jefe técnico', 
      production_team: 'Equipo de producción', 
      sound_tech: 'Técnico de sonido', 
      light_tech: 'Técnico de luces', 
      tailor: 'Sastre', 
      dj:'DJ',
      vj:'VJ', 
      videomaker: 'Videomaker', 
      photographer:'Fotógrafo', 
      blockbuster: 'Taquillero', 
      cargo_staff: 'Personal de carga / descarga' 
    },
    materials:{
      block_title:'Recursos humanos disponibles',
      title: 'Materiales disponibles',
      sound: 'Sonido',
      speaker: 'Altavoces',
      soundboard: 'Mesa de sonido',
      audio_monitors: 'Monitores audio',
      equalizer: 'Ecualizador',
      ampli: 'Amplificador',
      micros: 'Micrófonos',
      headset_micro: 'Micrófono a diadema',
      mic_stands: 'Pies de micro',
      audio_cables: 'Cables audio',
      piano: 'Piano / Teclado',
      drums: 'Batería',
      guitar: 'Guitarra', 
      bass: 'Bajo',
      audiovisual: 'Audiovisual',
      computer: 'Ordenador',
      cd_player: 'Reproductor cds',
      vynil_player: 'Reproductor vinilos',
      dvd_player: 'Reproductor dvd',
      projector: 'Proyector',
      projector_screen: 'Pantalla proyección',
      monitor_screen: 'Pantalla monitor',
      show: 'Espectáculo',
      light_board: 'Mesa de luces',
      stage_lighting: 'Focos',
      lighting_filter_gel: 'Gelatinas / Filtros',
      smoke_machine: 'Máquina de humo',
      forniture: 'Mobiliario',
      lectern: 'Atril',
      mobile_stage: 'Tarima móvil',
      pedestal: 'Peana',
      tables: 'Mesas',
      chairs: 'Sillas',
      stool: 'Taburetes',
      mirror: 'Espejo',
      mat:'Esterillas / Colchonetas'
    },
    accessibility:{
      block_title: 'Accesibilidad',
      wheelchair:'accesibile con silla de ruedas',
      cargo:'zona de carga / descarga',
      private_parking:'aparcamiento privado',
      public_parking: 'aparcamiento público cercano',
      bikes_parking:'aparcamiento de bicicletas'
    },
    tech_specs:{
      block_title:'Características técnicas',
      bottom_floor:'planta baja',
      top_floor:'ático',
      outdoor:'exterior',
      indoor:'interior',
      stage:'escenario',
      dressing_room:'camerino',
      showcase:'escaparate',
      sound_system:'equipo de sonido integrado',
      video_system:'sistema video integrado',
      expo_rail:'rieles expositivos',
      socket:'toma de corriente',
      tap:'toma de agua',
      heating:'calefacción',
      conditioner:'aire acondicionado',
      wifi:'wifi'
    },
    tech_poss:{
      block_title:'Posibilidades técnicas',
      drill_floor:'taladrar suelo',
      drill_wall:'taladrar pared',
      wall_intervention:'intervenir pared',
      floor_intervention:'intervenir suelo',
      roof_intervention: 'intervenir techo',
      blindness:'oscuridad',
      store:'almacén',
      hook_roof:'engancharse al techo'
    },
    floor:{
      title:'Type of floor',
      carpet:'carpet', 
      linoleum:'linoleum', 
      parquet:'parquet', 
      tile:'tile', 
      cement:'cement', 
      resin:'resin'
    },
    forms:{
      event:{
        nameL: "Event Name",
        textsL: "Subtitle and description of the event (you can translate in 3 languages)",
        langL: "Language",
        baselineL: "Subtitle",
        descriptionL: "Description text of the event",
        buttonsL: "Personal buttons",
        imgL: "Poster of the event (format DIN, ratio 1x1,414)",
        placeL: "Place (local, neighborhood or city)",
        placeH: "It is the text that will appear in the event card and will be linked with thw localization in the map.",
        addressL: "Localization of the event in the map",
        addressH: "If the event is all around an entire city, just insert the 'City' and the 'Country'. If it is in an entire district, insert 'City' and 'Postal code'. ",
        eventTimeL: "Dates of the event and starting/ending time of every day",
        eventTimeBtn: "Añade una fecha",
        categoriesL: "General artistic categories of the event",
        typeL: 'Event type',
        gInitText: 'This information <strong>cannot be modify</strong> after the event.',
        callWarningText: "IMPORTANT: Dates and times of the event can be modified <strong>only till the opening of the call</strong>.",
        addPersonalBtn:"Add a personalized button",
        addLanguageBtn: "Add a language"
      },
      partners:{
        nameL: "Name",
        linkL: "Web link",
        typeL: "Type of partner",
        imgL: "Logo"
      },
      program:{
        display_programL: 'Default order of the activities'
      }
    },
    popup:{
      settings:{
        title: 'Settings',
        notificationsWidget:{
          title:'Interests',
          event_call: 'Event call',
          notifTxt: 'You will be notified by email about calls for participating in events of the  selected categories.',
          noNotif: 'You will not receive any notification about calls.',
          selectorPlaceholder: 'Select the artistic categories of your interest',
          successText: 'Saved'
        },
        modifyPasswordWidget:{
          title: 'Password',
          successText: 'Saved'
        },
        langWidget: {
          title: 'Language'
        }
      },
      delete:{
        title:"¿Are your sure?",
        user: "By confirming, all your data will be deleted from orfheo: all your profiles and contents will be canceled.",
        profile: "By confirming, your profile will be deleted and with it all its contents. However, proposals sent to calls will not be canceled.",
        confirm:"Confirm",
        cancel: "Cancel",
        production:"By confirming, your artistic project will be removed from your portfolio. This action will not affect your registration in calls."
      },
      modifypasswd:{
        title:"Enter a new password",
        password:"New password",
        passwordConf: "Confirm your new password",
        notequal: "The passwords don't match",
        tooshort:"Password must be at least 8 characters long",
        check:"Please verify that the passwords are equal and have a minimum of 8 characters",
        success: "The password has been changed."
      },
      recover:{
        title: "Recover your account",
        submit: "Send"
      },
      termsAndConditions:{
        title: "General conditions",
        date:"Last updated: May 2018",
        part1:'<p> <strong>Welcome!</strong></p><p> <strong>Orfheo is based on a principle: we can do more things together than separately.</strong></p><p>It is people like you who make it possible for this place not only to exist, but also to grow and thrive.</br>These general conditions explain the service and the relationship between users, rights and reciprocal responsibilities.</p><p> <strong>Being part of orfheo is free</strong> and by doing so you are accepting these general conditions.</p>',
        subtitle2: "General principles:",
        subtitle3: "We commit to:",
        mex3: "<p><ul><li>Describe how your information can be used and/or shared in these general conditions. </li><li> Use reasonable measures to keep your sensitive information safe.</li> <li>Let the information that you decide to share flow in the community.</li> <li>Promote values ​​such as solidarity, a sense of community, transversality, equity, respect and harmony with the environment. </li><li> Respect and defend the community of orfheo. </li><li> Listen and welcome any kind of suggestion or constructive criticism.</li></ul></p>",
        subtitle4: "Terms of use and privacy:",
        mex4: '<p>Here we explain how we collect and share your personal information / data / contents.<ul><li>We collect very little personal information about you. </li><li> We do not rent or sell your information to third parties, ie: we do not share your data with third parties for marketing purposes. </li><li> It is possible for the information public in orfheo to be shared with third parties according to our ideology, always accomplishing with the law and with the intention of bringing benefit to the whole community. </li><li> You are responsible for the contents you share and their privacy measures.</li><li>To store and secure your data, we rely on an external database service (mLab Sandbox). The security that is provided is based on a double-key authentication system. In addition, all information is transmitted using the https protocol (SSL technology) that prevents data from being intercepted fraudulently.</li> <li>We will occasionally send you emails regarding important information.</li> <li>The quality of the data you provide is useful for you, so that we can improve your experience as a user, letting us develop new functions. </li><li> Everything you publish in orfheo is public, can be seen and eventually used by an external observer.</li> <li>At some point we may ask you to answer a survey as a feedback, but you will never be required to participate in it.</li> <li>You do not need to create an account to explore and visualize any of the contents.</li> <li>In order to create an account, you only need to give us your email address.</li><li>Anyone can join and leave orfheo at any time.</li><li> All the data you provide are yours and can only be used with your consent.</li> </ul></p>',
        subtitle5:'Advertising:',
        mex5: "<p>Right now there is no form of advertising within orfheo. In the future, we do not exclude the possibility of the presence of non-intrusive advertising related to the artistic-cultural world, which can provide useful and valuable information for the citizens. We believe that advertising can be effective without being annoying. We exclude the possibility of advertising in the form of pop-ups that may interfere with the display of orfheo contents. </p>",
        subtitle5_5:'Project sustainability:',
        mex5_5:'<p>As promised, being part of orfheo does not have and will never have no cost to any user. However, the maintenance of a web with this complexity has a cost, as well as the sustainability of the lives of the people who work on it on a daily basis. Therefore, launching a call and being able to access the relative management tool has a price, which is decided together, based on a minimum basis, depending on the type of event that you want to organize. </p>',
        cookies: 'Cookies policy:',
        cookiesMex1: 'Cookies are a computer element widely used in the internet. When you access a web page, some information is stored in your browser memory so the website can quickly access that information in the future.',
        cookiesMex2: 'Orfheo uses cookies for the sole purpose of improving the browsing experience of its users. For example, we store information to allow a faster and continuous login, avoid disconnexions from the site in the case of server restarts, and remembering preferences or choices throughout the browsing process. </br> Our site also includes features provided by third parties. In our case, we use "analytical" cookies that allow us to recognize and count the number of visitors and to see how users move around the website. This information helps us improve the operation of the platform. Specifically, we use Google Analytics services for our statistics. You can get more information about Google Analytics and YouTube services in this <a href="http://www.google.com/intl/en/policies/technologies/cookies/" target="_blank"> link </ a >.',
        cookiesMex3:'In general, because of the structure of the internet today, cookies are an essential element. By law, every web that uses them, is obliged to warn its users so that they know what is happening. </br> You can allow, block or delete the cookies installed on your computer by configuring the browser options installed on your computer. In case of doing so, it is possible that part of the site does not work or that its quality may be affected.',
        cookiesMex4: 'The same information displayed here is also available in the terms and conditions section. In case of modification, the citizens of orfheo will be notified well in advance.',
        LGDPtitle: 'RGDP',
        LGDPmex:"<p>In order to accomplish with the data protection act and have the right to eventually send you information about our services, we communicate that: </p><p>“On behalf of orfheo, we treat the information you provide us in order to be able to offer you our services, send you related information and invite you to the events organized by orfheo.  The data provided will be kept as long as you do not request their removal by deleting your account. The data will not be transferred to third parties except in cases where there is a legal obligation. You have the right to obtain confirmation on how orfheo is treating your personal data so you have the right to access your personal data, rectify them or request its deletion when the data is no longer necessary for the purposes that were collected.”</p><h5>Party responsible for the database and data processing:</h5><p>Asociación Possibilitats</br>NIF: G98814718</br>Address: C/ Nuestra Señora de la Asunción 4b, 46020, Valencia, Spain</br>Email: possibility.association@gmail.com</p>",
        subtitle6: 'Updates:',
        mex6: 'We reserve the right to modify, if necessary, the general conditions and adapt them to future developments. We assume the duty and the commitment to inform of the changes to all citizens of orfheo, so that they can know the updates in advance.',
        subtitle7: '¡Thanks a lot!',
        finalMex: '<p> If you have questions or suggestions, please send an email to <a href="mailto:info@orfheo.org"> info@orfheo.org </a>. </ P> <p> Thanks for reading until here. We hope you enjoy in and out of orfheo. </br> Your participation in creating, maintaining and improving this place is a must. </ P> <p> We appreciate you taking the time to read about the project, and we thank you for contributing. By what you do, you are helping to build something really important, not only a collaborative project, but also a vibrant community focused on a very noble goal.</p>'
      },
      noMapLocation:{
        title: "¡Attention!",
        mex: "Google does not recognize the address you provided and therefore can not be located on any map.",
        fix:"Change the address",
        ok:"Proceed anyway"
      }
    },
    widget:{
      permanentSelector:{
        label: 'Activity type and programmation',
        puntual: 'one-time activity',
        permanent: 'permanent activity'
      },
      subcategorySelectorField:{
        label: "Category of the activity",
        placeholder: "Select"
      },
      titleManagerField:{
        label: 'Title and short description'
      },
      conditions:{
        see: '(See conditions)'
      },
      Links:{
        placeholder:'Copy&Paste the link here'
      },
      categorySelector: {
        helptext: "It is the orfheo artistic category associated with your proposal."
      },
      linkUploadPdf:{
        introText: "Upload a pdf file (max. 1Mb) or copy&paste a link to the document in Dropbox, Google Drive, Mega... (remember to make the document public in order to make it accessible)."
      },
      selectorOther:{
        textPlaceholder:"Specify" 
      },
      dateTimeArray:{
        starting_time: 'Starting time',
        ending_time: 'Ending time',
        subcatSelector:{
          allSelected: 'All categories',
          label: 'Apply to',
          placeholder: 'All categories or select any'
        }
      },
      eventTime:{
        date: 'Date',
        starting_time: 'Starting time of activities',
        ending_time: 'Ending time of activities',
        permanents: 'Open time of permanents activities (like expositions, markets ...)'
        // pinit: 'Begin',
        // pend: 'End'
      },
      gmap:{
        viewOnGoogle:'View on Google Maps'
      },
      search:{
        placeholder:"Search by tags",
        byName: 'Search in the name',
        noResults: 'No results'
      },
      uploadPhoto:{
        btn: "Upload",
        tooBigError: "The size of the images can not exceed %{maxSize}Kb. You can quickly reduce it by using, among many others,  <a href = 'http://optimizilla.com/es/',  target='_blank'>this web</a>.",
        max1:"%{maxN} image maximum.",
        maxNi: "%{maxN} images maximum.",
        acceptedFormat: "Accepted formats: %{accepted}"
      },
      uploadPDF:{
        btn: 'Upload',
        tooBigError: 'Document size can not exceed 1Mb. You can reduce it in a moment using, among many others <a href = "https://www.ilovepdf.com/compress_pdf",  target="_blank">this web</a>.',
        max1:'One document maximum.',
        acceptedFormat: 'Accepted formats:: .pdf'
      },
      availability:{
        placeholder: "Select one or more options",
        selectAllText: "Select all",
        allSelected: "Available every day"
      },
      inputName:{
        unavailable: "This profile name already exists. Choose another in order to proceed."
      },
      checkName:{
        label: 'Artistic name',
        helptext: 'It is the name of your profile. To modify, click ',
        here: 'here'
      },
      InputTel:{
        show:"Show in my profile page",
        label: "Phone number",
        helptext: "This information is necessary for being contacted by the organization.",
        modify: "It is the phone number associated with your profile and you can cahnge it whenever you want from the corresponding page."
      },
      InputEmail:{
        label: "Contact email",
        helptext: "This information is necessary for being contacted by the organization.",
        modify: 'It is the email associated with your profile and you can cahnge it whenever you want from the corresponding page.'
      },
      inputCache:{
        show: "Show in my portfolio"
      },
      inputWeb:{
        placeholder: "Copy and paste the corresponding link here and click the validation button"
      },
      inputNumber:{
        warning: "Only numeric caracters and one point for decimals" 
      },
      inputComments: {
        label: "Private comments",
        placeholder: "whatever you want to remenber about this activity",
        label_needs : "Needs"
      },
      inputPerformancePrice: {
        linkPlaceholder: 'link for buying online',
        label:"Ticket",
        buy: 'Buy',
        book: 'Book'
      },
      inputAddressArtist:{
        city:"City*",
        postalCode:"Postal Code*",
        neighborhood:"Neighborhood (optional)"
      },
      inputChildren:{
        all_public:'All public',
        baby:"Kids",
        family:"Family",
        young: "Youth",
        adults: "Adults"
      },
      inputAddressSpace:{
        street: "Street",
        number: "Number",
        city:"City",
        postalCode:"Postal Code",
        door:"Floor / Door",
        state: "Country",
        warning:"¡Attention! Google does not recognize the address you provided and therefore can not be located on any map.",
        insertGeo:"If the location is not correct, manually insert your geographic coordinates and save them by clicking ",
        insertGeoBtn:"here",
        placeholder: 'Address assistant: start typing'
      },
      multimediaManager:{
        btn: "Modify or create a new one",
        title: "Manage your multimedia content",
        mex:"You can add:",
        videoList:"<strong>videos</strong> from:  youtube, vimeo, vine, facebook",
        imageList:"<strong>images</strong> from: your computer, instagram, flickr, pinterest, twitter, facebook",
        audioList:"<strong>audios</strong> from: soundcloud, bandcamp, spotify",
        photoL:"Upload images from your computer (4 max, size must not exceed 500kb each)"
      },
      multipleSelector:{
        placeholder: "Select one or more options",
        selectAll: "Select all",
        allSelected: "All selected"
      },
      inputMultimedia:{
        placeholder:"Copy and paste the corresponding link/code here and click the validation button",
        invalid:"Not a valid entry",
        acepted:"Accepted entries",
        popup:{
          title:"How to add...",
          item1:'...an image from <strong>flickr, instagram, pinterest</strong> (a pin) or a video from <strong>youtube, vimeo, vine</strong> or an audio from <strong>soundcloud</strong>:',
          sublist1_1:"open the image, video or audio in the corresponding website",
          sublist1_2:'copy its link directly form the browser or using the option "share" or "copy link"',
          sublist1_3:"paste it in the orfheo formulary field",
          sublist1_4:'click on the validation button',
          itemTwitter:'...an image from <strong>twitter</strong> (a tweet):',
          sublistTwitter_1:'click on the tweet you want to share',
          sublistTwitter_2:'on the opening popup, click on the three dotted icon',
          sublistTwitter_3:'select "Copy link to Tweet"',
          sublistTwitter_4:'copy the link and paste it in the orfheo formulary field',
          sublistTwitter_5:'click on the validation button',
          item2:'...an image, a post or video published on <strong>facebook</strong>:',
          sublist2_1:'click on the publication date located on the upper part of the post',
          sublist2_2:'copy the address of the page that opens up',
          sublist2_3:'paste the address in the orfheo formulary field',
          sublist2_4:'click on the validation button',
          item3: '...an audio from <strong>bandcamp</strong>:',
          sublist3_1:'in the song page click on "Share/Embed" (under the main picture) and then click on "Embed this album"',
          sublist3_2:'Select a style for the music player',
          sublist3_3:'copy the html code form the "Embed" field located on the upper left corner',
          sublist3_4:'copy the link and paste it in the orfheo formulary field',
          sublist3_5:'click on the validation button',
          item4: '...an audio from <strong>spotify</strong>:',
          sublist4_1:'select a song from a playlist with the mouse right button',
          sublist4_2:'click on "Copy Song Link"',
          sublist4_3:'copy the link and paste it in the orfheo formulary field',
          sublist4_4:'click on the validation button',
          finalMex: 'Finally, consider that you can only import into orfheo multimedia contents declared public on the web where they have been uploaded.'
        }
      }
    },
    searchPage:{
      proposals:{
        titleSection: 'Find creative proposals'
      },
      profiles:{
        titleSection: 'Conect and build your network'
      },
      events:{
        titleSection: 'Live amazing experiences'
      },
      spaces:{
        titleSection: 'Discover cultural spaces'
      }
    },
    createProfile:{
      text: 'Create a profile',
      artistText:'Show your portfolio <br> and participate in big events',
      spaceText: 'Host artistic events and position yourself in the cultural map',
      organizationText: 'Announce your project and launch calls',
      introA: 'This information will be displayed on your profile page, you can modify it. It will let others know about you.',
      introS: 'This information will be displayed on the profile page of your space, you can modify it.',
      introO: 'This information will be displayed on the profile page, you can modify it.',
      submit: 'Create',
      artistForm:{
        nameL: "Name",
        nameH: "The name for your profile",
        facetsL:"Profile facets",
        facetsH: "Select the categories that better define you profile.",
        short_descriptionL:"Short description",
        short_descriptionH:"Short description of the profile. Remaining characters:  ",
        emailL: "Contact email",
        photoL:"Profile picture (500kb maximum)",
        photoH: "Optimal dimension 980x300px.",
        bioL: "Biography / Information",
        bioH: "Anything you want to share about your artistic-cultural life.",
        addressL: "City and Postal code",
        addressH: "Indicating your city and postal code will make it easier to locate you for a possible contact.",
        phoneL:"Phone number",
        webL:"Personal website and links to social networks",
        webH: "You can add links to both your websites and personal blogs as well as to your profiles on social networks (photos and videos are managed along with your artistic proposal).",
        colorL: "Pick a color",
        colorH:"Is the personal color for your profile!",
        menuL: 'Reorder the menu',
        TagsL: "Tags",
        TagsPlaceholder: 'Free tags'
      },
      spaceForm:{
        question: 'Do you wnat to differentiate your space in more rooms / ambients?',
        yes: 'Yes',
        no: 'No',
        removeAmb:"Remove",
        addAmb: 'Add another',
        nameL:"Space name",
        nameH:"The name for your space profile.",
        addressL:"Address",
        addressPlaceholder: 'Ex: Gauden Road, London, United Kingdom',
        catL: "Space type",
        sizeL: "Space dimension",
        planeL: "Space plane",
        planeH: "Upload a map of your space (max image size 500kb)",
        accessibilityL: "Accessibility",
        rulesL: 'Space rules',
        catPlaceholder:'Select',
        bioL:"Description / Information",
        bioPlaceholder:'Dimensions, characteristics, activities that usually hosts, etc.',
        bioH: "Anything you want to share about your space.",
        phoneL: "Phone number",
        webL: "Personal website and links to social networks",
        webH: "You can add links to both your websites and personal blogs as well as to your profiles on social networks.",
        linksL: 'Online materials',
        linksH:'Add videos, pictures and audios from your social networks.',
        ambNameL: 'Name of the room / ambient',
        ambDescriptionL: 'Technical description of the room / ambient',
        ambSizeL: 'Dimensions',
        ambHeighL: 'Height',
        ambTechL: 'Technical specifications',
        ambPossL: 'Technical possibilities',
        ambFloorL: 'Floor type',
        ambCapacityL:'Capacity',
        catL: 'Accepted categories',
        catH: 'Check the artistic categories of the activities that can be hosted.',
        formatL: 'Accepted formats',
        formatH: 'Cheack the formats of the activities that can be hosted.',
        photoL:"Space pictures (4 maximum, size must not exceed 500kb each)",
        colorL: "Pick a color",
        colorH: "Is the personal color for your profile!",
        linksH:"Add multimedia contents from your social networks."
      }
    },
    modifyProfile:{
      title: 'Modify your profile',
      delete: 'Delete the profile',
    },
    proposal:{
      delete: 'Delete this proposal',
      deleteAlert: 'Confirming, your proposal will be removed from the %{event} call.',
      deleteOk: 'Your request to participate has been successfully canceled',
      amend: 'Amendment correctly submitted',
      sentForm: 'Submitted form',
      sentBy: 'Proposal submitted by',
      format: "Format",
      terms: 'participation terms',
      termsOk: 'You have accepted the %{link} of %{event}',
      ambients_number: "Rooms / ambients",
      ambients_n: "Rooms / ambients",
      proposal_for: 'Suitable for',
      amend:{
        title: 'Amendment sent:',
        helper: 'It is not allowed to modify the submitted form, but, if you need it, you can submit an amendment from your profile page before the call deadline',
        placeholder: 'Type here the message you want to send',
        modify: 'Modify amendment'
      },
      form:{
        category: '(form: %{category})',
        door: 'door/floor',
        multimedia: 'Multimedia:',
        seeContents: ' view submitted content',
        duration: 'Duration (if applicable)',
        cache: 'Cache / Production expenses',
        nameL:"Name",
        emailL:"Email",
        addressL:"Address",
        bioL:"Description / Information",
        cacheComment: "Comment",
        orfheo_category: "Orfheo artitic category",
        subcategory:"Category / Modality"

      }
    },
    production:{
      createTitle: 'Create an artistic proposal',
      createOk: 'Content successfully created',
      form:{
        titleL: "Title for the artistic proposal",
        categoryL: "Category",
        formatL: "Format",
        descriptionL: 'Description',
        descriptionH: 'Describe your artistic proposal in more detail.',
        short_descriptionL:'Brief description',
        short_descriptionH:'Summarize your artistic proposal in a maximum of 80 characters. Remaining:',
        durationL: "Duration *",
        childrenL:"Audience",
        childrenH: "Indicate to which type of audience the proposal is addressed.",
        linksL:"Online materials",
        linksH: "Add videos, pictures and audios from your social networks. This material will let others better know your art.",
        photoL: "Your art pictures (4 maximum, size must not exceed 500kb each)",
        cacheL:"Cache / Production expenses",
        noDefinedDuration:"It has no defined duration",
        catSel:'Select a category *',
        submit: 'Create'
      },
      modify:{
        title: 'Modify your artistic project',
        cat:'Category',
        initMex: 'With this form you can modify the contents of your artistic project. Changes will not affect data sent to calls.',
        delete: 'Delete this artistic project'
      }
    },
    signUp:{
      btn:'Join',
      success: "We've sent you a link to activate your account.",
      popup:{
        title: 'Start by creating an account...',
        email:'Email',
        passwd:'Password',
        insertEmail:'Your email',
        confirmPasswd:'Confirm your password',
        tooshort: 'Password must be at least 8 characters long.',
        notequal:'Password fields do not match.',
        format: 'Email must have a valid format.',
        submit:'Create an account',
        mex: '...doing it, of course, <strong>is totally free :) </strong>',
        conditions: 'general conditions',
        conditionText:'By creating an account, you confirm that you agree with our ',
        length: '8 characters minimum',
        notificationText: 'I want to be notified about artistic call openings'
      }
    },
    login:{
      dropdown:{
        recover:'Forgot your password?',
        recoverAlert: 'Recover your account.',
        email:'Email',
        passwd:'Password',
        gobtn:'Login',
        rememberme:'Remember me'
      },
      popup:{
        notValidated: 'User not validated',
        notValidatedmex: 'When registering, we send you an email with a link to activate your account. Check in the spam folder...',
        sendOther:"...or re-type your email here, and we'll send you another one.",
        okbtn:'Send',
        notValidEmail:'The email is not valid',
        sent: 'We have sent you an email with the instructions to access your account.',
        nouser:'This user does not exist.',
        notExisting: '¡There is no user associated with this email!',
        registerbtn:'Register',
        registerTitle: 'Register to proceed'
      },
      eventPage:{
        nouser: "If you don't have an account:",
        signUp: 'Create an account',
        signUpTitle: 'Create an account...',
        loginTitle: 'To sign up you need to login'
      }
    },
    call:{
      initText:'This call is for profiles of the type <strong>%{types}</strong>',
      chooseProfile: 'Sign up with an existing profile...',
      newProfile: '...or create and sign up with a new one',
      createProfile:{
        title:'Create a profile and sign up as:',
        artistText: 'Show your art and build your portfolio',
        spaceText: 'Host and propose activities',
        organizationText: 'Offer your space and send proposals'
      },
      successTitle: '¡Awesome!',
      succesMex:'You have successfully signed up.',
      sendOther: 'Send another proposal',
      toProfile: 'Go to your profile page',
      alreadyInscribed: {
        title: 'You have already sign up this space :)',
        mex: 'You can check it in "History" block of your profile page.'
      },
      stop:{
        title: 'ATTENTION, YOU SHALL NOT PASS',
        mex1:'This call is for profiles whith type<strong>',
        mex2:'</strong>. Select or create one of the accepted types to proceed.'
      },
      form:{
        initMex:"Fill in this <strong>form</strong> in order to sign up with %{link} to <strong>%{organizer}</strong>'s call",
        portfolio:'Apply with a portfolio proposal',
        catPlaceholder: 'select how you want to sign up',
        newProposal: '...or propose something new',
        chooseHow: 'You can participate hosting or proposing art:',
        stagebtn:'Offer your space',
        perfomerbtn: 'Propose your art',
        partI:'This information will be stored in your <strong>portfolio</strong> and shown in your profile',
        partII: 'Only you and the organizers of the event will see this information',
        pI: 'PART I: ',
        pII:'PART II: ',
        initSpace: 'PART I: This information will be shown in your profile',
        finalMex: 'ATTENTION: After submitting, you can amend but <strong>not modify</strong> the content of this form. For this reason, please, review carefully all the fields before clicking the submit button.',
        sendbtn: 'Submit',
        inscribeSpace: 'Sign up a space you already defined',
        newSpace: "...or create and sign up a new one",
        dataPolicy: "orfheo is not responsible for the call organizers treatment of the data collected with this form."
      },
      helpContactText: "For any question about the call, please contact with the organizers at <a href='mailto:%{organizer_mail}'>%{organizer_mail}</a>.</br> For problems related with orfheo, please contact with the technical support at <a href='mailto:tech@orfheo.org'>tech@orfheo.org</a>."
    },
    footer:{
      // languages:'Languages',
      languages:{
        es: 'Español',
        ca: 'Valencià',
        en: 'English'
      },
      project: 'Project',
      contact: 'Contact',
      services:'Services',
      conditions: 'Conditions'
    },
    header:{
      events:'Events',
      profiles:'Community',
      proposals: 'Catalog',
      spaces: 'Spaces',
      news:'News',
      callToActionSmallScreen: 'Pro',
      callToAction: 'Professional',
      goToSearchPage: 'Explore',
      home: 'Home',
      insideDropdown:{
        settings: 'Settings',
        delete: 'Delete my account',
        modifypasswd:'Modify password',
        logout:'Logout',
        contact:'Contact orfheo',
        event:'Event'
      }
    },
    welcome: {
      profilesSection: {
        title: "Your cultural community is calling you<br>Join orfheo as:",
        artist: "Share your art,<br>join a call,<br>hatch a network, discover, create.",
        space: "Make the best out of your space,<br>host artistic events,<br>open the doors to culture.",
        organization: "Announce your project,<br>launch calls,<br>expand your community.",
        create: "Create a profile"
      },
      networkSection: {
        title: 'Create through networking with your cultural community',
        subtitle1: 'Here and now',
        subtitle2: 'Take control',
        subtitle3: 'Do it',
        section1: 'Discover projects and let yourself be known </br> for what you do.',
        section2: 'Involve the community, </br> launch your call.',
        section3: 'Create unforgettable experiences together.',
        link: 'Explore the advantages of launching your call in orfheo'
      },
      inspireSection: {
        title: 'The future we want is here',
        section: "You have imagined it, but now it is real: <br> you have at your disposal a universe of new, great cultural possibilities.",
        link: 'Let yourself be inspired'
      },
      servicesSection: {
        logo: 'S e r v i c e s',
        subtitle1: 'e-Manager',
        subtitle2: 'Counseling',
        subtitle3: 'API',
        section1: 'Create an event,</br> launch a call, </br>use the management tool </br>and publish an interactive program.',
        section2: 'Make the best out of your project, </br> feed your community </br> and explore new creative strategies during the process.',
        section3: 'Forward all your event data to your web page or mobile application, using it as it suits you and keeping everything updated.',
        link: 'Discover more'
      }
    },
    eventsTab:{
      organizer: 'Organizer: ',
      announcing: 'Call opens on: %{date}',
      opened: 'Open call',
      closed: 'Closed call',
      finished: 'Finished',
      until: ' until %{date}',
      onlineProgram: '¡Online program!',
      contact: 'Create an event, contact us'
    },
    contact: {
      dataPolicy:"The data required in this form will be used for the sole purpose of attending your query. We will not share your data with third parties nor will we add them to any contact list.",
      logo: 'C o n t a c t',
      servicesTab: {
        tab: 'Services',
        title: 'What does orfheo offer you?',
        mex1: 'The possibilities we offer are mainly focused on supporting, promoting and easing the creation, diffusion and <strong> management of large participative events </strong>. Specifically, with orfheo you can take advantage of the following services:',
        subtitle2: 'e-Manager:',
        mex2: 'A powerful innovative web tool that allows you to launch your call and manage all relative data with extreme ease and simplicity. You can consult, organize, filter and modify received proposals as well as create new ones to insert into your programming.',
        subtitle3: 'Counseling:',
        mex3: 'You will be able to take advantage of a constant monitoring throughout the process of preparation of your event and discover new creative strategies focused on making the best out of your cultural community.',
        subtitle4: 'API:',
        mex4: 'The API service allows you to receive and use data related to your events and calls in your mobile application or website.',
        mex5: 'For more information, check our %{link} and contact us without compromise through the following form:',
        servicesPage: 'services page'
      },
      techTab:{
        tab: 'Tech support',
        title: '¿How can we help you?',
        mex1: 'We are here to provide technical support, advice, answer your questions or give you useful information when you need it most.',
        mex2: "We'll get back to you right away."
      },
      feedBackTab:{
        tab: 'Feedback',
        title: 'What do you think of orfheo?',
        mex1: 'For being able to improve it is necessary to put ourselves into play and be questioned. We would be happy to know what you think of orfheo, what features you are missing and would like to have at your fingertips, what would you change, remove or add...',
        mex2: 'Any constructive criticism is welcomed, it will help us provide a better service.',
        mex3: '¡Your opinion is important!'
      },
      collaborateTab:{
        tab: 'Collaborate',
        title: 'Do you want to be a part?',
        mex1: 'We would like to share knowledge and continue to develop this project so that all citizens of orfheo can always enjoy the community. We would also like to give the possibility of using this tool to all those who wish it.',
        mex2: 'We believe that inclusion inspires innovation and therefore we are always open to hear ideas and collaborate.',
        mex3: 'Contact us at ',
        mex4: 'There are many ways to collaborate in orfheo:',
        mex5: 'as a partner: </br> If you have a business and as we believe that we can do more things together than separately, do not hesitate to send us your proposal of alliance.',
        mex6: 'as a sponsor: </br> Thanks to you, who wants to invest and/or collaborate through publicity and sponsorship, we can offer the possibility of financially help the projects of the orfheo community.',
        mex7: 'as a worker: </br> work in orfheo as a creative, artist, designer, programmer, community manager, administrative or commercial manager. Send us information about yourself.',
        mex8: 'as a patron: </br> generously support a reality, because you believe in it. Supporting orfheo means being part of a project with the potential to improve our world.',
        mex9: 'as a volunteer: </br> contact us if you want to learn through the development of orfheo or, if you already have the knowledge, to offer your time to a noble cause.'
      },
      contactTab:{
        tab: 'Contact',
        title: '¡Here we are!',
        country: 'Spain'
      },
      eventContact:{
        title: 'Your events in orfheo',
        mex1: 'In order to create an event or for more information, contact us through the following form:',
        mex2: 'Creating an event in orfheo will allow you to launch <strong>your call</strong> in the community and access the <strong> management tool </strong> that will accompany you until the publishing of<strong> your interactive program </strong> (more information on our %{link}).'
      },
      contactUs: {
        title: 'Contact orfheo',
        mex1: 'We are always available to provide technical assistance, and answer your questions related with orfheo.',
        mex2: 'Send us a message, we will answer you right away :)'
      },
      forms: {
        name: 'Name*',
        email: 'Email*',
        phone: 'Phone number',
        subject: 'Subject',
        links: 'Links to webs/social networks of your project',
        call_me: 'I want to be contacted by phone',
        hangout_me: 'I want a Hangout/Skype appointment',
        mex: 'Message*',
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        daysPlaceholder: "Select your availability during the week",
        everyday: "Everyday",
        always: "Available every day",
        periods: ['Morning', 'Afternoon'],
        periodsPlaceholder: "Select your availability during the day",
        everyperiod: "Morning and afternoon",
        anytime: "Available morning and afternoon",
        profileName: 'Name of your orfheo profile'
      },
      send: 'Send',
      correct: 'Message sent successfully. ',
      thanks: '<br>Thank you for contacting us. <br> We will reply as soon as possible :)',
      noSend: 'Message not sent:'
    },
    project:{
      baseline: 'Together we can do more than alone',
      mex1: '<p> Welcome to orfheo: </p><p>A different social network, the reflection of active communities and the practical response to the requirements of the participatory culture.</p><p>  Orfheo is a platform for artists, cultural agents and creators, who discovered that is possible to live infinite forms of artistic experiences out of conventional spaces.</p> <p> This web has multiple functionalities, capable of easing the management of open calls and give value to ideas from their birth till their realizations. It offers tools to store and organize the data of any project, making possible forms of life based on collaboration in the cultural ecosystem. At the same time it makes available to everyone a well of shared and self-managed resources, of universal access and  inclusion. </p> ',
      more: 'Read more...',
      subtitle: 'The vision and the mission of orfheo are base on the following pillars:',
      list1: '<p>SHARING <ul> <li> We share our ideas and inspirations because knowing more of the others means learning one from each other.</li> <li>We share our value where: value = (experiences + knowledge) x attitude. </li>  <li> We decide and create collaborating. </li> </ul></p>',
      list2: '<p>IDENTITY <ul><li>We believe that each person is something unique. </li> <li> We play an active role in the development of a free world, created thanks to the small collective effort of many people. </li></ul></p>',
      list3: '<p>INFORMATION <ul><li>We would like to pltaform to be in as many languages ​​as possible. </li> <li> We want you to have access to information anywhere, any time. </li> </ul></p>',
      list4: '<p>EXPERIENCE <ul><li>We want the users to have the best possible experience, so that they can take advantage of orfheo resources only the necessary and apply them in the everyday life. </li> <li> We aim to evolve towards a clean, clear and simple interface, usable by all. </li> </ul></p>',
      list5: '<p>MODEL <ul><li>We aim to a model of sustainable economy where everyone can enjoy collective resources without compromising the sustainability of the project. For this reason entering the community is totally free but the use of the manager has a little cost. </li> <li>We set goals not easy to achieve, because we are convinced that along the way, efforts to fulfill them will lead to results, perhaps different from those expected, but equally valuable . </li></ul></p>',
      list7: '<p>AIM <ul><li>Our mission is to encourage participatory culture through the granting of new possibilities and tools dedicated to building and improving collaborative relationships, which are the basis of the culture in which we believe. </li> </ul></p>'
    },
    performanceManager:{
      popup:{
        title: 'Create an activity'
      },
      addParticipantBtn: 'Create a new participant',
      participantSelector:{
        placeholder: 'Select a participant'
      }
    },
    manager:{
      title: 'Manage',
      toEvent: 'Event page',
      export: 'Export table',
      zeroRecords: "No results",
      infoEmpty: "No information available",
      export: 'Export table',
      copy:{
        helper: 'Create and copy a mailing list',
        table: 'Copy table',
        keys: '<i>ctrl</i> or <i>\u2318</i> + <i>C</i> in order to copy the table data to your clipboard. <br><br>To cancel, click on this message or press Esc.',
        success: '<strong>%d data rows</strong> copied to the clipboard',
        success1: '<strong>1 data row</strong> copied to the clipboard',
        results: ' Results per page _MENU_',
        artistEmails: 'artists emails',
        spaceEmails: 'spaces emails',
        allEmails: 'all emails',
        title: 'Copy emails',
        mex1: '<strong>%{amount} emails copied</strong> to the clipboard',
        mex2: '(<strong><i>Ctrl+V</i></strong> to paste)'
      },
      program:{
        tab: 'Program',
        chain: 'Link the changes',
        unchain: 'Unlink the changes',
        menu: {
          helper: 'Tools menu',
          artistsnoProgram: 'Proposals out of program',
          spacesnoProgram: 'Spaces out of program',
          orderSpaces: 'Order Spaces',
          orderby: 'Sort by:',
          save: 'Save changes',
          onlyProposalsSelected: 'Only selected proposals',
          onlySpacesSelected: 'Only selected spaces',
          permanentsManager: 'Permanent act. schedule',
          priceManager:'Tickets manager',
          subcatPrices_itxt: 'Set ticket by category'
        },
        permanentTable:{
          btn: 'Permanent program',
          title: 'Permanent activities table'
        },
        publish: 'Publish the program',
        publishmex: 'The program has been successfully published in your event page',
        unpublish: 'Withdraw the program',
        unpublishmex: 'The program has been withdrawn from your event page',
        manageTool: 'Management tool',
        chronoOrder: 'Sort chronologically',
        artistCat: 'Art. category',
        spaceCat: 'Spa. category',
        spaceNum: 'Spa. num',
        artistEmail: 'Artist email',
        spaceEmail: 'Space email',
        punctuals: 'punctuals',
        permanents: 'permanents',
        host_other_categories:'Other space categories',
        participant_other_categories:'Other artist categories',
        host_other:'Other for space',
        participant_other:'Other for artist',
        host_phone:'Space phone',
        participant_phone: 'Artist phone'
      },
      proposals: {
        space_description: "General description of the space",        
        tab: 'Proposals',
        addAnother: "Add another proposal to a participant you've already created",
        addArtist: 'Create and add an artistic proposal',
        addSpace: 'Create and add a space proposal',
        orNew: '...o create something new',
        byName: "Select by name",
        selectCat: "Select the proposal category",
        phoneL: "Contact phone",
        showFields: 'Show all fields',
        modifyNote1: 'This information, as well as the name, can only be modified by the owner, from the profile page.',
        modifyNote2: 'This information, as well as the name and email, can be changed by modifying any proposal of this artist that you have created.',
        allProposals: 'All proposals',
        artistProposals:'Artistic proposals',
        spaceProposals: 'Space proposals',
        eventCat: 'Category in the event',
        hideShowCol: {
          helper: 'Show/Hide columns',
          selectAll: "Select everything",
          unselect: 'Unselect everything',
          initial: 'Initial settings'
        },
        created: 'created',
        received: 'received',
        createOk: 'Proposal correctly created',
        createTitle: 'Create a proposal (%{type})',
        deleteNote: 'When you delete the proposal, a notification email will automatically be sent to %{name}',
        deleteOk: 'Proposal successfully deleted',
        modifymex: 'Form: %{type}',
        organizerProposal: 'Proposal created by the organizers of the event',
        artistName: "Artistic name",
        responsible: "Person responsible of the space",
        hasProgramAlert: {
          mex: 'Before deselecting, delete all the activities related with this proposal.',
          btn:'See activities'
        }
      },
      tools: {
        tab: 'Tools',
        whitelist: {
          title: 'Enable users to submit a proposal at any time',
          placeholder: 'Email or Profile name',
          ontheList: 'This user is already listed.'
        },
        qr: {
          title: 'Download and distribute the QR code of your event page in orfheo',
          download: 'Download'
        },
        slug:{
          title: 'Short URL',
          created: 'Link of your event page:',
          create:'Set the link of your event page:',
          regexMex:'Use lowercase letters, numbers and/or the characters _ -',
          unavailable: 'This link is already in use',
          regexError: 'The link only can contain lowercase letters, numbers and/or the characters _ -',
          lengthError: 'The link must contain at least three characters',
          available:'Available',
          popupMex: 'The new link to your event page is:',
          popupWarning:'It will work next to the current one and it cannot be modified or eliminated once created.'
        }
      },
      participants:{
        modifyNote: 'This information can only be modified by its owner from the profile page.',
      }
    },
    profile_page:{
      aside:{
        yourOther: 'your other profiles',
        other:'Other profiles from same user',
        portfolio:'Portfolio',
        gallery: 'Multimedia gallery',
        relations: 'Relations'
      },
      noTags: 'No tags specified',
      artistBio: 'Biography',
      call:'Participation in calls',
      callMex:'You are not registered in any active call in this period.',
      multimedia:'Multimedia contents',
      video: 'Videos',
      images: 'Images',
      audio:'Audio',
      spaceInfo: 'Information',
      events: 'Events',
      organizationInfo:'Information',
      createEventBtn:'Create an event and launch a call',
      createEventTitle: 'Your events in orfheo',
      participation:'Participation in events',
      production:{
        cache:'Cache: ',
        public: 'Audience ',
        noDuration: "It has no defined duration",
        info: 'Information',
        description: 'Description',
        multimedia: 'Multimedias'
      },
      space:{
        description: 'Technical description',
        rules: 'Rules of the space',
        location: 'Location'
      },
      call_proposals:{
        title:'Proposals sent to'
      },
      free_block:{
        default_title:'Free Block',
        labelPhotoForm: 'Upload an image (size must not exceed 500kb)',
        labelTextForm:'Text',
        labelTitleForm: 'Title',
        labelBottomForm: 'Button',
        helptextBottomForm: 'Text of the botton. 30 characters maximum. Remaining:',
        PlaceHolderTextBottomForm: 'Text',
        TooltipTextBottomForm: "Tooltip",
        LinkBottomForm: 'Link',
        helptextLink: 'Copy and paste the link to the page where you want the botton to send.',
        helptextTooltip: 'Its the text that appears when overlying the botton.'
      },
      DescriptionBlock:{
        labelDescription: 'Text',
        title: 'Description'
      },
      menu:{
        upcoming: "Program",
        space: "The space",
        description: 'Biografy',
        portfolio: "Portfolio",
        history: 'Record'
      },
      SpaceBlock:{
        addSpace: "Add a space"
      },
      proposalBlock:{
        addProposal: "Add a proposal"
      },
      historyBlock:{
        activities: 'Participations:',
        events:'Events:',
        call_proposals: 'Call proposals:',
        seeBtn:'See',
        eventsElementText1: 'participant',
        eventsElementText2: 'participants',
        activitiesElementText1: 'activity',
        activitiesElementText2: 'activities'
      },
      upcoming:{
        programation: 'Program '
      },
      events:{
        popup:{
          createTitle: 'Add en event'
        }
      }
    },
    event_page:{
      infoTab: {
        signupCall:'Sign up!',
        callOpening:'Call opening ',
        callOpened:'Open call',
        till: ' untill ',
        callClosed:'Closed call (since ',
        organize:'Organizer: ',
        noConditions: 'No terms of participation',
        seeAll: 'see all',
        conditions:'Participation terms'
      },
      eventAside:{
        program: 'Program',
        community: 'Community',
        info:'Info',
        partners:'Partners',
        managerbtn:'e-Manager',
        withdrawprog:'Withdraw the program',
        publishprog: 'Publish the program',
        withdrawMex:'Now only you can see the program of your event',
        publishMex:'The program has been successfully published',
      },
      program:{
        filtersbtn: 'Filters',
        filters:{
          participants:'Artistic Categories',
          hosts: 'Space Categories',
          other:'Audience',
          titleText:'Select what you want to see'
        },
        all_dates: 'All dates',
        nowbtn:'Now',
        by_time:'Schedule',
        by_space:'Space',
        orderby:'Sort by',
        permanents: 'Along all day',
        noResults:'No results',
        buy: 'Buy ticket',
        book: 'Book'
      }
    },
    services: {
      subtitle:'The management tool for big events',
      mex: 'Launch the call of your artistic-cultural event through orfheo <br>and  manage all your data with a new and powerful tool.',
      pricing: "The price is not a limit: 59,90 €/mes ",
      watchVideo:'Watch a demo video',
      contact: 'Contact us',
      section1: {
        title: 'Expand your event beyond an event',
        mex: 'Open your event in orfheo and give value to your community beyond a single encounter. You will have an entirely dedicated page and you will achieve new audiences.'
      },
      section2: {
        title: 'Colletct the data you need',
        mex: "Get ready for the beginning of something great. Start with your customized form. Anyone can easily sign up in your call from your event page."
      },
      section3:{
        title: 'View and manage the received data',
        mex: 'View, filter and explore all received proposals. Save time, harness the power of well-organized information and keep everything under control.'
      },
      section4: {
        title: 'Create the program',
        mex: 'Build the program of your event and organize anything side by side with your team. Everything is synchronized in real time and quickly modifiable. '
      },
      section5: {
        title: 'Ready? Publish the interactive program',
        mex: 'Publish your interactive program. It allows your audience to find what they want and navigate between the profiles of the participants.'
      },
      section6: {
        title: 'Surprise your audience more than ever!',
        mex: 'Let orfheo be the App of your event: it works as the perfect guide  for you and your audience.'
      },
      api:{
        title: 'API - Integrate in real time what you want and wherever you want',
        mex: 'The API service allows you to receive your events related data in all your applications. Any changes you make in orfheo will update your web and mobile app automatically. You will be able to have all your information always updated, where and when you want.'
      },
      counseling: {
        title: 'Counseling for your project',
        mex: 'You will be able to enjoy constant monitoring throughout the process of preparation of your event and discover new creative strategies focused on getting the best out of your project.'
      },
      price: {
        title: 'Price is not a limit',
        subtitle: '<span style = "color:black; margin: 0 0 4rem 0; display: block;"><b>Contact us to start managing your event by orfheo.</b></span>'
      },
      e_pack: {
        pricing: '<h3 style="font-weight:normal; display:inline">59,90</h3> €/mes<p style="text-align:center">The management tool <br>for big events</p>',
        list: 'Dedicated page/Open call online/Notification to all users/Multi-language forms/Recieve unlimited proposals/Schedule any activity/Interactive online program/Use orfheo as your App/Personal URL/Continuous technical support'
      },
      plus_pack:{
        list: 'API/Counseling',
        mex: '<p>Price without VAT. To be paid from the opening of your call till the end of your event.</p><p> Contact us for a  free trial of the e-manager.</p>'
      },
      endMex: "We believe in universes full of creativity, inclusiveness, stimulation, innovation, technology, social integration and union. We believe in a new era, where sharing is the motion force. We believe in the interaction and participation of people. We need collective actions and real engines to create a more human, accessible and close cultural reality. We need to empower projects, network and grow in community. We dream of building new horizons without barriers, a place in constant expansion that allows the easy exchange of experiences and information. Let's make it possible together, now."
    },
    browserTests:{
      version: 'It has been detected that you are using a version of% {browser} with which orfheo has not been tested. Problems of incompatibility are not excluded. </br> For a better experience, we recommend using a recent version of Google Chrome or alternatively Mozilla Firefox.',
      tracking: 'All contents on this page can not be loaded correctly. It is very likely that the browser tracking function is enabled. For a better experience, it is recommended to deactivate it.'
    },
    cookiesPolicy:{
      title: 'Cookies policy',
      mex: '<b>This web uses cookies:</b> In order to improve your browsing experience, orfheo stores information in your browser in the form of small text elements called cookies.  If you accept or continue browsing you will be agreeing with this notification. For more information you can read our '
    },
    error: {
      alert: 'Error!',
      nonExecuted: 'The action could not be executed',
      incomplete: "Please check the required fields.",
      unsaved: 'Could not save data',
      already_registered: 'User already registered!',
      invalid_parameters: 'The inserted parameters are not valid! <br/> Please check them out.',
      invalid_email: 'The email is not correct! <br/> Please try again.',
      incorrect_password: 'Wrong password!',
      invalid_password: 'Invalid password!',
      closedCall: 'Closed call',
      out_of_time_range: 'Your proposal has not been sent.',
      invalid_type: 'Invalid profile type.',
      existing_profile: 'A profile with this name already exists. Choose another.',
      non_existing_profile: 'The profile does not exist!',
      non_existing_proposal: 'The proposal does not exist!',
      non_existing_production: 'The artistic production does not exist!',
      invalid_category:'¡Invalid category!',
      existing_call: 'Already existing call.',
      non_existing_call:'There is no such call.',
      you_dont_have_permission: 'You lost the connection... log in and try again.',
      invalid_query: 'Invalid action',
      non_existing_event:'There is no such event',
      existing_name: 'The profile name you have chosen already exists. Please choose another.',
      serverProblem:{
        title: "Server Error",
        mex: "<p>Operation not executed. Please, refresh the page and try again. </p> <p>If the error persists, contact us at <a href='mailto:tech@orfheo.org' target='_top'> tech@orfheo.org</a>.</a></p>"
      },
      noPermanentsTime: 'There is not any default schedule for the permanent activities of '
    }
  }
}(Pard || {}))
