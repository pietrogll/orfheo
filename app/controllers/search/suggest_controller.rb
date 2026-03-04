# frozen_string_literal: true

module Search
  class SuggestController < ApplicationController
    skip_before_action :verify_authenticity_token
    before_action :require_login!, except: %i[suggest_event_names suggest_tags]

    # POST /search/suggest
    def suggest
      check_lang!(params[:lang])
      @lang = params[:lang].to_sym
      queriable_tags = get_query(params[:query])
      tags = queriable_tags[0...-1]
      matched_profiles = query_profiles(get_profiles(params[:event_id]), tags)
      results = get_suggestions_for(matched_profiles, queriable_tags)
      results = sort_results(results)
      success(items: results)
    end

    # POST /search/results
    def results
      check_lang!(params[:lang])
      @lang = params[:lang].to_sym
      tags = get_query(params[:query])
      shown_profiles = check_params(params[:shown])
      not_shown = not_shown_profiles(get_profiles(params[:event_id]), shown_profiles)
      matched_profiles = query_profiles(not_shown, tags)
      success(profiles: matched_profiles.take(15))
    end

    # POST /search/suggest_program
    def suggest_program
      queriable_tags = get_query(params[:query])
      queriable_filters = get_filters(params[:filters])
      results = Services::Search.get_program_suggestions(
        params[:lang],
        params[:event_id],
        queriable_tags,
        queriable_filters
      )
      success(items: results)
    end

    # POST /search/results_program
    def results_program
      unless params[:program_timestamp].nil?
        cached_program_timestamp = CachedEvent.program_timestamp(params[:event_id])
        return head :not_modified if cached_program_timestamp.to_i == params[:program_timestamp].to_i
      end

      tags = get_query(params[:query])
      queriable_filters = get_filters(params[:filters])
      results = Services::Search.get_program_results(
        params[:lang],
        params[:event_id],
        tags,
        queriable_filters,
        params[:date],
        params[:time]
      )
      hosts = Services::Events.get_event_program_hosts(params[:event_id])

      success(
        program: results,
        hosts: hosts,
        program_timestamp: CachedEvent.program_timestamp(params[:event_id])
      )
    end

    # POST /search/suggest_tags
    def suggest_tags
      results = Services::Suggest.tag_texts(params[:query], params[:source])
      success(items: results)
    end

    # POST /search/suggest_event_names
    def suggest_event_names
      results = Services::Suggest.event_names(params[:query])
      success(items: results)
    end

    private

    def check_lang!(lang)
      valid_langs = %i[es en ca]
      raise Pard::Invalid, 'invalid_language' unless valid_langs.include?(lang.to_sym)
    end

    def get_query(params_query)
      return [] if params_query.blank?

      check_params(params_query)
      params_query.map { |param| I18n.transliterate(param).downcase }
    end

    def get_filters(params_filters)
      return {} if params_filters.blank?

      params_filters = params_filters.to_unsafe_h if params_filters.respond_to?(:to_unsafe_h)
      unless params_filters.is_a?(Hash) && params_filters.values.all? { |selections| selections.is_a?(Array) }
        raise Pard::Invalid::FilterParams
      end

      params_filters = Util.string_keyed_hash_to_symbolized(params_filters)
      params_filters.map { |key, value| [key, value] }.to_h
    end

    def check_params(params_array)
      return [] if params_array.blank?
      unless params_array.is_a?(Array) && params_array.all? { |param| param.is_a?(String) }
        raise Pard::Invalid::QueryParams
      end

      params_array
    end

    def get_profiles(event_id)
      profiles = event_id.blank? ? Repos::Profiles.all : Repos::Profiles.get_event_profiles(event_id)
      filtered_profiles = profiles.map do |profile|
        profile = Actions::FilterProfile.run(profile)
        profile[:tags] = Actions::UserGetsTextTags.of(profile)
        profile
      end
      filtered_profiles.shuffle
    end

    def query_profiles(all_profiles, tags)
      return all_profiles if tags.all?(&:blank?)

      all_profiles.select { |profile| query_profile(profile, tags) }
    end

    def query_profile(profile, tags)
      tags.all? { |tag| check_profile(profile, tag) }
    end

    def check_profile(profile, tag)
      return check_value(profile[:facets], tag) if facet?(tag)

      searcheable_fields.any? { |field| check_value(profile[field], tag) }
    end

    def check_value(value, tag)
      return check_hash(value, tag) if value.is_a?(Hash)
      return check_array(value, tag) if value.is_a?(Array)

      matches?(value, tag) if value.is_a?(String)
    end

    def check_hash(value, tag)
      value.keys.any? { |key| check_value(value[key], tag) }
    end

    def check_array(value, tag)
      value.any? { |val| check_value(val, tag) }
    end

    def queriable?(value, query)
      return false if value.nil?

      tags = query[0...-1]
      return false if tags.any? { |tag| tag == translate(I18n.transliterate(value).downcase) }

      matches?(value, query.last)
    end

    def matches?(value, tag)
      matchable_value = translate(I18n.transliterate(value).downcase)
      words = matchable_value.split(/\W+/).map { |word| translate(word).split(/\W+/) }.flatten
      matchable_value == tag || words.any? { |word| word.start_with?(tag) }
    end

    def translate(text)
      # Placeholder for translation logic - this should use I18n or Services::Translator
      text
    end

    def searcheable_fields
      %i[facets name bio address tags]
    end

    def not_shown_profiles(profiles, shown)
      not_shown = profiles.reject { |profile| shown.include?(profile[:id]) }
      not_shown.sort_by { |profile| profile[:profile_picture].blank? && profile[:photos].blank? ? 1 : 0 }
    end

    def get_suggestions_for(matched_profiles, query)
      suggestions = []
      return suggestions if query.last.blank?

      matched_profiles.each { |profile| add_suggestions(suggestions, profile, query) }
      suggestions
    end

    def add_suggestions(suggestions, profile, query)
      if profile[:facets].any? { |facet| queriable?(facet, query) }
        profile[:facets].each { |facet| add_suggestion(suggestions, facet, 'facet') if queriable?(facet, query) }
      end
      add_suggestion(suggestions, profile[:name], 'name') if queriable?(profile[:name], query)
      add_suggestion(suggestions, profile[:address][:locality], 'city') if queriable?(profile[:address][:locality],
                                                                                      query)
    end

    def add_suggestion(suggestions, text, type)
      translation = I18n.transliterate(translate(text))
      return if suggestions.any? { |suggestion| suggestion[:text].downcase == I18n.transliterate(translation).downcase }

      suggestions.push({ id: translation, text: translation, type: type, icon: text })
    end

    def sort_results(results)
      sorted_results = []
      sorted_results.push(results.select { |result| result[:type] == 'facet' })
      sorted_results.push(results.select { |result| result[:type] == 'category' })
      sorted_results.push(results.select { |result| result[:type] == 'city' })
      sorted_results.push(results.select { |result| result[:type] == 'name' })
      sorted_results.push(results.select { |result| result[:type] == 'title' })
      sorted_results.flatten
    end

    def facet?(_text)
      # Dictionary logic for facets - simplified version
      # TODO: This should be moved to a service or model
      false
    end
  end
end
