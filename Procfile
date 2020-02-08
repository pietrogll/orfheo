web: bundle exec rackup config.ru -p ${PORT-8080}
worker: bundle exec sidekiq -c 2 -v -r ./workers/sidekiq_workers.rb
