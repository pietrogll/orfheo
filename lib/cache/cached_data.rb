# frozen_string_literal: true

class InstanceCache
  def initialize
    @cache = ActiveSupport::Cache::MemoryStore.new
  end
  # (expires_in: 5.minutes)

  def write(key, value)
    @cache.write(key, value)
  end

  def read(key)
    @cache.read(key)
  end

  def delete(key)
    @cache.delete(key)
  end

  def clear
    @cache.clear
  end
end

class BaseCache
  class << self
    def write(key, value)
      cache.write(key, value)
    end

    def read(key)
      cache.read(key)
    end

    def delete(key)
      cache.delete(key)
    end

    def clear
      cache.clear
    end

    private

    def cache
      Rails.cache
    end
  end
end

class CachedEvent < BaseCache
  class << self
    def program(event_id)
      fetch_cached_program_data(event_id)[:program]
    end

    def program_timestamp(event_id)
      fetch_cached_program_data(event_id)[:program_timestamp]
    end

    def program_hosts(event_id)
      cache.fetch(hosts_key(event_id)) do
        get_cached_program_hosts event_id
      end
    end

    def delete(event_id)
      cache.delete(program_key(event_id))
      cache.delete(hosts_key(event_id))
      Services::Cloudflare.purge_program_cache(event_id) if defined?(Services::Cloudflare)
    end

    def write_program_with_timestamp(event_id, _program)
      write(event_id, program_with_timestamp)
    end

    private

    def program_key(event_id)
      "program_#{event_id}"
    end

    def hosts_key(event_id)
      "hosts_#{event_id}"
    end

    def fetch_cached_program_data(event_id)
      cache.fetch(program_key(event_id)) do
        program = get_event_program(event_id)
        program_with_timestamp(program)
      end
    end

    def program_with_timestamp(program)
      timestamp = (Time.now.to_f * 1000).to_i
      { program: program, program_timestamp: timestamp }
    end

    def get_event_program(event_id)
      event = Repos::Events.get_by_id event_id
      raise Pard::Unexisting, 'event_not_found' if event.nil?

      Services::Programs.arrange_program event[:program_id]
    end

    def get_cached_program_hosts(event_id)
      hosts_identifiers = []
      Array(program(event_id)).each_with_object([]) do |performance, accumulator|
        next if performance[:host_id].blank? || performance[:host_name].blank?

        identifier = performance[:host_id] + performance[:host_name]
        unless hosts_identifiers.include?(identifier)
          accumulator << performance
          hosts_identifiers << identifier
        end
      end
    end
  end
end
