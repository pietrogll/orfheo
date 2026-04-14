# frozen_string_literal: true

Rails.application.routes.draw do
  mount Rswag::Ui::Engine => '/api-docs'
  mount Rswag::Api::Engine => '/api-docs'
  # Health check endpoint for monitoring
  get '/health', to: proc { [200, { 'Content-Type' => 'text/plain' }, ['OK']] }

  # Root route - welcome page
  root 'welcome#index'

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get 'up' => 'rails/health#show', as: :rails_health_check

  # Action Cable WebSocket endpoint
  mount ActionCable.server => '/cable'

  # Authentication routes (sessions)
  post '/register', to: 'sessions#register'
  post '/login', to: 'sessions#create'
  post '/logout', to: 'sessions#destroy'
  delete '/login', to: 'sessions#destroy' # Alternative logout via DELETE
  get '/validate', to: 'sessions#validate' # Email validation callback
  post '/forgotten_password', to: 'sessions#forgotten_password'

  # Legacy authentication routes (frontend expects /login/ prefixes)
  scope '/login' do
    post '/register', to: 'sessions#register'
    post '/login', to: 'sessions#create'
    post '/logout', to: 'sessions#destroy'
    post '/forgotten_password', to: 'sessions#forgotten_password'
  end

  # Current user session info
  get '/login', to: 'sessions#show', as: :current_session

  # Users resource routes
  scope '/users' do
    get '/', to: 'users#index', as: :users
    post '/header', to: 'users#header'
    post '/modify_password', to: 'users#modify_password'
    post '/save_interests', to: 'users#save_interests'
    get '/get_user_email', to: 'users#get_user_email'
    post '/delete_user', to: 'users#delete_user'
  end

  # Language modification (global)
  post '/modify_lang', to: 'users#modify_lang'

  # Events management
  scope '/event' do
    get '/:slug', to: 'events#show_by_slug', as: :event_by_slug
    get '/', to: 'events#show', as: :event
  end

  get '/event_manager', to: 'events#manager', as: :event_manager
  get '/events', to: 'events#index', as: :events

  scope '/users' do
    # Event CRUD
    post '/create_event', to: 'events#create'
    post '/modify_event', to: 'events#update'
    post '/delete_event', to: 'events#destroy'
    post '/update_partners', to: 'events#update_partners'
    post '/event_manager', to: 'events#manager_data'
    post '/check_slug', to: 'events#check_slug'
    post '/create_slug', to: 'events#create_slug'

    # Programs CRUD
    post '/create_program', to: 'programs#create'
    post '/modify_program', to: 'programs#update'
    post '/delete_program', to: 'programs#destroy'
    post '/space_order', to: 'programs#space_order'
    post '/publish', to: 'programs#publish'
    post '/artist_subcategories_price', to: 'programs#artist_subcategories_price'
    post '/set_permanents', to: 'programs#set_permanents'

    # Activities CRUD
    post '/create_performances', to: 'activities#create'
    post '/modify_performances', to: 'activities#update'
    post '/delete_performances', to: 'activities#destroy'
  end

  get '/program', to: 'programs#show', as: :program

  # Profiles management
  scope '/profile' do
    get '/:slug', to: 'profiles#show_by_slug', as: :profile_by_slug
    get '/', to: 'profiles#show', as: :profile
  end

  get '/profiles', to: 'profiles#index', as: :profiles
  get '/services', to: 'services#index', as: :services

  scope '/users' do
    # Profile CRUD
    post '/create_profile', to: 'profiles#create'
    post '/modify_profile', to: 'profiles#update'
    post '/modify_profile_name', to: 'profiles#update'
    post '/modify_profile_description', to: 'profiles#update'
    post '/delete_profile', to: 'profiles#destroy'
    post '/check_name', to: 'profiles#check_name'
    post '/list_profiles', to: 'profiles#list_profiles'
    post '/profile_productions_spaces', to: 'profiles#profile_productions_spaces'

    # Productions CRUD
    post '/create_production', to: 'productions#create'
    post '/modify_production', to: 'productions#update'
    post '/delete_production', to: 'productions#destroy'

    # Spaces CRUD
    post '/create_space', to: 'spaces#create'
    post '/modify_space', to: 'spaces#update'
    post '/delete_space', to: 'spaces#destroy'
  end

  # Admin panel routes (requires admin authentication)
  namespace :admin do
    get '/', to: 'admin#index', as: :dashboard

    # Meta resources
    resources :tags, only: %i[index create update destroy]
    resources :ambients, only: %i[index create update destroy]
    resources :galleries, only: %i[index create update destroy]
    resources :admins, only: %i[index create destroy]
    resources :assets, only: %i[index create update destroy]
    resources :participants, only: %i[index create update destroy]
  end

  # Calls management (artist/space proposals)
  get '/call', to: 'calls#show'
  scope '/users' do
    get '/call', to: 'calls#show'
    post '/create_call', to: 'calls#create'
    post '/delete_call', to: 'calls#destroy'
    post '/modify_call', to: 'calls#update'
    post '/checks_participant_name', to: 'calls#checks_participant_name'
    post '/add_whitelist', to: 'calls#add_whitelist'
    post '/delete_whitelist', to: 'calls#delete_whitelist'
    post '/get_call_proposals', to: 'calls#get_call_proposals'
  end

  # Artist proposals
  scope '/users' do
    post '/send_artist_proposal', to: 'artist_proposals#create'
    post '/amend_artist_proposal', to: 'artist_proposals#amend'
    post '/modify_artist_proposal', to: 'artist_proposals#update'
    post '/delete_artist_proposal', to: 'artist_proposals#destroy'
    post '/select_artist_proposal', to: 'artist_proposals#select'
    post '/modify_param_proposal', to: 'artist_proposals#modify_param'
  end

  # Space proposals
  scope '/users' do
    post '/send_space_proposal', to: 'space_proposals#create'
    post '/amend_space_proposal', to: 'space_proposals#amend'
    post '/modify_space_proposal', to: 'space_proposals#update'
    post '/select_space_proposal', to: 'space_proposals#select'
    post '/delete_space_proposal', to: 'space_proposals#destroy'
  end

  # Forms management (under /forms namespace)
  scope '/forms', controller: 'forms' do
    post '/', to: 'forms#index', as: :forms_list
    post '/get_call_forms', to: 'forms#get_call_forms'
    post '/create', to: 'forms#create'
    post '/modify', to: 'forms#update'
    post '/delete', to: 'forms#destroy'
  end

  # Free blocks (user availability)
  scope '/users' do
    post '/create_free_block', to: 'free_blocks#create'
    post '/modify_free_block', to: 'free_blocks#update'
    post '/delete_free_block', to: 'free_blocks#destroy'
  end

  # Search functionality (under /search namespace)
  namespace :search do
    # Search pages (React app)
    get '/proposals', to: 'search#proposals'
    get '/spaces', to: 'search#spaces'
    get '/profiles', to: 'search#profiles'
    get '/events', to: 'search#events'

    # Search API
    post '/load_results', to: 'search#load_results'
    get '/public_info', to: 'search#public_info'

    # Search suggest API
    post '/suggest', to: 'suggest#suggest'
    post '/results', to: 'suggest#results'
    post '/suggest_program', to: 'suggest#suggest_program'
    post '/results_program', to: 'suggest#results_program'
    post '/suggest_tags', to: 'suggest#suggest_tags'
    post '/suggest_event_names', to: 'suggest#suggest_event_names'
  end

  # Participant management (under /participant namespace)
  namespace :participant do
    post '/modify', to: 'participants#modify'
  end

  # Mount Action Cable server
end
