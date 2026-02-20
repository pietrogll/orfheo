# frozen_string_literal: true

require 'digest'

namespace :assets do
  desc 'Audit duplicate files between app/assets and assets (set FAIL_ON_DIFF=1 to fail on drift)'
  task :audit_duplicates do
    root = Rails.root
    app_root = root.join('app/assets')
    legacy_root = root.join('assets')

    abort 'Expected both app/assets and assets to exist.' unless app_root.exist? && legacy_root.exist?

    categories = %w[javascripts stylesheets images]
    duplicates = []
    only_in_app = []
    only_in_legacy = []

    categories.each do |category|
      app_dir = app_root.join(category)
      legacy_dir = legacy_root.join(category)
      next unless app_dir.exist? && legacy_dir.exist?

      app_files = Dir.glob(app_dir.join('**/*')).select { |path| File.file?(path) }
      legacy_files = Dir.glob(legacy_dir.join('**/*')).select { |path| File.file?(path) }

      app_rel = app_files.map { |path| Pathname(path).relative_path_from(app_dir).to_s }
      legacy_rel = legacy_files.map { |path| Pathname(path).relative_path_from(legacy_dir).to_s }

      common = (app_rel & legacy_rel).sort
      common.each do |relative_path|
        app_file = app_dir.join(relative_path)
        legacy_file = legacy_dir.join(relative_path)
        same = Digest::SHA256.file(app_file).hexdigest == Digest::SHA256.file(legacy_file).hexdigest
        duplicates << {
          category: category,
          path: relative_path,
          same: same,
          app_file: app_file,
          legacy_file: legacy_file
        }
      end

      (app_rel - legacy_rel).sort.each do |relative_path|
        only_in_app << "#{category}/#{relative_path}"
      end

      (legacy_rel - app_rel).sort.each do |relative_path|
        only_in_legacy << "#{category}/#{relative_path}"
      end
    end

    same_count = duplicates.count { |row| row[:same] }
    diff_rows = duplicates.reject { |row| row[:same] }

    puts '== Asset Duplicate Audit =='
    puts "duplicates: #{duplicates.length}"
    puts "identical:  #{same_count}"
    puts "drifted:    #{diff_rows.length}"
    puts "only app/assets: #{only_in_app.length}"
    puts "only assets:     #{only_in_legacy.length}"

    if diff_rows.any?
      puts
      puts '-- Drifted duplicates --'
      diff_rows.each do |row|
        puts "#{row[:category]}/#{row[:path]}"
      end
    end

    if only_in_app.any?
      puts
      puts '-- Only in app/assets --'
      only_in_app.each { |path| puts path }
    end

    if only_in_legacy.any?
      puts
      puts '-- Only in assets --'
      only_in_legacy.each { |path| puts path }
    end

    abort 'Asset drift detected between app/assets and assets.' if ENV['FAIL_ON_DIFF'] == '1' && diff_rows.any?
  end
end
