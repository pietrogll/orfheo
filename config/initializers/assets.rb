# frozen_string_literal: true

# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'

# Add additional assets to the asset load path.
# Rails 8 / Sprockets 4
Rails.application.config.assets.paths << Rails.root.join('assets', 'javascripts')
Rails.application.config.assets.paths << Rails.root.join('assets', 'stylesheets')
Rails.application.config.assets.paths << Rails.root.join('assets', 'images')
Rails.application.config.assets.paths << Rails.root.join('assets', 'font')
Rails.application.config.assets.paths << Rails.root.join('assets', 'reactjs', 'dist')

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets folder are already added.
Rails.application.config.assets.precompile += %w[ours.js websocket.js bundle.js]
