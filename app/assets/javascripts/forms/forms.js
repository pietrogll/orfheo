'use strict';

(function(ns){

  ns.Forms = ns.Forms || {};

  ns.Forms.Materials = { 
    'sound':[
      'speaker',
      'soundboard',
      'audio_monitors',
      'equalizer', 
      'ampli', 
      'micros', 
      'headset_micro', 
      'mic_stands', 
      'audio_cables', 
      'piano', 
      'drums', 
      'guitar', 
      'bass'
      ], 
    'audiovisual':[
      'computer',
      'cd_player',
      'vynil_player',
      'dvd_player',
      'projector',
      'projector_screen',
      'monitor_screen'
    ],
    'show':[
      'light_board',
      'stage_lighting',
      'lighting_filter_gel',
      'smoke_machine'
    ],
    'forniture':[
      'lectern',
      'mobile_stage',
      'pedestal',
      'tables',
      'chairs',
      'stool',
      'mirror',
      'mat'
    ]
  }

  ns.Forms.HumanResources = [
    'room_chief', 
    'tech_chief', 
    'production_team', 
    'sound_tech', 
    'light_tech', 
    'tailor', 
    'dj', 
    'vj', 
    'videomaker', 
    'photographer', 
    'blockbuster', 
    'cargo_staff'
  ];

  ns.Forms.Accessibility = [
    'wheelchair',
    'cargo',
    'private_parking',
    'public_parking',
    'bikes_parking'
  ]

  ns.Forms.TechSpecs = [
    'bottom_floor',
    'top_floor',
    'outdoor',
    'indoor',
    'stage',
    'dressing_room',
    'showcase',
    'sound_system',
    'video_system',
    'expo_rail',
    'socket',
    'tap',
    'heating',
    'conditioner',
    'wifi'
  ]

  ns.Forms.TechPoss = [
    'drill_wall',
    'drill_floor',
    'wall_intervention',
    'floor_intervention',
    'roof_intervention',
    'blindness',
    'store',
    'hook_roof'
  ]

  ns.Forms.Floor = [
    'carpet', 
    'linoleum', 
    'parquet', 
    'tile', 
    'cement', 
    'resin'
  ]
 

  ns.Forms.Profile =  {
    name: {
      "type" : "mandatory",
      "label" : Pard.t.text('createProfile.artistForm.nameL'),
      "input" : "InputName",
      "args" : [],
      "helptext" : Pard.t.text('createProfile.artistForm.nameH')
    },
    profile_picture:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.artistForm.photoL'),
      "input" : "UploadPhotos",
      "args" : [ 
                "/profile_picture", 
                1
              ],
      "helptext" : Pard.t.text('createProfile.artistForm.photoH'),
    },
    email:{
      "type" : "mandatory",
      "label" : Pard.t.text('createProfile.artistForm.emailL'),
      "input" : "InputEmailChecked",
      "args" : [],
      "helptext" : ""
    },
    phone: {
      "type" : "optional",
      "label" : Pard.t.text('createProfile.artistForm.phoneL'),
      "input" : "InputTel",
      "args" : ['',true],
      "helptext" : ""
    },
    facets: {
      "type" : "mandatory",
      "label" : Pard.t.text('createProfile.artistForm.facetsL'),
      "input" : "MultipleGroupSelector",
      "args" : [Pard.OrfheoFacets, null, Pard.t.text('facets'), {width:'100%', multipleWidth: 185, multiple: true}],
      "helptext" : Pard.t.text('createProfile.artistForm.facetsH')
    },
    tags:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.artistForm.TagsL'),
      "input" : "InputTags",
      "args" : ['profiles'],
      "helptext" : ""
    },
    address:{
      "type" : "mandatory",
      "label" : Pard.t.text('createProfile.artistForm.addressL'),
      "input" : "InputAddressArtist",
      "args" : null,
      "helptext" : Pard.t.text('createProfile.artistForm.addressH')
    },
    short_description:{
      'type':'optional',
      'label': Pard.t.text('createProfile.artistForm.short_descriptionL'), 
      'input': 'TextAreaCounter',
      'args':['', 140, Pard.t.text('createProfile.artistForm.short_descriptionH')],
      'helptext': ''
    },
    personal_web:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.artistForm.webL'),
      "input" : "InputPersonalWeb",
      "args" : null,
      "helptext" : Pard.t.text('createProfile.artistForm.webH')
    },
    buttons:{
      "type" : "optional",
      "label" : Pard.t.text('profile_page.free_block.labelBottomForm'),
      "input" : "PersonalButton",
      "args" : null,
      "helptext" : ''
    },
    color:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.artistForm.colorL'),
      "input" : "InputColor",
      "args" : null,
      "helptext" : Pard.t.text('createProfile.artistForm.colorH')
    },
    menu:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.artistForm.menuL'),
      "input" : "SortableList",
      "args" : [Pard.t.text('profile_page.menu')],
      "helptext" : ""
    }
  }


  ns.Forms.Participant = {
      name: {
        "type" : "mandatory",
        "label" : Pard.t.text('proposal.form.nameL'),
        "input" : "InputParticipantName",
        "args" : [],
        "helptext" : ""
      },
      email: {
        "type" : "mandatory",
        "label" : Pard.t.text('proposal.form.emailL'),
        "input" : "InputEmail",
        "args" : [ 
            ""
        ],
        "helptext" : ""
      },
      phone: {
        "type" : "mandatory",
        "label" : Pard.t.text('manager.proposals.phoneL'),
        "input" : "InputTel",
        "args" : [ 
            ""
        ],
        "helptext" : ""
      }
    }


  ns.Forms.FreeBlock = {
    name:{
      "type" : "mandatory",
      "input" : "Input",
      "args" : ['', 'text'],
      "label" : Pard.t.text('profile_page.free_block.labelTitleForm'),
      "helptext" : ""
    },
    description: {
      'type':'optional',
      'label': Pard.t.text('profile_page.free_block.labelTextForm'),
      'input':'TextAreaEnriched',
      'args':['',4],
      'helptext':""
    },
    // links : {
    //     "type" : "optional",
    //     "label" : Pard.t.text('production.form.linksL'),
    //     "input" : "InputMultimedia",
    //     "args" : null,
    //     "helptext" : ""
    // },
    photos : {
        "type" : "optional",
        "label" : Pard.t.text('profile_page.free_block.labelPhotoForm'),
        "input" : "UploadPhotos",
        "args" : [ 
            "/photos", 
            1
        ],
        "helptext" : ""
    },
    buttons:{
      "type" : "optional",
      "label" : Pard.t.text('profile_page.free_block.labelBottomForm'),
      "input" : "PersonalButton",
      "args" : null,
      "helptext" : ''
    }
  }


  ns.Forms.DescriptionBlock = {
    description: {
      'type':'mandatory',
      'label': Pard.t.text('profile_page.DescriptionBlock.labelDescription'),
      'input':'TextAreaEnriched',
      'args':['',4],
      'helptext': ""
    }
  }

  ns.Forms.Space = {
    name:{
      "type" : "mandatory",
      "label" : Pard.t.text('createProfile.spaceForm.nameL'),
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : ""
    },
    type:{
      "type" : "mandatory",
      "label" : Pard.t.text('space_type.title'),
      "input" : "ArraySelector",
      "args" : [Pard.OrfheoSpaceType.map(function(val){return Pard.t.text('space_type')[val]}), Pard.OrfheoSpaceType],
      "helptext" : ""
    },
    description: {
      'type':'mandatory',
      'label': Pard.t.text('createProfile.spaceForm.bioL'),
      'input':'TextAreaEnriched',
      'args':['',4],
      'helptext':Pard.t.text('createProfile.spaceForm.bioPlaceholder')
    },
    size:{
        "type" : "optional",
        "label" : Pard.t.text('createProfile.spaceForm.sizeL'),
        "input" : "InputNumber",
        "args" : ['', 'm^2'],
        "helptext" : ""
    },
    address:{
      "type" : "mandatory",
      "label" : Pard.t.text('proposal.form.addressL'),
      "input" : "InputAddressSpace",
      "args" : [
                Pard.t.text('createProfile.spaceForm.addressPlaceholder')
              ],
      "helptext" : ""
    },
    plane_picture:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.spaceForm.planeL'),
      "input" : "UploadPhotos",
      "args" : [ 
          "/plane_picture", 
          1
      ],
      "helptext" :Pard.t.text('createProfile.spaceForm.planeH')
    },
    human_resources:{
      "type" : "optional",
      "label" : Pard.t.text('human_resources.title'),
      "input" : "MultipleSelector",
      "args" : [Pard.Forms.HumanResources, null, Pard.t.text('human_resources'), {width:'100%', multipleWidth: 185, multiple: true}],
      "helptext" : ""
    },
    materials:{
      "type" : "optional",
      "label" : Pard.t.text('materials.title'),
      "input" : "MultipleGroupSelector",
      "args" : [Pard.Forms.Materials, null, Pard.t.text('materials'), {width:'100%', multipleWidth: 185, multiple: true}],
      "helptext" : ""
    },
    accessibility:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.spaceForm.accessibilityL'),
      "input" : "MultipleSelector",
      "args" : [Pard.Forms.Accessibility, null, Pard.t.text('accessibility')],
      "helptext" : ""
    },
    rules:{
      'type':'optional',
      'label': Pard.t.text('createProfile.spaceForm.rulesL'),
      'input':'TextAreaEnriched',
      'args':['',4],
      'helptext':""
    }
  }

  ns.Forms.Ambient = {
    name:{
      "type" : "mandatory",
      "label" : Pard.t.text('createProfile.spaceForm.ambNameL'),
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : ""
    },
    description: {
      'type':'mandatory',
      'label': Pard.t.text('createProfile.spaceForm.ambDescriptionL'),
      'input':'TextAreaEnriched',
      'args':['',4],
      'helptext': Pard.t.text('createProfile.spaceForm.bioPlaceholder')
    },
    size:{
        "type" : "optional",
        "label" : Pard.t.text('createProfile.spaceForm.ambSizeL'),
        "input" : "InputNumber",
        "args" : ['', 'm^2'],
        "helptext" : ""
    },
    height:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.spaceForm.ambHeighL'),
      "input" : "InputNumber",
      "args" : ['', 'm'],
      "helptext" : ""
    },
    tech_specs:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.spaceForm.ambTechL'),
      "input" : "MultipleSelector",
      "args" : [Pard.Forms.TechSpecs, null, Pard.t.text('tech_specs')],
      "helptext" : ""
    },
    tech_poss:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.spaceForm.ambPossL'),
      "input" : "MultipleSelector",
      "args" : [Pard.Forms.TechPoss, null, Pard.t.text('tech_poss')],
      "helptext" : ""
    },
    floor:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.spaceForm.ambFloorL'),
      "input" : "MultipleSelector",
      "args" : [Pard.Forms.Floor, null, Pard.t.text('floor')],
      "helptext" : ""
    },
    capacity:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.spaceForm.ambCapacityL'),
      "input" : "InputNumber",
      "args" : ['', 'personas'],
      "helptext" : ""
    },
    allowed_categories:{
      "type" : "mandatory",
      "label" : Pard.t.text('createProfile.spaceForm.catL'),
      "input" : "MultipleSelector",
      "args" : [Pard.OrfheoCategories.concat(['none']),null,Pard.t.text('categories')],
      "helptext" : Pard.t.text('createProfile.spaceForm.catH')
    },
    allowed_formats:{
      "type" : "mandatory",
      "label" : Pard.t.text('createProfile.spaceForm.formatL'),
      "input" : "MultipleSelector",
      "args" : [Pard.OrfheoFormats.concat(['none']),null,Pard.t.text('formats')],
      "helptext" : Pard.t.text('createProfile.spaceForm.formatH')
    },
    links : {
        "type" : "optional",
        "label" : Pard.t.text('production.form.linksL'),
        "input" : "InputMultimedia",
        "args" : null,
        "helptext" : Pard.t.text('createProfile.spaceForm.linksH')
    },
    photos : {
        "type" : "optional",
        "label" : Pard.t.text('createProfile.spaceForm.photoL'),
        "input" : "UploadPhotos",
        "args" : [ 
            "/photos", 
            4
        ],
        "helptext" : ""
    }
  }


  ns.Forms.SpaceCall = {
    space_name:{
      "type" : "mandatory",
      "label" : Pard.t.text('createProfile.spaceForm.nameL'),
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : ""
    },
    type:{
      "type" : "mandatory",
      "label" : Pard.t.text('space_type.title'),
      "input" : "ArraySelector",
      "args" : [Pard.OrfheoSpaceType.map(function(val){return Pard.t.text('space_type')[val]}), Pard.OrfheoSpaceType],
      "helptext" : ""
    },
    description: {
      'type':'mandatory',
      'label': Pard.t.text('createProfile.spaceForm.bioL'),
      'input':'TextAreaEnriched',
      'args':['',4],
      'helptext':Pard.t.text('createProfile.spaceForm.bioPlaceholder')
    },
    address:{
      "type" : "mandatory",
      "label" : Pard.t.text('proposal.form.addressL'),
      "input" : "InputAddressSpace",
      "args" : [
                Pard.t.text('createProfile.spaceForm.addressPlaceholder')
              ],
      "helptext" : ""
    },
    plane_picture:{
      "type" : "optional",
      "label" :  Pard.t.text('createProfile.spaceForm.planeL'),
      "input" : "UploadPhotos",
      "args" : [ 
          "/plane_picture", 
          1
      ],
      "helptext" : Pard.t.text('createProfile.spaceForm.planeH'),
    }
  }


  ns.Forms.AmbientCall = {
    name:{
      "type" : "mandatory",
      "label" : Pard.t.text('createProfile.spaceForm.ambNameL'),
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : ""
    },
    description: {
      'type':'mandatory',
      'label': Pard.t.text('createProfile.spaceForm.ambDescriptionL'),
      'input':'TextAreaEnriched',
      'args':['',4],
      'helptext': Pard.t.text('createProfile.spaceForm.bioPlaceholder')
    },
    allowed_categories:{
      "type" : "mandatory",
      "label" : Pard.t.text('createProfile.spaceForm.catL'),
      "input" : "MultipleSelector",
      "args" : [Pard.OrfheoCategories.concat(['none']),null,Pard.t.text('categories')],
      "helptext" : Pard.t.text('createProfile.spaceForm.catH')
    },
    allowed_formats:{
      "type" : "mandatory",
      "label" : Pard.t.text('createProfile.spaceForm.formatL'),
      "input" : "MultipleSelector",
      "args" : [Pard.OrfheoFormats.concat(['none']),null,Pard.t.text('formats')],
      "helptext" : Pard.t.text('createProfile.spaceForm.formatH')
    },
    links : {
        "type" : "optional",
        "label" : Pard.t.text('production.form.linksL'),
        "input" : "InputMultimedia",
        "args" : null,
        "helptext" : Pard.t.text('createProfile.spaceForm.linksH')
    },
    photos : {
      "type" : "optional",
      "label" : Pard.t.text('createProfile.spaceForm.photoL'),
      "input" : "UploadPhotos",
      "args" : [ 
          "/photos", 
          4
      ],
      "helptext" : ""
    }
  }


  ns.Forms.PortfolioProposal ={
    category:{
      "type" : "mandatory",
      "label" : Pard.t.text('production.form.categoryL'),
      "input" : "ArraySelector",
      "args" : [Pard.OrfheoCategories.map(function(val){return Pard.t.text('categories')[val]}), Pard.OrfheoCategories],
      "helptext" : ""
    },
    format:{
      "type" : "mandatory",
      "label" : Pard.t.text('production.form.formatL'),
      "input" : "ArraySelector",
      "args" : [Pard.OrfheoFormats.map(function(val){return Pard.t.text('formats')[val]}), Pard.OrfheoFormats],
      "helptext" : ""
    },
    tags:{
      "type" : "optional",
      "label" : Pard.t.text('createProfile.artistForm.TagsL'),
      "input" : "InputTags",
      "args" : ['productions'],
      "helptext" : ""
    },
    title:{
        "type" : "mandatory",
        "label" : Pard.t.text('production.form.titleL'),
        "input" : "Input",
        "args" : ['', 'text'],
        "helptext" : ""
      },
    description: {
      'type':'mandatory',
      'label':Pard.t.text('production.form.descriptionL'),
      'input':'TextAreaEnriched',
      'args':['',4],
      'helptext': Pard.t.text('production.form.descriptionH')
    },
    short_description: { 
      'type':'mandatory',
      'label': Pard.t.text('production.form.short_descriptionL'),
      'input': 'TextAreaCounter',
      'args':['',80,Pard.t.text('production.form.short_descriptionH')],
      'helptext': ''
    },   
    duration : {
      "type" : "optional",
      "label" : Pard.t.text('production.form.durationL'),
      "input" : "ArraySelector",
      "args" : [ 
          [   
              Pard.t.text('production.form.noDefinedDuration'),
              "5 min",
              "10 min",
              "15 min",
              "20 min",
              "25 min",
              "30 min",
              "35 min",
              "40 min", 
              "45 min",
              "50 min",
              "55 min", 
              "1 h",
              "1h 15min", 
              "1h 30min", 
              "1h 45min", 
              "2 h", 
              "2h 15min", 
              "2h 30min"
          ], 
          [   
              "none",
              "5",
              "10",
              "15",
              "20",
              "25", 
              "30",
              "35",
              "40",
              "45",
              "50",
              "55", 
              "60", 
              "75", 
              "90", 
              "105", 
              "120", 
              "135", 
              "150"
          ]
      ],
      "helptext" : ""
    },
    children : {
      "type" : "optional",
      "label" : Pard.t.text('production.form.childrenL'),
      "input" : "InputChildren",
      "args" : null,
      "helptext" : Pard.t.text('production.form.childrenH')
    }, 
    links : {
        "type" : "optional",
        "label" : Pard.t.text('production.form.linksL'),
        "input" : "InputMultimedia",
        "args" : null,
        "helptext" : Pard.t.text('production.form.linksH')
    },
    photos : {
        "type" : "optional",
        "label" : Pard.t.text('production.form.photoL'),
        "input" : "UploadPhotos",
        "args" : [ 
            "/photos", 
            4
        ],
        "helptext" : ""
    },
    cache:{
      "type" : "optional",
      "label" : Pard.t.text('production.form.cacheL'),
      "input" : "InputCommentedCache",
      "args" : [''],
      "helptext" : ""
    }
  }

  ns.Forms.MultimediaManager =  {
    links : {
        "type" : "optional",
        "label" : Pard.t.text('createProfile.spaceForm.linksL'),
        "input" : "InputMultimedia",
        "args" : null,
        "helptext" : Pard.t.text('createProfile.spaceForm.linksH')
    },
    photos : {
        "type" : "optional",
        "label" : Pard.t.text('widget.multimediaManager.photoL'),
        "input" : "UploadPhotos",
        "args" : [ 
            "/photos", 
            4
        ],
        "helptext" : ""
    }
  }


  ns.Forms.Event =  {
    name:{
      "type" : "mandatory",
      "label" : Pard.t.text('forms.event.nameL'),
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : ""
    },
    type:{
      "type" : "mandatory",
      "label" : Pard.t.text('forms.event.typeL'),
      "input" : "ArraySelector",
      "args" : [
        Pard.OrfheoEventType.map(function(val){return Pard.t.text('event_type')[val]}), 
        Pard.OrfheoEventType, 
        null
      ],
      "helptext" : ''
    },
    categories:{
      "type" : "mandatory",
      "label" : Pard.t.text('forms.event.categoriesL'),
      "input" : "MultipleSelector",
      "args" : [Pard.OrfheoCategories,null,Pard.t.text('categories')],
      "helptext" : ""
    },
    img : {
        "type" : "optional",
        "label" : Pard.t.text('forms.event.imgL'),
        "input" : "UploadPhotos",
        "args" : [ 
            "/photos", 
            1
        ],
        "helptext" :""
    },
     place:{
      "type" : "mandatory",
      "label" : Pard.t.text('forms.event.placeL'),
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : Pard.t.text('forms.event.placeH')
    },
    address:{
      "type" : "mandatory",
      "label" : Pard.t.text('forms.event.addressL'),
      "input" : "InputAddressSpace",
      "args" : ['',[ 'locality']],
      "helptext" : Pard.t.text('forms.event.addressH')
    },
    eventTime:{
      "type" : "mandatory",
      "label" : Pard.t.text('forms.event.eventTimeL'),
      "input" : "EventTime",
      "args" : [Pard.t.text('forms.event.eventTimeBtn')],
      "helptext" : ""
    },
    texts: {
      "type" : "mandatory",
      "label" : Pard.t.text('forms.event.textsL'),
      "input" : "SummableInputs",
      "args" : [{
        lang:{
          'type':'mandatory',
          'label': Pard.t.text('forms.event.langL'),
          'input':'Selector',
          'args':[
          {
            'es': Pard.t.text('footer.languages.es'),
            'ca' : Pard.t.text('footer.languages.ca'),
            'en': Pard.t.text('footer.languages.en')
          },
          null,
          'select language'
          ]
        },
        baseline: {
          'type':'optional',
          'label': Pard.t.text('forms.event.baselineL'),
          'input':'Input',
          'args':['','text']
        },
        description:{
          'type':'mandatory',
          'label': Pard.t.text('forms.event.descriptionL'),
          'input':'TextAreaEnriched',
          'args':['',4]
        },
        buttons:{
          "type" : "optional",
          "label" : Pard.t.text('forms.event.buttonsL'),
          "input" : "PersonalButtons",
          "args": [false],
          "helptext":""
        }
      },
      Pard.t.text('forms.event.addLanguageBtn')],
      "helptext" : ""
    },
    professional:{
      "type" : "optional",
      "label" : 'Professional',
      "input" : "CheckBox",
      "args" : ['', 'true'],
      "helptext" : ""
    },
    profile_id:{
      "type" : "mandatory",
      "label" : 'Organizer profile_id',
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : ""
    }
  }


  ns.Forms.Partners = {
     partners:{
      "type" : "optional",
      "label" : 'Partners',
      "input" : "SummableInputs",
      "args" : [{
          "name" : {
              "type" : "optional",
              "label" : Pard.t.text('forms.partners.nameL'),
              "input" : "Input",
              "args" : [ 
                  "", 
                  "text"
              ]
          },
          "link" : {
              "type" : "optional",
              "label" : Pard.t.text('forms.partners.linkL'),
              "input" : "Input",
              "args" : [ 
                  "Copy and paste the link", 
                  "text"
              ]
          },
          "type" : {
            "type" : "mandatory",
            "label" : Pard.t.text('forms.partners.typeL'),
            "input" : "Selector",
            "args" : [
            {
              'sponsors': Pard.t.text('partner_type.sponsor').capitalize(),
              'collaborators': Pard.t.text('partner_type.collaborator').capitalize(),
              'promotors': Pard.t.text('partner_type.promotor').capitalize()
            },
            null
            ]
          },
          "img" : {
              "type" : "optional",
              "label" : Pard.t.text('forms.partners.imgL'),
              "input" : "UploadPhotos",
              "args" : [ 
                  "/photos", 
                  1
              ]
          }
      }],
      "helptext" : ''
    }
  }



  
  ns.Forms.CallTexts = {
    choose_type:{
      "type" : "optional",
      "label" : 'choose_type',
      "input" : "TextAreaEnriched",
      "args" : [],
      "helptext" : ""
    },
    space_call_btn:{
      "type" : "optional",
      "label" : 'space_call_btn',
      "input" : "Input",
      "args" : [null, 'text'],
      "helptext" : ""
    },
    artist_call_btn:{
      "type" : "optional",
      "label" : 'artist_call_btn',
      "input" : "Input",
      "args" : [null, 'text'],
      "helptext" : ""
    }
  }


  ns.Forms.Call = {
    start:{
      'type':'mandatory',
      'input':'InputDate',
      'args': null,
      'label': 'start date',
      "helptext" : ""
    },
    deadline: {
      'type':'mandatory',
      'input':'InputDate',
      'args': null,
      'label': 'end date',
      "helptext" : ""
    },
    conditions: {
      'type':'optional',
      'input':'Input',
      'args': ["link","text"],
      'label': 'conditions',
      "helptext" : ""
    },
    texts : {
      'type':'optional',
      'label' : 'Call texts',
      'input':'MultiLangInputs',
      'args': [Pard.Forms.CallTexts],
      "helptext" : ""
    },
    event_selected:{
      "type" : "mandatory",
      "label" : 'Event to assigning call to',
      "input" : "EventsSelector",
      "args" : [],
      "helptext" : ""
    }
  }

  ns.Forms.CallFormTexts = {
    label:{
      "type" : "mandatory",
      "label" : 'Form Title (label)',
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : ""
    },
    helptext:{
      "type" : "optional",
      "label" : 'Introductory text',
      "input" : "TextAreaEnriched",
      "args" : ['', 4],
      "helptext" : ""
    },
    part_one:{
      "type" : "optional",
      "label" : 'part_one form helptext',
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : "Es el texto que aparece para explicar la primera parte (con los campos de default) de los formularios."
    },
    part_two:{
      "type" : "optional",
      "label" : 'part_two form helptext',
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : "Texto para la segunda parte."
    },
    final_text:{
      "type" : "optional",
      "label" : 'Final text',
      "input" : "TextAreaEnriched",
      "args" : ['', 4],
      "helptext" : ""
    },
    sent_proposal_mex:{
      "type" : "optional",
      "label" : 'Sent proposal message',
      "input" : "TextAreaEnriched",
      "args" : ['', 4],
      "helptext" : ""
    }
  }


  ns.Forms.CallForm_I = {
    texts:{
      "type" : "mandatory",
      "label" : 'Texts',
      "input" : "FormInputs",
      "args" : [Pard.Forms.CallFormTexts],
      "helptext" : ""
    },
    widgets:{
      "type" : "optional",
      "label" : 'Widgets',
      "input" : "InputFormWidgets",
      "args" : [],
      "helptext" : ""
    },
    own:{
      "type" : "optional",
      "label" : 'Visibility (own)',
      "input" : "Selector",
      "args" : [{
        '': 'public (for everybody)',
        'private' : 'private (only for whitelisted users and organizers)',
        'own' : 'own (only for organizers)'
      }],
      "helptext" : ""
    }
  }

   
  
  ns.Forms.Program = {
    subcategories:{
      "type" : "mandatory",
      "label" : 'Subcategories',
      "input" : "ProgramSubcategories",
      "args" : [],
      "helptext" : ""
    },
    event_selected:{
      "type" : "mandatory",
      "label" : 'Event to assign program to',
      "input" : "EventsSelector",
      "args" : [],
      "helptext" : ""
    },
    permanents:{
      "type" : "optional",
      "label" : Pard.t.text('widget.eventTime.permanents'),
      "input" : "DateTimeArray",
      "args" : [],
      "helptext" : ""    
    },
    display_program:{
      "type" : "optional",
      "label" : Pard.t.text('forms.program.display_programL'),
      "input" : "Selector",
      "args" : [{ 
          "by_time" : Pard.t.text('event_page.program.by_time'),
          "by_space": Pard.t.text('event_page.program.by_space')
        }],
      "helptext" : ""
    }
  }

  ns.Forms.OpenCallMail =  {
    event_selected : {
        "type" : "mandatory",
        "label" : 'Select event to inform about',
        "input" : "EventsSelector",
        "args" : [],
        "helptext" : ""
    }
  }


  ns.Forms.TextMail =  {
    receivers: {
      "type" : "optional",
      "label" : 'Recipients',
      "input" : "InputTagsSimple",
      "args" : ['Emails'],
      "helptext" : ""
    },
    categories: {
      "type" : "optional",
      "label" : 'Categories',
      "input" : "MultipleSelector",
      "args" : [Pard.OrfheoCategories.concat(['none']),null,Pard.t.text('categories')],
      "helptext" : ""
    },
    email_type: {
      "type" : "optional",
      "label" : 'Email Type',
      "input" : "Selector",
      "args" : [
        { 
          "" : 'none',
          "event_call": 'event_call'
        }
      ],
      "helptext" : ""
    },
    subject_es : {
      "type" : "mandatory",
      "label" : 'Subject default (ES)',
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : "Spanish subject"
    },
    body_es : {
      "type" : "mandatory",
      "label" : 'Body default (ES)',
      "input" : "TextArea",
      "args" : ['HTML text', 8],
      "helptext" : "Default body email text"
    },
    subject_ca : {
      "type" : "optional",
      "label" : 'Subject CA',
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : "Catalan subject"
    },
    body_ca : {
      "type" : "optional",
      "label" : 'Body CA',
      "input" : "TextArea",
      "args" : ['HTML text', 8],
      "helptext" : "Catalan body email text"
    },
    subject_en : {
      "type" : "optional",
      "label" : 'Subject EN',
      "input" : "Input",
      "args" : ['', 'text'],
      "helptext" : "English subject"
    },
    body_en : {
      "type" : "optional",
      "label" : 'Body EN',
      "input" : "TextArea",
      "args" : ['HTML text', 8],
      "helptext" : "English body email text"
    }
  }


  ns.Forms.DefaultSpaceCallFormFields = {
    "subcategory" : {
      "type" : "mandatory",
      "label" : "select space subcategory",
      "input" : "SubcategorySelector",
      "args":[],
      "helptext":''

    },
    "phone" : {
      "type" : "mandatory",
      "label" : "Teléfono de contacto",
      "input" : "InputTel",
      "args" : [ 
          ""
      ],
      "helptext" : ""
    },
    "email" : {
        "type" : "mandatory",
        "label" : "Correo de contacto",
        "input" : "InputEmail",
        "args" : [ 
            ""
        ],
        "helptext" : ""
    }, 
    "availability" : {
      "type" : "mandatory",
      "label" : "Disponibilidad",
      "input" : "MultipleDaysSelector",
      "args" : [  ],
      "helptext" : "Selecciona los días que estás disponible para tu participación en el evento."
    },
    "conditions" : {
      "type" : "mandatory",
      "label" : "Acepto las condiciones de participación asociadas a este evento",
      "input" : "Conditions",
      "args" : null,
      "helptext" : null
    }
  }

  
  ns.Forms.DefaultArtistCallFormFields = {
    "category" : {
        "type" : "mandatory",
        "label" : "Selecciona una categoría artistica",
        "input" : "CategorySelector",
        "args" : [],
        "helptext" : null
    },
    "subcategory" : {
        "type" : "mandatory",
        "label" : "Disciplina PRINCIPAL de la obra que se presenta en el evento",
        "input" : "SubcategorySelector",
        "args" : [],
        "helptext" : null
    },
    "other_categories" : {
        "type" : "optional",
        "label" : "Otras disciplinas de la obra",
        "input" : "MultipleSelector",
        "args" : [],
        "helptext" : ""
    },
    "other" : {
        "type" : "optional",
        "label" : "Si has marcado 'otro', especificar",
        "input" : "Text",
        "args" : null,
        "helptext" : null
    },
    "format" : {
        "type" : "mandatory",
        "label" : "Formato de la propuesta",
        "input" : "FormatSelector",
        "args" : [],
        "helptext" : null
    },
    "title" : {
        "type" : "mandatory",
        "label" : "Título de la obra",
        "input" : "Text",
        "args" : null,
        "helptext" : null
    },
    "description" : {
        "type" : "mandatory",
        "label" : "Descripción de la propuesta",
        "input" : "TextArea",
        "args" : null,
        "helptext" : ""
    },
    "short_description" : {
        "type" : "mandatory",
        "label" : "Descripción (muy) breve",
        "input" : "TextAreaCounter",
        "args" : 80,
        "helptext" : "Máximo 80 caracteres. Quedan: "
    },
    "duration" : {
        "type" : "mandatory",
        "label" : "Duración",
        "input" : "Duration",
        "args" : [],
        "helptext" : null
    },
    "links" : {
        "type" : "optional",
        "label" : "Contenidos multimedias",
        "input" : "InputMultimedia",
        "args" : null,
        "helptext" : "Añade enlaces a contanidos multimedias de tu obra."
    },
    "photos" : {
        "type" : "optional",
        "label" : "Fotos de tu obra (máximo 4, tamaño inferior a 500kb)",
        "input" : "UploadPhotos",
        "args" : [ 
            "/photos", 
            4
        ],
        "helptext" : null
    },
    "children" : {
        "type" : "mandatory",
        "label" : "Público al que va dirigido",
        "input" : "InputChildren",
        "args" : null,
        "helptext" : "Indica a qué tipo de público está dirigida tu propuesta."
    },
    "phone" : {
        "type" : "mandatory",
        "label" : "Teléfono de contacto",
        "input" : "InputTel",
        "args" : [ 
            ""
        ],
        "helptext" : ""
    },
    "email" : {
        "type" : "mandatory",
        "label" : "Correo de contacto",
        "input" : "InputEmail",
        "args" : [ 
            ""
        ],
        "helptext" : ""
    },
    "availability" : {
      "type" : "mandatory",
      "label" : "Disponibilidad",
      "input" : "MultipleDaysSelector",
      "args" : [  ],
      "helptext" : "Selecciona los días que estás disponible para tu participación en el evento."
    },
    "conditions" : {
        "type" : "mandatory",
        "label" : "Acepto las condiciones de participación asociadas a este evento",
        "input" : "Conditions",
        "args" : null,
        "helptext" : null
    }
  } 



  

}(Pard || {}));
